<template>
  <v-card>
    <v-card-title class="d-flex align-start justify-space-between mb-0 pb-0">
      <v-row>
        <v-col cols="12" md="4">
          <span class="text-no-wrap">Portfolio Net Values</span>
        </v-col>
        <v-col cols="12" md="8" class="d-flex align-end">
          <v-spacer />
          <v-chip-group v-model="selectedPeriod" class="pa-0 my-n2">
            <v-chip
              v-for="period in timeSeriesPeriods"
              :key="period"
              outlined
              small
              class="ms-1 me-0"
            >
              {{ period }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="py-0 my-0">
      <!-- Chart -->
      <vue-apex-charts
        v-if="Array.isArray(chartData) && candlesticksChartOptions"
        :options="candlesticksChartOptions"
        :series="chartData"
        height="300"
      />
    </v-card-text>
  </v-card>
</template>
<script>
import VueApexCharts from 'vue-apexcharts';
// eslint-disable-next-line object-curly-newline
import { mdiDotsVertical, mdiTrendingUp, mdiCurrencyUsd } from '@mdi/js';
import {
  dashboardCandlesticksOptions,
} from '@/utils/apexChartConfigs';

export default {
  components: {
    VueApexCharts,
  },
  props: {
    value: {
      type: String,
      default: '1m',
    },
    timeSeries: {
      type: Array,
      default: () => ([]),
    },
    periodStatistics: {
      type: Array,
      default: () => ([]),
    },
  },

  data() {
    return {
      candlesticksChartOptions: dashboardCandlesticksOptions,
      icons: {
        mdiDotsVertical,
        mdiTrendingUp,
        mdiCurrencyUsd,
      },
    };
  },

  computed: {
    selectedPeriod: {
      get() {
        return this.timeSeriesPeriods[this.value] || '1m';
      },
      set(val) {
        this.$emit('input', this.timeSeriesPeriods[val]);
        this.$emit('change', this.timeSeriesPeriods[val]);
      },
    },
    timeSeriesPeriods() {
      return ['1m', '3m', '6m', '1y', '5y', 'ytd', 'all'];
    },
    chartData() {
      const data = Array.isArray(this.timeSeries)
        ? this.timeSeries.map(
          dataPoint => ({
            x: new Date(dataPoint.timestamp).getTime(),
            y: [
              dataPoint.vOpen,
              dataPoint.vOpen > dataPoint.vClose ? dataPoint.vOpen : dataPoint.vClose,
              dataPoint.vOpen < dataPoint.vClose ? dataPoint.vOpen : dataPoint.vClose,
              dataPoint.vClose,
            ],
          }),
        )
        : [];

      return [{ data }];
    },
  },
};
</script>
