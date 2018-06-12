<template>
  <q-page padding>
    <div v-if="Class">
      <q-card>
        <q-card-title>
          {{ Class.name }} - {{ getDayNamePluralDisplay(Class.dayOfWeek.name) }}
          <q-icon slot="right" name="fas fa-ellipsis-v">
            <q-popover ref="popover">
              <q-list link class="no-border">
                <q-item @click.native="$refs.popover.hide(); $refs.scheduleItemUpdate.show();">
                  <q-item-main label="Edit Class" />
                </q-item>
              </q-list>
            </q-popover>
          </q-icon>
        </q-card-title>
        <q-card-main>
          <dl class="horizontal">
            <dt>For</dt>
            <dd v-html="getClassStudentsSegmentDisplay(Class.studentsSegment)"></dd>
            <dt>Start</dt>
            <dd>{{ getClassTimeDisplay(Class.startsAt) }}</dd>
            <dt>End</dt>
            <dd>{{ getClassTimeDisplay(Class.endsAt) }}</dd>
          </dl>
        </q-card-main>
      </q-card>
      <q-card flat>
        <q-card-main>
          <schedule-item-chart
            :schedule-item="Class"
            :look-back-days="classAttendancesLookBackDays" />
        </q-card-main>
      </q-card>
    </div>
    <schedule-item-update
      v-if="Class"
      ref="scheduleItemUpdate"
      title="Update Class"
      :class-obj="Class"
      @schedule-item-deleted="handleDeletedScheduleItem"
      @schedule-item-updated="handleUpdateScheduleItem" />
      </q-page>
</template>

<script>
import { date, format } from 'quasar';
import { ClassByIdWithAttendances } from '../gql';
import ScheduleItemUpdate from '../components/ScheduleItemUpdate';
import ScheduleItemChart from '../components/ScheduleItemChart';

export default {
  name: 'schedule-item',
  components: {
    ScheduleItemUpdate,
    ScheduleItemChart,
  },
  created() {
    this.$store.commit('app/setTitle', 'Schedule');
  },
  apollo: {
    Class: {
      loadingKey: 'loadingCounter',
      query: ClassByIdWithAttendances,
      variables() {
        const oldestDate = new Date();
        const latestDate = new Date();

        oldestDate.setHours(0, 0, 0, 0);
        latestDate.setHours(0, 0, 0, 0);
        oldestDate.setDate(latestDate.getDate() - this.classAttendancesLookBackDays);

        return {
          id: window.unescape(this.$route.params.id),
          oldestDate,
          latestDate,
        };
      },
    },
  },
  data() {
    return {
      Class: undefined,
      classAttendancesLookBackDays: 30,
      loadingCounter: 0,
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
    getClassStudentsSegmentDisplay(seg) {
      return seg ? format.capitalize(seg.toLowerCase()) : 'Everyone';
    },
    getClassTimeDisplay(atTime) {
      const d = new Date();

      d.setHours(0, 0, 0, 0);
      d.setTime(d.getTime() + (atTime * 1000));

      return date.formatDate(d.getTime(), 'h:mma');
    },
    getDayNamePluralDisplay(dayName) {
      return `${format.capitalize(dayName.toLowerCase())}s`;
    },
    handleDeletedScheduleItem() {
      this.$q.loading.show();
      setTimeout(() => {
        this.$router.push({ name: 'Schedule', query: { refresh: 1 } });
      });
    },
    handleUpdateScheduleItem() {
      this.$apollo.queries.Class.refetch();
    },
  },
};
</script>

<style>
</style>
