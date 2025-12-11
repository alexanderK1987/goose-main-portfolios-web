<template>
  <v-card>
    <v-menu
      v-model="showTxCostMenu"
      offset-y
      absolute
      :position-x="menuX"
      :position-y="menuY"
      close-on-content-click
    >
      <v-card v-if="menuTargetItem" max-width="15em" min-width="12em">
        <v-card-text class="white--text error py-2 px-4">
          <span class="font-weight-bold">{{ menuTargetItem.ticker }}</span> - transaction cost
        </v-card-text>
        <v-card-text class="caption pa-2">
          <v-row no-gutters>
            <v-col cols="1" />
            <v-col cols="6">
              Capital gain tax
            </v-col>
            <v-col cols="5" class="text-right">
              <samp>{{ toCurrency(menuTargetItem.sumTaxCgain) }}</samp>
            </v-col>
            <v-col cols="1" />
            <v-col cols="6">
              Dividend tax
            </v-col>
            <v-col cols="5" class="text-right">
              <samp>{{ toCurrency(menuTargetItem.sumTaxDividend) }}</samp>
            </v-col>
            <v-col cols="1">
              +
            </v-col>
            <v-col cols="6">
              Tx. fee
            </v-col>
            <v-col cols="5" class="text-right">
              <samp>{{ toCurrency(menuTargetItem.sumTxFee) }}</samp>
            </v-col>
            <v-col cols="12">
              <hr>
            </v-col>
            <v-col cols="1">
              =
            </v-col>
            <v-col cols="6" class="font-weight-bold">
              Total tx. cost
            </v-col>
            <v-col cols="5" class="text-right font-weight-bold error--text">
              <samp>{{ toCurrency(getTxCost(menuTargetItem)) }}</samp>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>
    <v-menu
      v-model="showPnLMenu"
      offset-y
      absolute
      :position-x="menuX"
      :position-y="menuY"
      close-on-content-click
    >
      <v-card v-if="menuTargetItem" max-width="18em" min-width="15em">
        <v-card-text class="info white--text py-2 px-4">
          <span class="font-weight-bold">{{ menuTargetItem.ticker }}</span> - profits &amp; losses
        </v-card-text>
        <v-card-text class="caption pa-2">
          <v-row no-gutters>
            <v-col cols="1" />
            <v-col cols="6">
              Realized gain
            </v-col>
            <v-col cols="5" class="text-right">
              <samp>{{ toCurrency(menuTargetItem.sumRealizedGain) }}</samp>
            </v-col>
            <v-col v-if="menuTargetItem.qtyHold" cols="1" />
            <v-col v-if="menuTargetItem.qtyHold > 1e-5" cols="6">
              Unrealized gain
            </v-col>
            <v-col v-if="menuTargetItem.qtyHold > 1e-5" cols="5" class="text-right">
              <samp>{{ toCurrency(menuTargetItem.vClose - menuTargetItem.sumHoldingCost) }}</samp>
            </v-col>
            <v-col cols="1">
              +
            </v-col>
            <v-col cols="6">
              Dividends
            </v-col>
            <v-col cols="5" class="text-right">
              <samp>{{ toCurrency(menuTargetItem.sumDividend) }}</samp>
            </v-col>
            <v-col cols="12">
              <hr>
            </v-col>
            <v-col cols="1">
              =
            </v-col>
            <v-col cols="6">
              Profits
            </v-col>
            <v-col cols="5" class="text-right font-weight-bold success--text">
              <samp>{{ toCurrency(getPNL(menuTargetItem) + getTxCost(menuTargetItem)) }}</samp>
            </v-col>

            <v-col cols="1">
              -
            </v-col>
            <v-col cols="5">
              Tx. costs
            </v-col>
            <v-col cols="6" class="text-right font-weight-bold error--text">
              <samp>{{ toCurrency(getTxCost(menuTargetItem)) }}</samp>
            </v-col>
            <v-col cols="12">
              <hr>
            </v-col>
            <v-col cols="1">
              =
            </v-col>
            <v-col cols="6" class="font-weight-semibold">
              Total P/L
            </v-col>
            <v-col cols="5" class="text-right font-weight-bold info--text">
              <samp>{{ toCurrency(getPNL(menuTargetItem)) }}</samp>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-data-table
      :headers="headers"
      :items="value"
      :custom-sort="customSort"
      item-key="ticker"
      class="table-rounded elevation-4"
      dense
    >
      <!-- MOBILE VIEW -->
      <template v-if="$vuetify.breakpoint.smAndDown" v-slot:item="{ item }">
        <div class="pa-2">
          <!-- ticker -->
          <div class="d-flex justify-space-between align-center pt-1">
            <div class="text-no-wrap me-2">
              <code class="text-lg">{{ hidePortfolioValues ? '###' :item.ticker }}</code>
            </div>
            <span class="secondary--text text-xs d-flex flex-column">
              <span>
                <samp class="text--secondary pe-1">{{ hidePortfolioValues ? '#,###' : ( item.qtyHold || item.qtyAdded || 0).toLocaleString() }}</samp>shares
              </span>
              <span v-if="item.qtyHold > 1e-5">
                <samp class="text--secondary">{{ hidePortfolioValues ? '##.##%' : toPercentage(getHoldingPositionPortions(item), false) }}</samp>
              </span>
            </span>
            <v-spacer />
            <vue-apex-charts
              v-if="Array.isArray(item && item.tSeries)"
              :key="item.chartKey + 'mobile'"
              :options="sparklineOptions(getDayChangePercentages(item))"
              :series="toSparklineData(item)"
              width="140"
              height="36"
              @updated="handleChartRedraw(item, true)"
            />
          </div>
          <!-- day change -->
          <div v-if="!isClosedStats" class="d-flex justify-space-between align-center px-1 pt-1">
            <span class="caption text--secondary">Day Change</span>
            <div class="text-right">
              <samp
                :class="`${getTrendColor(getDayChangePercentages(item))}--text pe-2 text-sm`"
              >{{ hidePortfolioValues ? '##.##%' :toUDPercentage(getDayChangePercentages(item)) }}</samp>/
              <samp class="text-sm ps-1">{{ hidePortfolioValues ? '$###,###.##' : toCurrency(getDayChange(item)) }}</samp>
            </div>
          </div>
          <!-- profits and losses -->
          <div class="d-flex justify-space-between align-center px-1 pt-1">
            <span class="caption text--secondary">Total P/L</span>
            <a class="pa-0 mx-0 text--primary" @click="popPnLMenu($event, item)">
              <samp :class="`${getTrendColor(getGainPercentages(item))}--text text-no-wrap ps-1 text-sm`">
                {{ hidePortfolioValues ? '##.##%' : toUDPercentage(getGainPercentages(item)) }}
              </samp>/
              <samp class="text-sm ps-1">{{ hidePortfolioValues ? '$###,###.##' : toCurrency(getPNL(item)) }}</samp>
            </a>
          </div>
          <!-- avg. revenue/price vs avg. cost -->
          <div class="d-flex justify-space-between align-center px-1 pt-1">
            <span v-if="isClosedStats" class="caption text--secondary">Avg. revn./cost</span>
            <span v-else class="caption text--secondary">Price/avg. cost</span>
            <div class="text-right">
              <span v-if="isClosedStats" class="pe-2">
                <samp class="text-sm">{{ hidePortfolioValues ? '$###.##' : toCurrency(item.sumRevenue / item.qtyDeced) }}</samp>
              </span>
              <span v-else class="pe-2">
                <samp class="text-sm">{{ hidePortfolioValues ? '$###.##' : toCurrency(item.pClose) }}</samp>
              </span>
              <span>/</span>
              <samp class="text-sm ps-2">{{ hidePortfolioValues ? '$###.##' : toCurrency(item.sumCost / item.qtyAdded) }}</samp>
            </div>
          </div>
          <!-- dividends -->
          <div class="d-flex justify-space-between align-center px-1  pt-1">
            <span class="caption text--secondary">Post-tax dividends</span>
            <div class="text-right">
              <samp class="text-sm ps-1">{{ hidePortfolioValues ? '$###,###.##' : toCurrency(item.sumDividend) }}</samp>
            </div>
          </div>
        </div>
        <v-divider />
      </template>
      <!-- DESKTOP VIEW -->
      <template
        v-for="header in headers"
        v-else
        #[`item.${header.value}`]="{ item }"
      >
        <div :key="header.value" style="height: 20px">
          <span v-if="header.value === 'ticker'" class="text-base">
            <code>&nbsp;{{ hidePortfolioValues ? '###' : item.ticker }}&nbsp;</code>
          </span>
          <div v-else-if="header.value === 'dayChange'" class="text-no-wrap">
            <samp class="text--primary">
              {{ hidePortfolioValues ? '$###.##' : toCurrency(getDayChange(item)) }}
            </samp>
            <span class="pe-2 secondary--text text-lg">/</span>
            <samp
              :class="`${getTrendColor(getDayChangePercentages(item))}--text`
              "
            >{{ hidePortfolioValues ? '##.##%' : toUDPercentage(getDayChangePercentages(item)) }}</samp>
          </div>
          <vue-apex-charts
            v-if="header.value === 'dayTrend'"
            :key="item.chartKey"
            :options="sparklineOptions(getDayChangePercentages(item))"
            :series="toSparklineData(item)"
            width="120"
            height="36"
            class="pr-0 mr-n2"
            @updated="handleChartRedraw(item)"
          />
          <div v-else-if="header.value === 'PNL'">
            <a class="pa-0 mx-0 text--primary" @click="popPnLMenu($event, item)">
              <samp>{{ hidePortfolioValues ? '$###.##' : toCurrency(getPNL(item)) }}</samp>
            </a>
          </div>
          <div v-else-if="header.value === 'PNL%'">
            <samp :class="`${getTrendColor(getGainPercentages(item))}--text text-no-wrap`" @click="popPnLMenu($event, item)">
              {{ hidePortfolioValues ? '##.##%' : toUDPercentage(getGainPercentages(item)) }}
            </samp>
          </div>
          <div v-else-if="header.value === 'txCost'">
            <a class="pa-0 mx-0 text--primary" @click="popTxCostMenu($event, item)">
              <samp>{{ hidePortfolioValues ? '$###.##' : toCurrency(getTxCost(item)) }}</samp>
            </a>
          </div>
          <div v-else-if="header.value === 'closedAvgRevenue'">
            <samp class="text-right">
              {{ hidePortfolioValues ? '$###.##' : toCurrency(item.sumRevenue / item.qtyDeced) }}
            </samp>
          </div>
          <div v-else-if="header.value === 'closedAvgCost'">
            <samp class="text-right">
              {{ hidePortfolioValues ? '$###.##' : toCurrency(item.sumCost / item.qtyAdded) }}
            </samp>
          </div>
          <div v-else-if="header.type === '$'" class="text-right">
            <samp>{{ hidePortfolioValues ? '$###.##' : toCurrency(item[header.value]) }}</samp>
          </div>
          <div v-else-if="header.type === '#'" class="text-right">
            <samp>{{ hidePortfolioValues ? '###.##' : item[header.value].toLocaleString() }}</samp>
          </div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mdiInformationOutline, mdiChartPie } from '@mdi/js';
