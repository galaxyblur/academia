<template>
  <q-page padding>
    <q-card v-if="Person">
      <q-card-title>
        {{ displayName }}
        <div v-if="Person.isMember" slot="right" class="row items-center">
          <q-icon name="fas fa-certificate" class="text-positive" />&nbsp;Member
        </div>
        <span slot="subtitle">{{ displaySubName }}</span>
        <q-icon slot="right" name="fas fa-ellipsis-v">
          <q-popover ref="personPopover">
            <q-list link class="no-border">
              <q-item @click.native="handleEditPerson">
                <q-item-main :label="displayTitleForEdit" />
              </q-item>
              <q-item v-if="isStudent" @click.native="handleEditGuardians">
                <q-item-main label="Edit Parents/Guardians" />
              </q-item>
            </q-list>
          </q-popover>
        </q-icon>
      </q-card-title>
      <q-card-main>
        <person-info :person="Person" />
        <template v-if="Person.guardians.length > 0">
          <hr>
          <h6><q-icon name="fas fa-user-circle" /> Parents/Guardians</h6>
          <person-info-guardians :guardians="Person.guardians" />
        </template>
      </q-card-main>
    </q-card>

    <q-card v-if="Person && Person.guardianOf && Person.guardianOf.length > 0" flat>
      <q-card-main>
        <persons-list list-header-text="Parent/Guardian of" :persons="Person.guardianOf" />
      </q-card-main>
    </q-card>

    <person-update
      v-if="personToUpdate"
      ref="personUpdate"
      :person="personToUpdate"
      @create-person="handleUpdatePerson"
      @update-person="handleUpdatePerson"
      @delete-person="handleDeletePerson" />
  </q-page>
</template>

<script>
import { PersonById } from '../gql';
import strings from '../json/strings';
import { isStudent, getPreferredName, getSecondaryName, isGuardian } from '../lib/PersonHelper';
import PersonInfo from '../components/PersonInfo';
import PersonInfoGuardians from '../components/PersonInfoGuardians';
import PersonUpdate from '../components/PersonUpdate';
import PersonsList from '../components/PersonsList';

export default {
  name: 'person',
  components: {
    PersonInfo,
    PersonInfoGuardians,
    PersonUpdate,
    PersonsList,
  },
  apollo: {
    Person: {
      loadingKey: 'loadingCounter',
      query: PersonById,
      variables() {
        return {
          id: window.unescape(this.$route.params.id),
        };
      },
    },
  },
  data() {
    return {
      loadingCounter: 0,
      Person: undefined,
      personToUpdate: undefined,
      strings,
    };
  },
  computed: {
    displayName() {
      return getPreferredName(this.Person);
    },
    displaySubName() {
      return getSecondaryName(this.Person);
    },
    displayTitleForEdit() {
      let title = 'Edit Person';

      if (this.isStudent) {
        title = `Edit ${strings.Person}`;
      } else if (!this.personToUpdate || !this.personToUpdate.id) {
        title = 'Add Parent/Guardian';
      }

      return title;
    },
    isStudent() {
      return isStudent(this.Person);
    },
    isGuardian() {
      return isGuardian(this.Person);
    },
  },
  methods: {
    chooseGuardianForEdit() {
      const btns = [];

      btns.push({
        color: 'positive',
        icon: 'fas fa-plus',
        label: 'Add New',
        handler: () => {
          this.personToUpdate = {
            guardianOf: [this.Person],
          };
          this.showPersonUpdateModal();
        },
      });

      this.Person.guardians.forEach((pg) => {
        const name = pg.lastName ? `${pg.firstName} ${pg.lastName}` : pg.firstName;

        btns.push({
          label: name,
          handler: () => {
            this.personToUpdate = Object.assign({}, pg);
            this.showPersonUpdateModal();
          },
        });
      });

      btns.push({
        label: 'Cancel',
      });

      this.$q.dialog({
        title: 'Edit Parent/Guardians',
        stackButtons: true,
        buttons: btns,
      });
    },
    handleEditGuardians() {
      this.$refs.personPopover.hide();
      this.chooseGuardianForEdit();
    },
    handleEditPerson() {
      this.personToUpdate = Object.assign({}, this.Person);
      this.showPersonUpdateModal();
    },
    handleDeletePerson() {
      this.$q.loading.show();
      setTimeout(() => {
        this.$router.push({ name: 'Persons', query: { refresh: 1 } });
      }, 1000);
    },
    handleUpdatePerson() {
      this.$apollo.queries.Person.refetch();
    },
    showPersonUpdateModal() {
      this.$refs.personPopover.hide();

      this.$nextTick(() => {
        this.$refs.personUpdate.show();
      });
    },
  },
  created() {
    this.$store.commit('app/setTitle', 'Person');
  },
  watch: {
    loadingCounter(val) {
      if (val > 0) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    },
    Person() {
      let title = '';
      let subtitle = '';

      if (this.isStudent) {
        title = this.displayName;
        subtitle = strings.Persons;
      } else if (this.isGuardian) {
        title = this.displayName;
        subtitle = 'Parent/Guardian';
      }

      if (title) {
        this.$store.commit('app/setTitle', title);
        this.$store.commit('app/setSubtitle', subtitle);
      }
    },
  },
};
</script>

<style>
</style>
