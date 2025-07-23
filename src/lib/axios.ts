import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // Include cookies in requests for authentication
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding common configurations
api.interceptors.request.use(
  (config) => {
    // No need to add Authorization headers since we're using cookie-based auth with jose
    // Cookies will be automatically included due to withCredentials: true
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors globally
    if (error.response?.status === 401) {
      // Handle unauthorized errors - redirect to login
      console.error('Unauthorized access - redirecting to login')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    } else if (error.response?.status === 403) {
      console.error('Forbidden access')
    } else if (error.response?.status === 500) {
      console.error('Internal server error')
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
    }
    
    // Return a more user-friendly error message
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(errorMessage))
  }
)

export default api 