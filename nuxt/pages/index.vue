<template>
  <div class="home-page">
    <div class="header">
      <AppLogo size="sm" />
      <div class="profile-summary" v-if="pilotData">
        <img :src="pilotData.avatarUrl" alt="Avatar" class="avatar" />
        <div class="pilot-info">
          <h3>{{ pilotData.name }}</h3>
          <p class="text-muted">{{ pilotData.totalFlightHours }} Total Hrs</p>
        </div>
      </div>
    </div>

    <!-- Documents Expiry -->
    <section class="section docs-section" v-if="documentsData">
      <h3 class="section-title">Documents Status</h3>
      <div class="chips-container">
        <div 
          v-for="doc in documentsData.documents" 
          :key="doc.id"
          class="doc-chip"
          :class="`status-${doc.status}`"
        >
          <span class="doc-label">{{ doc.label }}</span>
          <span class="doc-days" v-if="doc.daysRemaining > 0">{{ doc.daysRemaining }}d</span>
          <span class="doc-days" v-else>Expired</span>
        </div>
      </div>
    </section>

    <!-- Flight Hours Chart -->
    <section class="section chart-section" v-if="summaryData">
      <div class="section-header">
        <h3 class="section-title">7-Day Rolling Sum</h3>
        <span class="limit-badge">Limit: {{ summaryData.limit }} hrs</span>
      </div>
      <div class="card">
        <FlightHoursChart :data="summaryData" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

const api = useApi();
const pilotData = ref<any>(null);
const documentsData = ref<any>(null);
const summaryData = ref<any>(null);

onMounted(async () => {
  try {
    const [pilot, docs, summary] = await Promise.all([
      api.fetch('/pilot/me'),
      api.fetch('/documents'),
      api.fetch('/flight-hours/summary?range=1w')
    ]);
    pilotData.value = pilot;
    documentsData.value = docs;
    summaryData.value = summary;
  } catch (err) {
    console.error('Failed to fetch home data:', err);
  }
});
</script>

<style lang="scss" scoped>
@import '~/assets/scss/tokens';
@import '~/assets/scss/mixins';

.home-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: right;
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: $radius-pill;
    object-fit: cover;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 700;
  }
  p {
    font-size: 13px;
  }
}

.section {
  margin-bottom: 32px;
  
  &-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 16px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .section-title {
    margin-bottom: 0;
  }
}

.limit-badge {
  background: rgba($warning, 0.15);
  color: #B45309; /* Darker warning color for text */
  padding: 4px 10px;
  border-radius: $radius-pill;
  font-size: 12px;
  font-weight: 700;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.doc-chip {
  @include flex-center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: $radius-pill;
  font-size: 13px;
  font-weight: 600;
  background: $surface;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #E5E7EB;
  
  &.status-safe {
    border-left: 4px solid $success;
  }
  &.status-soon {
    border-left: 4px solid $warning;
    background: rgba($warning, 0.05);
  }
  &.status-expired {
    border-left: 4px solid $danger;
    background: rgba($danger, 0.05);
    color: $danger;
  }
  
  .doc-days {
    opacity: 0.7;
    font-size: 12px;
  }
}

.card {
  @include card;
  padding: 16px;
}
</style>
