import axios from 'axios'

// Create axios instance with default configuration
const apiClient = axios.create({
  // Base URL is relative to current origin
  baseURL: '/',
  // Send cookies with every request (CRITICAL for session authentication)
  withCredentials: true,
  // Timeout after 30 seconds
  timeout: 30000,
  // Default headers
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      console.error(`API Error ${status}:`, data)

      if (status === 401) {
        console.error('Unauthorized - session may have expired')
        // Optionally redirect to login
        // window.location.href = '/web/home'
      } else if (status === 403) {
        console.error('Forbidden - insufficient permissions')
      } else if (status === 404) {
        console.error('Not Found - endpoint may not exist')
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server:', error.message)
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
