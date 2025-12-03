<template>
  <v-row>
    <v-col cols="12" md="8" class="d-flex flex-column">
      <dashboard-picker-and-stats
        v-model="portfolioIdx"
        :portfolios="portfolios"
        :portfolio-latest-data-point="portfolioLastMarketDayData"
        class="flex-grow-1 fill-height"
        @pick-portfolio="pickPortfolioByIndex($event)"
      />
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <dashboard-goal-to-one-million
        v-model="portfolioLastMarketDayData.vClose"
        class="flex-grow-1 fill-height"
      />
    </v-col>

    <v-col cols="12" md="8" class="d-flex flex-column">
      <dashboard-time-series
        v-model="portfolioTSeriesPeriod"
        :time-series="visibleTSeries"
        class="flex-grow-1 fill-height"
        @change="switchTSeries($event)"
      />
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <dashboard-card-compositions
        :value="compositionData"
        class="flex-grow-1 fill-height"
      />
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          Holdings
          <v-spacer />
          <v-btn icon small class="my-n1" @click="showHoldings = !showHoldings">
            <v-icon>
              {{ showHoldings? icons.mdiChevronUp :icons.mdiChevronDown }}
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <dashboard-ticker-stats v-if="showHoldings" :value="holdingPositionStats" />
          <v-divider v-else />
        </v-card-text>
        <v-card-title>
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
          />
          <v-divider v-else />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { snakeToCamel } from '@/utils/snakeCamelTools';
import siteConfig from '@/../.siteConfig';

// demos
import DashboardGoalToOneMillion from './DashboardGoalToOneMillion.vue';
import DashboardPickerAndStats from './DashboardPickerAndStats.vue';
import DashboardCardCompositions from './DashboardCardCompositions.vue';
import DashboardTimeSeries from './DashboardTimeSeries.vue';
import DashboardTickerStats from './DashboardTickerStats.vue';

export default {
  components: {
    DashboardGoalToOneMillion,
    DashboardPickerAndStats,
    DashboardCardCompositions,
    DashboardTimeSeries,
    DashboardTickerStats,
  },
  data: () => ({
    portfolioIdx: 0,
    portfolios: [],
    portfolioLastMarketDayData: {},
    portfolioTSeriesPeriod: '1m',
    portfolioTSeriesMaps: {},
    visibleTSeries: [],
    portfolioTickerStats: [],
    showHoldings: true,
    showClosedPositions: true,
    icons: {
      mdiChevronDown,
      mdiChevronUp,
    },
  }),
  computed: {
    portfolio() {
      return Array.isArray(this.portfolios) ? this.portfolios[this.portfolioIdx] : {};
    },
    compositionData() {
      if (Array.isArray(this.portfolioLastMarketDayData?.positions)) {
        const { positions } = this.portfolioLastMarketDayData;
        const sortedPositions = [...positions].sort((a, b) => b.vClose - a.vClose);

        return [
          { value: this.portfolioLastMarketDayData.cashClose, ticker: '$CASH' },
          ...sortedPositions.map(p => ({ value: p.vClose, ticker: p.ticker })),
        ];
      }

      return [];
    },
    holdingPositionStats() {
      if (this.portfolioLastMarketDayData && Array.isArray(this.portfolioTickerStats?.positions)) {
        const holdingPositions = this.portfolioLastMarketDayData.positions || [];
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
    portfolioIdx() {
      this.updateUrlFragment();
      this.getPortfolioLastMarketDayData();
      this.portfolioTSeriesMaps = {};
      this.getMyPortfolioTSeries();
      this.getMyPortfolioTickerStats();
    },
  },
  async created() {
    this.loading = true;
    await this.getMyPortfolios();
    this.getPortfolioLastMarketDayData();
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
    async getPortfolioLastMarketDayData() {
      if (!this.portfolio) {
        return;
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioLastMarketDayData(this.portfolio._id)}`;
        const response = await this.$api.get(REQ_URL);
        this.portfolioLastMarketDayData = snakeToCamel(response.data) || {};
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
        const portfolioTickerStats = snakeToCamel(response.data) || {};
        for (const stat of portfolioTickerStats.positions) {
          if (stat.qtyHold > 1e-5) {
            // eslint-disable-next-line no-await-in-loop
            const tSeries = await this.getTickerDailyTimeSeries(stat.ticker);
            console.log(JSON.stringify(tSeries, null, 2));
            stat.tSeries = [{
              name: 'day trend',
              data: tSeries,
            }];
          }
        }
        this.portfolioTickerStats = portfolioTickerStats;
      } catch (err) {
        console.error(err);
      }
    },
    async getTickerDailyTimeSeries(ticker) {
      if (!ticker) {
        return [];
      }
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.tickerDailyTSeries(ticker)}`;
        const response = await this.$api.get(REQ_URL);

        return Array.isArray(response.data) ? snakeToCamel(response.data).map(dataPoint => ({
          x: new Date(dataPoint.timestamp).getTime(),
          y: dataPoint.pClose,
        })) : [];
      } catch (err) {
        console.error(err);
      }

      return [];
    },
  },
};
</script>
