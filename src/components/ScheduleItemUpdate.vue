<template>
  <q-modal
    v-model="isOpen"
    ref="scheduleItemUpdate"
    content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>{{ title }}</q-toolbar-title>
      </q-toolbar>
      <div id="schedule-item-update-modal-footer" class="layout-padding bg-light" slot="footer">
        <q-btn
          v-if="classObj"
          color="negative"
          @click="removeScheduleItem"
          :loading="isRemoveScheduleItemLoading"
          class="float-left">
            Remove
        </q-btn>
        <q-btn color="faded" @click="hide">Cancel</q-btn>
        <q-btn color="primary" @click="save" :loading="isSaveLoading">Save</q-btn>
      </div>
      <div class="layout-padding">
        <q-field error-label="name is required" :error="$v.classObjMod.name.$error">
          <q-input float-label="Name" v-model="classObjMod.name" />
        </q-field>
        <q-field
          label="Day"
          error-label="day is required"
          :error="$v.classObjMod.dayOfWeekId.$error">
          <q-option-group
            type="radio"
            v-model="classObjMod.dayOfWeekId"
            :options="dayOfWeekOptions"/>
        </q-field>
        <q-field error-label="invalid start time" :error="$v.classObjMod.startsAtDate.$error">
          <q-datetime
            type="time"
            format="hh:mm a"
            :format24h="false"
            no-clear
            float-label="Starts at"
            @change="handleStartsAtDateChange"
            v-model="classObjMod.startsAtDate" />
        </q-field>
        <q-field error-label="invalid end time" :error="$v.classObjMod.endsAtDate.$error">
          <q-datetime
            type="time"
            format="hh:mm a"
            :format24h="false"
            no-clear
            float-label="Ends at"
            @change="handleEndsAtDateChange"
            v-model="classObjMod.endsAtDate" />
        </q-field>
        <q-field
          label="For"
          :error-label="'invalid ' + strings.person + ' group'"
          :error="$v.classObjMod.personsSegment.$error">
          <q-option-group
            type="radio"
            v-model="classObjMod.personsSegment"
            :options="personsSegmentOptions"/>
        </q-field>
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import {
  Dialog,
  format,
} from 'quasar';

import {
  required,
  minLength,
} from 'vuelidate/lib/validators';

import {
  allDayOfWeeks,
  createClass,
  deleteClass,
  updateClass,
  typeClassPersonSegment,
} from '../gql';

import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

const formatEnumForDisplay = (enumName => format.capitalize(enumName.toLowerCase()));

const addGroupIdToClassObj = function addGroupIdToClassObj(classObj, user) {
  if (user && user.groups && user.groups.length > 0) {
    classObj.groupId = user.groups[0].id;
  }
};

const saveClass = function saveClass(variables) {
  const mutation = this.$apollo.mutate({
    mutation: updateClass,
    variables,
  });

  return mutation;
};

const saveNewClass = function saveNewClass(variables) {
  const mutation = this.$apollo.mutate({
    mutation: createClass,
    variables,
  });

  return mutation;
};

const removeScheduleItem = function removeScheduleItem(classObj) {
  const mutation = this.$apollo.mutate({
    mutation: deleteClass,
    variables: {
      id: classObj.id,
    },
  });

  return mutation;
};

const getTodayAtMidnight = function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getNowRoundedToHour = function getNowRoundedToHour() {
  const rightNow = new Date();
  rightNow.setMinutes(0);
  rightNow.setSeconds(0);
  rightNow.setMilliseconds(0);
  return rightNow;
};

const getSecondsSinceMidnight = function getSecondsSinceMidnight(d = new Date()) {
  const today = getTodayAtMidnight();

  const diff = parseInt(d.getTime() - today.getTime(), 10);
  return parseInt(diff / 1000, 10);
};

