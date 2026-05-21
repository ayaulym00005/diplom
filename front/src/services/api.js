import axios from 'axios'

// Единые ключи для localStorage (должны совпадать с AuthContext)
const TOKEN_KEY = 'dermiq_token'
const USER_KEY = 'dermiq_user'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const http = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false, // CORS
})

// Интерцептор для добавления JWT токена к запросам
http.interceptors.request.use(
    function(config) {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
            console.log('✅ Токен добавлен в запрос')
        } else {
            console.warn('⚠️ Токен не найден в localStorage')
        }
        return config
    },
    function(error) {
        return Promise.reject(error)
    }
)

// Интерцептор для обработки ошибок ответа
http.interceptors.response.use(
    function(response) {
        // Успешный ответ — возвращаем только data
        return response.data
    },
    function(error) {
        let errorMsg = 'Қате пайда болды'

        if (error.response && error.response.data) {
            // Сервер вернул ошибку с деталями
            if (error.response.data.detail) {
                errorMsg = error.response.data.detail
            } else if (error.response.data.message) {
                errorMsg = error.response.data.message
            } else if (typeof error.response.data === 'string') {
                errorMsg = error.response.data
            }
        } else if (error.message) {
            errorMsg = error.message
        }

        console.error('❌ API Қате:', {
            status: error.response?.status,
            message: errorMsg,
            fullError: error,
        })

        // 401 — токен истек или невалиден
        if (error.response && error.response.status === 401) {
            console.warn('⚠️ Токен истек, удаляем и перенаправляем на логин')
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
                // Перенаправляем на логин
            window.location.href = '/login'
        }

        return Promise.reject(new Error(errorMsg))
    }
)

// ═══════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════

export const authAPI = {
    login: (email, password) => {
        return http.post('/auth/login', { email, password })
    },

    register: (payload) => {
        return http.post('/auth/register', {
            name: payload.name,
            email: payload.email,
            password: payload.password,
        })
    },

    me: () => {
        return http.get('/auth/me')
    },

    updateProfile: (payload) => {
        return http.patch('/auth/profile', {
            name: payload.name,
            email: payload.email,
        })
    },

    changePassword: (oldPassword, newPassword) => {
        return http.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
        })
    },

    forgotPassword: (email) => {
        return http.post('/auth/forgot-password', { email })
    },

    resetPassword: (token, newPassword) => {
        return http.post('/auth/reset-password', {
            token,
            new_password: newPassword,
        })
    },

    deleteAccount: () => {
        return http.delete('/auth/account')
    },
}

// ═══════════════════════════════════════════════════════════
// PROFILE API
// ═══════════════════════════════════════════════════════════

export const profileAPI = {
    saveLifestyle: (data) => {
        return http.post('/profile/lifestyle', data)
    },

    getLifestyle: () => {
        return http.get('/profile/lifestyle')
    },

    getStatus: () => {
        return http.get('/profile/status')
    },
}

// ═══════════════════════════════════════════════════════════
// ANALYSIS API
// ═══════════════════════════════════════════════════════════

export const analysisAPI = {
    analyze: (formData) => {
        return http.post('/analysis/predict', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    history: () => {
        return http.get('/analysis/history')
    },

    get: (id) => {
        return http.get(`/analysis/${id}`)
    },
}

// ═══════════════════════════════════════════════════════════
// DIARY API
// ═══════════════════════════════════════════════════════════

export const diaryAPI = {
    list: () => {
        return http.get('/diary/')
    },

    create: (data) => {
        return http.post('/diary/', data)
    },

    remove: (id) => {
        return http.delete(`/diary/${id}`)
    },
}

// ═══════════════════════════════════════════════════════════
// CHAT API
// ═══════════════════════════════════════════════════════════

export const chatAPI = {
    send: (message) => {
        return http.post('/chat/', { message })
    },
}

export default http