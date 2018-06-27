<template>
  <q-page>
    <template v-if="allPersons.length > 0">
      <persons-list
        :persons="personsUnknown"
        list-header-help-text="Students need a birthdate to be tracked as a child or adult."
        :list-header-text="personsUnknown.length + ' ' + strings.persons + ' with no birthdate'" />
    </template>

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
import PersonsList from '../components/PersonsList';
import PersonUpdate from '../components/PersonUpdate';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'persons-no-birthdate',
  components: {
    PersonsList,
    PersonUpdate,
  },
  created() {
    this.$store.commit('app/setTitle', `${strings.Persons} with No Birthdate`);
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
  computed: {
    personsUnknown() {
      return this.allPersons.filter(s => !s.birthdate);
    },
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
