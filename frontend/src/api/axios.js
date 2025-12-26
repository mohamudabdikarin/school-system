import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    withCredentials: true,
    timeout: 10000,
});

instance.interceptors.request.use((config) => {
    // Try localStorage first, then sessionStorage as fallback
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Request with token:", config.url);
    } else {
        console.log("Request without token:", config.url);
    }
    return config;
}, (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
    console.log("Response received:", response.status, response.config.url);
    return response;
}, (error) => {
    console.error("Response error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message
    });
    return Promise.reject(error);
});

export default instance; 