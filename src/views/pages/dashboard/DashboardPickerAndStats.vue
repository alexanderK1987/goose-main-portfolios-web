<template>
  <v-card>
    <v-card-title class="align-start">
      <span>
        {{ portfolio && portfolio.portfolioName }}
      </span>
      <v-spacer />
      <v-menu v-model="pickerVisible" offset-y left min-width="280">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small class="my-n1" v-bind="attrs" v-on="on">
            <v-icon>
              {{ pickerVisible? icons.mdiChevronUp :icons.mdiChevronDown }}
            </v-icon>
          </v-btn>
        </template>

        <!-- Portfolio list -->
        <v-card class="py-1 px-2">
          <v-list>
            <v-list-item><h4>Pick Portfolios</h4></v-list-item>
            <v-divider class="pb-2" />
            <v-list-item-group v-model="selectPortfolioIdx">
              <v-list-item
                v-for="portfolioItem, portfolioItemIdx in portfolios"
                :key="`pf-${portfolioItemIdx}`"
                :class="value === portfolioItemIdx? `primary--text`:``"
                :disabled="value === portfolioItemIdx"
                link
                @click="$emit('pick-portfolio', portfolioItemIdx)"
              >
                <v-list-item-content>
                  <div class="d-flex justify-space-between align-center">
                    <span class="subtitle-2">{{ portfolioItem.portfolioName }}</span>
                    <pre>{{ toCurrency(portfolioItem.sumDeposit) }}</pre>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-menu>
    </v-card-title>
    <v-card-subtitle class="">
      <v-row>
        <v-col class="d-flex flex-wrap justify-start align-center">
          <span class="caption me-4 pb-2">
            Market day
            <v-chip v-if="portfolioLatestDataPoint" dense small class="my-n3 py-0">
              {{ toLocaleDateString(portfolioLatestDataPoint.timestamp) }}
            </v-chip>
          </span>
          <span class="caption me-4 pb-2">
            First activity
            <v-chip v-if="portfolio" outlineddense small class="my-n3 py-0">
              {{ toLocaleDateString(portfolio && portfolio.firstTxTimestamp) }}
            </v-chip>
          </span>
          <span class="caption pb-2">
            Account age
            <v-chip v-if="portfolio" dense small class="my-n3 py-0">
              {{ toAgeString(portfolio && portfolio.firstTxTimestamp) }}
            </v-chip>
          </span>
        </v-col>
      </v-row>
    </v-card-subtitle>

    <v-card-text>
      <div class="d-flex flex-wrap justify-space-between">
        <div
          v-for="data in statisticsData"
          :key="data.title"
          class="d-flex align-center pb-2"
        >
          <v-avatar size="44" :color="data.color" rounded class="elevation-1">
            <v-icon dark color="white" size="30">
              {{ data.icon }}
            </v-icon>
          </v-avatar>
          <div class="ms-2">
            <p class="text-xs mb-0">
              {{ data.title }}
            </p>
            <div class="d-flex flex-nowrap align-center">
              <samp :class="`${data.contentColor}--text text-lg font-weight-bold`">
                {{ data.content }}
              </samp>
              <sub
                v-if="data.caption"
                :class="`${data.captionColor}--text text-xxs ps-1`"
              >
                {{ data.caption }}
              </sub>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  mdiPercentOutline,
  mdiCurrencyUsd,
  mdiTrendingUp,
  mdiTrendingNeutral,
  mdiTrendingDown,
  mdiChevronDown,
  mdiChevronUp,
  mdiChevronRight,
  mdiPiggyBank,
  mdiTrophy,
} from '@mdi/js';
import {
  toCurrency, toPercentage, toLocaleDateString, toAgeString, getTrendColor,
} from '@/utils/numberTools';

export default {
  props: {
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    portfolios: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    portfolioLatestDataPoint: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data: () => ({
    toCurrency,
    toLocaleDateString,
    toPercentage,
    toAgeString,
    getTrendColor,
    pickerVisible: false,
    portfolioItemIdxSelected: 0,
    icons: {
      mdiTrendingUp,
      mdiTrendingDown,
      mdiTrendingNeutral,
      mdiPercentOutline,
      mdiCurrencyUsd,
      mdiChevronDown,
      mdiChevronUp,
      mdiChevronRight,
      mdiPiggyBank,
      mdiTrophy,
    },
  }),
  computed: {
    portfolio() {
      return Array.isArray(this.portfolios) ? this.portfolios[this.value] : {};
    },
    statisticsData() {
      const latestCloseValue = this.portfolioLatestDataPoint?.vClose;
      const latestOpenValue = this.portfolioLatestDataPoint?.vOpen;
      const dailyDiff = latestCloseValue - latestOpenValue;
      const dailyDiffPercentages = dailyDiff / latestOpenValue;
      const principals = (this.portfolio?.sumDeposit - this.portfolio?.sumWithdraw) || 0;
      const totalProfitAndLoss = latestCloseValue - principals;
      const totalProfitAndLossPercentages = totalProfitAndLoss / principals;

      return [
        {
          title: 'Net Value',
          content: toCurrency(this.portfolioLatestDataPoint?.vClose),
          icon: mdiCurrencyUsd,
          color: 'warning',
        },
        {
          title: 'Last Day Change',
          content: toCurrency(dailyDiff),
          caption: toPercentage(dailyDiffPercentages),
          icon: this.getTrendDiffIcon(dailyDiffPercentages),
          captionColor: this.getTrendColor(dailyDiffPercentages),
          color: 'primary',
        },
        {
          title: 'Principals',
          content: toCurrency(principals),
          icon: mdiPiggyBank,
          color: 'info',
        },
        {
          title: 'Profit/Loss',
          content: toCurrency(totalProfitAndLoss),
          caption: toPercentage(totalProfitAndLossPercentages),
          icon: mdiTrophy,
          contentColor: '',
          captionColor: this.getTrendColor(totalProfitAndLossPercentages),
          color: 'success',
        },
      ];
    },
    selectPortfolioIdx: {
      get() {
        return this.value; // read from parent
      },
      set(val) {
        this.$emit('input', val); // emit update back to parent
      },
    },
  },
  methods: {
    getTrendDiffIcon(diffPercentages) {
      return diffPercentages > 0.1e-2
        ? this.icons.mdiTrendingUp
        : diffPercentages < -0.1e-2
          ? this.icons.mdiTrendingDown
          : this.icons.mdiTrendingNeutral;
    },
  },
};
</script>
