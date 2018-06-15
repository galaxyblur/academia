<template>
  <q-modal v-model="isOpen" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>Sign-In</q-toolbar-title>
      </q-toolbar>
      <div class="layout-padding">
        <div class="text-center generic-margin">
          Welcome to <strong>{{ strings.productName }}</strong>,
          the best tool for managing your {{ strings.art }} group.
        </div>
        <div class="text-center generic-margin">
          <q-btn color="primary" @click="start" :loading="isStartLoading">Start</q-btn>
        </div>
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import { login, isLoggedIn } from '../lib/AuthHelper';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'authentication',
  data() {
    return {
      strings,
      isOpen: false,
      isStartLoading: false,
    };
  },
  methods: {
    start() {
      this.isStartLoading = true;
      this.$q.loading.show();
      login();
      this.isStartLoading = false;
    },
  },
  mounted() {
    setInterval(() => {
      if (!isLoggedIn() && this.$route.name !== 'AuthenticationCallback') {
        this.isOpen = true;
      } else {
        this.isOpen = false;
      }
    }, 1000);
  },
};
</script>

<style scoped>
</style>
