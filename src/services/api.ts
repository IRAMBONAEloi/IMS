import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ims-a15g.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
             console.log('Authorization header set:', config.headers.Authorization);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;