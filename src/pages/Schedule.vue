<template>
  <q-page padding>
    <div class="row justify-center q-mb-md">
      <div>
        <q-btn color="primary" @click="$refs.scheduleItemUpdate.show()">
          <q-icon name="fas fa-plus" />&nbsp;Add Class
        </q-btn>
      </div>
    </div>
    <div v-if="days.length > 0">
      <q-list link>
        <template v-for="(d, id) in days">
          <q-list-header :key="id">
            {{ d.name }}
            <small v-if="classesByDay[d.id].length < 1" class="text-faded"><i>no class</i></small>
          </q-list-header>
          <template v-if="classesByDay[d.id].length > 0">
            <q-item
              v-for="(c, ic) in classesByDay[d.id]"
              :key="id + '-' + ic"
              :to="{ name: 'ScheduleItem', params: { id: getIdForClass(c) } }"
              tag="label"
              multiline
            >
              <q-item-main>
                <q-item-tile label>{{ c.name }}</q-item-tile>
                <q-item-tile sublabel>
                  {{ getClassTimeDisplay(c.startsAt) }}-{{ getClassTimeDisplay(c.endsAt) }}
                </q-item-tile>
              </q-item-main>
              <q-item-side right icon="fas fa-angle-right"></q-item-side>
            </q-item>
          </template>
        </template>
      </q-list>
    </div>
    <div v-else-if="loadingCounter < 1" class="text-center q-ma-md">No schedule found.</div>
    <schedule-item-update
      ref="scheduleItemUpdate"
      title="Add Class"
      @schedule-item-deleted="handleUpdateScheduleItem"
      @schedule-item-updated="handleUpdateScheduleItem" />
  </q-page>
</template>

<script>
import { date } from 'quasar';
import { allDayOfWeeksClasses } from '../gql';
import ScheduleItemUpdate from '../components/ScheduleItemUpdate';

export default {
  name: 'schedule',
  components: {
    ScheduleItemUpdate,
  },
  created() {
    this.$store.commit('app/setTitle', 'Schedule');
  },
  mounted() {
    if (this.$route.query.refresh && this.allDayOfWeeks.length > 0) {
      this.handleUpdateScheduleItem();
    }
  },
  apollo: {
    allDayOfWeeks: {
      loadingKey: 'loadingCounter',
      query: allDayOfWeeksClasses,
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
      allDayOfWeeks: [],
      loadingCounter: 0,
    };
  },
  computed: {
    classesByDay() {
      const classes = {};

      this.days.forEach((day) => {
        const [groupDay] = this.allDayOfWeeks.filter(d => d.id === day.id);
        classes[day.id] = groupDay ? groupDay.classes : [];
      });

      return classes;
    },
    days() {
      return this.$store.state.app.days;
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
    getIdForClass(classObj) {
      return window.escape(classObj.id);
    },
    getClassTimeDisplay(atTime) {
      const d = new Date();

      d.setHours(0, 0, 0, 0);
      d.setTime(d.getTime() + (atTime * 1000));

      return date.formatDate(d.getTime(), 'h:mma');
    },
    handleUpdateScheduleItem() {
      this.$apollo.queries.allDayOfWeeks.refetch();
    },
  },
};
</script>

<style>
</style>
