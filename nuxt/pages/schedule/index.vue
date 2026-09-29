<template>
  <div class="schedule-page">
    <div class="page-header">
      <h2>Schedule</h2>
      <div class="month-selector">
        <button @click="changeMonth(-1)" class="icon-btn">&lt;</button>
        <span class="current-month">{{ monthName }} {{ year }}</span>
        <button @click="changeMonth(1)" class="icon-btn">&gt;</button>
      </div>
    </div>

    <!-- Horizontal Legend -->
    <div class="legend-scroll" v-if="scheduleData">
      <div class="legend-container">
        <div 
          v-for="item in scheduleData.legend" 
          :key="item.code" 
          class="legend-item"
        >
          <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="legend-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar" v-if="scheduleData">
      <div class="weekdays">
        <div v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d" class="weekday-cell">{{ d }}</div>
      </div>
      <div class="days-grid">
        <div v-for="empty in blankDays" :key="`empty-${empty}`" class="day-cell empty"></div>
        
        <div 
          v-for="day in daysInMonth" 
          :key="`day-${day}`" 
          class="day-cell"
          :class="{ 'has-schedule': getSchedule(day) }"
          @click="openDay(day)"
        >
          <div class="day-number">{{ day }}</div>
          
          <template v-if="getSchedule(day)">
            <div class="schedule-content">
              <span 
                class="duty-dot" 
                :style="{ backgroundColor: getSchedule(day).base_color }"
              ></span>
              <span class="base-name">{{ getSchedule(day).base_name }}</span>
            </div>
            
            <div v-if="getSchedule(day).remaining > 0" class="remaining-badge">
              {{ getSchedule(day).remaining }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';

const api = useApi();
const router = useRouter();

const year = ref(2026);
const month = ref(4);
const scheduleData = ref<any>(null);

const monthName = computed(() => {
  const d = new Date(year.value, month.value - 1, 1);
  return d.toLocaleString('default', { month: 'long' });
});

const blankDays = computed(() => {
  const d = new Date(year.value, month.value - 1, 1);
  return d.getDay(); // 0-6
});

const daysInMonth = computed(() => {
  return new Date(year.value, month.value, 0).getDate();
});

async function fetchSchedule() {
  try {
    const data = await api.fetch(`/schedules?year=${year.value}&month=${month.value}`);
    scheduleData.value = data;
  } catch (err) {
    console.error('Failed to fetch schedules', err);
  }
}

function changeMonth(delta: number) {
  let m = month.value + delta;
  let y = year.value;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  month.value = m;
  year.value = y;
}

watch([year, month], () => {
  fetchSchedule();
});

onMounted(() => {
  fetchSchedule();
});

function getSchedule(day: number) {
  if (!scheduleData.value) return null;
  const targetDate = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return scheduleData.value.schedules.find((s: any) => s.duty_date === targetDate);
}

function openDay(day: number) {
  const schedule = getSchedule(day);
  if (schedule) {
    router.push(`/schedule/${schedule.duty_date}`);
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/_tokens.scss';
@import '~/assets/scss/_mixins.scss';

.schedule-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 { font-size: 20px; font-weight: 800; }
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $surface;
  padding: 6px 12px;
  border-radius: $radius-pill;
  box-shadow: $shadow-card;

  .current-month {
    font-weight: 600;
    font-size: 14px;
    min-width: 100px;
    text-align: center;
  }
  
  .icon-btn {
    font-size: 16px;
    font-weight: 700;
    color: $navy;
    padding: 0 4px;
  }
}

.legend-scroll {
  overflow-x: auto;
  margin-bottom: 24px;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #E5E7EB;
    border-radius: 4px;
  }
}

.legend-container {
  display: flex;
  gap: 16px;
  width: max-content;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  
  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
}

.calendar {
  @include card;
  padding: 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: $text-muted;
  margin-bottom: 8px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: 12px;
  background: $bg;
  padding: 6px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  
  &.empty {
    background: transparent;
  }
  
  &.has-schedule {
    cursor: pointer;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    
    &:active {
      transform: scale(0.95);
    }
  }

  .day-number {
    font-size: 12px;
    font-weight: 700;
    margin-bottom: auto;
  }

  .schedule-content {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    
    .duty-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    
    .base-name {
      font-size: 10px;
      font-weight: 800;
      color: $navy;
    }
  }

  .remaining-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: $red;
    color: white;
    font-size: 9px;
    font-weight: 800;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    @include flex-center;
    box-shadow: 0 2px 4px rgba($red, 0.3);
  }
}
</style>
