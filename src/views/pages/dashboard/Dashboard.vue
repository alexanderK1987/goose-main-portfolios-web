<template>
  <v-row dense>
    <v-col cols="12" md="8" class="d-flex flex-column">
      <dashboard-picker-and-stats
        ref="pickerAndStats"
        v-model="portfolioIdx"
        :portfolios="portfolios"
        :last-market-day-data="lastMarketDayData || {}"
        :penultimate-market-day-data="penultimateMarketDayData || {}"
        :loading="loading"
        :hide-portfolio-values="hidePortfolioValues"
        class="flex-grow-1 fill-height"
        @pick-portfolio="pickPortfolioByIndex($event)"
        @trigger-refresh="triggerRefresh()"
        @toggleHideValues="hidePortfolioValues = !hidePortfolioValues"
      />
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <dashboard-goal
        :value="lastMarketDayData && lastMarketDayData.vClose || 0"
        :goal="portfolio && portfolio.personalGoal || 1e6"
        :hide-portfolio-values="hidePortfolioValues"
        class="flex-grow-1 fill-height"
      />
    </v-col>
    <v-col cols="12" md="8" class="d-flex flex-column">
      <dashboard-time-series
        v-model="portfolioTSeriesPeriod"
        :time-series="visibleTSeries"
        :period-statistics="portfolioPeriodStatistics"
        :hide-portfolio-values="hidePortfolioValues"
        class="flex-grow-1 fill-height"
        @change="changeTSeriesPeriods($event)"
      />
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <dashboard-card-compositions
        :value="compositionData"
        :hide-portfolio-values="hidePortfolioValues"
        class="flex-grow-1 fill-height"
      />
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title class="pb-3">
          Holdings
          <v-spacer />
          <v-btn icon small class="my-n1" @click="showHoldings = !showHoldings">
            <v-icon>
              {{ showHoldings? icons.mdiChevronUp :icons.mdiChevronDown }}
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <dashboard-ticker-stats
            v-if="showHoldings"
            :value="holdingPositionStats"
            :last-market-day-data="lastMarketDayData || {}"
            :penultimate-market-day-data="penultimateMarketDayData || {}"
            :hide-portfolio-values="hidePortfolioValues"
            :ticker-paged-txs="tickerPagedTxs"
            :ticker-paged-tx-loading="tickerPagedTxLoading"
            @query-ticker-tx="queryTickerTxs($event)"
          />
          <v-divider v-else />
        </v-card-text>
        <v-card-title class="pb-3">
          Closed Positions
          <v-spacer />
          <v-btn icon small class="my-n1" @click="showClosedPositions = !showClosedPositions">
            <v-icon>
              {{ showClosedPositions? icons.mdiChevronUp :icons.mdiChevronDown }}
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <dashboard-ticker-stats
            v-if="showClosedPositions"
            is-closed-stats
            :value="closedPositionStats"
            :last-market-day-data="{}"
            :penultimate-market-day-data="{}"
            :hide-portfolio-values="hidePortfolioValues"
            :ticker-paged-txs="tickerPagedTxs"
            :ticker-paged-tx-loading="tickerPagedTxLoading"
            @query-ticker-tx="queryTickerTxs($event)"
          />
          <div v-else class="d-flex align-center pt-2" @click="showClosedPositions = !showClosedPositions">
            <v-divider />
            <span class="mx-2 caption">{{ closedPositionStats.length }} hidden</span>
            <v-divider />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { snakeToCamel, camelToSnake } from '@/utils/snakeCamelTools';
import siteConfig from '@/../.siteConfig';

// demos
import DashboardGoal from './DashboardGoal.vue';
import DashboardPickerAndStats from './DashboardPickerAndStats.vue';
import DashboardCardCompositions from './DashboardCardCompositions.vue';
import DashboardTimeSeries from './DashboardTimeSeries.vue';
import DashboardTickerStats from './DashboardTickerStats.vue';

