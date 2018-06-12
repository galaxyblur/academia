<template>
  <q-page padding>
    <div class="row justify-center q-mb-md">
      <div>
        <q-btn color="primary" @click="$refs.personUpdate.show()">
          <q-icon name="fas fa-plus" />&nbsp;Add {{ strings.Person }}
        </q-btn>
      </div>
    </div>
    <div v-if="allPersons.length > 0">
      <persons-list
        :persons="allPersons"
        :list-header-text="allPersons.length + ' ' + strings.persons" />
    </div>
    <div v-else-if="loadingCounter < 1" class="text-center q-ma-md">
      No {{ strings.persons }} found.
    </div>

    <person-update
      ref="personUpdate"
      :person="{ newStudent: true }"
      @create-person="handleUpdatePerson"
      @update-person="handleUpdatePerson"
      @delete-person="handleUpdatePerson" />
  </q-page>
</template>

<script>
import { allPersonsStudents } from '../gql';
import strings from '../json/strings';
import PersonsList from '../components/PersonsList';
import PersonUpdate from '../components/PersonUpdate';

export default {
  name: 'persons',
  components: {
    PersonsList,
    PersonUpdate,
  },
  created() {
    this.$store.commit('app/setTitle', strings.Persons);
  },
  mounted() {
    if (this.$route.query.refresh && this.allPersons.length > 0) {
      this.handleUpdatePerson();
    }
  },
  apollo: {
    allPersons: {
      loadingKey: 'loadingCounter',
      query: allPersonsStudents,
      skip() {
        return !this.$store.state.user.User;
      },
      variables() {
        return {
          userId: this.$store.state.user.User.id,
        };
      },
    },
  },
  data() {
    return {
      allPersons: [],
      loadingCounter: 0,
      strings,
    };
  },
  watch: {
    loadingCounter(val) {
      if (val > 0) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    },
  },
  methods: {
    handleUpdatePerson() {
      this.$apollo.queries.allPersons.refetch();
    },
  },
};
</script>

<style>
</style>
