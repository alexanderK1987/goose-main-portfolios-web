<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-start">
      <span>Compositions</span>
      <v-spacer />
      <v-btn
        v-model="groupSmallPositions"
        class="my-0 py-0 mr-n2"
        dense
        flat
        outlined
        rounded
        hide-details
        x-small
        color="secondary"
        @click="groupMinors = !groupMinors"
      >
        {{ groupMinors ? 'ungroup' : 'group minors' }}
      </v-btn>
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
    groupThreshold: 2.5e-2,
    groupMinors: true,
    icons: { mdiDotsVertical, mdiMenuUp },
  }),
  computed: {
    totalValue() {
      if (!Array.isArray(this.value)) {
        return 0;
      }

      return this.value.map(p => p.value).reduce((a, b) => a + b, 0);
    },
    groupedIndex() {
      if (!Array.isArray(this.value)) {
        return 0;
      }
      for (let i = 0; i < this.value.length; i += 1) {
        if (this.value[i].ticker[0] === '$') {
          continue;
        } else if (this.value[i].value / this.totalValue < this.groupThreshold) {
          return i;
        }
      }

      return this.value.length;
    },
    chartData() {
      if (this.groupMinors) {
        const displayedData = this.value.slice(0, this.groupedIndex);
        const displayedSum = displayedData.map(p => p.value).reduce((a, b) => a + b, 0);
        const remainingSum = this.totalValue - displayedSum;

        return [
          ...displayedData.map(p => p.value),
          ...(remainingSum > 1e-5 ? [remainingSum] : []),
        ];
      }

      return this.value.map(p => p.value);
    },
    tickerLabels() {
      if (this.groupMinors) {
        const displayedData = this.value.slice(0, this.groupedIndex);
        const displayedSum = displayedData.map(p => p.value).reduce((a, b) => a + b, 0);
        const remainingSum = this.totalValue - displayedSum;

        return [
          ...displayedData.map(p => p.ticker),
          ...(remainingSum > 1e-5 ? ['others'] : []),
        ];
      }

      return this.value.map(p => p.ticker);
    },
    chartOptions() {
      return dashboardCompositionDoughnutOptions(this.tickerLabels);
    },
  },
};
</script>
