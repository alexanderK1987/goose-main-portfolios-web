<template>
  <div id="misc">
    <img
      class="misc-mask"
      height="226"
      :src="require(`@/assets/images/misc/misc-mask-${$vuetify.theme.dark ? 'dark' : 'light'}.png`)"
    >

    <v-img
      class="misc-tree"
      src="@/assets/images/misc/tree-4.png"
    />

    <div class="page-title text-center px-5">
      <h2 class="d-flex align-center justify-center">
        <span class="me-2">You've seen nothin!</span>
        <v-icon color="warning">
          {{ icons.mdiAlert }}
        </v-icon>
      </h2>

      <div class="d-flex justify-center">
        <v-img
          max-width="380"
          contain
          src="@/assets/images/3d-characters/error.webp"
        />
      </div>

      <p class="text-sm">
        We couldn't find the page you are looking for, and you shall go
      </p>
      <v-btn large color="primary" to="/" class="mb-4">
        Back Home
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mdiAlert } from '@mdi/js';

export default {
  setup() {
    return {
      icons: {
        mdiAlert,
      },
    };
  },
};
</script>

<style lang="scss">
@import '~@/plugins/vuetify/default-preset/preset/misc.scss';
</style>
