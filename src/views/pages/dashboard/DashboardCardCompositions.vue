<template>
  <v-card>
    <v-card-title class="align-start">
      <span>Compositions</span>
    </v-card-title>
    <v-card-text>
      <vue-apex-charts
        v-if="Array.isArray(chartData) && chartOptions"
        :options="chartOptions"
        :series="chartData"
        height="350"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiDotsVertical, mdiMenuUp } from '@mdi/js';
import VueApexCharts from 'vue-apexcharts';
import {
  dashboardCompositionDoughnutOptions,
} from '@/utils/apexChartConfigs';

export default {
  components: {
    VueApexCharts,
  },
  props: {
    value: {
      type: Array,
      required: true,
      default: () => ([]),
    },
  },
  data: () => ({
    icons: { mdiDotsVertical, mdiMenuUp },
  }),
  computed: {
    chartData() {
      return this.value.map(x => x.value);
    },
    tickerLabels() {
      return this.value.map(x => x.ticker);
    },
    chartOptions() {
      return dashboardCompositionDoughnutOptions(this.tickerLabels);
    },
  },
};
</script>
