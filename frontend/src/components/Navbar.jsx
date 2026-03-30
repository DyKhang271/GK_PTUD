import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import ThemeToggle from './ThemeToggle';
import UserProfileModal from './UserProfileModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">📸</span>
            <span className="brand-text">Gallery App</span>
          </Link>

          <div className="navbar-right">
            <ThemeToggle />
            {user && (
              <>

                <div className="user-info" onClick={() => setIsProfileModalOpen(true)}>
                  {user.avatar_url ? (
                    <img src={`${API_BASE_URL}${user.avatar_url}`} alt="Avatar" className="user-avatar user-avatar-img" />
                  ) : (
                    <span className="user-avatar">{user.username[0].toUpperCase()}</span>
                  )}
                  <span className="user-name">{user.username}</span>
                  {user.is_admin && <span className="admin-badge">Admin</span>}
                </div>
                <button onClick={handleLogout} className="btn btn-ghost" id="logout-btn">
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      {isProfileModalOpen && (
        <UserProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />
      )}
    </>
  );
}
