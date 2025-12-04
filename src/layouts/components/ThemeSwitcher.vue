<template>
  <v-fade-transition mode="out-in">
    <v-icon
      :key="$vuetify.theme.dark"
      @click="toggleTheme()"
    >
      {{ $vuetify.theme.dark ? icons.mdiWeatherSunny : icons.mdiWeatherNight }}
    </v-icon>
  </v-fade-transition>
</template>
<script>

import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';

export default {
  data() {
    return {
      icons: {
        mdiWeatherNight,
        mdiWeatherSunny,
      },
    };
  },

  created() {
    // Load user preference from localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      this.$vuetify.theme.dark = saved === 'true';
    }
  },

  methods: {
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('darkMode', this.$vuetify.theme.dark);
    },
  },
};
</script>
