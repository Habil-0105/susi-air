<template>
  <div class="chart-container">
    <Bar
      v-if="chartData"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const chartData = computed(() => {
  if (!props.data || !props.data.points) return null;
  
  // Format labels: just day/month for better view
  const labels = props.data.points.map((p: any) => {
    const d = new Date(p.date);
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  });

  const datasets = [
    {
      label: '7-Day Rolling (Hrs)',
      data: props.data.points.map((p: any) => p.rollingSum),
      backgroundColor: props.data.points.map((p: any) => 
        p.isToday ? '#E63757' : (p.isFuture ? '#E5E7EB' : '#22C5E8')
      ),
      borderRadius: 4,
    }
  ];

  return { labels, datasets };
});

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = props.data.points[context.dataIndex];
            const base = `${context.parsed.y} hrs`;
            if (point.partialWindow) return `${base} (Partial Window)`;
            return base;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: props.data.yMax || 50, // use yMax from API if available
        grid: {
          color: '#F5F6F8'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
});
</script>

<style scoped>
.chart-container {
  height: 250px;
  width: 100%;
}
</style>
