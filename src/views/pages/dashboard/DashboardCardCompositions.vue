<template>
  <v-card ref="chartContainer">
    <v-card-title class="d-flex justify-space-between align-start">
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
    <v-card-text>
      <vue-apex-charts
        v-if="Array.isArray(chartData) && chartOptions"
        :key="chartKey"
        :options="chartOptions"
        :series="chartData"
        height="270"
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
    hidePortfolioValues: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    groupThreshold: 2.5e-2,
    groupMinors: true,
    chartKey: new Date().getTime(),
    icons: { mdiDotsVertical, mdiMenuUp },
    chartLabelLocations: 'right',
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
      return dashboardCompositionDoughnutOptions(
        this.hidePortfolioValues ? this.tickerLabels.map(x => 'XXX') : this.tickerLabels,
        this.chartLabelLocations,
        this.hidePortfolioValues,
      );
    },
  },
  watch: {
    chartOptions: {
      handler() {
        this.chartKey = new Date().getTime();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleChartRedraw() {
      this.$nextTick(() => {
        const container = this.$refs?.chartContainer?.$el;
        if (container) {
          // Update the data properties that the computed property depends on
          if (container.offsetHeight > container.offsetWidth * 1) {
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
<style scoped>
::v-deep .apexcharts-legend-text {
  margin-left: 0rem !important;
  padding-left: 0.25rem;
}
::v-deep .apexcharts-canvas .apexcharts-pie .apexcharts-datalabel-label {
  font-size: 1.2rem !important;
  transform: translateY(0rem) !important;
}
::v-deep .apexcharts-canvas .apexcharts-pie .apexcharts-datalabel-value {
  font-size: 1.0rem !important;
  transform: translateY(-0.6rem) !important;
}
</style>
