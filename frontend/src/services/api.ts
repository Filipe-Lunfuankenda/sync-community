import axios from 'axios';

// The base URL can be defined via Environment Variables (.env) 
// Fallback to relative path so it works perfectly in Docker/Codespaces via Nginx Proxy
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to inject the Bearer Token if it exists in LocalStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses to handle global 401s (Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            // We could clear token and redirect to login here
            localStorage.removeItem('access_token');
            // window.location.href = '/login'; // Will be handled better via AuthContext later
        }
        return Promise.reject(error);
    }
);

export default api;
