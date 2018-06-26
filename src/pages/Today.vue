<template>
  <q-page padding>
    <h5 v-if="today" id="today-subhead" class="text-center q-ma-none">
      <q-btn
        icon="fas fa-arrow-alt-circle-left"
        class="today-subhead-hidden"
        size="sm"
        dense />
      <q-btn
        icon="fas fa-chevron-left"
        class="q-mx-sm"
        :class="{ todaySubheadHidden: false }"
        @click="goBackOneDay"
        size="sm"
        dense />
      {{ today.displayDate }}
      <q-btn
        icon="fas fa-chevron-right"
        class="q-mx-sm"
        :class="{ 'today-subhead-hidden': isSetToToday }"
        @click="goForwardOneDay"
        size="sm"
        dense />
      <q-btn
        icon="fas fa-arrow-alt-circle-right"
        :class="{ 'today-subhead-hidden': isSetToToday }"
        @click="goToToday"
        size="sm"
        dense />
      <br>
      <q-checkbox
        v-if="!isSetToToday"
        v-model="isEditingPreviousDateDisabled"
        @input="handleEditingToggle"
        color="negative"
        checked-icon="fas fa-lock"
        unchecked-icon="fas fa-unlock" />
      {{ today.classes.length }}
      <template v-if="today.classes.length === 1">class</template>
      <template v-else>classes</template>
    </h5>

    <q-alert
      v-if="allPersonsBirthdays.length > 0 && isBirthdayAlertVisible && isSetToToday"
      class="q-my-md"
      color="secondary"
      icon="fas fa-birthday-cake"
      :actions="[{ label: 'Hide', handler: () => { isBirthdayAlertVisible = false } }]">
      {{ allPersonsBirthdays.length }}
      birthday<template v-if="allPersonsBirthdays.length > 1">s</template> this week:
      <em>{{ birthdayNames }}</em>
    </q-alert>

    <template v-if="today && today.classes.length > 0">


      <q-collapsible
        group="todayClasses"
        v-for="(c, ic) in today.classes"
        :key="ic"
        :opened="isClassHappeningNowish(c)">

        <template slot="header">
          <q-item-main>
            <q-item-tile
              label
              :text-color="!isAttendanceEditable ? 'faded' : ''">
              {{ c.name }}
            </q-item-tile>
            <q-item-tile
              sublabel
              :text-color="!isAttendanceEditable ? 'faded' : ''">
              {{ getClassTimeDisplay(c.startsAt) }}-{{ getClassTimeDisplay(c.endsAt) }}
            </q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-chip
                  dense
              :color="getClassAttendance(c).length > 0 ? 'primary' : 'faded'"
              class="float-right">
              {{ getClassAttendance(c).length }}
            </q-chip>
          </q-item-side>
        </template>

        <q-list>

          <q-list-header>
            {{ getPersonsForClass(c).length }} {{ getSegmentDisplayName(c) }}
          </q-list-header>
          <q-item
            v-for="(s, is) in getPersonsForClass(c)"
            :key="is + '-' + ic"
            tag="label"
            multiline>
            <q-item-main>
              <q-item-tile label>
                {{ getPreferredName(s) }}
                <span v-if="getSecondaryName(s)"><small>{{ getSecondaryName(s) }}</small></span>
                <i v-if="s.isMember" class="fa fa-certificate text-positive"></i>
              </q-item-tile>
            </q-item-main>
            <q-item-side right>
              <q-checkbox
                v-model="classAttendance"
                :val="s.attendanceKey"
                :disable="!isAttendanceEditable" />
            </q-item-side>
          </q-item>

          <template v-if="personsUnknown.length > 0">
            <q-list-header>
              {{ personsUnknown.length }} Others
              <small>
                <router-link :to="{ name: 'PersonsNoBirthdate' }">fix this &raquo;</router-link>
              </small>
            </q-list-header>
            <q-item
              v-for="(s, is) in getPersonsForClass(c, 'unknown')"
              :key="'unknown-' + is + '-' + ic"
              tag="label"
              multiline>
              <q-item-main>
                <q-item-tile label>
                  {{ getPreferredName(s) }}
                  <span v-if="getSecondaryName(s)"><small>{{ getSecondaryName(s) }}</small></span>
                  <i v-if="s.isMember" class="fa fa-certificate text-positive"></i>
                </q-item-tile>
              </q-item-main>
              <q-item-side right>
                <q-checkbox
                  v-model="classAttendance"
                  :val="s.attendanceKey"
                  :disable="!isAttendanceEditable" />
              </q-item-side>
            </q-item>
          </template>

          <q-item>
            <q-btn
              icon="fas fa-plus"
              label="Add New Student"
              text-color="positive"
              size="md"
              dense
              @click="$refs.personUpdate.show()" />
          </q-item>

        </q-list>

      </q-collapsible>

      <q-alert
        class="q-my-md"
        type="warning"
        icon="fas fa-users"
        :actions="[{ label: 'Fix This', handler: goToPersonsNoBirthdate }]">
        {{ personsUnknown.length }} {{ strings.persons }} have no birthdate.
      </q-alert>

      <q-page-sticky v-if="classAttendanceNeedsSyncing" position="bottom-right" :offset="[10, 10]">
        <q-btn
          color="positive"
          class="shadow-5 animate-bounce"
          @click="syncClassAttendance"
          :loading="isSaveLoading">
          <q-icon name="fas fa-cloud-upload-alt" />&nbsp;Save Attendance
        </q-btn>
      </q-page-sticky>

    </template>

    <template v-else-if="loadingCounter < 1">
      <q-card class="q-mt-md">
        <q-card-main>
          No classes found.
          <router-link :to="{ name: 'Schedule' }">Edit Schedule &raquo;</router-link>
        </q-card-main>
      </q-card>
    </template>

    <person-update
      ref="personUpdate"
      :person="{ newStudent: true }"
      @create-person="handleUpdatePerson" />

  </q-page>
