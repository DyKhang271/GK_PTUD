import { useState, useRef } from 'react';
import { changePassword, uploadAvatar } from '../api';
import { API_BASE_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function UserProfileModal({ user, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();
  const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('Vui lòng điền đầy đủ các trường.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu mới không khớp.');
    }
    if (newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    try {
      setIsLoading(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      addToast('success', 'Đổi mật khẩu thành công!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadAvatar(file);
      updateUser(res.data);
      addToast('success', 'Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      addToast('error', err.response?.data?.detail || 'Lỗi khi tải ảnh lên.');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarSrc = user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thông tin tài khoản</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="profile-info-section">
            <div className="profile-avatar-large-wrapper" onClick={handleAvatarClick}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-large">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div className="avatar-overlay">
                <span>Đổi ảnh</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              {isUploading && <div className="avatar-uploading-spinner"></div>}
            </div>
            <div className="profile-details">
              <h3>{user.username}</h3>
              <p>{user.email}</p>
              <span className="user-role-badge">
                {user.is_admin ? 'Quản trị viên (Admin)' : 'Thành viên'}
              </span>
            </div>
          </div>

          <div className="profile-divider"></div>

          <form onSubmit={handleSubmit} className="profile-password-form">
            <h3>Đổi mật khẩu</h3>
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ"
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Đang cập nhật...' : 'Xác nhận đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
