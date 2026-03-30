import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import api, { API_BASE_URL } from '../api';

export default function PhotoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await api.get(`/api/photos/${id}`);
        setPhoto(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Không tìm thấy ảnh');
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xóa ảnh',
      message: 'Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/api/photos/${id}`);
      showToast('Đã xóa ảnh thành công!', 'error');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Xóa thất bại', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>❌ {error}</h2>
        <Link to="/" className="btn btn-primary">Quay về</Link>
      </div>
    );
  }

  const isOwner = photo?.user_id === user?.id;

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="photo-detail-page">
      <div className="photo-detail-card">
        <div className="photo-detail-image">
          <img src={`${API_BASE_URL}${photo.image_url}`} alt={photo.title} />
        </div>
        <div className="photo-detail-info">
          <h1>{photo.title}</h1>
          {photo.description && (
            <p className="photo-detail-desc">{photo.description}</p>
          )}
          <div className="photo-detail-meta">
            <span>👤 {photo.owner_username}</span>
            <span>📅 {formatDateTime(photo.uploaded_at)}</span>
          </div>
          <div className="photo-detail-actions">
            <Link to="/" className="btn btn-ghost">← Quay lại</Link>
            {isOwner && (
              <>
                <Link
                  to={`/photos/${photo.id}/edit`}
                  className="btn btn-secondary"
                  id="edit-photo-btn"
                >
                  ✏️ Chỉnh sửa
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                  id="delete-photo-btn"
                >
                  🗑️ Xóa
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
