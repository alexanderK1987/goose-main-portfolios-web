<template>
  <v-card>
    <v-card-title class="d-flex align-start justify-space-between">
      <v-row>
        <v-col cols="12" md="4">
          <span>Net Values</span>
        </v-col>
        <v-col cols="12" md="8" class="d-flex align-end">
          <v-spacer />
          <v-chip-group v-model="selectedPeriod" class="pa-0 my-n2">
            <v-chip
              v-for="period in timeSeriesPeriods"
              :key="period"
              outlined
              small
              class="mx-1"
            >
              {{ period }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <!-- Chart -->
      <vue-apex-charts
        v-if="Array.isArray(chartData) && apexChartOptions"
        :options="apexChartOptions"
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

export default {
  components: {
    VueApexCharts,
  },
  props: {
    value: {
      type: String,
      default: '6m',
    },
    timeSeries: {
      type: Array,
      default: () => ([]),
    },
  },

  data() {
    return {
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
        return this.timeSeriesPeriods[this.value];
      },
      set(val) {
        this.$emit('change', this.timeSeriesPeriods[val]);
      },
    },
    timeSeriesPeriods() {
      return ['7d', '1m', '3m', '6m', '5y', '10y', 'ytd', 'all'];
    },
    chartData() {
      const entries = Array.isArray(this.timeSeries)
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

      return [
        {
          data: entries,
        },
      ];
    },
    apexChartOptions() {
      return {
        chart: {
          type: 'candlestick',
          toolbar: { show: false },
          offsetX: -15,
        },

        // 2. Update plotOptions for candlestick
        plotOptions: {
          candlestick: {
            // You can customize colors for rising/falling candles here
            colors: {
              up: '#00B746', // Green for rising (Close > Open)
              down: '#EF403C', // Red for falling (Close < Open)
            },

            // Remove bar-specific options like columnWidth, distributed, borderRadius
          },
        },

        dataLabels: { enabled: false },
        legend: { show: false },

        xaxis: {
          // 3. Candlestick charts usually use Date/Time values for the X-axis
          // We will define a more appropriate X-axis in the data example below.
          type: 'datetime',

          // Preserve existing look options
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            show: false,
            style: { fontSize: '12px' },
          },
        },

        yaxis: {
          show: true,
          tickAmount: 4,
          labels: {
            offsetY: 3,
            formatter: value => `$${value}`, // Keep the currency formatter
          },
        },

        stroke: { width: [1] }, // Candlestick strokes are usually thinner

        grid: {
          strokeDashArray: 5, // Use a finer dash array
          padding: { right: 0 },
        },
      };
    },
  },
};
</script>
