import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base, SessionLocal
from routers import auth, photos
from models import User
from utils import hash_password

# Create all tables
Base.metadata.create_all(bind=engine)

# Initialize default admin user
db = SessionLocal()
try:
    if not db.query(User).filter(User.username == "admin").first():
        admin_user = User(
            username="admin",
            email="admin@gallery.com",
            hashed_password=hash_password("Admin@123"),
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
finally:
    db.close()

app = FastAPI(title="Gallery App API", version="1.0.0")

# CORS – allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(photos.router)


@app.get("/")
def root():
    return {"message": "Gallery App API is running"}
