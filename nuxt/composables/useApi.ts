import { useRuntimeConfig } from '#app';
import { useAuthStore } from '~/stores/auth';

export const useApi = () => {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const fetchWithAuth = async <T>(endpoint: string, options: any = {}): Promise<T> => {
    const headers = {
      ...options.headers,
    };

    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }

    try {
      const response = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
        ...options,
        headers,
      });
      return response;
    } catch (err: any) {
      if (err.response?.status === 401 && endpoint !== '/auth/login') {
        auth.logout();
      }
      throw err;
    }
  };

  return { fetch: fetchWithAuth };
};