</template>

<script>
import { date } from 'quasar';

import {
  difference,
  forIn,
  map,
  pullAll,
  uniq,
} from 'lodash';

import {
  allPersonsStudents,
  DayOfWeekByNameAndDateWithAttendances,
} from '../gql';

import { isLoggedIn } from '../lib/AuthHelper';

import {
  getMinChildAge,
  getPreferredName,
  getPreferredNameShort,
  getSecondaryName,
} from '../lib/PersonHelper';

import {
  addToClassAttendancePersonsWith,
  createClassAttendanceWith,
  removeFromClassAttendanceWith,
  getSegmentDisplayName,
} from '../lib/ClassHelper';

import PersonsList from '../components/PersonsList';
import PersonUpdate from '../components/PersonUpdate';

import { getSecondsSinceMidnight } from '../lib/DateHelper';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

const minChildAge = getMinChildAge();

const getAttendanceKey = function getAttendanceKey(classObj, classAtt, person) {
  const classAttendanceId = classAtt ? classAtt.id : undefined;

  return JSON.stringify({
    classId: classObj.id,
    classAttendanceId,
    personId: person.id,
  });
};

const unpackAttendanceKey = function unpackAttendanceKey(key) {
  return JSON.parse(key);
};

export default {
  name: 'today',
  components: {
    PersonsList,
    PersonUpdate,
  },
  created() {
    this.$store.commit('app/setTitle', 'Today');
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
      result({ data }) {
        this.allPersonsBirthdays = [];

        if (data.allPersons && data.allPersons.length > 0) {
          data.allPersons.forEach((p) => {
            const pDate = date.isValid(p.birthdate) ? new Date(p.birthdate) : undefined;
            const d = new Date();
            const sunday = d.getDate() - d.getDay();
            const saturday = sunday + 6;

            if (pDate) {
              const hasBirthday = pDate.getMonth() === d.getMonth() &&
                                  pDate.getDate() >= sunday &&
                                  pDate.getDate() <= saturday;

              if (hasBirthday) {
                pDate.setFullYear(d.getFullYear());
                this.allPersonsBirthdays.push(Object.assign({
                  birthdayDisplay: `${getPreferredNameShort(p)} (${date.formatDate(pDate, 'ddd')})`,
                }, p));
              }
            }
          });
        }
      },
    },
    DayOfWeek: {
      loadingKey: 'loadingCounter',
      query: DayOfWeekByNameAndDateWithAttendances,
      variables() {
        this.dateToday.setHours(0, 0, 0, 0);

        // const todayName = 'TUESDAY';
        const todayName = date.formatDate(this.dateToday.getTime(), 'dddd').toUpperCase();

        const dateTomorrow = new Date();
        dateTomorrow.setHours(0, 0, 0, 0);
        dateTomorrow.setDate(this.dateToday.getDate() + 1);

        return {
          today: this.dateToday,
          tomorrow: dateTomorrow,
          name: todayName,
          groupId: this.$store.getters['user/groupId'],
        };
      },
      skip() {
        return !isLoggedIn() || !this.$store.getters['user/groupId'];
      },
      update(data) {
        return data.DayOfWeek;
      },
      result({ data }) {
        if (data.DayOfWeek && data.DayOfWeek.classes && data.DayOfWeek.classes.length > 0) {
          data.DayOfWeek.classes.forEach((c) => {
            if (c.attendances && c.attendances.length > 0) {
              c.attendances.forEach((ca) => {
                if (ca.personsInAttendance && ca.personsInAttendance.length > 0) {
                  ca.personsInAttendance.forEach((p) => {
                    const key = getAttendanceKey(c, ca, p);
                    this.classAttendance.push(key);
                    this.classAttendanceSynced.push(key);
                  });
                }
              });
            }
          });
        }
      },
    },
  },
  data() {
    return {
      dateToday: new Date(),
      allPersons: [],
      allPersonsBirthdays: [],
      classAttendance: [],
      classAttendanceSynced: [],
      classAttendanceByClass: {},
      classAttendanceNeedsSyncing: false,
      DayOfWeek: undefined,
      loadingCounter: 0,
      strings,
      isSaveLoading: false,
      isEditingPreviousDateDisabled: true,
      isBirthdayAlertVisible: true,
    };
  },
  computed: {
    birthdayNames() {
      return map(this.allPersonsBirthdays, 'birthdayDisplay').join(', ');
    },
    personsAdults() {
      return this.allPersons.filter((s) => {
        const sDate = date.isValid(s.birthdate) ? new Date(s.birthdate) : undefined;
        let isAdult = false;

        if (sDate) {
          isAdult = date.getDateDiff(sDate, minChildAge, 'days') < 0;
        }

        return isAdult;
      });
    },
    personsChildren() {
      return this.allPersons.filter((s) => {
        let isChild = false;
        const sDate = date.isValid(s.birthdate) ? new Date(s.birthdate) : undefined;

        if (sDate) {
          isChild = date.getDateDiff(sDate, minChildAge, 'days') >= 0;
        }

        return isChild;
      });
    },
    personsUnknown() {
      return this.allPersons.filter(s => !s.birthdate);
    },
    today() {
      let today;

      if (this.DayOfWeek) {
        today = Object.assign({
          displayDate: date.formatDate(this.dateToday.getTime(), 'dddd, MMMM D YYYY'),
        }, this.DayOfWeek);
      }

      return today;
    },
    isSetToToday() {
      const dateNow = new Date();
      dateNow.setHours(0, 0, 0, 0);

      const dateTodayCopy = new Date(this.dateToday.getTime());
      dateTodayCopy.setHours(0, 0, 0, 0);

      return dateNow.getTime() === dateTodayCopy.getTime();
    },
    isAttendanceEditable() {
      return this.isSetToToday || !this.isEditingPreviousDateDisabled;
    },
  },
  watch: {
    classAttendance() {
      const attendancesUnsynced = difference(this.classAttendance, this.classAttendanceSynced);
      const attendancesRemoved = difference(this.classAttendanceSynced, this.classAttendance);

      this.classAttendanceNeedsSyncing = attendancesUnsynced.length > 0
        || attendancesRemoved.length > 0;
    },
    loadingCounter(val) {
      if (val > 0) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    },
    dateToday() {
      this.isEditingPreviousDateDisabled = true;
    },
  },
  methods: {
    goBackOneDay() {
      const back = this.dateToday.getDate() - 1;
      const newDate = new Date();
      newDate.setDate(back);

      this.dateToday = newDate;
    },
    goForwardOneDay() {
      const fwd = this.dateToday.getDate() + 1;
      const newDate = new Date();
      newDate.setDate(fwd);

      this.dateToday = newDate;
    },
    goToToday() {
      this.dateToday = new Date();
    },
    syncClassAttendance() {
      this.isSaveLoading = true;
      const mutations = [];
      const attendancesUnsynced = difference(this.classAttendance, this.classAttendanceSynced);
      const attendancesRemoved = difference(this.classAttendanceSynced, this.classAttendance);
      let newClassAttendancePersons;

      this.loadingCounter += 1;

      attendancesUnsynced.forEach((key) => {
        const record = unpackAttendanceKey(key);
        const classObj = this.DayOfWeek.classes.filter(c => c.id === record.classId)[0];

        if (classObj) {
          const isClassAttendanceIsNew = !classObj.attendances || classObj.attendances.length < 1;

          if (isClassAttendanceIsNew) {
            newClassAttendancePersons = newClassAttendancePersons || {};
            newClassAttendancePersons[classObj.id] = newClassAttendancePersons[classObj.id] || [];
            newClassAttendancePersons[classObj.id].push(record.personId);
          } else {
            const mut = addToClassAttendancePersonsWith.call(this, {
              classAttendancesClassAttendanceId: record.classAttendanceId,
              personsInAttendancePersonId: record.personId,
            });

            mutations.push(mut);
          }
        }
      });

      attendancesRemoved.forEach((key) => {
        const record = unpackAttendanceKey(key);
        const classObj = this.DayOfWeek.classes.filter(c => c.id === record.classId)[0];

        if (classObj) {
          const mut = removeFromClassAttendanceWith.call(this, {
            classAttendancesClassAttendanceId: record.classAttendanceId,
            personsInAttendancePersonId: record.personId,
          });

          mutations.push(mut);
        }
      });

      // We can assume the operations will succeed
      pullAll(this.classAttendanceSynced, attendancesRemoved);
      this.classAttendanceSynced = uniq(this.classAttendanceSynced.concat(attendancesUnsynced));

      if (typeof newClassAttendancePersons !== 'undefined') {
        forIn(newClassAttendancePersons, (personsInAttendanceIds, classId) => {
          const mut = createClassAttendanceWith.call(this, {
            classOccurredAt: new Date(),
            classId,
            personsInAttendanceIds,
          });

          mutations.push(mut);
        });
      }

      if (mutations.length > 0) {
        Promise.all(mutations)
          .catch((err) => {
            this.loadingCounter -= 1;
            this.$q.notify(err.message);
            this.isSaveLoading = false;
          })
          .then(() => {
            this.loadingCounter -= 1;
            this.classAttendanceNeedsSyncing = false;
            this.$q.notify('Attendance saved.');
            this.isSaveLoading = false;
          });
      }
    },
    getPreferredName,
    getSecondaryName,
    getSegmentDisplayName,
    getPersonsForClass(classObj, specificSegment) {
      const persons = [];
      const segment = specificSegment || classObj.personsSegment;
      let selectedPersons = [];

      switch (segment) {
        case 'CHILDREN':
          selectedPersons = this.personsChildren;
          break;

        case 'ADULTS':
          selectedPersons = this.personsAdults;
          break;

        case 'unknown':
          selectedPersons = this.personsUnknown;
          break;

        default:
          selectedPersons = this.personsAdults.concat(this.personsChildren);
          break;
      }

      selectedPersons.forEach((p) => {
        // Every class should have <= 1 attendance instance per day
        const attendance = classObj.attendances ? classObj.attendances[0] : undefined;
        const attendanceKey = getAttendanceKey(classObj, attendance, p);
        persons.push(Object.assign({ attendanceKey }, p));
      });

      return persons;
    },
    getClassTimeDisplay(atTime) {
      const d = new Date();

      d.setHours(0, 0, 0, 0);
      d.setTime(d.getTime() + (atTime * 1000));

      return date.formatDate(d.getTime(), 'h:mma');
    },
    getClassAttendance(classObj) {
      const personIds = [];

      this.classAttendance.forEach((key) => {
        const { classId, personId } = unpackAttendanceKey(key);

        if (classObj.id === classId) {
          personIds.push(personId);
        }
      });

      return personIds;
    },
    isClassHappeningNowish(classObj) {
      const sec = getSecondsSinceMidnight();

      return this.isSetToToday && sec < classObj.endsAt && sec >= (classObj.startsAt - 600);
    },
    goToPersonsNoBirthdate() {
      this.$router.push({ name: 'PersonsNoBirthdate' });
    },
    handleUpdatePerson(person) {
      this.$apollo.queries.allPersons.refetch();
      this.$q.dialog({
        title: `New ${strings.Person} Added`,
        message: `${getPreferredName(person)} was added to the group. Find them in the list to mark them as present for a class.`,
      });
    },
    handleEditingToggle() {
      if (this.isEditingPreviousDateDisabled === false) {
        this.$q.dialog({
          title: 'Enable Editing',
          message: 'You are viewing a previous day\'s classes. Are you sure you want to edit these classes?',
          cancel: true,
          ok: 'Enable',
        }).then(() => {}, () => {
          this.isEditingPreviousDateDisabled = true;
        });
      }
    },
  },
};
</script>

<style scoped>
#today-subhead .today-subhead-hidden {
  visibility: hidden;
}
</style>
