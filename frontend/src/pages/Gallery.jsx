import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PhotoCard from '../components/PhotoCard';
import UploadModal from '../components/UploadModal';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api';

export default function Gallery() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Admin tab state
  const [activeTab, setActiveTab] = useState('photos');

  // User management state (admin only)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_admin: false,
  });
  const [formError, setFormError] = useState('');

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await api.get('/api/photos/', { params });
      setPhotos(res.data);
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/api/auth/users');
      setUsers(res.data);
    } catch (err) {
      showToast('Không thể tải danh sách user', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin && activeTab === 'users') {
      fetchUsers();
    }
  }, [user, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPhotos();
  };

  const handleDeletePhoto = async (photoId) => {
    const confirmed = await showConfirm({
      title: 'Xóa ảnh',
      message: 'Bạn có chắc chắn muốn xóa ảnh này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/api/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      showToast('Đã xóa ảnh thành công!', 'error');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Xóa thất bại', 'error');
    }
  };

  const handleUploaded = () => {
    fetchPhotos();
    showToast('Đã tải ảnh lên thành công!', 'success');
  };

  // ── User management handlers ──
  const handleDeleteUser = async (userId) => {
    const confirmed = await showConfirm({
      title: 'Xóa người dùng',
      message: 'Bạn có chắc chắn muốn xóa user này và TOÀN BỘ ảnh của họ? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/api/auth/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      showToast('Đã xóa người dùng thành công!', 'error');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Xóa thất bại', 'error');
    }
  };

  const handleOpenUserModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setFormData({ username: u.username, email: u.email, password: '', is_admin: u.is_admin });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', is_admin: false });
    }
    setFormError('');
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingUser) {
        const updateData = { username: formData.username, email: formData.email, is_admin: formData.is_admin };
        if (formData.password) updateData.password = formData.password;
        const res = await api.put(`/api/auth/users/${editingUser.id}`, updateData);
        setUsers(users.map((u) => (u.id === editingUser.id ? res.data : u)));
        showToast('Đã cập nhật người dùng thành công!', 'info');
      } else {
        if (!formData.password) {
          setFormError('Vui lòng nhập mật khẩu');
          return;
        }
        const res = await api.post('/api/auth/users', formData);
        setUsers([...users, res.data]);
        showToast('Đã thêm người dùng thành công!', 'success');
      }
      handleCloseUserModal();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Có lỗi xảy ra');
      showToast(err.response?.data?.detail || 'Có lỗi xảy ra', 'error');
    }
  };

  return (
    <div className="gallery-page">
      {/* Admin Tabs */}
      {user?.is_admin && (
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'photos' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            🖼️ Quản lý Ảnh
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Quản lý User
          </button>
        </div>
      )}

      {/* ════ PHOTOS TAB ════ */}
      {(activeTab === 'photos' || !user?.is_admin) && (
        <>
          <div className="gallery-header">
            <div className="gallery-header-left">
              <h1>
                {user?.is_admin ? '🔑 Tất cả ảnh (Admin)' : '🖼️ Ảnh của tôi'}
              </h1>
              <p className="gallery-count">{photos.length} ảnh</p>
            </div>
            <div className="gallery-header-right">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên..."
                  className="search-input"
                  id="search-input"
                />
                <button type="submit" className="btn btn-secondary" id="search-btn">
                  🔍
                </button>
              </form>
              <button
                onClick={() => setShowUpload(true)}
                className="btn btn-primary"
                id="upload-btn"
              >
                ＋ Upload
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải ảnh...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📷</span>
              <h2>Chưa có ảnh nào</h2>
              <p>Hãy upload ảnh đầu tiên của bạn!</p>
              <button
                onClick={() => setShowUpload(true)}
                className="btn btn-primary"
              >
                Upload ngay
              </button>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={handleDeletePhoto}
                  isOwner={photo.user_id === user?.id || user?.is_admin}
                />
              ))}
            </div>
          )}

          <UploadModal
            isOpen={showUpload}
            onClose={() => setShowUpload(false)}
            onUploaded={handleUploaded}
          />
        </>
      )}

      {/* ════ USERS TAB (Admin only) ════ */}
      {activeTab === 'users' && user?.is_admin && (
        <>
          <div className="gallery-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>👥 Quản lý Người dùng</h1>
            <button onClick={() => handleOpenUserModal()} className="btn btn-primary">Thêm Người dùng</button>
          </div>

          {usersLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.is_admin ? (
                          <span className="admin-badge">Admin</span>
                        ) : (
                          <span className="user-badge">User</span>
                        )}
                      </td>
                      <td>
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Xóa
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="btn btn-sm btn-secondary"
                          style={{ marginLeft: '8px' }}
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showUserModal && (
            <div className="modal-backdrop" onClick={handleCloseUserModal}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingUser ? 'Sửa Người dùng' : 'Thêm Người dùng'}</h2>
                  <button type="button" className="modal-close" onClick={handleCloseUserModal}>&times;</button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-error">{formError}</div>}
                  <form onSubmit={handleUserSubmit}>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Password {editingUser && '(Để trống nếu không muốn đổi)'}</label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_admin}
                        onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                        style={{ width: 'auto', margin: 0 }}
                      />
                      <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => setFormData({ ...formData, is_admin: !formData.is_admin })}>
                        Là Admin
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={handleCloseUserModal} className="btn btn-ghost">Hủy</button>
                      <button type="submit" className="btn btn-primary">Lưu</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
