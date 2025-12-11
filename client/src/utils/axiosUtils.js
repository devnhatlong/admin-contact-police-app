import axios from 'axios';
import { getTokenFromCookie } from './utils';
import userService from '../services/userService';

// Utility function để tạo axios instance với interceptors
export const createAxiosInstance = (baseURL = null) => {
    const axiosInstance = axios.create(baseURL ? { baseURL } : {});

    // Add a request interceptor to add the JWT token to the authorization header
    axiosInstance.interceptors.request.use(
        (config) => {
            const accessToken = getTokenFromCookie("accessToken_DBLD");

            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // Add a response interceptor to refresh the JWT token if it's expired
    axiosInstance.interceptors.response.use(
        async (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const refreshToken = getTokenFromCookie("refreshToken_DBLD");

            if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
                originalRequest._retry = true; // Prevent infinite loop
                
                try {
                    const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                    document.cookie = `accessToken_DBLD=${newAccessToken}; path=/`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    redirectToLogin();
                    return Promise.reject(error);
                }
            }

            if (error.response?.status === 401 && !refreshToken) {
                redirectToLogin();
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

// Function để redirect về login page
const redirectToLogin = () => {
    document.cookie = "accessToken_DBLD=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken_DBLD=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
};