<template>
  <q-layout view="lHr LpR lFr">
    <q-layout-drawer side="left" v-model="isLeftDrawerVisible">
    </q-layout-drawer>

    <q-layout-drawer side="right" v-model="isRightDrawerVisible">
    </q-layout-drawer>

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
    <authentication ref="authentication" />
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

import { onUserId, logout } from '../lib/AuthHelper';

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
      isLeftDrawerVisible: true,
      isRightDrawerVisible: true,
    };
  },
  mounted() {
    onUserId((id) => {
      this.userId = id;
    });

    if (!this.userId) {
      this.showAuth();
    }
  },
  methods: {
    showAuth() {
      this.$refs.authentication.show();
      logout();
    },
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
        } else {
          this.showAuth();
        }
      },
      error() {
        this.showAuth();
      },
    },
  },
};
</script>

<style>
</style>
