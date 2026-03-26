import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('dermiq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.response?.data?.detail || 'Something went wrong'
    if (err.response?.status === 401) {
      localStorage.removeItem('dermiq_token')
      localStorage.removeItem('dermiq_user')
      window.location.href = '/login'
    }
    return Promise.reject(new Error(msg))
  }
)

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    http.post('/auth/login', { email, password }),

  register: ({ name, email, password }) =>
    http.post('/auth/register', { name, email, password }),

  me: () =>
    http.get('/auth/me'),

  forgotPassword: (email) =>
    http.post('/auth/forgot-password', { email }),
}

// ─── Lifestyle / Onboarding ───────────────────────────
export const profileAPI = {
  // Save user lifestyle data
  saveLifestyle: (data) =>
    http.post('/profile/lifestyle', data),

  // Get saved lifestyle data
  getLifestyle: () =>
    http.get('/profile/lifestyle'),

  // Check if onboarding is complete
  getStatus: () =>
    http.get('/profile/status'),
}

// ─── Skin Analysis ────────────────────────────────────
export const analysisAPI = {
  // POST multipart/form-data with image file
  analyze: (formData) =>
    http.post('/analysis/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Get all past analyses
  history: () =>
    http.get('/analysis/history'),

  // Get single analysis by id
  get: (id) =>
    http.get(`/analysis/${id}`),
}

export default http
