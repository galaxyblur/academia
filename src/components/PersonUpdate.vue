<template>
  <q-modal
    v-model="isOpen"
    ref="personUpdateModal"
    :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>{{ displayTitleForEdit }}</q-toolbar-title>
      </q-toolbar>
      <div id="person-update-modal-footer" class="layout-padding bg-light" slot="footer">
        <q-btn
          v-if="person.id"
          color="negative"
          @click="removePerson"
          :loading="isRemovePersonLoading"
          class="float-left">
          Remove
        </q-btn>
        <q-btn-group>
          <q-btn color="faded" @click="hide">Cancel</q-btn>
          <q-btn color="primary" @click="save" :loading="isSaveLoading">Save</q-btn>
        </q-btn-group>
      </div>
      <div class="layout-padding">
        <dl v-if="isStudent === false">
          <dt>Parent/guardian of</dt>
          <dd>{{ guardianOfList }}</dd>
        </dl>
        <q-field
          v-if="isStudent"
          class="q-py-sm"
          :error-label="'invalid ' + strings.alias"
          :error="$v.PersonMod.alias.$error">
          <q-input :float-label="strings.Alias" v-model="PersonMod.alias" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid first name"
          :error="$v.PersonMod.firstName.$error">
          <q-input float-label="First name" v-model="PersonMod.firstName" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid last name"
          :error="$v.PersonMod.lastName.$error">
          <q-input float-label="Last name" v-model="PersonMod.lastName" />
        </q-field>
        <q-field v-if="isStudent" class="q-py-sm">
          <q-select
            v-if="allRanks.length > 0"
            :float-label="strings.Rank"
            v-model="PersonMod.rankId"
            :options="personRankOptions" />
          <small v-else>
            <em>(Cannot edit {{ strings.rank }} for this person; no {{ strings.ranks }} found.)</em>
          </small>
          <rank-display v-if="selectedPersonRank" v-bind="selectedPersonRank" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid phone number (use numbers only)"
          :error="$v.PersonMod.phoneNumber.$error">
          <q-input float-label="Phone number" type="tel" v-model="PersonMod.phoneNumber" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid email address"
          :error="$v.PersonMod.emailAddress.$error">
          <q-input float-label="Email address" type="email" v-model="PersonMod.emailAddress" />
        </q-field>
        <q-field
          v-if="isStudent"
          class="q-py-sm"
          error-label="invalid birthdate"
          :error="$v.PersonMod.birthdate.$error">
          <q-datetime float-label="Birthdate" type="date" v-model="PersonMod.birthdate" />
        </q-field>
        <q-field
          v-if="isStudent"
          class="q-py-sm"
          error-label="error"
          :error="$v.PersonMod.startedExperienceAt.$error"
          :helper="'When did this ' + strings.person + ' start ' + strings.art + '?'">
          <q-datetime
            float-label="Start date"
            type="date"
            v-model="PersonMod.startedExperienceAt" />
        </q-field>
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import {
  email,
  maxLength,
  numeric,
  required,
} from 'vuelidate/lib/validators';

import {
  allRanks,
  PersonById,
} from '../gql';

import {
  createPersonInContext,
  getPreferredName,
  hasNewStudentMarker,
  isStudent,
  safeDeletePersonInContext,
  updatePersonInContext,
  PersonDefaults,
} from '../lib/PersonHelper';

