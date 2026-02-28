import { toast } from "react-toastify";

export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const isFormData = options.body && (Object.prototype.toString.call(options.body) === '[object FormData]' || options.body instanceof FormData);
    const defaultHeaders = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const res = await fetch(url, config);

        // Handle Global 401 (Unauthorized/Expired)
        if (res.status === 401) {
            console.warn("Session expired or unauthorized. Logging out...");
            localStorage.clear();
            window.location.href = "/";
            toast.error("Session expired. Please login again.");
            return null;
        }

        return res;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};
