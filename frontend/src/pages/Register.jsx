import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PWD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // Ít nhất 8 ký tự, 1 chữ, 1 số

  const [emailError, setEmailError] = useState('');
  const [pwdError, setPwdError] = useState('');

  const validateEmail = (val) => {
    setEmail(val);
    if (!EMAIL_REGEX.test(val)) {
      setEmailError('Email không hợp lệ (ví dụ: abc@xyz.com)');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (val) => {
    setPassword(val);
    if (!PWD_REGEX.test(val)) {
      setPwdError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số');
    } else {
      setPwdError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (emailError || pwdError) {
      setError('Vui lòng sửa các lỗi định dạng trước khi đăng ký');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">📸</span>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản Gallery App</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username">Tên đăng nhập</label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="text"
              value={email}
              onChange={(e) => validateEmail(e.target.value)}
              placeholder="Nhập email..."
              required
            />
            {emailError && <span className="input-error">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Mật khẩu</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              placeholder="Ít nhất 8 ký tự, 1 chữ, 1 số..."
              required
            />
            {pwdError && <span className="input-error">{pwdError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Xác nhận mật khẩu</label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            id="register-submit"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
