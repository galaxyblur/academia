<template>
  <q-page padding>
    <div class="text-center">
      <q-btn label="Log Out" color="negative" icon="fas fa-sign-out-alt" @click="logOut" />
    </div>
  </q-page>
</template>

<script>
import { logout } from '../lib/AuthHelper';

export default {
  name: 'account',
  methods: {
    logOut() {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to log out of the app?',
        ok: 'Log Out',
        cancel: true,
      }).then(() => {
        logout();
        this.$q.notify('You have been logged out.');
      }).catch(() => {
        // no-op
      });
    },
  },
  created() {
    this.$store.commit('app/setTitle', 'My Account');
  },
};
</script>
