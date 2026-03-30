import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../api';

export default function EditPhoto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await api.get(`/api/photos/${id}`);
        setTitle(res.data.title);
        setDescription(res.data.description || '');
      } catch (err) {
        setError(err.response?.data?.detail || 'Không tìm thấy ảnh');
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/photos/${id}`, { title, description });
      showToast('Đã cập nhật ảnh thành công!', 'info');
      navigate(`/photos/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Cập nhật thất bại');
      showToast(err.response?.data?.detail || 'Cập nhật thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>✏️ Chỉnh sửa ảnh</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">Tiêu đề</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-desc">Mô tả</label>
            <textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ảnh..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <Link to={`/photos/${id}`} className="btn btn-ghost">
              Hủy
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-photo-btn"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
