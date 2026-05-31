import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useMemo } from 'react';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function useApi() {
  const { getToken } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL,
    });

    instance.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error getting Clerk token:", error);
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return api;
}
