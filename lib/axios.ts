import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.herclo.co.id/api', // URL Backend Laravel
    headers: {
        'Accept': 'application/json',
    },
});

// Interceptor untuk menyisipkan Token Bearer secara otomatis & menangani FormData
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

export default api;
