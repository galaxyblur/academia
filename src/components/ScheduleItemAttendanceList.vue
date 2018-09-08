<template>
  <q-collapsible group="scheduleItemAttendanceList" :opened="isClassHappeningNowish(classObj)">

    <template slot="header">
      <q-item-main>
        <q-item-tile
          label
          :text-color="!isAttendanceEditable ? 'faded' : ''">
          {{ classObj.name }}
        </q-item-tile>
        <q-item-tile
          sublabel
          :text-color="!isAttendanceEditable ? 'faded' : ''">
          {{ classStartsAtDisplay }}-{{ classEndsAtDisplay }}
        </q-item-tile>
      </q-item-main>
      <q-item-side right>
        <q-chip
          dense
          :color="classAttendanceMod.length > 0 ? 'primary' : 'faded'"
          class="float-right">
          {{ classAttendanceMod.length }}
        </q-chip>
      </q-item-side>
    </template>

    <q-list no-border>

      <q-list-header>
        {{ persons.length }} {{ getSegmentDisplayName(classObj) }}
      </q-list-header>
      <q-item
        v-for="p in persons"
        :key="p.id + '-' + classObj.id"
        tag="label"
        multiline>
        <q-item-main>
          <q-item-tile label>
            {{ getPreferredName(p) }}
            <span v-if="getSecondaryName(p)"><small>{{ getSecondaryName(p) }}</small></span>
            <i v-if="p.isMember" class="fa fa-certificate text-positive"></i>
          </q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-checkbox
            v-model="classAttendanceMod"
            :val="p.attendanceKey"
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
          v-for="p in personsUnknown"
          :key="p.id + '-' + classObj.id"
          tag="label"
          multiline>
          <q-item-main>
            <q-item-tile label>
              {{ getPreferredName(p) }}
              <span v-if="getSecondaryName(p)"><small>{{ getSecondaryName(p) }}</small></span>
              <i v-if="p.isMember" class="fa fa-certificate text-positive"></i>
            </q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-checkbox
              v-model="classAttendanceMod"
              :val="p.attendanceKey"
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
          @click="$emit('addPerson')" />
      </q-item>

    </q-list>

  </q-collapsible>
</template>

<script>
import { date } from 'quasar';
import { cloneDeep } from 'lodash';

import {
  getPreferredName,
  getSecondaryName,
} from '../lib/PersonHelper';

import { getSegmentDisplayName } from '../lib/ClassHelper';
import { getSecondsSinceMidnight } from '../lib/DateHelper';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'schedule-item-attendance-list',
  props: [
    'class-obj',
    'class-attendance',
    'is-attendance-editable',
    'is-set-to-today',
    'persons',
    'persons-unknown',
  ],
  data() {
    const classAttendanceMod = this.classAttendance ? cloneDeep(this.classAttendance) : [];

    return {
      classAttendanceMod,
      loadingCounter: 0,
      strings,
      isSaveLoading: false,
    };
  },
  computed: {
    classStartsAtDisplay() {
      const d = new Date();

      d.setHours(0, 0, 0, 0);
      d.setTime(d.getTime() + (this.classObj.startsAt * 1000));

      return date.formatDate(d.getTime(), 'h:mma');
    },
    classEndsAtDisplay() {
      const d = new Date();

      d.setHours(0, 0, 0, 0);
      d.setTime(d.getTime() + (this.classObj.endsAt * 1000));

      return date.formatDate(d.getTime(), 'h:mma');
    },
  },
  watch: {
    classAttendanceMod() {
      this.$emit('update:class-attendance', this.classAttendanceMod);
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
    getClassAttendanceMod() {
      return this.classAttendanceMod;
    },
    getPreferredName,
    getSecondaryName,
    getSegmentDisplayName,
    isClassHappeningNowish(classObj) {
      const sec = getSecondsSinceMidnight();

      return this.isSetToToday && sec <= classObj.endsAt && sec >= (classObj.startsAt - 600);
    },
  },
};
</script>
