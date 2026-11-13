import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 12000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? '');
    if (error.response?.status === 401 && !requestUrl.startsWith('/auth/')) {
      sessionStorage.removeItem('ims-user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
