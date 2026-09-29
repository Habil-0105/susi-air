<template>
  <div class="placeholder-page">
    <h2>More</h2>
    <p>More page placeholder.</p>
    <button @click="auth.logout()" class="pill-btn" style="margin-top: 24px;">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
const auth = useAuthStore();
</script>

<style scoped>
.placeholder-page { padding: 24px; }
</style>
