import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically inject JWT access token into requests if available (bypass for public auth endpoints)
API.interceptors.request.use((config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    const isPublic = [
        '/auth/register/',
        '/auth/login/',
        '/auth/forgot-password/',
        '/auth/verify-otp/',
        '/auth/reset-password/',
        '/weather/current/',
        '/crop-recommendation/predict/',
        '/expert/login/',
        '/expert/register/'
    ].some(path => url.endsWith(path)) ||
        (url.includes('/market-prices/') && !url.includes('/market-prices/refresh/')) ||
        (url.includes('/government-schemes/')) ||
        // Only public expert endpoints (list, search, districts, detail) - NOT /consultation/expert/
        (/\/expert\/(search\/|districts\/|(\d+\/)?)?$/.test(url) && method === 'get' && !url.includes('/consultation/'));

    if (!isPublic) {
        const token = localStorage.getItem('access_token');
        if (token && token !== 'null' && token !== 'undefined') {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authAPI = {
    register: async (userData) => {
        const response = await API.post('/auth/register/', userData);
        return response.data;
    },
    login: async (credentials) => {
        const response = await API.post('/auth/login/', credentials);
        return response.data;
    },
    forgotPassword: async (mobile) => {
        const response = await API.post('/auth/forgot-password/', { mobile });
        return response.data;
    },
    verifyOtp: async (mobile, otpCode) => {
        const response = await API.post('/auth/verify-otp/', { mobile, otp_code: otpCode });
        return response.data;
    },
    resetPassword: async (mobile, newPassword, confirmPassword) => {
        const response = await API.post('/auth/reset-password/', {
            mobile,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
        return response.data;
    },
    logout: async () => {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
            // Optional: call backend logout to blacklist the refresh token
            try {
                await API.post('/auth/logout/', { refresh });
            } catch (err) {
                console.error("Backend logout error:", err);
            }
        }
        // Clean localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    }
};

export const farmAPI = {
    getAll: async () => {
        const response = await API.get('/farmer/farms/');
        return response.data;
    },
    create: async (farmData) => {
        const response = await API.post('/farmer/farms/', farmData);
        return response.data;
    },
    update: async (id, farmData) => {
        const response = await API.put(`/farmer/farms/${id}/`, farmData);
        return response.data;
    },
    delete: async (id) => {
        const response = await API.delete(`/farmer/farms/${id}/`);
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/farmer/farms/${id}/`);
        return response.data;
    }
};

export const cropAPI = {
    getAll: async () => {
        const response = await API.get('/farmer/crops/');
        return response.data;
    },
    create: async (cropData) => {
        const response = await API.post('/farmer/crops/', cropData);
        return response.data;
    },
    update: async (id, cropData) => {
        const response = await API.put(`/farmer/crops/${id}/`, cropData);
        return response.data;
    },
    delete: async (id) => {
        const response = await API.delete(`/farmer/crops/${id}/`);
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/farmer/crops/${id}/`);
        return response.data;
    }
};

export const expenseAPI = {
    getAll: async () => {
        const response = await API.get('/farmer/expenses/');
        return response.data;
    },
    create: async (expenseData) => {
        const response = await API.post('/farmer/expenses/', expenseData);
        return response.data;
    },
    update: async (id, expenseData) => {
        const response = await API.put(`/farmer/expenses/${id}/`, expenseData);
        return response.data;
    },
    delete: async (id) => {
        const response = await API.delete(`/farmer/expenses/${id}/`);
        return response.data;
    }
};

export const salesAPI = {
    getAll: async () => {
        const response = await API.get('/farmer/sales/');
        return response.data;
    },
    create: async (salesData) => {
        const response = await API.post('/farmer/sales/', salesData);
        return response.data;
    },
    update: async (id, salesData) => {
        const response = await API.put(`/farmer/sales/${id}/`, salesData);
        return response.data;
    },
    delete: async (id) => {
        const response = await API.delete(`/farmer/sales/${id}/`);
        return response.data;
    }
};

export const notificationAPI = {
    getAll: async () => {
        const role = localStorage.getItem('role')?.toLowerCase() || 'farmer';
        const prefix = role === 'admin' ? '/adminpanel' : `/${role}`;
        const response = await API.get(`${prefix}/notifications/`);
        return response.data;
    },
    markAsRead: async (id) => {
        const role = localStorage.getItem('role')?.toLowerCase() || 'farmer';
        const prefix = role === 'admin' ? '/adminpanel' : `/${role}`;
        const response = await API.patch(`${prefix}/notifications/${id}/`);
        return response.data;
    }
};

export const marketPricesAPI = {
    getLatest: async (date) => {
        const url = date ? `/market-prices/latest/?date=${date}` : '/market-prices/latest/';
        const response = await API.get(url);
        return response.data;
    },
    query: async (params) => {
        const response = await API.get('/market-prices/by-crop/', { params });
        return response.data;
    },
    getAnalytics: async (params) => {
        const response = await API.get('/market-prices/analytics/', { params });
        return response.data;
    },
    refresh: async () => {
        const response = await API.post('/market-prices/refresh/');
        return response.data;
    },
    getDistricts: async () => {
        const response = await API.get('/market-prices/districts/');
        return response.data;
    }
};

export const diseaseDetectionAPI = {
    upload: async (formData) => {
        const response = await API.post('/disease-detection/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    predict: async (formData) => {
        const response = await API.post('/disease-detection/predict/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getHistory: async () => {
        const response = await API.get('/disease-detection/history/');
        return response.data;
    },
    getDetail: async (id) => {
        const response = await API.get(`/disease-detection/history/${id}/`);
        return response.data;
    },
    deleteHistory: async (id) => {
        const response = await API.delete(`/disease-detection/history/${id}/`);
        return response.data;
    },
    clearHistory: async () => {
        const response = await API.delete('/disease-detection/history/');
        return response.data;
    }
};

export const weatherAPI = {
    getCurrent: async (city, lat = null, lon = null) => {
        const params = {};
        if (lat && lon) {
            params.lat = lat;
            params.lon = lon;
        } else if (city) {
            params.city = city;
        }
        const response = await API.get('/weather/current/', { params });
        return response.data;
    }
};

export const cropRecommendationAPI = {
    predict: async (payload) => {
        const response = await API.post('/crop-recommendation/predict/', payload);
        return response.data;
    }
};

export const governmentSchemesAPI = {
    getAll: async (params) => {
        const response = await API.get('/government-schemes/', { params });
        return response.data;
    },
    search: async (params) => {
        const response = await API.get('/government-schemes/search/', { params });
        return response.data;
    },
    getCategories: async () => {
        const response = await API.get('/government-schemes/categories/');
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/government-schemes/${id}/`);
        return response.data;
    }
};

export const expertAPI = {
    getAll: async () => {
        const response = await API.get('/expert/');
        return response.data;
    },
    search: async (params) => {
        const response = await API.get('/expert/search/', { params });
        return response.data;
    },
    getDistricts: async () => {
        const response = await API.get('/expert/districts/');
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/expert/${id}/`);
        return response.data;
    },
    login: async (credentials) => {
        const response = await API.post('/expert/login/', credentials);
        return response.data;
    },
    register: async (expertData) => {
        const response = await API.post('/expert/register/', expertData);
        return response.data;
    },
    getDashboard: async () => {
        const response = await API.get('/expert/dashboard/');
        return response.data;
    },
    update: async (id, expertData) => {
        const response = await API.put(`/expert/${id}/`, expertData);
        return response.data;
    },
    delete: async (id) => {
        const response = await API.delete(`/expert/${id}/`);
        return response.data;
    }
};

export const consultationAPI = {
    create: async (formData) => {
        const response = await API.post('/consultation/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getFarmerList: async () => {
        const response = await API.get('/consultation/farmer/');
        return response.data;
    },
    getExpertList: async () => {
        const response = await API.get('/consultation/expert/');
        return response.data;
    },
    getDetails: async (id) => {
        const response = await API.get(`/consultation/${id}/`);
        return response.data;
    },
    reply: async (id, message) => {
        const response = await API.post(`/consultation/${id}/reply/`, { message });
        return response.data;
    },
    close: async (id) => {
        const response = await API.post(`/consultation/${id}/close/`);
        return response.data;
    },
    submitRating: async (id, ratingObj) => {
        const response = await API.post(`/consultation/${id}/rate/`, ratingObj);
        return response.data;
    }
};

export const adminExpertAPI = {
    getStats: async () => {
        const response = await API.get('/adminpanel/experts/stats/');
        return response.data;
    },
    getAll: async (params = {}) => {
        const response = await API.get('/adminpanel/experts/', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/adminpanel/experts/${id}/`);
        return response.data;
    },
    create: async (expertData) => {
        const response = await API.post('/adminpanel/experts/', expertData);
        return response.data;
    },
    update: async (id, expertData) => {
        const response = await API.put(`/adminpanel/experts/${id}/`, expertData);
        return response.data;
    },
    remove: async (id) => {
        const response = await API.delete(`/adminpanel/experts/${id}/`);
        return response.data;
    },
    toggleStatus: async (id, activeStatus) => {
        const response = await API.patch(`/adminpanel/experts/${id}/status/`, { active_status: activeStatus });
        return response.data;
    }
};

export const adminConsultationAPI = {
    getStats: async () => {
        const response = await API.get('/adminpanel/consultations/stats/');
        return response.data;
    },
    getAll: async (params = {}) => {
        const response = await API.get('/adminpanel/consultations/', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/adminpanel/consultations/${id}/`);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await API.patch(`/adminpanel/consultations/${id}/status/`, { status });
        return response.data;
    },
    remove: async (id) => {
        const response = await API.delete(`/adminpanel/consultations/${id}/`);
        return response.data;
    }
};

export const farmerSchemesAPI = {
    getAll: async (params = {}) => {
        const response = await API.get('/schemes/', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/schemes/${id}/`);
        return response.data;
    }
};

export const adminAnalyticsAPI = {
    getDashboard: async () => {
        const response = await API.get('/admin/analytics/dashboard/');
        return response.data;
    },
    getCharts: async () => {
        const response = await API.get('/admin/analytics/charts/');
        return response.data;
    },
    exportData: async (format) => {
        const response = await API.get(`/admin/analytics/export/`, {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    }
};

export const adminSchemesAPI = {
    getStats: async () => {
        const response = await API.get('/admin/schemes/stats/');
        return response.data;
    },
    getAll: async (params = {}) => {
        const response = await API.get('/admin/schemes/', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await API.get(`/admin/schemes/${id}/`);
        return response.data;
    },
    create: async (data) => {
        const response = await API.post('/admin/schemes/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await API.put(`/admin/schemes/${id}/`, data);
        return response.data;
    },
    remove: async (id) => {
        const response = await API.delete(`/admin/schemes/${id}/`);
        return response.data;
    }
};

export const adminProfileAPI = {
    get: async () => {
        const response = await API.get('/admin/profile/');
        return response.data;
    },
    update: async (profileData) => {
        const response = await API.put('/admin/profile/', profileData);
        return response.data;
    },
    changePassword: async (passwordData) => {
        const response = await API.patch('/admin/change-password/', passwordData);
        return response.data;
    },
    uploadPhoto: async (formData) => {
        const response = await API.post('/admin/profile/photo/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deletePhoto: async () => {
        const response = await API.delete('/admin/profile/photo/');
        return response.data;
    }
};

export const profileAPI = {
    get: async () => {
        const response = await API.get('/auth/profile/');
        return response.data;
    },
    update: async (profileData) => {
        const response = await API.put('/auth/profile/update/', profileData);
        return response.data;
    }
};

export default API;