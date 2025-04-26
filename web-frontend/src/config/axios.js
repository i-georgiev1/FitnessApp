import axios from 'axios';
import { API_BASE_URL } from './api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 600000, // 10 minutes in milliseconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            // Ensure token has Bearer prefix
            const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            config.headers.Authorization = finalToken;
        } else {
            console.log('No token found in localStorage'); // Debug log
        }

        // Don't set Content-Type for FormData, let the browser set it automatically
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('Response error:', error.response?.status, error.response?.data); // Debug log

        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear invalid token
            localStorage.removeItem('token');

            // Redirect to login page
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle 403 Forbidden errors
        if (error.response?.status === 403) {
            console.log('403 Forbidden error - checking token:', localStorage.getItem('token')); // Debug log
            // You might want to handle forbidden errors differently
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 