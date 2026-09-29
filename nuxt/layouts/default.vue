<template>
  <div class="mobile-container layout">
    <main class="content">
      <slot />
    </main>
    <nav class="bottom-nav" v-if="showNav">
      <NuxtLink to="/" class="nav-item" active-class="active">
        <HomeIcon class="icon" />
        <span>Home</span>
      </NuxtLink>
      <NuxtLink to="/schedule" class="nav-item" active-class="active">
        <CalendarDaysIcon class="icon" />
        <span>Schedule</span>
      </NuxtLink>
      <NuxtLink to="/logbook" class="nav-item" active-class="active">
        <BookOpenIcon class="icon" />
        <span>Logbook</span>
      </NuxtLink>
      <NuxtLink to="/more" class="nav-item" active-class="active">
        <MenuIcon class="icon" />
        <span>More</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, CalendarDaysIcon, BookOpenIcon, MenuIcon } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const showNav = computed(() => route.path !== '/login');
</script>

<style lang="scss" scoped>
@import '~/assets/scss/_tokens.scss';

.layout {
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding-bottom: calc(70px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: $surface;
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -1px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $text-muted;
  font-size: 11px;
  font-weight: 500;
  gap: 4px;
  
  .icon {
    width: 24px;
    height: 24px;
    stroke-width: 2px;
  }
  
  &.active {
    color: $red;
  }
}
</style>
