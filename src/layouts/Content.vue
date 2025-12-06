<template>
  <v-app>
    <vertical-nav-menu :is-drawer-open.sync="isDrawerOpen" />
    <v-app-bar
      app
      flat
      absolute
      color="transparent"
    >
      <div class="boxed-container w-full">
        <div class="d-flex align-center mx-5">
          <!-- Left Content -->
          <v-app-bar-nav-icon
            class="d-block d-lg-none me-2"
            @click="isDrawerOpen = !isDrawerOpen"
          />
          <code :class="['me-2', isMarketOpen?'warning--text':'']">
            <v-icon
              v-if="$vuetify.breakpoint.mdAndUp"
              small
              class="mt-n1 me-n1"
              :color="isMarketOpen?'warning':''"
            >
              {{ isMarketOpen? icons.mdiWhiteBalanceSunny: icons.mdiWeatherNight }}
            </v-icon>
            NYSE
          </code>
          <samp :class="[
            $vuetify.breakpoint.mdAndUp ? 'text-sm' : 'text-xs',
          ]"
          >{{ nyseTimeStr }}</samp>
          <span v-if="$vuetify.breakpoint.mdAndUp">
            <code class="ms-10 me-2">
              <v-icon small class="mt-n1 me-n1">{{ icons.mdiMapMarkerRadius }}</v-icon>
              LOCAL</code>
            <samp class="text-sm">{{ localTimeStr }}</samp>
          </span>
          <v-spacer />
          <theme-switcher />
          <app-bar-user-menu />
        </div>
      </div>
    </v-app-bar>

    <v-main>
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
  mdiBellOutline,
  mdiMapMarkerRadius,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiGithub,
  mdiKnife,
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
      marketOpenData: null,
      isDrawerOpen: null,
      currentTime: new Date(),
      icons: {
        mdiBellOutline,
        mdiMapMarkerRadius,
        mdiWeatherNight,
        mdiWhiteBalanceSunny,
        mdiGithub,
        mdiKnife,
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
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
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
.v-app-bar ::v-deep {
  .v-toolbar__content {
    padding: 0;

    .app-bar-search {
      .v-input__slot {
        padding-left: 18px;
      }
    }
  }
}

.boxed-container {
  margin-left: auto;
  margin-right: auto;
}

.flip-horizontal {
  /* Applies a mirror effect along the vertical axis */
  transform: scaleX(-1);
  /* Ensure the icon rotates from its center */
  transform-origin: center;
}
</style>
