<template>
  <v-card flat :disabled="loading">
    <v-card-text>
      <v-form class="multi-col-validation">
        <v-row>
          <v-col cols="12" md="6" class="d-flex justify-start align-center">
            <div class="font-weight-bold pe-3">
              Account Status
            </div>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end flex-wrap">
            <v-chip class="mx-1 px-2" :small="$vuetify.breakpoint.smAndDown">
              <v-icon small>
                {{ value.isAdmin? icons.mdiCrown : icons.mdiChessPawn }}
              </v-icon>
              <span>{{ value.isAdmin? 'admin' : 'tenent' }}</span>
            </v-chip>
            <v-chip class="mx-1 px-2" :small="$vuetify.breakpoint.smAndDown">
              <v-icon small>
                {{ value.isActive? icons.mdiAccountHeartOutline : icons.mdiAlertOutline }}
              </v-icon>
              <span>{{ value.isActive? 'verified' : 'unverified' }}</span>
            </v-chip>
            <v-chip class="mx-1 px-2" :small="$vuetify.breakpoint.smAndDown">
              <v-icon small>
                {{ icons.mdiCalendarStar }}
              </v-icon>
              <span v-if="$vuetify.breakpoint.smAndDown">
                {{ new Date(value.createdAt).toLocaleDateString() }}
              </span>
              <span v-else>created: {{ new Date(value.createdAt).toLocaleString() }}</span>
            </v-chip>
          </v-col>

          <v-col md="6" cols="12">
            <v-text-field
              v-model="localForm.nickname"
              label="Nickname"
              dense
              outlined
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="localForm.email"
              label="E-mail"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" md="12" class="d-flex justify-end">
            <v-btn color="primary" class="me-3 mt-4" @click="$emit('save', localForm)">
              Update
            </v-btn>
            <v-btn color="secondary" outlined class="mt-4" @click="resetForm()">
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  mdiAlertOutline,
  mdiAccountHeartOutline,
  mdiCalendarStar,
  mdiCrown,
  mdiChessPawn,
} from '@mdi/js';

const makeProfileForm = ({ nickname, email }) => ({
  nickname: nickname || '',
  email: email || '',
});

export default {
  props: {
    value: {
      default: () => ({}),
      type: Object,
      required: true,
    },
    loading: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    localForm: makeProfileForm({}),
    icons: {
      mdiAlertOutline,
      mdiAccountHeartOutline,
      mdiCalendarStar,
      mdiCrown,
      mdiChessPawn,
    },
  }),
  watch: {
    value: {
      handler(inputValue) {
        this.localForm = makeProfileForm(inputValue);
      },
    },
  },
  methods: {
    resetForm() {
      this.localForm = makeProfileForm(this.value);
    },
  },
};
</script>
