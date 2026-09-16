'use client'

import { API_URL } from "@/core/config";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "locale": "ar"
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Global kick-out logic or token refresh goes here
    }
    return Promise.reject(error);
  }
);


export const useAxios = () => apiClient;