import axios from 'axios';
import { API_URL } from './config';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true, // <-- WAJIB ADA: Agar cookie/session lintas subdomain diizinkan
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

const publicExact = new Set([
    '/register', '/login',
    '/categories', '/products', '/banners',
    '/galleries', '/articles', '/testimonials',
    '/checkout', '/settings', '/midtrans-callback',
    '/promo/validate'
]);

const authRequiredPaths = new Set(['/user', '/logout', '/my-orders']);

// Interceptor untuk menyisipkan Token Bearer & menangani FormData
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token =
            localStorage.getItem('auth_token') ||
            localStorage.getItem('herclo_token') ||
            localStorage.getItem('token');
        const rawUrl = config.url?.split('?')[0] ?? '';
        // Endpoint yang butuh auth selalu kirim token (mis. /admin/*)
        const isAdminOrAuth =
            rawUrl.startsWith('/admin') || authRequiredPaths.has(rawUrl);
        const isPublicExact = publicExact.has(rawUrl);
        // Kirim token jika: ada token DAN (butuh auth ATAU bukan public exact)
        const shouldAttach = !!token && (isAdminOrAuth || !isPublicExact);
        if (shouldAttach) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

// Global 401 handler: bersihkan sesi & redirect ke login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const reqUrl: string = error.config?.url ?? '';
            const isLoginRequest = reqUrl.includes('/login');
            // Jangan redirect jika yang 401 adalah request login itu sendiri
            if (!isLoginRequest) {
                const currentPath = window.location.pathname;
                const isAuthPage =
                    currentPath.startsWith('/login') ||
                    currentPath.startsWith('/admin');
                // Hanya auto-redirect dari halaman auth/admin agar tidak ganggu checkout public
                if (isAuthPage) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('herclo_token');
                    localStorage.removeItem('herclo_user');
                    localStorage.removeItem('token');
                    // Gunakan replace agar tidak loop history
                    if (currentPath !== '/login') {
                        window.location.replace('/login');
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;