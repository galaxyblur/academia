<template>
  <q-modal
    v-model="isOpen"
    ref="personGuardianUpdateModal"
    :content-css="{minWidth: '80vw', minHeight: '80vh'}"
    @close="handleClose">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>{{ title }}</q-toolbar-title>
      </q-toolbar>
      <div id="person-guardian-update-modal-footer" class="layout-padding bg-light" slot="footer">
        <q-btn
          v-if="guardian && guardian.id"
          color="negative"
          @click="removeGuardian"
          :loading="isRemoveGuardianLoading"
          class="float-left">
          Remove
        </q-btn>
        <q-btn-group>
          <q-btn color="faded" @click="hide">Cancel</q-btn>
          <q-btn color="primary" @click="save" :loading="isSaveLoading">Save</q-btn>
        </q-btn-group>
      </div>
      <div class="layout-padding">
        <dl>
          <dt>Parent/guardian of</dt>
          <dd v-html="guardianOfName"></dd>
        </dl>
        <q-field
          class="q-py-sm"
          error-label="invalid first name"
          :error="$v.guardianMod.firstName.$error">
          <q-input float-label="First name" v-model="guardianMod.firstName" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid last name"
          :error="$v.guardianMod.lastName.$error">
          <q-input float-label="Last name" v-model="guardianMod.lastName" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid phone number (use numbers only)"
          :error="$v.guardianMod.phoneNumber.$error">
          <q-input float-label="Phone number" type="tel" v-model="guardianMod.phoneNumber" />
        </q-field>
        <q-field
          class="q-py-sm"
          error-label="invalid email address"
          :error="$v.guardianMod.emailAddress.$error">
          <q-input float-label="Email address" type="email" v-model="guardianMod.emailAddress" />
        </q-field>
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import {
  alpha,
  email,
  maxLength,
  numeric,
  required,
} from 'vuelidate/lib/validators';

import {
  PersonById,
  updatePerson,
  createPerson,
  addToPersonGuardians,
} from '../gql';

const addGuardianForPerson = function addGuardianForPerson(personId, guardianId) {
  const mutation = this.$apollo.mutate({
    mutation: addToPersonGuardians,
    variables: {
      personId,
      guardianId,
    },
  });

  return mutation;
};

const saveGuardian = function saveGuardian(variables) {
  const mutation = this.$apollo.mutate({
    mutation: updatePerson,
    variables,
  });

  return mutation;
};

const saveNewGuardian = function saveNewGuardian(variables) {
  return new Promise((res, rej) => {
    this.$apollo.mutate({
      mutation: createPerson,
      variables,
    }).then((resp) => {
      let guardianId;

      if (resp.data && resp.data.createPerson.id) {
        guardianId = resp.data.createPerson.id;
        addGuardianForPerson.call(this, this.guardianOfPerson.id, guardianId)
          .then(respAdd => res(respAdd))
          .catch(error => rej(error));
        // todo: delete newly created parent on relation error
      }
    }).catch(error => rej(error));
  });
};

const getPersonNameDisplay = function getPersonNameDisplay(s) {
  let name = '';

  if (s.alias) {
    name = `${s.alias} <small><i>(${s.firstName})</i></small>`;
  } else {
    name = s.lastName ? `${s.firstName} ${s.lastName}` : s.firstName;
  }

  return name;
};

export default {
  name: 'person-guardian-update',
  apollo: {
    Person: {
      query: PersonById,
      variables() {
        const vars = {};

        if (this.guardian && this.guardian.id) {
          vars.id = this.guardian.id;
        }

        return vars;
      },
      skip() {
        return !this.guardian || !this.guardian.id;
      },
    },
  },
  computed: {
    guardianOfName() {
      const names = [];
      const hasPersonsInGuardian = this.Person && this.Person.guardianOf;

      if (hasPersonsInGuardian && this.Person.guardianOf.length > 0) {
        this.Person.guardianOf.forEach((s) => {
          names.push(getPersonNameDisplay(s));
        });
      } else if (this.guardianOfPerson) {
        names.push(getPersonNameDisplay(this.guardianOfPerson));
      }

      return names.join(', ');
    },
  },
  props: ['guardian', 'guardianOfPerson', 'title'],
  data() {
    return {
      isOpen: false,
      guardianMod: Object.assign({}, this.guardianDefaults, this.guardian),
      guardianDefaults: {
        id: undefined,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        emailAddress: '',
      },
      Person: undefined,
      isRemoveGuardianLoading: false,
      isSaveLoading: false,
    };
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    hide() {
      this.isOpen = false;
    },
    show() {
      this.isOpen = true;
    },
    removeGuardian() {
      // Needs to know if the guardian is attached to another person
      this.$q.notify('This feature is not available');
    },
    save() {
      this.isSaveLoading = true;
      let mutation;

      // Required to validate all fields
      this.$v.guardianMod.$touch();

      if (this.$v.guardianMod.$error) {
        this.isSaveLoading = false;
        return;
      }

      if (this.guardianMod.id) {
        mutation = saveGuardian.call(this, this.guardianMod);
      } else {
        mutation = saveNewGuardian.call(this, this.guardianMod);
      }

      mutation.then(() => {
        this.isSaveLoading = false;
        this.hide();
        this.$q.notify('Parent/guardian saved!');
      });

      mutation.catch((error) => {
        this.isSaveLoading = false;
        this.$q.notify(error.message);
      });
    },
  },
  validations: {
    guardianMod: {
      firstName: {
        alpha,
        required,
      },
      lastName: { alpha },
      phoneNumber: {
        maxLength: maxLength(10),
        numeric,
      },
      emailAddress: { email },
    },
  },
};
</script>

<style scoped>
#person-guardian-update-modal-footer {
  text-align: right;
}
</style>
