<template>
  <v-app>
    <vertical-nav-menu :is-drawer-open.sync="isDrawerOpen" />
    <v-app-bar
      app
      dense
      class="app-top-navigation-bar"
    >
      <div class="w-full">
        <div class="d-flex align-center mx-2">
          <!-- Left Content -->
          <v-app-bar-nav-icon
            class="me-3 pa-0"
            style="width: 1.2em !important; height: 1.2em !important;"
            @click="isDrawerOpen = !isDrawerOpen"
          >
            <v-icon>{{ isDrawerOpen ? icons.mdiMenuOpen : icons.mdiMenuClose }}</v-icon>
          </v-app-bar-nav-icon>
          <code :class="['me-2', isMarketOpen?'warning--text':'', 'text-xs']">
            <v-icon
              small
              class="mt-n1"
              :color="isMarketOpen?'warning':''"
            >
              {{ isMarketOpen? icons.mdiWhiteBalanceSunny: icons.mdiWeatherNight }}
            </v-icon>
            NYSE
          </code>
          <samp :class="['text-xs', isMarketOpen ? 'text--primary':'']">{{ nyseTimeStr }}</samp>
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <code class="ms-4 me-2 text-xs">
              <v-icon small class="mt-n1">{{ icons.mdiMapMarkerRadius }}</v-icon>
              LOCAL</code>
            <samp class="text-xs">{{ localTimeStr }}</samp>
          </template>
          <v-spacer />
          <theme-switcher />
          <app-bar-user-menu />
        </div>
      </div>
    </v-app-bar>

    <v-main style="overflow-x: hidden;">
      <div class="app-content-container px-4 pb-6">
        <slot />
      </div>
    </v-main>

    <v-footer
      app
      inset
      color="transparent"
      absolute
      height="48"
      class="px-0"
    >
      <div class="boxed-container w-full">
        <div class="mx-6 d-flex justify-space-between caption align-center">
          <span>
            &copy;2025
            <v-icon small class="me-n1 flip-horizontal">{{ icons.mdiKnife }}</v-icon>
            Goooooose
          </span>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import {
  mdiMapMarkerRadius,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiKnife,
  mdiMenuClose,
  mdiMenuOpen,
} from '@mdi/js';
import { snakeToCamel } from '@/utils/snakeCamelTools';
import siteConfig from '@/../.siteConfig';
import VerticalNavMenu from './components/vertical-nav-menu/VerticalNavMenu.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import AppBarUserMenu from './components/AppBarUserMenu.vue';

export default {
  components: {
    VerticalNavMenu,
    ThemeSwitcher,
    AppBarUserMenu,
  },

  data() {
    return {
      clockTimer: null,
      marketOpenCheckTimer: null,
      marketOpenData: null,
      isDrawerOpen: null,
      currentTime: new Date(),
      icons: {
        mdiMapMarkerRadius,
        mdiWeatherNight,
        mdiWhiteBalanceSunny,
        mdiKnife,
        mdiMenuClose,
        mdiMenuOpen,
      },
    };
  },

  computed: {
    isMarketOpen() {
      if (this?.marketOpenData) {
        const marketOpenUtc = new Date(this.marketOpenData.marketOpenUtc);
        const marketCloseUtc = new Date(this.marketOpenData.marketCloseUtc);
        const now = new Date();

        return now > marketOpenUtc && now < marketCloseUtc;
      }

      return false;
    },
    localTimeStr() {
      return this.currentTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false, // Use 12-hour format (e.g., PM/AM)
        timeZoneName: 'short', // Include the time zone abbreviation (e.g., EST/EDT)
      });
    },
    nyseTimeStr() {
      return this.currentTime.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false, // Use 12-hour format (e.g., PM/AM)
        timeZoneName: 'short', // Include the time zone abbreviation (e.g., EST/EDT)
      });
    },
  },

  mounted() {
    this.clockTimer = setInterval(() => {
      this.currentTime = new Date();
    }, 1e3);
    this.getMarketOpenInfo();
    this.marketOpenCheckTimer = setInterval(() => {
      this.getMarketOpenInfo();
    }, 1e3 * 3600);
  },
  beforeDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    if (this.marketOpenCheckTimer) clearInterval(this.marketOpenCheckTimer);
  },
  methods: {
    async getMarketOpenInfo() {
      const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.marketInfoOpenInfo}`;
      try {
        // Call the API endpoint
        const response = await this.$api.get(REQ_URL);
        this.marketOpenData = snakeToCamel(response.data);
      } catch {
        console.log('cannot fetch market open info');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@include theme(app-top-navigation-bar) using ($material) {
  background-color: map-deep-get($material, 'background') !important;
}
.flip-horizontal {
  transform: scaleX(-1);
  transform-origin: center;
}
</style>
