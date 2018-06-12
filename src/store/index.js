import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app: {
      namespaced: true,
      state: {
        days: [],
        history: [],
        subtitle: '',
        title: '',
      },
      mutations: {
        historyClear(state) {
          state.history = [];
        },
        historyPop(state) {
          state.history.pop();
        },
        historyPush(state, routePath) {
          state.history.push(routePath);
        },
        setDays(state, payload) {
          state.days = payload;
        },
        setSubtitle(state, subtitle) {
          state.subtitle = subtitle;
        },
        setTitle(state, title) {
          state.title = title;
        },
      },
    },
    user: {
      namespaced: true,
      state: {
        User: undefined,
      },
      getters: {
        groupId(state) {
          let id;

          if (state.User && state.User.groups && state.User.groups.length > 0) {
            const [group] = state.User.groups;
            ({ id } = group);
          }

          return id;
        },
      },
      mutations: {
        setUser(state, payload) {
          state.User = payload;
        },
      },
    },
  },
});

export default store;
