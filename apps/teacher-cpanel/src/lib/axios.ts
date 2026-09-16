import axios from 'axios'
import { API_URL } from '@/core/config'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { Accept: 'application/json', locale: 'ar' },
})

export const useAxios = () => apiClient