import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('loba_token')
  if (token) cfg.headers.Authorization = 'Bearer ' + token
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('loba_token')
      localStorage.removeItem('loba_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
