<template>
  <v-card flat :disabled="loading">
    <v-form>
      <div class="px-3">
        <v-card-text class="pt-5">
          <v-row>
            <v-col cols="12" class="d-flex justify-start align-center">
              <div class="font-weight-bold pe-3">
                Change Password
              </div>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <!-- current password -->
              <v-text-field
                v-model="value.oldPassword"
                :type="oldVisible ? 'text' : 'password'"
                :append-icon="oldVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                :rules="[required]"
                label="Current Password"
                outlined
                dense
                @click:append="oldVisible = !oldVisible"
              />

              <v-divider class="mb-4 mt-2" />

              <!-- new password -->
              <v-text-field
                v-model="value.newPassword"
                :type="newVisible ? 'text' : 'password'"
                :append-icon="newVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                :rules="[required]"
                label="New Password"
                outlined
                dense
                @click:append="newVisible = !newVisible"
              />

              <!-- confirm password -->
              <v-text-field
                v-model="value.checkPassword"
                :type="checkVisible ? 'text' : 'password'"
                :append-icon="checkVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                :rules="[required, doubleCheck]"
                label="Confirm New Password"
                outlined
                dense
                class="mt-3"
                @click:append="checkVisible = !checkVisible"
              />
            </v-col>

            <v-col
              cols="12"
              sm="4"
              md="6"
              class="d-none d-sm-flex justify-end py-6"
            >
              <v-spacer />
              <v-img
                max-height="170"
                src="@/assets/images/logos/goose-logo.svg"
                class="security-character me-n12"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <!-- action buttons -->
        <v-card-text class="d-flex justify-end">
          <v-btn
            color="primary"
            class="me-3 mt-3"
            @click="$emit('update')"
          >
            Update
          </v-btn>
          <v-btn
            color="secondary"
            outlined
            class="mt-3"
            @click="$emit('reset')"
          >
            Cancel
          </v-btn>
        </v-card-text>
      </div>
    </v-form>
  </v-card>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { mdiKeyOutline, mdiLockOpenOutline, mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js';

export default {
  props: {
    loading: {
      default: false,
      type: Boolean,
    },
    value: {
      default: null,
      type: Object,
      required: true,
    },
  },
  data: () => ({
    oldVisible: false,
    newVisible: false,
    checkVisible: false,
    icons: {
      mdiKeyOutline,
      mdiLockOpenOutline,
      mdiEyeOffOutline,
      mdiEyeOutline,
    },
  }),
  methods: {
    required(v) {
      return !!v || 'Field is required';
    },
    doubleCheck(v) {
      return v === this.value.newPassword || 'Must be the same';
    },
  },
};
</script>
