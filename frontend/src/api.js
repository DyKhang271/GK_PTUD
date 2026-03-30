import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — only redirect if token expired (was previously set)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('token');
      if (hadToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // FIXME: window.location.href sẽ buộc trình duyệt reload lại toàn bộ trang làm mất tính SPA của React.
        // Bạn nên thay thế bằng điều hướng của React Router thông qua một biến cục bộ, Custom event hoặc History API.
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };

export const changePassword = async (data) => {
  return await api.put('/api/auth/me/password', data);
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.put('/api/auth/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