import VueApexCharts from 'vue-apexcharts';
import {
  toCurrency, toPercentage, getTrendColor, toUDPercentage,
} from '@/utils/numberTools';

import {
  sparklineOptions,
} from '@/utils/apexChartConfigs';

export default {
  components: {
    VueApexCharts,
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    isClosedStats: {
      type: Boolean,
      default: false,
    },
    lastMarketDayData: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    penultimateMarketDayData: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    hidePortfolioValues: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    sparklineOptions,
    toCurrency,
    toPercentage,
    toUDPercentage,
    getTrendColor,
    icons: {
      mdiChartPie,
      mdiInformationOutline,
    },
    menuTargetItem: null,
    showTxCostMenu: false,
    showPnLMenu: false,
    menuX: 0,
    menuY: 0,
  }),
  computed: {
    headers() {
      if (!this.isClosedStats) {
        return [
          {
            text: 'Ticker', value: 'ticker', align: 'center',
          },
          {
            text: 'Day Change', value: 'dayChange', align: 'end',
          },
          {
            text: 'Day Trend', value: 'dayTrend',
          },
          {
            text: 'Price', value: 'pClose', type: '$', align: 'end',
          },
          {
            text: 'Shares', value: 'qtyHold', type: '#', align: 'end',
          },
          {
            text: 'Avg. Cost', value: 'avgCost', type: '$', align: 'end',
          },
          {
            text: 'Total P/L%', value: 'PNL%', type: '%', align: 'end',
          },
          {
            text: 'Total P/L', value: 'PNL', type: '$', align: 'end',
          },
          {
            text: 'Holding Value', value: 'vClose', type: '$', align: 'end',
          },
          {
            text: 'Dividends', value: 'sumDividend', type: '$', align: 'end',
          },
          {
            text: 'Tx. Costs', value: 'txCost', type: '$', align: 'end',
          }, // sumTaxDividend and sumTaxCgain
        ];
      }

      return [
        {
          text: 'Ticker', value: 'ticker', type: 'T', align: 'center',
        },
        {
          text: 'Total P/L%', value: 'PNL%', type: '%', align: 'end',
        },
        {
          text: 'Total P/L', value: 'PNL', type: '$', align: 'end',
        },
        {
          text: 'Avg. Revenue', value: 'closedAvgRevenue', type: '$', align: 'end',
        },
        {
          text: 'Avg. Cost', value: 'closedAvgCost', type: '$', align: 'end',
        },
        {
          text: 'Shares Held', value: 'qtyAdded', type: '#', align: 'end',
        },
        {
          text: 'Dividends', value: 'sumDividend', type: '$', align: 'end',
        },
        {
          text: 'Tx. Costs', value: 'txCost', type: '$', align: 'end',
        }, // sumTaxDividend and sumTaxCgain
      ];
    },
  },
  methods: {
    getHoldingPositionPortions(item) {
      return item.vClose / this.lastMarketDayData.vClose;
    },
    popPnLMenu($event, item) {
      this.showTxCostMenu = false;
      this.showPnLMenu = true;
      const targetElement = $event.currentTarget;
      const rect = targetElement.getBoundingClientRect();
      this.menuX = rect.left;
      this.menuY = rect.bottom;
      this.menuTargetItem = item;
    },
    popTxCostMenu($event, item) {
      this.showPnLMenu = false;
      this.showTxCostMenu = true;
      const targetElement = $event.currentTarget;
      const rect = targetElement.getBoundingClientRect();
      this.menuX = rect.left;
      this.menuY = rect.bottom;
      this.menuTargetItem = item;
    },
    getBasePrice(item) {
      const penultimatePositions = this.penultimateMarketDayData?.positions;
      if (Array.isArray(penultimatePositions)) {
        const basePosition = penultimatePositions.find(p => p.ticker === item.ticker);
        if (basePosition) {
          return basePosition.pClose;
        }
      }
      const data = item?.tSeries[0]?.data;
      if (Array.isArray(data) && data.length) {
        return data[0].y;
      }

      const lastPositions = this.lastMarketDayData?.positions;
      if (Array.isArray(lastPositions)) {
        const basePosition = lastPositions.find(p => p.ticker === item.ticker);
        if (basePosition) {
          return basePosition.pOpen;
        }
      }

      return 0;
    },
    getDayChange(item) {
      if (!(Array.isArray(item.tSeries) && item.tSeries.length)) return 0;

      const base = this.getBasePrice(item);
      const current = item.tSeries[item.tSeries.length - 1].pClose;

      return (current - base) * item.qtyHold;
    },
    getDayChangePercentages(item) {
      if (!(Array.isArray(item.tSeries) && item.tSeries.length)) return 0;

      const base = this.getBasePrice(item);
      const current = item.tSeries[item.tSeries.length - 1].pClose;

      return current / base - 1.0;
    },
    getTxCost(item) {
      return item.sumTaxDividend + item.sumTaxCgain + item.sumTxFee;
    },
    getPNL(item) {
      if (item.qtyHold > 1e-5) {
        return item.sumRealizedGain + item.sumDividend + (item.vClose - item.sumHoldingCost) - this.getTxCost(item);
      }

      return item.sumRealizedGain + item.sumDividend - item.sumTaxDividend - item.sumTaxCgain - this.getTxCost(item);
    },
    getGainPercentages(item) {
      if (item.vClose > 1e-5) {
        return (item.vClose + item.sumDividend - item.sumTaxCgain - item.sumTaxDividend - item.sumTxFee) / (item.sumHoldingCost) - 1.0;
      }

      return (item.sumRevenue + item.sumDividend - item.sumTaxCgain - item.sumTaxDividend - item.sumTxFee) / (item.sumCost) - 1.0;
    },
    customSort(items, sortBy, sortDesc) {
      const isDescending = sortDesc[0];
      const column = sortBy[0];

      // Only apply this custom logic to the 'PNL%' column
      if (column === 'PNL%') {
        return items.sort((a, b) => {
          const diff = this.getGainPercentages(a) - this.getGainPercentages(b);

          return isDescending ? -diff : diff;
        });
      }
      if (column === 'dayTrend') {
        return items.sort((a, b) => {
          const diff = this.getGainPercentages(a) - this.getGainPercentages(b);

          return isDescending ? -diff : diff;
        });
      }
      if (column === 'PNL') {
        return items.sort((a, b) => {
          const diff = this.getPNL(a) - this.getPNL(b);

          return isDescending ? -diff : diff;
        });
      }
      if (column === 'txCost') {
        return items.sort((a, b) => {
          const diff = this.getTxCost(a) - this.getTxCost(b);

          return isDescending ? -diff : diff;
        });
      }

      return items.sort((a, b) => {
        const diff = a[column] - b[column];

        return isDescending ? -diff : diff;
      });
    },
    handleChartRedraw(item, mobile = false) {
      this.$nextTick(() => {
        item.chartKey = new Date().toUTCString() + mobile ? 'mobile' : '';
      });
    },

    isMarketOpenPeriod(timestamp) {
      const timeString = timestamp.split('T')[1];

      return timeString >= '09:30' && timeString <= '16:00';
    },
    toSparklineData(item) {
      if (!Array.isArray(item?.tSeries)) return null;
      const dataPoints = item.tSeries.map(dataPoint => ({
        x: new Date(dataPoint.timestamp).getTime(),
        y: dataPoint.pClose,
        o: this.isMarketOpenPeriod(dataPoint.timestamp),
      }));

      const chartSeries = [
        // full day trend
        { name: 'F', data: dataPoints },

        // market opened segment
        { name: 'O', data: dataPoints.filter(p => p.o) },
      ];

      // baseline
      const baseLine = [
        { x: dataPoints[0]?.x || new Date().getTime(), y: this.getBasePrice(item) },
        { x: dataPoints[dataPoints.length - 1]?.x || new Date().getTime() + 1, y: this.getBasePrice(item) },
      ];

      chartSeries.push({
        name: 'baseline',
        data: baseLine,
      });

      return chartSeries;
    },
  },
};
</script>
