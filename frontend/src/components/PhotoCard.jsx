import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

export default function PhotoCard({ photo, onDelete, isOwner }) {
  const navigate = useNavigate();
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="photo-card" onClick={() => navigate(`/photos/${photo.id}`)}>
      <div className="photo-card-image">
        <img
          src={`${API_BASE_URL}${photo.image_url}`}
          alt={photo.title}
          loading="lazy"
        />
        {isOwner && (
          <div className="photo-card-actions" onClick={(e) => e.stopPropagation()}>
            <Link to={`/photos/${photo.id}/edit`} className="btn btn-sm btn-secondary">
              Sửa
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
              }}
              className="btn btn-sm btn-danger"
            >
              Xóa
            </button>
          </div>
        )}
      </div>
      <div className="photo-card-body">
        <h3 className="photo-card-title">{photo.title}</h3>
        <div className="photo-card-footer">
          {photo.uploaded_at && (
            <span className="photo-card-date">📅 {formatDateTime(photo.uploaded_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
