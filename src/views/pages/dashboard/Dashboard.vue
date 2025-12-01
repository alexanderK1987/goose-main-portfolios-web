<template>
  <v-row>
    <v-col cols="12" md="8" class="d-flex flex-column">
      <dashboard-picker-and-stats
        v-model="portfolioIdx"
        :portfolios="portfolios"
        :portfolio-latest-data-point="portfolioLatestDataPoint"
        class="flex-grow-1 fill-height"
        @pick-portfolio="pickPortfolioByIndex($event)"
      />
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <dashboard-goal-to-one-million
        v-model="portfolioLatestDataPoint.vClose"
        class="flex-grow-1 fill-height"
      />
    </v-col>

    <v-col cols="12" sm="12" md="8" class="d-flex flex-column">
      <dashboard-time-series
        v-model="portfolioTSeriesPeriod"
        :time-series="visibleTSeries"
        class="flex-grow-1 fill-height"
        @change="switchTSeries($event)"
      />
    </v-col>
    <v-col cols="12" md="4" sm="6" class="d-flex flex-column">
      <dashboard-card-compositions
        :value="compositionData"
        class="flex-grow-1 fill-height"
      />
    </v-col>
    <v-col cols="12" md="4">
      <dashboard-card-sales-by-countries />
    </v-col>
    <v-col cols="12" md="8">
      <dashboard-card-deposit-and-withdraw />
    </v-col>
    <v-col cols="12">
      <dashboard-datatable />
    </v-col>
  </v-row>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { snakeToCamel } from '@/utils/snakeCamelTools';
import siteConfig from '@/../.siteConfig';

// demos
import DashboardGoalToOneMillion from './DashboardGoalToOneMillion.vue';
import DashboardPickerAndStats from './DashboardPickerAndStats.vue';
import DashboardCardCompositions from './DashboardCardCompositions.vue';
import DashboardCardDepositAndWithdraw from './DashboardCardDepositAndWithdraw.vue';
import DashboardCardSalesByCountries from './DashboardCardSalesByCountries.vue';
import DashboardTimeSeries from './DashboardTimeSeries.vue';
import DashboardDatatable from './DashboardDatatable.vue';

export default {
  components: {
    DashboardGoalToOneMillion,
    DashboardPickerAndStats,
    DashboardCardCompositions,
    DashboardCardDepositAndWithdraw,
    DashboardCardSalesByCountries,
    DashboardTimeSeries,
    DashboardDatatable,
  },
  data: () => ({
    portfolioIdx: 0,
    portfolios: [],
    portfolioLatestDataPoint: {},
    portfolioTSeriesPeriod: '1m',
    portfolioTSeriesMaps: {},
    visibleTSeries: [],
    portfolioTickerStats: [],
  }),
  computed: {
    portfolio() {
      return Array.isArray(this.portfolios) ? this.portfolios[this.portfolioIdx] : {};
    },
    compositionData() {
      if (Array.isArray(this.portfolioLatestDataPoint?.positions)) {
        const { positions } = this.portfolioLatestDataPoint;
        const sortedPositions = [...positions].sort((a, b) => b.vClose - a.vClose);

        return [
          { value: this.portfolioLatestDataPoint.cashClose, ticker: '$CASH' },
          ...sortedPositions.map(p => ({ value: p.vClose, ticker: p.ticker })),
        ];
      }

      return [];
    },
  },
  watch: {
    portfolioIdx() {
      this.updateUrlFragment();
      this.getMyPortfolioLastDataPoint();
      this.portfolioTSeriesMaps = {};
      this.getMyPortfolioTSeries();
      this.getMyPortfolioTickerStats();
    },
  },
  async created() {
    this.loading = true;
    await this.getMyPortfolios();
    this.getMyPortfolioLastDataPoint();
    this.getMyPortfolioTSeries();
    this.getMyPortfolioTickerStats();
    this.loading = false;
    this.detectUrlFragment();
    this.updateUrlFragment();
  },
  methods: {
    pickPortfolioByIndex(pickerIdx) {
      this.portfolioIdx = pickerIdx;
    },
    detectUrlFragment() {
      const { hash } = window.location;
      if (hash) {
        this.portfolioIdx = this?.portfolios?.findIndex(
          p => p?._id === hash.substring(1),
        ) || 0;
      }
    },
    updateUrlFragment() {
      window.location.hash = this.portfolio?._id;
    },
    async getMyPortfolios() {
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioList}`;
        const response = await this.$api.get(REQ_URL);
        this.portfolios = snakeToCamel(response.data);
      } catch (err) {
        console.error(err);
      }
    },
    async getMyPortfolioLastDataPoint() {
      if (!this.portfolio) {
        return;
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioLastMarketDayData(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL);
        this.portfolioLatestDataPoint = snakeToCamel(response.data) || {};
      } catch (err) {
        console.error(err);
      }
    },
    async getMyPortfolioTSeries() {
      if (!this.portfolio) {
        return;
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioTSeries(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL, {
          params: { series_mode: this.portfolioTSeriesPeriod },
        });
        this.portfolioTSeriesMaps[this.portfolioTSeriesPeriod] = snakeToCamel(response.data) || {};
        this.visibleTSeries = this.portfolioTSeriesMaps[this.portfolioTSeriesPeriod];
      } catch (err) {
        console.error(err);
      }
    },
    async switchTSeries(seriesMode) {
      this.portfolioTSeriesPeriod = seriesMode;
      if (Array.isArray(this.portfolioTSeriesMaps[this.portfolioTSeriesPeriod])) {
        this.visibleTSeries = this.portfolioTSeriesMaps[this.portfolioTSeriesPeriod];
      }
      this.getMyPortfolioTSeries();
    },
    async getMyPortfolioTickerStats() {
      if (!this.portfolio) {
        return;
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioTickerStats(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL);
        this.portfolioTickerStats = snakeToCamel(response.data) || {};
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
