<!-- TODO(LOGO): PLACEHOLDER. Replace with the official Susi Air logo asset from susiair.com (save it in /public, e.g. /public/susi-air-logo.svg, and render it with <img> here). -->
<template>
  <div class="logo-wrapper" :class="size">
    <div class="icon-box">
      <PlaneIcon class="plane" />
    </div>
    <span class="wordmark">Susi Air</span>
  </div>
</template>

<script setup lang="ts">
import { PlaneIcon } from 'lucide-vue-next';

defineProps({
  size: {
    type: String,
    default: 'lg', // 'sm' | 'lg'
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/scss/tokens';

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  
  .icon-box {
    background: $navy;
    color: $surface;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }
  
  .wordmark {
    font-weight: 800;
    color: $navy;
  }
  
  &.lg {
    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }
    .plane {
      width: 28px;
      height: 28px;
    }
    .wordmark {
      font-size: 28px;
    }
  }
  
  &.sm {
    gap: 8px;
    .icon-box {
      width: 32px;
      height: 32px;
    }
    .plane {
      width: 18px;
      height: 18px;
    }
    .wordmark {
      font-size: 18px;
    }
  }
}
</style>
