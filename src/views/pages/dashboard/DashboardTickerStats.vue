<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="value"
      :custom-sort="customSort"
      item-key="ticker"
      class="table-rounded"
    >
      <template
        v-for="header in headers"
        #[`item.${header.value}`]="{ item }"
      >
        <div :key="header.value">
          <v-chip v-if="header.value === 'ticker'" outlined>
            <div class="font-weight-semibold">
              {{ item.ticker }}
            </div>
          </v-chip>
          <div v-else-if="header.value === 'PNL'">
            <samp>{{ toCurrency(getPNL(item)) }}</samp>
          </div>
          <div v-else-if="header.value === 'PNL%'">
            <samp :class="`${getTrendColor(getGainPercentages(item))}--text`">
              {{ toUDPercentage(getGainPercentages(item)) }}
            </samp>
          </div>
          <div v-else-if="header.value === 'tax'">
            <samp class="text-right">
              {{ toCurrency(item.sumTaxDividend) }} / {{ toCurrency(item.sumTaxCgain) }} / {{ toCurrency(item.sumTxFee) }}
            </samp>
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
import { mdiSquareEditOutline, mdiDotsVertical } from '@mdi/js';
import {
  toCurrency, toPercentage, getTrendColor, toUDPercentage,
} from '@/utils/numberTools';

export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    isClosedStats: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    toCurrency,
    toPercentage,
    toUDPercentage,
    getTrendColor,
    icons: {
      mdiSquareEditOutline,
      mdiDotsVertical,
    },
  }),
  computed: {
    headers() {
      if (!this.isClosedStats) {
        return [
          {
            text: 'Ticker', value: 'ticker', type: 'T', align: 'center',
          },
          {
            text: 'Total P/L%', value: 'PNL%', type: '%', align: 'end',
          },
          {
            text: 'P/L', value: 'PNL', type: '$', align: 'end',
          },
          {
            text: 'Price', value: 'pClose', type: '$', align: 'end',
          },
          {
            text: 'Avg. Cost', value: 'avgCost', type: '$', align: 'end',
          },
          {
            text: 'Shares', value: 'qtyHold', type: '#', align: 'end',
          },
          {
            text: 'Holding Value', value: 'vClose', type: '$', align: 'end',
          },
          {
            text: 'Pre-tax Dividends', value: 'sumDividend', type: '$', align: 'end',
          },
          {
            text: 'Dvd. / Cap. Gain Taxes & Fees', value: 'tax', type: '$', align: 'end',
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
          text: 'Pre-tax Dividends', value: 'sumDividend', type: '$', align: 'end',
        },
        {
          text: 'Dvd. / Cap. Gain Taxes & Fees', value: 'tax', type: '$', align: 'end',
        }, // sumTaxDividend and sumTaxCgain
      ];
    },
  },
  methods: {
    getPNL(item) {
      if (item.vClose > 1e-5) {
        return (item.vClose - item.sumTaxCgain - item.sumTaxDividend) - (item.sumHoldingCost + item.sumTxFee);
      }

      return (item.sumRevenue - item.sumTaxCgain - item.sumTaxDividend) - (item.sumCost + item.sumTxFee);
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
      if (column === 'PNL') {
        return items.sort((a, b) => {
          const diff = this.getPNL(a) - this.getPNL(b);

          return isDescending ? -diff : diff;
        });
      }

      return items.sort((a, b) => {
        const diff = a[column] - b[column];

        return isDescending ? -diff : diff;
      });
    },
  },
};
</script>
