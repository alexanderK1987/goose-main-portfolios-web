<template>
  <v-card id="account-setting-card">
    <v-card-title>
      <h3>Portfolio Settings</h3>
    </v-card-title>
    <v-snackbar
      v-model="snackbarProps.visible"
      :timeout="snackbarProps.timeout"
      :color="snackbarProps.color"
    >
      {{ snackbarProps.content }}
    </v-snackbar>

    <!-- tabs -->
    <v-tabs v-model="tab" show-arrows>
      <v-tab
        v-for="portfolioTab in tabs"
        :key="`tab-${portfolioTab._id}`"
        class="mx-0 px-2"
      >
        <v-icon class="me-2" small>
          {{ portfolioTab.icon }}
        </v-icon>
        <span class="caption font-weigt-bold">{{ portfolioTab.title }}</span>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item v-for="portfolioTab in tabs" :key="`tab-item-${portfolioTab._id}`">
        <portfolio-edit-form
          :loading="loading"
          :value="portfolioTab"
          :create="!portfolioTab._id"
          @save="updatePortfolio($event, portfolioTab._id)"
          @create="createPortfolio($event)"
          @tx-upload="processTxUpload($event, portfolioTab._id)"
          @delete="deletePortfolio(portfolioTab._id)"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import { mdiPlusBox, mdiFileDocumentEditOutline } from '@mdi/js';
import siteConfig from '@/../.siteConfig';
import { snakeToCamel, camelToSnake } from '@/utils/snakeCamelTools';
import PortfolioEditForm from './PortfolioEditForm.vue';

const makePortfolioTab = ({ _id, portfolioName }) => ({
  _id,
  portfolioName: portfolioName || '',
  title: _id ? (portfolioName || '') : 'new',
  icon: _id ? mdiFileDocumentEditOutline : mdiPlusBox,
  portfolioTxs: [],
});

export default {
  components: {
    PortfolioEditForm,
  },
  data: () => ({
    snakeToCamel,
    loading: false,
    tab: 0,
    tabs: [],
    snackbarProps: {
      timeout: 1.5e3,
      visible: false,
      content: '',
      color: 'primary',
    },
    icons: {
      mdiPlusBox,
      mdiFileDocumentEditOutline,
    },
  }),

  watch: {
    tab: {
      handler(value) {
        window.location.hash = this.tabs[value]?._id || this.tabs[value]?.title;
      },
      immediate: true,
    },
  },

  async created() {
    await this.getPortfolio();
    await this.detectUrlFragment();
  },

  methods: {
    getCurrentPortfolioTabContent() {
      return this.tabs[this?.tab];
    },
    detectUrlFragment() {
      const { hash } = window.location;
      if (hash) {
        if (hash === '#new') {
          this.tab = (this?.tabs?.length - 1) || 0;
        } else {
          this.tab = this?.tabs?.findIndex(tab => tab._id === hash.substring(1)) || 0;
        }
      }
    },
    async getPortfolio() {
      this.loading = true;
      try {
        const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioList}`;
        const response = await this.$api.get(REQ_URL);
        const portfolios = snakeToCamel(response.data);
        if (Array.isArray(portfolios)) {
          this.tabs = [...portfolios.map(
            p => makePortfolioTab(p),
          ), makePortfolioTab({})];
        } else {
          this.tabs = [makePortfolioTab({})];
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async updatePortfolio($event, _id) {
      this.loading = true;
      const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioById(_id)}`;

      try {
        // Call the API endpoint
        const requestBody = { portfolioName: $event.portfolioName };
        const response = await this.$api.patch(REQ_URL, camelToSnake(requestBody));
        const updatedProfile = snakeToCamel(response.data);
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'success';
        this.snackbarProps.content = 'Success!';
        const i = this.tabs.findIndex(tab => tab._id === _id);
        if (i > -1) {
          this.tabs[i] = makePortfolioTab(updatedProfile);
        }
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
    async createPortfolio($event) {
      this.loading = true;
      const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioCreate}`;

      try {
        // Call the API endpoint
        const requestBody = { portfolioName: $event.portfolioName };
        const response = await this.$api.post(REQ_URL, camelToSnake(requestBody));
        const newProfile = snakeToCamel(response.data);
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'success';
        this.snackbarProps.content = 'Success!';
        if (Array.isArray(this.tabs) && this.tabs.length) {
          this.tabs.pop();
          this.tabs.push(makePortfolioTab(newProfile));
          this.tabs.push(makePortfolioTab({}));
        }
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
    async processTxUpload($event, _id) {
      if (!$event.txFile) {
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'error';
        this.snackbarProps.content = 'Please select a file!';

        return;
      }

      const formData = new FormData();
      formData.append('recv_file', $event.txFile);
      const params = { append: Number(!!$event.append) };

      const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioUploadTxFile(_id)}`;

      try {
        this.loading = true;
        const response = await this.$api.post(
          REQ_URL,
          formData,
          { params: camelToSnake(params) },
        );

        this.getCurrentPortfolioTabContent().portfolioTxs = snakeToCamel(response.data);
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'success';
        this.snackbarProps.content = 'Success!';
      } catch (err) {
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'error';
        const detailMessage = Array.isArray(err?.response?.data?.detail)
          ? err?.response?.data?.detail[0]?.msg : err?.response?.data?.detail;
        this.snackbarProps.content = `Upload failed. ${detailMessage || ''}`;
      } finally {
        this.loading = false;
      }
    },
    async deletePortfolio(_id) {
      this.loading = true;
      const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.portfolioById(_id)}`;

      try {
        await this.$api.delete(REQ_URL);
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'success';
        this.snackbarProps.content = 'Success!';
        this.tabs = this.tabs.filter(tab => tab._id !== _id);
        this.tab -= 1;
      } catch (err) {
        this.snackbarProps.visible = true;
        this.snackbarProps.color = 'error';
        const detailMessage = Array.isArray(err?.response?.data?.detail)
          ? err?.response?.data?.detail[0]?.msg : err?.response?.data?.detail;
        this.snackbarProps.content = `Delete failed. ${detailMessage || ''}`;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
