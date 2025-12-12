<template>
  <div class="auth-wrapper auth-v1">
    <div class="auth-inner">
      <v-card class="auth-card">
        <!-- logo -->
        <v-card-text class="align-center pb-4 pt-0 d-flex flex-column">
          <v-img
            :src="require('@/assets/images/logos/goose-logo.svg')"
            max-width="156px"
            alt="logo"
            contain
            class="my-4"
          />
          <div class="text-xl font-weight-bold">
            Gooseland!
          </div>
          Please sign-in to start the adventure!
        </v-card-text>

        <!-- login form -->
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="email"
              outlined
              dense
              hide-details
              label="Email"
              :rules="[required]"
              placeholder="john@example.com"
              autocomplete="username"
              class="py-2"
            />
            <v-text-field
              v-model="password"
              label="Password"
              outlined
              dense
              hide-details
              placeholder="************"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
              :rules="[required]"
              autocomplete="current-password"
              class="py-2"
              @click:append="isPasswordVisible = !isPasswordVisible"
            />
            <!-- forgot link -->
            <div v-if="enablePasswordReset" class="d-flex align-center justify-space-between flex-wrap">
              <a href="javascript:void(0)" class="mt-1">Forgot Password?</a>
            </div>
            <!-- remember me -->
            <div class="d-flex justify-start my-n3 align-center ps-1">
              <v-switch v-model="rememberMe" inset dense class="me-n2" />
              <span>Remember me</span>
            </div>
            <v-btn
              type="submit"
              color="primary"
              block
              large
              class="my-2"
              :loading="loading"
            >
              Login
            </v-btn>
            <span v-if="error" class="caption error--text">
              {{ error }}
            </span>
          </v-form>
        </v-card-text>

        <!-- create new account  -->
        <v-card-text
          v-if="enableRegister"
          class="d-flex align-center justify-center flex-wrap mt-2"
        >
          <span class="me-2"> New on our platform? </span>
          <router-link :to="{ name: 'pages-register' }">
            Create an account
          </router-link>
        </v-card-text>

        <!-- divider -->
        <v-card-text class="d-flex align-center mt-2">
          <v-divider />
          <span class="mx-5">2025 alex.chiu</span>
          <v-divider />
        </v-card-text>

        <!-- social links -->
        <v-card-actions class="d-flex justify-center">
          <v-btn
            v-for="link in socialLink"
            :key="link.icon"
            icon
            class="ms-1"
          >
            <v-icon :color="$vuetify.theme.dark ? link.colorInDark : link.color">
              {{ link.icon }}
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- background triangle shape  -->
    <img
      class="auth-mask-bg"
      height="173"
      :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark' : 'light'}.png`)"
    >

    <!-- tree -->
    <v-img
      class="auth-tree"
      width="247"
      height="185"
      src="@/assets/images/misc/tree.png"
    />

    <!-- tree  -->
    <v-img
      class="auth-tree-3"
      width="377"
      height="289"
      src="@/assets/images/misc/tree-3.png"
    />
  </div>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js';
import axios from 'axios';
import router from '@/router';
import siteConfig from '@/../.siteConfig';

export default {
  name: 'Login',

  data: () => ({
    enablePasswordReset: false,
    enableRegister: false,
    socialLink: [],
    rememberMe: false,

    email: '',
    password: '',
    isPasswordVisible: false,
    error: null,
    loading: false,
    icons: {
      mdiEyeOutline,
      mdiEyeOffOutline,
    },
  }),

  watch: {
    rememberMe(value) {
      localStorage.setItem(siteConfig.localStorageKeys.auth.rememberMe, Number(value));
    },
  },

  async created() {
    this.rememberMe = localStorage.getItem(siteConfig.localStorageKeys.auth.rememberMe) === '1';
    if (this.rememberMe) {
      const accessToken = localStorage.getItem(siteConfig.localStorageKeys.auth.tokenStorageKey);
      if (accessToken) {
        try {
          const REQ_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userProfile}`;
          await this.$api.get(REQ_URL);
          router.push('/pages/dashboard');
        } catch (e) {
          this.error = 'login expired';
        }
      }
    }
  },

  methods: {
    required(v) {
      return !!v || 'Field is required';
    },
    async login() {
      this.loading = true;
      this.error = null;

      try {
        const LOGIN_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userLogin}`;

        const response = await axios.post(LOGIN_URL, {
          email: this.email,
          password: this.password,
        });

        const { access_token, refresh_token } = response.data;

        // Store the tokens using the configured keys
        localStorage.setItem(siteConfig.localStorageKeys.auth.tokenStorageKey, access_token);
        localStorage.setItem(siteConfig.localStorageKeys.auth.refreshTokenStorageKey, refresh_token);

        // Redirect to the authenticated area
        router.push('/pages/dashboard');
      } catch (err) {
        // Handle login failure (e.g., 401 Unauthorized)
        this.error = 'Failed. Please check your credentials.';
        console.error('Login Error:', err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss">
@import '~@/plugins/vuetify/default-preset/preset/pages/auth.scss';
</style>
