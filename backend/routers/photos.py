import os
import uuid
import shutil
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from database import get_db
from models import User, Photo
from schemas import PhotoResponse, PhotoUpdate
from utils import get_current_user

router = APIRouter(prefix="/api/photos", tags=["Photos"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "uploads")

# Ensure the upload directory is correct (we are inside backend/)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)


def _photo_to_response(photo: Photo) -> PhotoResponse:
    return PhotoResponse(
        id=photo.id,
        title=photo.title,
        description=photo.description,
        image_url=photo.image_url,
        uploaded_at=photo.uploaded_at,
        user_id=photo.user_id,
        owner_username=photo.owner.username if photo.owner else None,
    )


# ──────────────── Upload Photo ────────────────

@router.post("/upload", response_model=PhotoResponse)
async def upload_photo(
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Use JPEG, PNG, GIF, or WebP.",
        )

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file to disk
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save to database
    image_url = f"/uploads/{unique_filename}"
    new_photo = Photo(
        title=title,
        description=description,
        image_url=image_url,
        user_id=current_user.id,
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    return _photo_to_response(new_photo)


# ──────────────── List Photos ────────────────

@router.get("/", response_model=list[PhotoResponse])
def list_photos(
    search: Optional[str] = Query(None, description="Search by title"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Photo)

    # Everyone only sees their own photos
    query = query.filter(Photo.user_id == current_user.id)

    # Optional search by title
    if search:
        query = query.filter(Photo.title.ilike(f"%{search}%"))

    photos = query.order_by(Photo.uploaded_at.desc()).all()
    return [_photo_to_response(p) for p in photos]


# ──────────────── Get Single Photo ────────────────

@router.get("/{photo_id}", response_model=PhotoResponse)
def get_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Check ownership (everyone only views their own)
    if photo.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _photo_to_response(photo)


# ──────────────── Update Photo ────────────────

@router.put("/{photo_id}", response_model=PhotoResponse)
def update_photo(
    photo_id: int,
    photo_data: PhotoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Only owner can edit
    if photo.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own photos")

    if photo_data.title is not None:
        photo.title = photo_data.title
    if photo_data.description is not None:
        photo.description = photo_data.description

    db.commit()
    db.refresh(photo)

    return _photo_to_response(photo)


# ──────────────── Delete Photo ────────────────

@router.delete("/{photo_id}")
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Only owner can delete
    if photo.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own photos")

    # Delete physical file
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(photo.image_url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(photo)
    db.commit()

    return {"message": "Photo deleted successfully"}
