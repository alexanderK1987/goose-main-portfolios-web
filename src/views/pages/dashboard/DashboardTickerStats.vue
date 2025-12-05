<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="value"
      :custom-sort="customSort"
      item-key="ticker"
      class="table-rounded"
      dense
    >
      <template
        v-for="header in headers"
        #[`item.${header.value}`]="{ item }"
      >
        <div :key="header.value">
          <div v-if="header.value === 'ticker'" class="text-base">
            <code>&nbsp;{{ item.ticker }}&nbsp;</code>
          </div>
          <div v-else-if="header.value === 'dayChange'" class="text-no-wrap">
            <samp class="text--primary">
              {{ toCurrency(getDayChange(item)) }}
            </samp>
            <span class="pe-2 secondary--text text-lg">/</span>
            <samp
              :class="`${getTrendColor(getDayChangePercentages(item))}--text`
              "
            >{{ toUDPercentage(getDayChangePercentages(item)) }}</samp>
          </div>
          <vue-apex-charts
            v-if="header.value === 'dayTrend'"
            :key="item.chartKey"
            :options="sparklineOptions(getDayChangePercentages(item), 120, 30)"
            :series="item.tSeries"
            :width="$vuetify.breakpoint.mdAndUp ? 120 : 120"
            height="32"
            class="pr-0 mr-n2"
            @updated="handleChartRedraw(item)"
          />
          <div v-else-if="header.value === 'PNL'">
            <v-menu open-on-hover left offset-y>
              <template v-slot:activator="{ on, attrs }">
                <a v-bind="attrs" class="pa-0 mx-0 text--primary" v-on="on">
                  <samp>{{ toCurrency(getPNL(item)) }}</samp>
                </a>
              </template>
              <v-card max-width="18em" min-width="15em">
                <v-card-text class="info white--text py-2 px-4">
                  <span class="font-weight-bold">{{ item.ticker }}</span> - profits &amp; losses
                </v-card-text>
                <v-card-text class="caption pa-2">
                  <v-row no-gutters>
                    <v-col cols="1" />
                    <v-col cols="6">
                      Realized gain
                    </v-col>
                    <v-col cols="5" class="text-right">
                      <samp>{{ toCurrency(item.sumRealizedGain) }}</samp>
                    </v-col>

                    <v-col v-if="item.qtyHold" cols="1" />
                    <v-col v-if="item.qtyHold > 1e-5" cols="6">
                      Unrealized gain
                    </v-col>
                    <v-col v-if="item.qtyHold > 1e-5" cols="5" class="text-right">
                      <samp>{{ toCurrency(item.vClose - item.sumHoldingCost) }}</samp>
                    </v-col>

                    <v-col cols="1" class="font-weight-bold text-center">
                      +
                    </v-col>
                    <v-col cols="6">
                      Dividends
                    </v-col>
                    <v-col cols="5" class="text-right">
                      <samp>{{ toCurrency(item.sumDividend) }}</samp>
                    </v-col>
                    <v-col cols="12">
                      <hr>
                    </v-col>

                    <v-col cols="1" class="font-weight-bold text-center">
                      =
                    </v-col>
                    <v-col cols="6" class="font-weight-semibold">
                      Profits
                    </v-col>
                    <v-col cols="5" class="text-right font-weight-bold success--text">
                      <samp>{{ toCurrency(getPNL(item) + getTxCost(item)) }}</samp>
                    </v-col>

                    <v-col cols="1" class="font-weight-bold text-center">
                      -
                    </v-col>
                    <v-col cols="5" class="font-weight-semibold">
                      Tx. costs
                    </v-col>
                    <v-col cols="6" class="text-right font-weight-bold error--text">
                      <samp>{{ toCurrency(getTxCost(item)) }}</samp>
                    </v-col>
                    <v-col cols="12">
                      <hr>
                    </v-col>
                    <v-col cols="1" class="font-weight-bold text-center">
                      =
                    </v-col>
                    <v-col cols="6" class="font-weight-semibold">
                      Total P/L
                    </v-col>
                    <v-col cols="5" class="text-right font-weight-bold info--text">
                      <samp>{{ toCurrency(getPNL(item)) }}</samp>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-menu>
          </div>
          <div v-else-if="header.value === 'PNL%'">
            <samp :class="`${getTrendColor(getGainPercentages(item))}--text text-no-wrap`">
              {{ toUDPercentage(getGainPercentages(item)) }}
            </samp>
          </div>
          <div v-else-if="header.value === 'txCost'">
            <v-menu open-on-hover left offset-y>
              <template v-slot:activator="{ on, attrs }">
                <a v-bind="attrs" class="pa-0 mx-0 text--primary" v-on="on">
                  <samp>{{ toCurrency(getTxCost(item)) }}</samp>
                </a>
              </template>
              <v-card max-width="15em" min-width="12em">
                <v-card-text class="white--text error py-2 px-4">
                  <span class="font-weight-bold">{{ item.ticker }}</span> - transaction cost
                </v-card-text>
                <v-card-text class="caption pa-2">
                  <v-row no-gutters>
                    <v-col cols="1" />
                    <v-col cols="6">
                      Capital gain tax
                    </v-col>
                    <v-col cols="5" class="text-right">
                      <samp>{{ toCurrency(item.sumTaxCgain) }}</samp>
                    </v-col>
                    <v-col cols="1" />
                    <v-col cols="6">
                      Dividend tax
                    </v-col>
                    <v-col cols="5" class="text-right">
                      <samp>{{ toCurrency(item.sumTaxDividend) }}</samp>
                    </v-col>
                    <v-col cols="1" class="font-weight-bold text-center">
                      +
                    </v-col>
                    <v-col cols="6">
                      Tx. fee
                    </v-col>
                    <v-col cols="5" class="text-right">
                      <samp>{{ toCurrency(item.sumTxFee) }}</samp>
                    </v-col>
                    <v-col cols="12">
                      <hr>
                    </v-col>
                    <v-col cols="1" class="font-weight-bold text-center">
                      =
                    </v-col>
                    <v-col cols="6" class="font-weight-semibold">
                      Total tx. cost
                    </v-col>
                    <v-col cols="5" class="text-right font-weight-bold error--text">
                      <samp>{{ toCurrency(getTxCost(item)) }}</samp>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-menu>
          </div>
          <div v-else-if="header.value === 'closedAvgRevenue'">
            <samp class="text-right">
              {{ toCurrency(item.sumRevenue / item.qtyDeced) }}
            </samp>
          </div>
          <div v-else-if="header.value === 'closedAvgCost'">
            <samp class="text-right">
              {{ toCurrency(item.sumCost / item.qtyAdded) }}
            </samp>
          </div>
          <div v-else-if="header.type === '$'" class="text-right">
            <samp>{{ toCurrency(item[header.value]) }}</samp>
          </div>
          <div v-else-if="header.type === '#'" class="text-right">
            <samp>{{ item[header.value].toLocaleString() }}</samp>
          </div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mdiInformationOutline } from '@mdi/js';
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
  },
  data: () => ({
    sparklineOptions,
    toCurrency,
    toPercentage,
    toUDPercentage,
    getTrendColor,
    icons: {
      mdiInformationOutline,
    },
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
            text: 'P/L%', value: 'PNL%', type: '%', align: 'end',
          },
          {
            text: 'P/L', value: 'PNL', type: '$', align: 'end',
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
          text: 'P/L%', value: 'PNL%', type: '%', align: 'end',
        },
        {
          text: 'P/L', value: 'PNL', type: '$', align: 'end',
        },
        {
          text: 'Avg. Revenue', value: 'closedAvgRevenue', type: '$', align: 'end',
        },
        {
          text: 'Avg. Cost', value: 'closedAvgCost', type: '$', align: 'end',
        },
        {
          text: 'Volumn', value: 'qtyAdded', type: '#', align: 'end',
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
    getBasePrice(item) {
      const penultimatePositions = this.penultimateMarketDayData?.positions;
      if (Array.isArray(penultimatePositions)) {
        const basePosition = penultimatePositions.find(p => p.ticker === item.ticker);
        if (basePosition) {
          console.log('PEN PCLOSE');

          return basePosition.pClose;
        }
      }
      const data = item?.tSeries[0]?.data;
      if (Array.isArray(data) && data.length) {
        console.log('SERIES 0');

        return data[0].y;
      }

      const lastPositions = this.lastMarketDayData?.positions;
      if (Array.isArray(lastPositions)) {
        const basePosition = lastPositions.find(p => p.ticker === item.ticker);
        if (basePosition) {
          console.log('LAST POPEN');

          return basePosition.pOpen;
        }
      }

      return 0;
    },
    getDayChange(item) {
      const data = item?.tSeries[0]?.data;
      if (Array.isArray(data) && data.length) {
        const base = this.getBasePrice(item);
        const current = data[data.length - 1].y;

        return (current - base) * item.qtyHold;
      }

      return 0;
    },
    getDayChangePercentages(item) {
      const data = item?.tSeries[0]?.data;
      if (Array.isArray(data) && data.length) {
        const base = this.getBasePrice(item);
        const current = data[data.length - 1].y;

        return current / base - 1.0;
      }

      return 0;
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
        return (item.vClose - item.sumTaxCgain - item.sumTaxDividend) / (item.sumHoldingCost + item.sumTxFee) - 1.0;
      }

      return (item.sumRevenue - item.sumTaxCgain - item.sumTaxDividend) / (item.sumCost + item.sumTxFee) - 1.0;
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
    handleChartRedraw(item) {
      this.$nextTick(() => {
        item.chartKey = new Date().toUTCString();
      });
    },
  },
};
</script>
