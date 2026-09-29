<template>
  <div class="logo-wrapper" :class="size">
    <img :src="'/logo-susiair.png'" alt="Susi Air Logo" class="real-logo" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'lg', // 'sm' | 'lg'
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/scss/_tokens.scss';

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .real-logo {
    object-fit: contain;
    width: auto;
  }
  
  &.lg {
    .real-logo {
      height: 48px;
    }
  }
  
  &.sm {
    .real-logo {
      height: 24px;
    }
  }
}
</style>
