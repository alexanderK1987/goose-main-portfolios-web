<template>
  <v-card>
    <v-card-title class="d-flex align-start justify-space-between mb-0 pb-0">
      <v-row>
        <v-col cols="12" class="d-flex align-center flex-wrap justify-space-between">
          <span class="text-no-wrap">Portfolio Net Values</span>
          <v-spacer />
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip dense outlined class="my-n2" v-bind="attrs" v-on="on">
                <v-icon small class="me-1">
                  {{ icons.mdiChartBar }}
                </v-icon>
                Stats
              </v-chip>
            </template>
            <v-card min-width="320" class="py-1">
              <v-card-text class="white--text primary px-4 py-3">
                <span class="font-weight-bold">Portfolio Perfomance</span>
              </v-card-text>
              <v-card-text class="px-3 pb-0">
                <div v-if="Array.isArray(periodStatistics)" class="">
                  <v-row class="my-0 py-0">
                    <v-col cols="3" class="text--primary font-weight-bold text-no-wrap">
                      Period
                    </v-col>
                    <v-col cols="5" class="text-right text--primary font-weight-bold text-no-wrap">
                      Contribution
                    </v-col>
                    <v-col cols="4" class="text-right text--primary font-weight-bold text-no-wrap">
                      Gain / RoR
                    </v-col>
                  </v-row>
                  <div
                    v-for="(entry, idx) in periodStatistics"
                    :key="`period-stats-${idx}`"
                    flat
                    elevation="3"
                  >
                    <v-divider />
                    <v-row class="my-0 py-0">
                      <v-col cols="3" class="text-no-wrap align-center font-weight-bold text--primary">
                        <v-chip outlined>
                          {{ entry.period }}
                        </v-chip>
                      </v-col>
                      <v-col cols="5" class="text-no-wrap text-right">
                        <samp class="pe-1">{{ toCurrency(entry.diffPrincipals) }}</samp>
                      </v-col>
                      <v-col cols="4" class="d-flex flex-column align-end justify-space-around">
                        <v-spacer />
                        <samp class="font-weight-semibold text-no-wrap">{{ toCurrency((entry.diffValue - entry.diffPrincipals)) }}</samp>
                        <samp :class="`${getTrendColor(getROR(entry))}--text text-no-wrap`">{{
                          toUDPercentage(getROR(entry))
                        }}</samp>
                        <v-spacer />
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-divider v-if="$vuetify.breakpoint.mdAndUp" vertical class="ml-2 mr-1" />
          <v-chip-group
            v-model="selectedPeriod"
            :class="[
              'pa-0 my-n2',
              $vuetify.breakpoint.smAndDown ? 'pt-5 flex-grow-1':''
            ]"
          >
            <v-spacer v-if="$vuetify.breakpoint.smAndDown" />
            <v-chip
              v-for="period in timeSeriesPeriods"
              :key="period"
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
        :height="$vuetify.breakpoint.smAndDown ? 200:300"
        :class="[$vuetify.breakpoint.smAndDown ? 'mr-n5 ml-n1 my-n4':'']"
        @mousewheel.stop=""
      />
    </v-card-text>
  </v-card>
</template>
<script>
import VueApexCharts from 'vue-apexcharts';
// eslint-disable-next-line object-curly-newline
import { mdiDotsVertical, mdiTrendingUp, mdiCurrencyUsd, mdiChartBar } from '@mdi/js';
import { toCurrency, toUDPercentage, getTrendColor } from '@/utils/numberTools';
import { dashboardCandlesticksOptions } from '@/utils/apexChartConfigs';

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
      toCurrency,
      toUDPercentage,
      getTrendColor,
      candlesticksChartOptions: dashboardCandlesticksOptions,
      icons: {
        mdiDotsVertical,
        mdiTrendingUp,
        mdiCurrencyUsd,
        mdiChartBar,
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
  methods: {
    getROR(entry) {
      return (entry.diffValue - entry.diffPrincipals) / (entry.baseValue + entry.diffPrincipals);
    },
  },
};
</script>
