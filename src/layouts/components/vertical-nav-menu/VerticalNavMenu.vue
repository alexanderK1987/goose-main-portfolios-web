<template>
  <v-navigation-drawer
    :value="isDrawerOpen"
    app
    floating
    width="230"
    class="app-navigation-menu"
    :right="$vuetify.rtl"
    @input="val => $emit('update:is-drawer-open', val)"
  >
    <!-- Navigation Header -->
    <div class="vertical-nav-header d-flex items-center px-3 pt-3 pb-1">
      <router-link
        to="/"
        class="d-flex align-center text-decoration-none"
      >
        <v-img
          :src="require('@/assets/images/logos/goose-logo.svg')"
          max-height="45px"
          max-width="45px"
          alt="logo"
          contain
          eager
          class="app-logo me-1"
          style="transform: scaleX(-1);"
        />
        <v-slide-x-transition>
          <h3 class="text--primary">
            Goose Tracker
          </h3>
        </v-slide-x-transition>
      </router-link>
    </div>

    <!-- Navigation Items -->
    <v-list
      expand
      shaped
      class="vertical-nav-menu-items pr-0"
    >
      <nav-menu-link
        title="Dashboard"
        :to="{ name: 'pages-dashboard' }"
        :icon="icons.mdiMonitorDashboard"
      />
      <nav-menu-link
        title="Portfolio Settings"
        :to="{ name: 'pages-portfolio-settings' }"
        :icon="icons.mdiFileDocumentMultipleOutline"
      />
      <nav-menu-section-title title="SYSTEM SECURITY" />
      <nav-menu-link
        title="Account Settings"
        :to="{ name: 'pages-account-settings' }"
        :icon="icons.mdiAccountCogOutline"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import {
  mdiMonitorDashboard,
  mdiFileDocumentMultipleOutline,
  mdiAccountCogOutline,
} from '@mdi/js';
import NavMenuSectionTitle from './components/NavMenuSectionTitle.vue';
import NavMenuLink from './components/NavMenuLink.vue';

export default {
  components: {
    NavMenuSectionTitle,
    NavMenuLink,
  },
  props: {
    isDrawerOpen: {
      type: Boolean,
      default: null,
    },
  },
  setup() {
    return {
      icons: {
        mdiMonitorDashboard,
        mdiFileDocumentMultipleOutline,
        mdiAccountCogOutline,
      },
    };
  },
};
</script>

<style lang="scss" scoped>
@include theme(app-navigation-menu) using ($material) {
  background-color: map-deep-get($material, 'background');
}
</style>
