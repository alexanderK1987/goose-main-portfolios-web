<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="value"
      item-key="ticker"
      class="table-rounded"
    >
      <!-- name -->
      <template #[`item.full_name`]="{ item }">
        <div class="d-flex flex-column">
          <span class="d-block font-weight-semibold text--primary text-truncate">{{ item.full_name }}</span>
          <small>{{ item.post }}</small>
        </div>
      </template>
      <template #[`item.salary`]="{ item }">
        {{ `$${item.salary}` }}
      </template>
      <!-- status -->
      <template #[`item.status`]="{ item }">
        <v-chip
          small
          class="font-weight-medium"
        >
          {{ status[item.status] }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mdiSquareEditOutline, mdiDotsVertical } from '@mdi/js';
import data from './datatable-data';

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
    usreList: data,
    status: {
      1: 'Current',
      2: 'Professional',
      3: 'Rejected',
      4: 'Resigned',
      5: 'Applied',
    },
    icons: {
      mdiSquareEditOutline,
      mdiDotsVertical,
    },
  }),
  computed: {
    headers() {
      if (!this.isClosedStats) {
        return [
          { text: 'Ticker', value: 'ticker' },
          { text: 'Price', value: 'pClose' },
          { text: 'Shares', value: 'qtyHold' },
          { text: 'Value', value: 'vClose' },
          { text: 'Avg. Cost', value: 'avgCost' },
          { text: 'Dividends', value: 'sumDividend' },
          { text: 'Realized Gain', value: 'sumRealizedGain' },
          { text: 'Tax', value: '' }, // sumTaxDividend and sumTaxCgain
          { text: 'Fee', value: 'sumTxFee' },
        ];
      }

      return [
        { text: 'Ticker', value: 'ticker' },
        { text: 'Bought', value: 'qtyAdded' },
        { text: 'Realized Gain', value: 'sumRealizedGain' },
        { text: 'Dividends', value: 'sumDividend' },
        { text: 'Dividend Tax', value: 'sumTaxDividend' },
        { text: 'Capital Gain Tax', value: 'sumTaxCgain' },
        { text: 'Fee', value: 'sumTxFee' },
      ];
    },
  },
};
</script>
