<template>
  <v-row>
    <v-col cols="12" md="8">
      <dashboard-picker-and-stats
        v-model="portfolioIdx"
        :portfolios="portfolios"
        :portfolio-latest-data-point="portfolioLatestDataPoint"
        @pick-portfolio="pickPortfolioByIndex($event)"
      />
    </v-col>
    <v-col cols="12" md="4">
      <dashboard-goal-to-one-million
        v-model="portfolioLatestDataPoint.vClose"
      />
    </v-col>
    <v-col cols="12" sm="12" md="8">
      <dashboard-time-series
        v-model="portfolioTSeriesPeriod"
        :time-series="visibleTSeries"
        @change="switchTSeries($event)"
      />
    </v-col>
    <v-col cols="12" md="4" sm="6">
      <dashboard-card-total-earning />
    </v-col>
    <v-col cols="12" md="4">
      <v-row class="match-height">
        <v-col cols="12" sm="6">
          <statistics-card-vertical
            :change="totalProfit.change"
            :color="totalProfit.color"
            :icon="totalProfit.icon"
            :statistics="totalProfit.statistics"
            :stat-title="totalProfit.statTitle"
            :subtitle="totalProfit.subtitle"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <statistics-card-vertical
            :change="totalSales.change"
            :color="totalSales.color"
            :icon="totalSales.icon"
            :statistics="totalSales.statistics"
            :stat-title="totalSales.statTitle"
            :subtitle="totalSales.subtitle"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <statistics-card-vertical
            :change="newProject.change"
            :color="newProject.color"
            :icon="newProject.icon"
            :statistics="newProject.statistics"
            :stat-title="newProject.statTitle"
            :subtitle="newProject.subtitle"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <statistics-card-vertical
            :change="salesQueries.change"
            :color="salesQueries.color"
            :icon="salesQueries.icon"
            :statistics="salesQueries.statistics"
            :stat-title="salesQueries.statTitle"
            :subtitle="salesQueries.subtitle"
          />
        </v-col>
      </v-row>
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
import { mdiPoll, mdiLabelVariantOutline, mdiCurrencyUsd, mdiHelpCircleOutline } from '@mdi/js';
import { snakeToCamel } from '@/utils/snakeCamelTools';
import StatisticsCardVertical from '@/components/statistics-card/StatisticsCardVertical.vue';
import siteConfig from '@/../.siteConfig';

// demos
import DashboardGoalToOneMillion from './DashboardGoalToOneMillion.vue';
import DashboardPickerAndStats from './DashboardPickerAndStats.vue';
import DashboardCardTotalEarning from './DashboardCardTotalEarning.vue';
import DashboardCardDepositAndWithdraw from './DashboardCardDepositAndWithdraw.vue';
import DashboardCardSalesByCountries from './DashboardCardSalesByCountries.vue';
import DashboardTimeSeries from './DashboardTimeSeries.vue';
import DashboardDatatable from './DashboardDatatable.vue';

export default {
  components: {
    StatisticsCardVertical,
    DashboardGoalToOneMillion,
    DashboardPickerAndStats,
    DashboardCardTotalEarning,
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

    totalProfit: {
      statTitle: 'Total Profit',
      icon: mdiPoll,
      color: 'success',
      subtitle: 'Weekly Project',
      statistics: '$25.6k',
      change: '+42%',
    },
    totalSales: {
      statTitle: 'Refunds',
      icon: mdiCurrencyUsd,
      color: 'secondary',
      subtitle: 'Past Month',
      statistics: '$78',
      change: '-15%',
    },
    newProject: {
      statTitle: 'New Project',
      icon: mdiLabelVariantOutline,
      color: 'primary',
      subtitle: 'Yearly Project',
      statistics: '862',
      change: '-18%',
    },
    salesQueries: {
      statTitle: 'Sales Quries',
      icon: mdiHelpCircleOutline,
      color: 'warning',
      subtitle: 'Last week',
      statistics: '15',
      change: '-18%',
    },
  }),
  computed: {
    portfolio() {
      return Array.isArray(this.portfolios) ? this.portfolios[this.portfolioIdx] : {};
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