export default {
  name: 'schedule-item-update',
  apollo: {
    allDayOfWeeks: {
      query: allDayOfWeeks,
      skip() {
        return !this.$store.state.user.User;
      },
      variables() {
        return {
          userId: this.$store.state.user.User.id,
        };
      },
      result({ data }) {
        if (data.allDayOfWeeks.length > 0 && !this.classObjMod.dayOfWeekId) {
          Object.assign(this.classObjMod, {
            dayOfWeekId: data.allDayOfWeeks[0].id,
          });
        }
      },
      update(data) {
        const allDays = [];

        if (data && data.allDays && data.allDays.length > 0) {
          data.allDays.forEach((d, i) => {
            allDays[i] = Object.assign({
              displayName: formatEnumForDisplay(d.name),
            }, d);
          });
        }

        return allDays;
      },
    },
    typeClassPersonSegment: {
      query: typeClassPersonSegment,
      update(data) {
        const personSegments = [];

        data.__type.states.forEach((s, i) => { // eslint-disable-line no-underscore-dangle
          personSegments[i] = Object.assign({
            displayName: formatEnumForDisplay(s.name),
          }, s);
        });

        return personSegments;
      },
    },
  },
  computed: {
    dayOfWeekOptions() {
      const opts = [];

      this.allDayOfWeeks.forEach((d) => {
        opts.push({
          label: d.displayName,
          value: d.id,
        });
      });

      return opts;
    },
    personsSegmentOptions() {
      const opts = [
        { label: 'Everyone', value: null },
      ];

      this.typeClassPersonSegment.forEach((s) => {
        opts.push({
          label: s.displayName,
          value: s.name,
        });
      });

      return opts;
    },
  },
  props: ['title', 'classObj'],
  data() {
    return {
      isOpen: false,
      allDayOfWeeks: [],
      classObjMod: Object.assign(
        {
          id: undefined,
          name: '',
          dayOfWeek: undefined,
          dayOfWeekId: (() => {
            const hasDayOfWeek = this.classObj && this.classObj.dayOfWeek;
            const dayOfWeekId = hasDayOfWeek ? this.classObj.dayOfWeek.id : undefined;

            return dayOfWeekId;
          })(),
          endsAt: (() => {
            const rightNow = getNowRoundedToHour();
            rightNow.setHours(rightNow.getHours() + 1);
            return getSecondsSinceMidnight(rightNow);
          })(),
          endsAtDate: (() => {
            let d = getTodayAtMidnight();

            if (this.classObj && this.classObj.endsAt) {
              d.setTime(d.getTime() + (this.classObj.endsAt * 1000));
              d.setSeconds(0);
              d.setMilliseconds(0);
            } else {
              d = getNowRoundedToHour();
              d.setHours(d.getHours() + 1);
            }

            return d;
          })(),
          startsAt: getSecondsSinceMidnight(getNowRoundedToHour()),
          startsAtDate: (() => {
            let d = getTodayAtMidnight();

            if (this.classObj && this.classObj.startsAt) {
              d.setTime(d.getTime() + (this.classObj.startsAt * 1000));
              d.setSeconds(0);
              d.setMilliseconds(0);
            } else {
              d = getNowRoundedToHour();
            }

            return d;
          })(),
          groupId: undefined,
          personsSegment: null,
        },
        this.classObj,
      ),
      strings,
      typeClassPersonSegment: [],
      isRemoveScheduleItemLoading: false,
      isSaveLoading: false,
    };
  },
  methods: {
    show() {
      this.isOpen = true;
    },
    hide() {
      this.isOpen = false;
    },
    handleEndsAtDateChange(val) {
      const today = getTodayAtMidnight();

      val.setSeconds(0);
      val.setMilliseconds(0);

      const diff = parseInt(val.getTime() - today.getTime(), 10);
      this.classObjMod.endsAt = parseInt(diff / 1000, 10);
    },
    handleStartsAtDateChange(val) {
      const today = getTodayAtMidnight();

      val.setSeconds(0);
      val.setMilliseconds(0);

      const diff = parseInt(val.getTime() - today.getTime(), 10);
      this.classObjMod.startsAt = parseInt(diff / 1000, 10);
    },
    removeScheduleItem() {
      this.isRemoveScheduleItemLoading = true;
      Dialog.create({
        title: 'Are you sure you want to remove this class?',
        buttons: [
          'Cancel',
          {
            label: 'Remove',
            handler: () => {
              removeScheduleItem.call(this, this.classObjMod)
                .catch((err) => {
                  this.isRemoveScheduleItemLoading = false;
                  this.$q.notify(err.message);
                })
                .then(() => {
                  this.isRemoveScheduleItemLoading = false;
                  this.$emit('schedule-item-deleted');
                  this.hide();
                  this.$q.notify('Class removed!');
                });
            },
          },
        ],
      });
    },
    save() {
      this.isSaveLoading = true;
      let mutation;

      // Required to validate all fields
      this.$v.classObjMod.$touch();

      if (this.$v.classObjMod.$error) {
        this.isSaveLoading = false;
        return;
      }

      addGroupIdToClassObj(this.classObjMod, this.$store.state.user.User);

      if (this.classObjMod.id) {
        mutation = saveClass.call(this, this.classObjMod);
      } else {
        mutation = saveNewClass.call(this, this.classObjMod);
      }

      mutation.then(() => {
        this.isSaveLoading = false;
        this.$emit('schedule-item-updated');
        this.hide();
        this.$q.notify('Class saved!');
      });

      mutation.catch((error) => {
        this.isSaveLoading = false;
        this.$q.notify(error.message);
      });
    },
  },
  validations: {
    classObjMod: {
      name: {
        minLength: minLength(3),
        required,
      },
      dayOfWeekId: { required },
      startsAtDate: { required },
      endsAtDate: { required },
      personsSegment: {},
    },
  },
};
</script>

<style scoped>
#schedule-item-update-modal-footer {
  text-align: right;
}
</style>