export default {
  components: {
    DashboardGoal,
    DashboardPickerAndStats,
    DashboardCardCompositions,
    DashboardTimeSeries,
    DashboardTickerStats,
  },
  data: () => ({
    loading: false,
    refreshInterval: null,
    portfolioIdx: 0,
    portfolios: [],
    portfolioLastMarketDays: [],
    portfolioTSeriesPeriod: '1m',
    portfolioTSeriesMaps: {},
    visibleTSeries: [],
    portfolioTickerStats: [],
    portfolioPeriodStatistics: [],
    showHoldings: true,
    showClosedPositions: true,
    hidePortfolioValues: false,
    tickerPagedTxs: {},
    tickerPagedTxLoading: false,
    icons: {
      mdiChevronDown,
      mdiChevronUp,
    },
  }),
  computed: {
    portfolio() {
      return Array.isArray(this.portfolios) ? this.portfolios[this.portfolioIdx] : {};
    },
    lastMarketDayData() {
      return (Array.isArray(this.portfolioLastMarketDays)) ? this.portfolioLastMarketDays[0] : null;
    },
    penultimateMarketDayData() {
      return (Array.isArray(this.portfolioLastMarketDays)) ? this.portfolioLastMarketDays[1] : null;
    },
    compositionData() {
      if (Array.isArray(this.lastMarketDayData?.positions)) {
        const { positions } = this.lastMarketDayData;
        const sortedPositions = [...positions].sort((a, b) => b.vClose - a.vClose);

        return [
          { value: this.lastMarketDayData.cashClose, ticker: '$Cash' },
          ...sortedPositions.map(p => ({ value: p.vClose, ticker: p.ticker })),
        ];
      }

      return [];
    },
    holdingPositionStats() {
      if (this.lastMarketDayData && Array.isArray(this.portfolioTickerStats?.positions)) {
        const holdingPositions = this.lastMarketDayData.positions || [];
        const holdingMap = {};
        for (const position of holdingPositions) {
          holdingMap[position.ticker] = position;
        }
        const holdingTickers = new Set(holdingPositions.map(p => p.ticker));
        const holdingStats = [];
        for (const stat of this.portfolioTickerStats.positions) {
          if (holdingTickers.has(stat.ticker)) {
            const clonedStat = { ...stat };
            holdingStats.push(Object.assign(clonedStat, holdingMap[stat.ticker] || {}));
          }
        }
        holdingStats.sort((a, b) => b.sumCost - a.sumCost);

        return holdingStats;
      }

      return [];
    },
    closedPositionStats() {
      if (Array.isArray(this.portfolioTickerStats?.positions)) {
        const closedStats = this.portfolioTickerStats.positions.filter(
          stat => stat.qtyHold < 1e-5,
        );
        closedStats.sort((a, b) => b.sumRevenue - a.sumRevenue);

        return closedStats;
      }

      return [];
    },
  },
  watch: {
    showClosedPositions(value) {
      localStorage.setItem(
        siteConfig.localStorageKeys.dashboard.showClosedPositions,
        Number(value) || 0,
      );
    },
    hidePortfolioValues(value) {
      localStorage.setItem(
        siteConfig.localStorageKeys.dashboard.hidePortfolioValues,
        Number(value) || 0,
      );
    },
    portfolioIdx() {
      this.updateUrlFragment();
      this.getportfolioLastMarketDays();
      this.portfolioTSeriesMaps = {};
      this.getMyPortfolioTSeries();
      this.getMyPortfolioTickerStats();
      this.getMyPortfolioPeriodStatistics();
    },
  },
  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  async created() {
    this.showClosedPositions = localStorage.getItem(
      siteConfig.localStorageKeys.dashboard.showClosedPositions,
    ) === '1';
    this.hidePortfolioValues = localStorage.getItem(
      siteConfig.localStorageKeys.dashboard.hidePortfolioValues,
    ) === '1';
    this.loading = true;
    await this.getMyPortfolios();
    this.getportfolioLastMarketDays();
    this.getMyPortfolioTSeries();
    this.getMyPortfolioTickerStats();
    this.getMyPortfolioPeriodStatistics();

    this.loading = false;
    this.detectUrlFragment();
    this.updateUrlFragment();
  },
  mounted() {
    // 10 minutes refresh
    this.refreshInterval = setInterval(() => {
      if (this.$refs?.pickerAndStats) {
        this.$refs.pickerAndStats.startCooldown();
      }

      this.triggerRefresh();
    }, 60e3 * 10);
  },
  methods: {
    async queryTickerTxs($event) {
      if (!this.portfolio) {
        return;
      }
      this.tickerPagedTxLoading = true;
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioPagedTxsQuery(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL, { params: camelToSnake($event) });
        this.tickerPagedTxs = snakeToCamel(response.data);
      } catch (err) {
        console.error(err);
      }
      this.tickerPagedTxLoading = false;
    },
    pickPortfolioByIndex(pickerIdx) {
      this.portfolioIdx = pickerIdx;
    },
    detectUrlFragment() {
      const { hash } = window.location;
      if (hash === '#undefined') {
        this.portfolioIdx = 0;
      } else if (hash) {
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
    async getportfolioLastMarketDays() {
      if (!this.portfolio) {
        return;
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioLastMarketDays(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL);
        this.portfolioLastMarketDays = snakeToCamel(response.data) || {};
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
    async changeTSeriesPeriods(seriesMode) {
      if (Array.isArray(this.portfolioTSeriesMaps[seriesMode])) {
        this.visibleTSeries = this.portfolioTSeriesMaps[seriesMode];
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
        const portfolioTickerStats = snakeToCamel(response.data) || {};
        for (const stat of portfolioTickerStats.positions) {
          if (stat.qtyHold > 1e-5) {
            // eslint-disable-next-line no-await-in-loop
            stat.tSeries = await this.getTickerDailyTimeSeries(stat.ticker);
          }
        }
        this.portfolioTickerStats = portfolioTickerStats;
      } catch (err) {
        console.error(err);
      }
    },
    async getMyPortfolioPeriodStatistics() {
      if (!this.portfolio) {
        return;
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioPeriodStatistics(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL);
        this.portfolioPeriodStatistics = snakeToCamel(response.data) || [];
        this.portfolioPeriodStatistics = this.portfolioPeriodStatistics.sort((a, b) => b.periodFirstTimestamp.localeCompare(a.periodFirstTimestamp));
      } catch (err) {
        console.error(err);
      }
    },
    async getTickerDailyTimeSeries(ticker) {
      if (!ticker) {
        return [];
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.marketInfoTickerTimeSeries(ticker)}`;
        const response = await this.$api.get(REQ_URL);

        return Array.isArray(response.data) ? snakeToCamel(response.data) : [];
      } catch (err) {
        console.error(err);
      }

      return [];
    },
    async triggerRefresh() {
      this.loading = true;
      try {
        await this.getportfolioLastMarketDays();
        await this.getMyPortfolioTSeries();
        await this.getMyPortfolioTickerStats();
        await this.getMyPortfolioPeriodStatistics();
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
