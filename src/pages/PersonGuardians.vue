<template>
  <q-page padding>
    <div v-if="allPersons.length > 0">
      <q-list separator link>
        <q-item
          v-for="(p, $ip) in allPersons"
          :key="$ip"
          :to="{ name: 'PersonGuardian', params: { id: p.id } }"
          tag="label"
          multiline
        >
          <q-item-main>
            <q-item-tile label>{{ getPreferredName(p) }}</q-item-tile>
            <q-item-tile sublabel>{{ getSecondaryName(p) }}</q-item-tile>
            <q-item-tile>
              <small>parent/guardian of <em>{{ getGuardianOfList( p.guardianOf ) }}</em></small>
            </q-item-tile>
          </q-item-main>
          <q-item-side right icon="fas fa-angle-right"></q-item-side>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { allPersonsGuardians } from '../gql';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

import {
  getPreferredName,
  getPreferredNameShort,
  getSecondaryName,
} from '../lib/PersonHelper';

import RankDisplay from '../components/RankDisplay';

export default {
  name: 'person-guardians',
  components: {
    RankDisplay,
  },
  created() {
    this.$store.commit('app/setTitle', 'Parents/Guardians');
  },
  apollo: {
    allPersons: {
      loadingKey: 'loadingCounter',
      query: allPersonsGuardians,
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
    getGuardianOfList(guardianOf) {
      const list = [];

      if (guardianOf && guardianOf.length > 0) {
        guardianOf.forEach(s => list.push(getPreferredNameShort(s)));
      }

      return list.join(', ');
    },
    getPreferredName(person) {
      return getPreferredName(person);
    },
    getSecondaryName(person) {
      return getSecondaryName(person);
    },
  },
};
</script>

<style>
</style>
