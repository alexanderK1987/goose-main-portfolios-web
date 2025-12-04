<template>
  <v-card id="account-setting-card">
    <v-card-title>
      <h3>Account Settings</h3>
    </v-card-title>
    <v-snackbar
      v-model="snackbarProps.visible"
      :timeout="snackbarProps.timeout"
      :color="snackbarProps.color"
    >
      {{ snackbarProps.content }}
    </v-snackbar>
    <!-- tabs -->
    <v-tabs v-model="tab">
      <v-tab v-for="tab in tabs" :key="tab.icon">
        <v-icon class="me-2">
          {{ tab.icon }}
        </v-icon>
        <span>{{ tab.title }}</span>
      </v-tab>
    </v-tabs>

    <!-- tabs item -->
    <v-tabs-items v-model="tab">
      <v-tab-item class="py-2">
        <account-settings-profile
          :value="profileForm"
          :loading="loading"
          @save="updateProfile($event)"
        />
      </v-tab-item>
      <v-tab-item class="py-2">
        <account-settings-security
          ref="securityForm"
          :loading="loading"
          @save="changePassword($event)"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import { mdiAccountOutline, mdiLockOpenOutline } from '@mdi/js';
import siteConfig from '@/../.siteConfig';
import AccountSettingsProfile from './AccountSettingsProfile.vue';
import AccountSettingsSecurity from './AccountSettingsSecurity.vue';
import { snakeToCamel, camelToSnake } from '@/utils/snakeCamelTools';

export default {
  components: {
    AccountSettingsProfile,
    AccountSettingsSecurity,
  },

  data: () => ({
    loading: false,
    tab: 0,
    tabs: [
      { title: 'Profile', icon: mdiAccountOutline },
      { title: 'Security', icon: mdiLockOpenOutline },
    ],
    profileForm: {},
    snackbarProps: {
      timeout: 1.5e3,
      visible: false,
      content: '',
      color: 'primary',
    },
    snakeToCamel,
  }),

  watch: {
    tab(value) {
      window.location.hash = this.tabs[value]?.title;
    },
  },

  created() {
    this.getProfile();
    this.detectUrlFragment();
  },

  methods: {
    detectUrlFragment() {
      const { hash } = window.location;
      if (hash) {
        this.tab = this?.tabs?.findIndex(tab => tab.title === hash.substring(1)) || 0;
      }
    },
    async getProfile() {
      this.loading = true;
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userProfile}`;

        // Call the API endpoint
        const response = await this.$api.get(REQ_URL);
        this.profileForm = snakeToCamel(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async updateProfile($event) {
      this.loading = true;
      const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userProfile}`;

      try {
        // Call the API endpoint
        const profileUpdates = camelToSnake($event);
        const response = await this.$api.patch(REQ_URL, profileUpdates);
        this.profileForm = snakeToCamel(response.data);
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'success';
        this.snackbarProps.content = 'Success!';
      } catch (err) {
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'error';
        const detailMessage = Array.isArray(err?.response?.data?.detail)
          ? err?.response?.data?.detail[0]?.msg : err?.response?.data?.detail;
        this.snackbarProps.content = `Update failed. ${detailMessage || ''}`;
      } finally {
        this.loading = false;
      }
    },
    async changePassword($event) {
      const CHPWD_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userChangePassword}`;
      this.loading = true;
      try {
        // Call the API endpoint
        const requestBody = {
          newPassword: $event.newPassword,
          oldPassword: $event.oldPassword,
        };
        await this.$api.patch(CHPWD_URL, camelToSnake(requestBody));

        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'success';
        this.snackbarProps.content = 'Success!';
        if (this.$refs?.securityForm?.resetForm) {
          this.$refs.securityForm.resetForm();
        }
      } catch (err) {
        console.log(err.response.data);
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'error';
        const detailMessage = Array.isArray(err?.response?.data?.detail)
          ? err?.response?.data?.detail[0]?.msg : err?.response?.data?.detail;
        this.snackbarProps.content = `Update failed. ${detailMessage || ''}`;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
