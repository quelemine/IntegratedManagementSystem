import axios from 'axios'

// Use production Render URL if not in development
const isDevelopment = import.meta.env.DEV
const API_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:5000/api' : 'https://integrated-management-system.onrender.com/api')

console.log('API URL:', API_URL)

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance
