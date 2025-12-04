<template>
  <v-card flat :disabled="loading" :loading="loading">
    <v-card-text>
      <v-form v-if="localPortfolioForm" ref="portfolioForm" class="multi-col-validation">
        <v-row>
          <v-col cols="12" class="d-flex justify-space-between">
            <span class="font-weight-bold">Portfolio Settings</span>
            <v-spacer />
            <v-btn
              v-if="!create"
              icon
              small
              :color="safeGuard ? 'success' : 'warning'"
              class="py-0 my-0"
              @click="safeGuard = !safeGuard"
            >
              <v-icon small>
                {{ safeGuard ? icons.mdiLock : icons.mdiLockOpenVariant }}
              </v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="localPortfolioForm.portfolioName"
              label="Portfolio name"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-end">
            <v-btn :disabled="safeGuard" color="error" class="me-3" @click="$emit('delete', localPortfolioForm)">
              Delete
            </v-btn>
            <v-btn v-if="create" color="primary" class="me-3" @click="$emit('create', localPortfolioForm)">
              Create
            </v-btn>
            <v-btn v-else color="primary" class="me-3" @click="$emit('save', localPortfolioForm)">
              Rename
            </v-btn>
            <v-btn color="secondary" outlined @click="resetForm('portfolioForm')">
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-text v-if="!create" class="py-8">
      <v-form v-if="localTxUploadForm" ref="txUploadForm" class="multi-col-validation">
        <v-row>
          <v-col cols="12">
            <p class="font-weight-bold">
              Transaction Upload
            </p>
            <span class="warning--text caption">This will replace all transactions of the entire portfolio.</span>
          </v-col>
          <v-col cols="12" md="8">
            <v-file-input
              v-model="localTxUploadForm.txFile"
              accept=".csv"
              outlined
              dense
              label="Transaction file (Firstrade CSV)"
              :prepend-icon="icons.mdiCloudUploadOutline"
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-end">
            <div class="d-flex flex-column justify-center me-2">
              <span class="text-xs mt-n2 secondary--text">append</span>
              <v-switch
                v-model="localTxUploadForm.append"
                disabled
                inset
                dense
                hide-details
                color="warning"
                class="my-0"
              />
            </div>
            <v-btn :disabled="safeGuard" color="primary" class="me-3" @click="$emit('tx-upload', localTxUploadForm)">
              Upload
            </v-btn>
            <v-btn color="secondary" outlined @click="resetForm('txUploadForm')">
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiCloudUploadOutline, mdiLockOpenVariant, mdiLock } from '@mdi/js';

const makePortfolioEditForm = ({ portfolioName, _id, portfolioTxs }) => ({
  _id: _id || null,
  portfolioName: !_id ? '' : portfolioName,
  portfolioTxs: portfolioTxs || [],
});
export default {
  props: {
    value: {
      default: () => ({}),
      type: Object,
      required: false,
    },
    create: {
      default: false,
      type: Boolean,
      required: false,
    },
    loading: {
      default: false,
      type: Boolean,
      required: false,
    },
  },
  data: () => ({
    safeGuard: true,
    localPortfolioForm: makePortfolioEditForm({}),
    localTxUploadForm: { txFile: null, append: false, _id: null },
    icons: {
      mdiCloudUploadOutline,
      mdiLockOpenVariant,
      mdiLock,
    },
  }),
  computed: {
    portfolioTxs() {
      if (Array.isArray(this.localPortfolioForm?.portfolioTxs)) {
        return this.localPortfolioForm.portfolioTxs;
      }

      return [];
    },
  },
  watch: {
    value: {
      handler(val) {
        this.localPortfolioForm = makePortfolioEditForm(val);
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    resetForm(refTarget) {
      if (this.$refs[refTarget]) {
        this.$refs[refTarget].reset();
      }
    },
  },
};
</script>
