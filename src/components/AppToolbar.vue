<template>
  <q-toolbar>
    <q-btn flat round small :class="canGoBack ? '': 'invisible'" @click="handleBack">
      <q-icon name="fas fa-chevron-left" />
    </q-btn>
    <q-toolbar-title>
      {{ title }}
      <span v-if="subtitle" slot="subtitle">{{ subtitle }}</span>
    </q-toolbar-title>
    <q-btn flat round small class="invisible">
      <q-icon name="fa-info-circle" />
    </q-btn>
  </q-toolbar>
</template>

<script>
import { clone } from 'lodash';

export default {
  name: 'app-toolbar',
  data() {
    return {
      canGoBack: false,
      User: undefined,
    };
  },
  computed: {
    title() {
      return this.$store.state.app.title || '';
    },
    subtitle() {
      const user = this.$store.state.user.User;
      const hasGroup = user && user.groups && user.groups.length > 0;
      const groupName = hasGroup ? user.groups[0].name : '';

      return this.$store.state.app.subtitle || groupName;
    },
  },
  methods: {
    handleBack() {
      this.$router.back();
    },
  },
  created() {
    this.$store.commit('app/historyPush', this.$route.path);
    this.$router.afterEach((to) => {
      const historyState = clone(this.$store.state.app.history);
      const curr = to.path;
      let prev = historyState[historyState.length - 2];

      if (curr === prev) {
        this.$store.commit('app/historyPop');
        historyState.pop();
      } else {
        this.$store.commit('app/historyPush', curr);
        historyState.push(curr);
      }

      prev = historyState[historyState.length - 2];

      if (curr && prev && curr.indexOf(prev) === 0) {
        this.canGoBack = true;
      } else {
        this.canGoBack = false;
        this.$store.commit('app/historyClear');
        this.$store.commit('app/historyPush', curr);
      }

      this.$store.commit('app/setTitle', to.name);
      this.$store.commit('app/setSubtitle', '');
    });
  },
};
</script>

<style>
</style>
