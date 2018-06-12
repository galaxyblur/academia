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

import strings from '../json/strings';

import {
  getAndStoreParameters,
  getAuthId,
  getEmail,
  getIdToken,
  getName,
  setUserId,
} from '../lib/AuthHelper';

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
    this.handleAuth();
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

        query.catch(this.handleAuthError);
        query.then((userResult) => {
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
      this.$q.dialog({
        title: 'Error',
        message: 'There was a problem saving your account. Please try again.',
      });
    },
    promptForGroupName() {
      return new Promise((res) => {
        this.$q.dialog({
          title: 'Group Name',
          message: 'Please enter a name for your group. (You can change this later.)',
          form: {
            name: {
              type: 'text',
              label: 'Group Name',
              model: '',
            },
          },
          buttons: [
            'Cancel',
            {
              label: 'Save',
              handler(data) {
                res(data.name);
              },
            },
          ],
        });
      });
    },
  },
};
</script>

<style scoped>
</style>
