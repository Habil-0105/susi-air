<template>
  <div class="login-page">
    <div class="header">
      <AppLogo size="lg" />
      <p class="subtitle">Pilot Portal</p>
    </div>
    
    <div class="form-container">
      <div v-if="error" class="error-banner">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" placeholder="Enter your username" required />
        </div>
        
        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
        </div>
        
        <button type="submit" class="pill-btn" :disabled="loading">
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';

const username = ref('johndoe');
const password = ref('susiairtest');
const loading = ref(false);
const error = ref('');

const auth = useAuthStore();
const api = useApi();
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await api.fetch<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    });
    
    auth.setToken(res.accessToken);
    router.push('/');
  } catch (err: any) {
    if (err.response?.status === 401) {
      error.value = 'Invalid username or password';
    } else {
      error.value = 'An error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/tokens';

.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px;
  min-height: 100vh;
  background: $surface;
}

.header {
  text-align: center;
  margin-bottom: 48px;
  
  .subtitle {
    color: $text-muted;
    margin-top: 8px;
    font-weight: 500;
  }
}

.form-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.error-banner {
  background: rgba($danger, 0.1);
  color: $danger;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
}

.input-group {
  margin-bottom: 24px;
  
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    font-family: inherit;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
    
    &:focus {
      border-color: $navy;
    }
  }
}

.pill-btn {
  margin-top: 16px;
}
</style>
