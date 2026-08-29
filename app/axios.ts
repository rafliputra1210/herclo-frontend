import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api', // URL Backend Laravel
    timeout: 3000, // Maksimal tunggu 3 detik per request
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Daftar endpoint publik (tidak perlu token)
const publicEndpoints = [
    '/register', '/login',
    '/categories', '/products', '/banners',
    '/galleries', '/articles', '/testimonials',
    '/checkout', '/settings', '/midtrans-callback',
    '/promo/validate'
];

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        // Cek apakah URL termasuk endpoint publik
        const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
        if (token && !isPublic) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;