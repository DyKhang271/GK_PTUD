import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Gallery from './pages/Gallery';
import PhotoDetail from './pages/PhotoDetail';
import EditPhoto from './pages/EditPhoto';
import Users from './pages/Users';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  // FIXME: Thêm useLocation () từ react-router-dom để lưu lại trang người dùng đang muốn truy cập
  // const location = useLocation();

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  
  // TODO: Nếu người dùng chưa đăng nhập, sử dụng thẻ Navigate và giữ lại đường dẫn gốc qua state (ví dụ: state={{ from: location }})
  // Nhờ đó, sau khi đăng nhập thành công, bạn có thể redirect quay lại trang này (chứ không bị mặc định về '/')
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  return !user ? children : <Navigate to="/" />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Gallery /></PrivateRoute>} />
          <Route path="/photos/:id" element={<PrivateRoute><PhotoDetail /></PrivateRoute>} />
          <Route path="/photos/:id/edit" element={<PrivateRoute><EditPhoto /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
