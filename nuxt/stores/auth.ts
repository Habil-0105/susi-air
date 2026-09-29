import { defineStore } from 'pinia';
import { useCookie, useRouter } from '#imports';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: useCookie('token').value || null,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
      const cookie = useCookie('token');
      cookie.value = token;
    },
    logout() {
      this.token = null;
      const cookie = useCookie('token');
      cookie.value = null;
      const router = useRouter();
      router.push('/login');
    }
  }
});
