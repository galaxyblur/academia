<template>
  <q-page padding>
    <h4 class="text-center q-ma-none">Classes</h4>
    <h5 v-if="today" class="text-center q-ma-none">{{ today.displayDate }}</h5>

    <q-card v-if="allPersonsBirthdays.length > 0" color="secondary" class="q-mt-md">
      <q-card-main>
        <q-icon name="fa-birthday-cake" />
        {{ allPersonsBirthdays.length }}
        birthday<template v-if="allPersonsBirthdays.length > 1">s</template> this week:
        <em>{{ birthdayNames }}</em>
      </q-card-main>
    </q-card>

    <template v-if="today && today.classes.length > 0">
      <q-card v-for="(c, ic) in today.classes" :key="ic" class="q-mt-md">
        <q-card-title>
          {{ c.name }}
          <small>{{ getClassTimeDisplay(c.startsAt) }}-{{ getClassTimeDisplay(c.endsAt) }}</small>
          <q-chip
            small
            :color="getClassAttendance(c).length > 0 ? 'primary' : 'faded'"
            class="float-right">
            {{ getClassAttendance(c).length }}
          </q-chip>
        </q-card-title>
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
              <q-checkbox v-model="classAttendance" :val="s.attendanceKey"></q-checkbox>
            </q-item-side>
          </q-item>
          <template v-if="personsUnknown.length > 0">
            <q-list-header>
              {{ personsUnknown.length }} Others
              <small><a href="#" v-scroll-to="'#today-persons-unknown'">fix this &raquo;</a></small>
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
                <q-checkbox v-model="classAttendance" :val="s.attendanceKey"></q-checkbox>
              </q-item-side>
            </q-item>
          </template>
        </q-list>
      </q-card>
      <q-card id="today-persons-unknown" v-if="personsUnknown.length > 0" flat>
        <q-card-main>
          <persons-list
            :list-header-text="personsUnknown.length + ' students have no birthdate'"
            :persons="personsUnknown" />
        </q-card-main>
      </q-card>
      <q-fixed-position v-if="classAttendanceNeedsSyncing" :offset="[10, 10]">
        <q-btn color="positive" class="shadow-5 animate-bounce" @click="syncClassAttendance" loader>
          <q-icon name="fa-cloud-upload" />&nbsp;Save Attendance
        </q-btn>
      </q-fixed-position>
    </template>

    <template v-else-if="loadingCounter < 1">
      <q-card class="q-mt-md">
        <q-card-main>
          No classes scheduled today.
          <router-link :to="{ name: 'Schedule' }">Edit Schedule &raquo;</router-link>
        </q-card-main>
      </q-card>
    </template>

  </q-page>
</template>

<style>
</style>

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

import strings from '../json/strings';

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
        // const todayName = 'TUESDAY';
        const today = new Date();
        const tomorrow = new Date();
        const todayName = date.formatDate(today.getTime(), 'dddd').toUpperCase();

        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(today.getDate() + 1);

        return {
          today,
          tomorrow,
          name: todayName,
          groupId: this.$store.getters['user/groupId'],
        };
      },
      skip() {
        return !isLoggedIn() || !this.$store.state.user.User;
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
      allPersons: [],
      allPersonsBirthdays: [],
      classAttendance: [],
      classAttendanceSynced: [],
      classAttendanceByClass: {},
      classAttendanceNeedsSyncing: false,
      DayOfWeek: undefined,
      loadingCounter: 0,
      strings,
    };
  },
  computed: {
    birthdayNames() {
      return map(this.allPersonsBirthdays, 'birthdayDisplay').join(', ');
    },
    personsAdults() {
      return this.allPersons.filter((s) => {
        let isAdult = false;
        const sDate = date.isValid(s.birthdate) ? new Date(s.birthdate) : undefined;

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
      const todayDate = new Date();
      let today;

      if (this.DayOfWeek) {
        today = Object.assign({
          displayDate: date.formatDate(todayDate.getTime(), 'dddd, MMMM D YYYY'),
        }, this.DayOfWeek);
      }

      return today;
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
  },
  methods: {
    syncClassAttendance(event, done) {
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
          })
          .then(() => {
            this.loadingCounter -= 1;
            this.classAttendanceNeedsSyncing = false;
            this.$q.notify('Attendance saved.');
            done();
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
  },
};
</script>
