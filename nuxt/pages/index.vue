<template>
  <div class="home-page">
    <div class="header">
      <div class="header-left">
        <AppLogo size="sm" />
        <h2 class="greeting">{{ greeting }}</h2>
      </div>
      <div class="profile-summary" v-if="pilotData">
        <div class="pilot-info">
          <h3>{{ pilotData.name }}</h3>
          <p class="text-muted"><strong>{{ pilotData.totalFlightHours }}</strong> Total Hrs</p>
        </div>
        <img :src="pilotData.avatarUrl" alt="Avatar" class="avatar" />
      </div>
      <div v-else-if="loading" class="profile-skeleton"></div>
    </div>

    <!-- Limits Cards -->
    <section class="section limits-section">
      <h3 class="section-title">Hours to Limit</h3>
      <div class="cards-grid" v-if="limitsData">
        <div class="limit-card" v-for="card in limitsData.cards" :key="card.key">
          <div class="card-header">
            <span class="card-label">{{ card.label }}</span>
            <span class="card-values">
              <strong>{{ card.hours }}</strong> / {{ card.limit }}h
            </span>
          </div>
          <div class="progress-bg">
            <div 
              class="progress-fill" 
              :class="`status-${card.status}`"
              :style="{ width: `${Math.min(card.percent, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
      <div class="cards-grid" v-else-if="loading">
        <div class="limit-card skeleton" v-for="i in 4" :key="i"></div>
      </div>
    </section>

    <!-- My Documents -->
    <section class="section docs-section">
      <h3 class="section-title">My Documents</h3>
      <div class="docs-list" v-if="documentsData">
        <div 
          v-for="doc in documentsData.documents" 
          :key="doc.id"
          class="doc-row"
        >
          <div class="doc-info">
            <span class="doc-label">{{ doc.label }}</span>
            <span class="doc-date">{{ formatDate(doc.expiryDate) }}</span>
          </div>
          <div class="doc-badge" :class="`badge-${doc.status}`">
            <span v-if="doc.status === 'safe'">Safe</span>
            <span v-else-if="doc.status === 'soon'">Expires in {{ doc.daysRemaining }} days</span>
            <span v-else>Expired</span>
          </div>
        </div>
      </div>
      <div class="docs-list" v-else-if="loading">
        <div class="doc-row skeleton" v-for="i in 4" :key="i" style="height: 54px"></div>
      </div>
    </section>

    <!-- Flight Hours Chart -->
    <section class="section chart-section">
      <div class="section-header">
        <h3 class="section-title">Flight Trend</h3>
        <div class="chart-toggles">
          <button 
            v-for="r in ['1w', '1m', '3m', '6m', '1y']" 
            :key="r"
            class="toggle-btn"
            :class="{ active: selectedRange === r }"
            :aria-pressed="selectedRange === r"
            @click="changeRange(r)"
          >
            {{ r }}
          </button>
        </div>
      </div>
      
      <div class="card" v-if="summaryData && !loadingChart">
        <div class="chart-header">
          <span class="chart-subtitle">{{ summaryData.windowDays }}-Day Rolling Sum</span>
          <span class="limit-badge">Limit: {{ summaryData.limit }} hrs</span>
        </div>
        <FlightHoursChart :data="summaryData" />
      </div>
      <div class="card skeleton" v-else style="height: 300px"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

const api = useApi();
const pilotData = ref<any>(null);
const documentsData = ref<any>(null);
const limitsData = ref<any>(null);

const summaryData = ref<any>(null);
const selectedRange = ref('1w');

const loading = ref(true);
const loadingChart = ref(false);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
});

async function loadInitialData() {
  loading.value = true;
  try {
    const [pilot, docs, limits, summary] = await Promise.all([
      api.fetch('/pilot/me'),
      api.fetch('/documents'),
      api.fetch('/flight-hours/limits'),
      api.fetch(`/flight-hours/summary?range=${selectedRange.value}`)
    ]);
    pilotData.value = pilot;
    documentsData.value = docs;
    limitsData.value = limits;
    summaryData.value = summary;
  } catch (err) {
    console.error('Failed to fetch home data:', err);
  } finally {
    loading.value = false;
  }
}

async function changeRange(range: string) {
  if (selectedRange.value === range) return;
  selectedRange.value = range;
  loadingChart.value = true;
  try {
    summaryData.value = await api.fetch(`/flight-hours/summary?range=${range}`);
  } catch (err) {
    console.error('Failed to fetch chart data:', err);
  } finally {
    loadingChart.value = false;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(() => {
  loadInitialData();
});
</script>

<style lang="scss" scoped>
@import '~/assets/scss/_tokens.scss';
@import '~/assets/scss/_mixins.scss';

.home-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.greeting {
  font-size: 16px;
  font-weight: 800;
  color: $navy;
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

.chart-toggles {
  display: flex;
  background: #E5E7EB;
  border-radius: $radius-pill;
  padding: 4px;
  
  .toggle-btn {
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: $radius-pill;
    color: $text-muted;
    
    &.active {
      background: $surface;
      color: $navy;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .chart-subtitle {
    font-size: 12px;
    font-weight: 600;
    color: $text-muted;
  }
}

.limit-badge {
  background: rgba($warning, 0.15);
  color: #B45309;
  padding: 4px 10px;
  border-radius: $radius-pill;
  font-size: 12px;
  font-weight: 700;
}

/* Limit Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.limit-card {
  @include card;
  padding: 12px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    align-items: baseline;
    
    .card-label {
      font-size: 13px;
      font-weight: 600;
      color: $text-muted;
    }
    .card-values {
      font-size: 12px;
      color: $text-muted;
      strong {
        color: $navy;
        font-size: 14px;
      }
    }
  }
  
  .progress-bg {
    height: 6px;
    background: #E5E7EB;
    border-radius: $radius-pill;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      border-radius: $radius-pill;
      transition: width 0.3s ease;
      
      &.status-safe { background: $success; }
      &.status-soon { background: $warning; }
      &.status-exceeded { background: $danger; }
    }
  }
}

.docs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-row {
  @include card;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  
  .doc-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .doc-label {
      font-size: 14px;
      font-weight: 700;
      color: $navy;
    }
    .doc-date {
      font-size: 12px;
      color: $text-muted;
    }
  }
  
  .doc-badge {
    padding: 6px 12px;
    border-radius: $radius-pill;
    font-size: 11px;
    font-weight: 700;
    
    &.badge-safe {
      background: rgba($success, 0.1);
      color: darken($success, 10%);
    }
    &.badge-soon {
      background: rgba($warning, 0.1);
      color: darken($warning, 15%);
    }
    &.badge-expired {
      background: rgba($danger, 0.1);
      color: $danger;
    }
  }
}

.card {
  @include card;
  padding: 16px;
}

/* Skeletons */
.skeleton {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}
@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
