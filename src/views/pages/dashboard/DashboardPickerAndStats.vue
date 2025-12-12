<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>
        {{ portfolio && portfolio.portfolioName }}
      </span>
      <v-spacer />

      <v-chip small class="px-1 me-2" @click="$emit('toggleHideValues')">
        <v-icon small>
          {{ hidePortfolioValues ? icons.mdiEyeOffOutline : icons.mdiEyeOutline }}
        </v-icon>
        <samp v-if="$vuetify.breakpoint.mdAndUp" class="caption ps-1">{{ hidePortfolioValues? 'Show' : 'Hide' }} Values</samp>
      </v-chip>
      <v-chip :disabled="loading || isCooldownActive" text small class="px-1 me-2" @click="refreshData()">
        <v-icon small>
          {{ loading || isCooldownActive ? icons.mdiTimerSand : icons.mdiRefresh }}
        </v-icon>
        <samp v-if="timeRemaining" class="text-xs">{{ formatSecondsToTime(timeRemaining) }}</samp>
        <span v-else-if="$vuetify.breakpoint.mdAndUp" class="ps-1">Refresh</span>
      </v-chip>
      <v-menu v-model="pickerVisible" offset-y left min-width="280">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small v-bind="attrs" v-on="on">
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
                    <pre>{{ hidePortfolioValues
                      ? '#'.repeat(7)
                      : toCurrency(portfolioItem.sumDeposit) }}</pre>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-menu>
    </v-card-title>
    <v-card-subtitle class="d-flex flex-wrap justify-start align-center pt-1">
      <span class="caption me-3 pb-2">
        First tx.
        <v-chip v-if="portfolio" outlineddense small class="my-n3 py-0">
          {{ hidePortfolioValues? '--/--/----' : toLocaleDateString(portfolio && portfolio.firstTxTimestamp || '') }}
        </v-chip>
      </span>
      <span class="caption pb-2">
        Account age
        <v-chip v-if="portfolio" dense small class="my-n3 py-0">
          {{ hidePortfolioValues? '-y -m -d' : toAgeString(portfolio && portfolio.firstTxTimestamp || '') }}
        </v-chip>
      </span>
      <span class="caption me-3 pb-2">
        Market day
        <v-chip v-if="lastMarketDayData" dense small class="my-n3 py-0">
          {{ toLocaleDateString(lastMarketDayData.timestamp) }}
        </v-chip>
      </span>
    </v-card-subtitle>

    <v-card-text>
      <div class="d-flex flex-wrap justify-space-between">
        <div
          v-for="data in statisticsData"
          :key="data.title"
          class="d-flex align-center pb-2"
          style="min-width: 200px;"
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
  mdiRefresh,
  mdiTimerSand,
  mdiEyeOffOutline,
  mdiEyeOutline,
} from '@mdi/js';
import {
  toCurrency, toPercentage, toLocaleDateString, toAgeString, getTrendColor, formatSecondsToTime,
} from '@/utils/numberTools';

export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
      required: false,
    },
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
    toCurrency,
    toLocaleDateString,
    formatSecondsToTime,
    toPercentage,
    toAgeString,
    getTrendColor,
    pickerVisible: false,
    portfolioItemIdxSelected: 0,
    isCooldownActive: false,
    timeToNextRefresh: 0,
    reactiveTicker: 0,
    countdownInterval: null,
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
      mdiTimerSand,
      mdiRefresh,
      mdiEyeOffOutline,
      mdiEyeOutline,

    },
  }),
  computed: {
    timeRemaining() {
      const _ = this.reactiveTicker;
      if (this.timeToNextRefresh - new Date().getTime() < 0) {
        return 0;
      }

      return (this.timeToNextRefresh - new Date().getTime()) / 1e3;
    },
    portfolio() {
      return Array.isArray(this.portfolios) ? this.portfolios[this.value] : {};
    },
    statisticsData() {
      const baseValue = this.penultimateMarketDayData?.vClose || this.lastMarketDayData?.vOpen || 0;
      const lastValue = this.lastMarketDayData?.vClose || 0;

      const dailyDiff = lastValue - baseValue;
      const dailyDiffPercentages = dailyDiff / baseValue;
      const principals = (this.portfolio?.sumDeposit - this.portfolio?.sumWithdraw) || 0;
      const totalProfitAndLoss = this.lastMarketDayData ? (lastValue - principals) : principals;
      const totalProfitAndLossPercentages = totalProfitAndLoss / principals;

      return [
        {
          title: 'Net Value',
          content: this.hidePortfolioValues ? '$###,###.##' : toCurrency(this.lastMarketDayData?.vClose),
          icon: mdiCurrencyUsd,
          color: 'warning',
        },
        {
          title: 'Day Change',
          content: this.hidePortfolioValues ? '$###.##' : toCurrency(dailyDiff),
          caption: this.hidePortfolioValues ? '##.##%' : toPercentage(dailyDiffPercentages),
          icon: this.getTrendDiffIcon(dailyDiffPercentages),
          captionColor: this.getTrendColor(dailyDiffPercentages),
          color: 'primary',
        },
        {
          title: 'Principals',
          content: this.hidePortfolioValues ? '$###,###.##' : toCurrency(principals),
          icon: mdiPiggyBank,
          color: 'info',
        },
        {
          title: 'Profit/Loss',
          content: this.hidePortfolioValues ? '$###,###.##' : toCurrency(totalProfitAndLoss),
          caption: this.hidePortfolioValues ? '##.##%' : toPercentage(totalProfitAndLossPercentages),
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
  watch: {
    $route() {
      this.endCooldown();
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
    refreshData() {
      this.$emit('trigger-refresh');
      this.startCooldown();
    },

    startCooldown() {
      this.isCooldownActive = true;
      this.timeToNextRefresh = (new Date()).getTime() + 10e3;
      this.countdownInterval = setInterval(() => {
        this.reactiveTicker += 1;
        if (this.timeToNextRefresh - new Date().getTime() <= 0) {
          this.endCooldown();
        }
      }, 1000);
    },
    endCooldown() {
      clearInterval(this.countdownInterval);
      this.isCooldownActive = false;
      this.timeToNextRefresh = 0;
    },
  },

  // Best practice: clear the interval when the component is destroyed
  beforeUnmount() {
    this.endCooldown();
  },
};
</script>
