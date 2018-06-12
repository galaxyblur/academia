<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <app-toolbar />
      <app-nav v-if="$q.theme === 'mat'" />
    </q-layout-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-layout-footer>
      <!-- Navigation for iOS theme -->
      <app-nav v-if="$q.theme === 'ios'" />
    </q-layout-footer>
    <authentication />
  </q-layout>
</template>

<script>
import AppToolbar from '../components/AppToolbar';
import AppNav from '../components/AppNav';
import Authentication from '../components/Authentication';

import {
  allDayOfWeeks,
  UserById,
} from '../gql';

import { onUserId } from '../lib/AuthHelper';

export default {
  name: 'LayoutDefault',
  components: {
    AppToolbar,
    AppNav,
    Authentication,
  },
  data() {
    return {
      userId: undefined,
      User: undefined,
    };
  },
  mounted() {
    onUserId((id) => {
      this.userId = id;
    });
  },
  apollo: {
    allDayOfWeeks: {
      query: allDayOfWeeks,
      result(res) {
        if (res && res.data && res.data.allDayOfWeeks) {
          this.$store.commit('app/setDays', res.data.allDayOfWeeks);
        }
      },
    },
    User: {
      query: UserById,
      skip() {
        return !this.userId;
      },
      variables() {
        return {
          id: this.userId,
        };
      },
      result(res) {
        if (res && res.data && res.data.User) {
          this.$store.commit('user/setUser', res.data.User);
        }
      },
    },
  },
};
</script>

<style>
</style>
