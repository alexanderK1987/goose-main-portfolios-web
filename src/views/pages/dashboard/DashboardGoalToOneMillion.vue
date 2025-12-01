<template>
  <v-card>
    <v-card-title class="align-start">
      Road to One Million
    </v-card-title>
    <v-row no-gutters>
      <v-col cols="8">
        <v-card-text>
          My progress
          <v-progress-linear height="8" :value="value / 1e4 " color="primary" class="my-2" />
          <div class="font-weight-bold text-4xl pt-1">
            {{ toPercentage(value / 1e6, false) }}
          </div>
        </v-card-text>
      </v-col>

      <v-col cols="4" class="d-flex align-start mt-5">
        <v-img
          contain
          height="180"
          width="159"
          :src="require(`@/assets/images/misc/triangle-${$vuetify.theme.dark ? 'dark' : 'light'}.png`)"
          class="greeting-card-bg"
        />
        <v-img
          contain
          height="108"
          max-width="83"
          :style="{ opacity: value / 1e6 }"
          class="greeting-card-trophy"
          src="@/assets/images/misc/trophy.png"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>

import { toPercentage } from '@/utils/numberTools';

export default {
  props: {
    value: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data: () => ({
    toPercentage,
  }),
};
</script>
<style lang="scss" scoped>
.greeting-card-bg {
  position: absolute;
  bottom: 0;
  right: 0;
}
.greeting-card-trophy {
  position: absolute;
  bottom: 1.5em;
  right: 1.2em;
}
</style>
