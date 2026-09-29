import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  if (!auth.token && to.path !== '/login') {
    return navigateTo('/login');
  }

  if (auth.token && to.path === '/login') {
    return navigateTo('/');
  }
});
