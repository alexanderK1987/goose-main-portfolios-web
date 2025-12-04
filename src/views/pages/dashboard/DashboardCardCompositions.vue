<template>
  <v-card ref="chartContainer">
    <v-card-title class="d-flex justify-space-between align-start pb-0">
      <span>Compositions</span>
      <v-spacer />
      <v-chip-group class="pa-0 my-n2" @change="groupMinors = !groupMinors">
        <v-chip v-if="!groupMinors" outlined small>
          group minors
        </v-chip>
        <v-chip v-else outlined small>
          ungroup
        </v-chip>
      </v-chip-group>
    </v-card-title>
    <v-card-text class="py-0 my-0">
      <vue-apex-charts
        v-if="Array.isArray(chartData) && chartOptions"
        :options="chartOptions"
        :series="chartData"
        :height="chartHeight"
        @updated="handleChartRedraw"
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
    chartLabelLocations: 'right',
    chartHeight: 300,
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
      return dashboardCompositionDoughnutOptions(this.tickerLabels, this.chartLabelLocations);
    },
  },
  methods: {
    handleChartRedraw() {
      this.$nextTick(() => {
        const container = this.$refs?.chartContainer?.$el;
        if (container) {
          // Update the data properties that the computed property depends on
          if (container.offsetHeight > container.offsetWidth * 0.9) {
            this.chartLabelLocations = 'bottom';
          } else {
            this.chartLabelLocations = 'right';
          }
        }
      });
    },
  },
};
</script>
