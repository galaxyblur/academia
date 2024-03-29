<template>
  <q-page class="flex flex-center">
    Please wait while we log you in...
  </q-page>
</template>

<script>
import {
  createUserAndGroup,
  UserByAuthId,
} from '../gql';

import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

import {
  exchangeCode,
  getAndStoreParameters,
  getAuthId,
  getEmail,
  getIdToken,
  getName,
  setUserId,
  logout,
} from '../lib/AuthHelper';

function getURLParams() {
  const s = window.location.search.substring(1);

  return s ? JSON.parse(
    `{"${s.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
    (key, value) => (key === '' ? value : decodeURIComponent(value)),
  ) : {};
}

export default {
  name: 'authentication-callback',
  data() {
    return {
      strings,
    };
  },
  created() {
    this.$store.commit('app/setTitle', 'Logging in...');
  },
  mounted() {
    this.$q.loading.show();
    // this.handleAuth();
    window.console.warn('auth-callback');
    window.console.warn(getURLParams());
    exchangeCode(getURLParams().code);
  },
  methods: {
    createUserAndGroup(groupName) {
      const mutation = this.$apollo.mutate({
        mutation: createUserAndGroup,
        variables: {
          email: getEmail(),
          groupName,
          idToken: getIdToken(),
          name: getName(),
        },
      });

      mutation.catch(this.handleAuthError);
      mutation.then((createUserResult) => {
        setUserId(createUserResult.data.createUser.id);
      });

      return mutation;
    },
    goToDefaultRoute() {
      this.$router.push({ name: 'Today' });
    },
    handleAuth() {
      getAndStoreParameters().then(() => {
        const query = this.$apollo.query({
          query: UserByAuthId,
          variables: {
            authId: getAuthId(),
          },
        });

        query.then((userResult) => {
          this.$q.loading.hide();

          if (userResult && userResult.data && userResult.data.User && userResult.data.User.id) {
            setUserId(userResult.data.User.id);
            this.goToDefaultRoute();
          } else {
            this.promptForGroupName().then((groupName) => {
              this.createUserAndGroup(groupName).then(this.goToDefaultRoute);
            });
          }
        });
      }, this.handleAuthError);
    },
    handleAuthError() {
      this.$q.loading.hide();
      this.$q.notify({
        message: 'There was a problem saving your account. Please try again.',
      });
      logout();
      this.goToDefaultRoute();
    },
    promptForGroupName() {
      return new Promise((res) => {
        this.$q.dialog({
          title: 'Group Name',
          message: 'Please enter a name for your group. (You can change this later.)',
          prompt: {
            model: '',
            type: 'text',
            label: 'Group Name',
          },
          cancel: false,
          color: 'secondary',
        }).then((data) => {
          res(data);
        });
      });
    },
  },
};
</script>

<style scoped>
</style>
