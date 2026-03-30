import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api';

export default function Users() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_admin: false,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
    }
  }, [user]);

  if (!user?.is_admin) {
    return <Navigate to="/" />;
  }

  const handleDelete = async (userId) => {
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

  const handleOpenModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setFormData({
        username: u.username,
        email: u.email,
        password: '',
        is_admin: u.is_admin,
      });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', is_admin: false });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const updateData = {
          username: formData.username,
          email: formData.email,
          is_admin: formData.is_admin,
        };
        // Only send password if it's not empty
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const res = await api.put(`/api/auth/users/${editingUser.id}`, updateData);
        setUsers(users.map((u) => (u.id === editingUser.id ? res.data : u)));
        showToast('Đã cập nhật người dùng thành công!', 'info');
      } else {
        // Create user
        if (!formData.password) {
          setFormError('Vui lòng nhập mật khẩu');
          setIsSubmitting(false);
          return;
        }
        const res = await api.post('/api/auth/users', formData);
        setUsers([...users, res.data]);
        showToast('Đã thêm người dùng thành công!', 'success');
      }
      handleCloseModal();
    } catch (err) {
      console.error("Lỗi thêm/sửa User:", err);
      let errMsg = 'Có lỗi xảy ra';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errMsg = detail.map((d) => `${d.loc ? d.loc.join('.') : ''} ${d.msg}`).join(', ');
        } else if (typeof detail === 'string') {
          errMsg = detail;
        } else {
          errMsg = JSON.stringify(detail);
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      setFormError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gallery-page">
      <div className="gallery-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>👥 Quản lý Người dùng</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">Thêm Người dùng</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Username</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id}>
                  <td>{index + 1}</td>
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
                        onClick={() => handleDelete(u.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Xóa
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(u)}
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingUser ? 'Sửa Người dùng' : 'Thêm Người dùng'}</h2>
              <button type="button" className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <form onSubmit={handleSubmit}>
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
                  <button type="button" onClick={handleCloseModal} className="btn btn-ghost" disabled={isSubmitting}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