import RankDisplay from './RankDisplay';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'person-update',
  components: {
    RankDisplay,
  },
  apollo: {
    allRanks: {
      loadingKey: 'loadingCounter',
      query: allRanks,
      skip() {
        return !this.$store.state.user.User;
      },
      variables() {
        return {
          userId: this.$store.state.user.User.id,
        };
      },
    },
    Person: {
      loadingKey: 'loadingCounter',
      query: PersonById,
      variables() {
        return {
          id: this.person.id,
        };
      },
      skip() {
        return !this.person.id;
      },
      result({ data }) {
        Object.assign(this.PersonMod, data.Person);
      },
    },
  },
  props: ['person'],
  data() {
    return {
      isOpen: false,
      allRanks: [],
      loadingCounter: 0,
      Person: undefined,
      PersonMod: this.getPersonModInitialData(),
      strings,
      isRemovePersonLoading: false,
      isSaveLoading: false,
    };
  },
  computed: {
    displayTitleForEdit() {
      let title = 'Edit Person';

      if (hasNewStudentMarker(this.PersonMod)) {
        title = `Add ${strings.Person}`;
      } else if (this.isStudent) {
        title = `Edit ${strings.Person}`;
      }

      return title;
    },
    guardianOfList() {
      const list = [];

      if (this.PersonMod.guardianOf && this.PersonMod.guardianOf.length > 0) {
        this.PersonMod.guardianOf.forEach((s) => {
          list.push(s.alias ? s.alias : s.firstName);
        });
      }

      return list.join(', ');
    },
    isStudent() {
      return isStudent(this.PersonMod);
    },
    personRankOptions() {
      const opts = [];

      this.allRanks.forEach((r) => {
        opts.push({
          label: r.name,
          value: r.id,
        });
      });

      return opts;
    },
    selectedPersonRank() {
      return this.allRanks.filter(rank => rank.id === this.PersonMod.rankId)[0];
    },
  },
  watch: {
    loadingCounter(v) {
      if (v > 0) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    },
  },
  methods: {
    show() {
      this.PersonMod = this.getPersonModInitialData();
      this.isOpen = true;
    },
    hide() {
      this.isOpen = false;
    },
    getPersonModInitialData() {
      return Object.assign(
        {},
        PersonDefaults,
        this.person,
        (() => {
          const p = {};

          if (this.person && this.person.rank) {
            p.rankId = this.person.rank.id;
          }

          p.groupId = this.$store.getters['user/groupId'];

          return p;
        })(),
      );
    },
    removePerson() {
      this.isRemovePersonLoading = true;
      this.$q.dialog({
        title: 'Remove Person',
        message: 'Are you sure?',
        cancel: true,
        ok: 'Remove',
      }).then(() => {
        safeDeletePersonInContext.call(this, this.PersonMod)
          .catch((err) => {
            this.$q.notify(err.message);
            this.isRemovePersonLoading = false;
          })
          .then((result) => {
            let msg = `Removed ${getPreferredName(this.PersonMod)}`;

            if (result.guardiansRemovedCount > 0) {
              msg += ` and ${result.guardiansRemovedCount} guardian(s)`;
            }

            this.$q.notify(`${msg}.`);
            this.isRemovePersonLoading = false;
            this.hide();
            this.$emit('delete-person', this.PersonMod);
          });
      }, () => {});
    },
    save() {
      this.isSaveLoading = true;
      let mutation;

      // Required to validate all fields
      this.$v.PersonMod.$touch();

      if (this.$v.PersonMod.$error) {
        this.isSaveLoading = false;
        return;
      }

      if (this.PersonMod.id) {
        mutation = updatePersonInContext.call(this, this.PersonMod);
      } else {
        mutation = createPersonInContext.call(this, this.PersonMod);
      }

      mutation.then((personResult) => {
        this.isSaveLoading = false;
        this.hide();
        this.$q.notify(`Info for ${getPreferredName(this.PersonMod)} was saved!`);

        if (personResult.data) {
          const p = Object.assign({}, this.PersonMod);

          if (personResult.data.createPerson) {
            this.$emit('create-person', Object.assign(p, personResult.data.createPerson));
          } else if (personResult.data.updatePerson) {
            this.$emit('update-person', Object.assign(p, personResult.data.updatePerson));
          }
        }
      });

      mutation.catch((error) => {
        this.isSaveLoading = false;
        this.$q.notify(error.message);
      });
    },
  },
  validations: {
    PersonMod: {
      alias: {},
      firstName: {
        required,
      },
      lastName: {},
      phoneNumber: {
        maxLength: maxLength(10),
        numeric,
      },
      emailAddress: { email },
      birthdate: {},
      startedExperienceAt: {},
    },
  },
};
</script>

<style scoped>
#person-update-modal-footer {
  text-align: right;
}
</style>
