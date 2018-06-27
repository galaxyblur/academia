<template>
  <q-page>

    <div class="text-center q-py-md">
      <q-btn color="primary" @click="$refs.scheduleItemUpdate.show()">
        <q-icon name="fas fa-plus" />&nbsp;Add Class
      </q-btn>
    </div>

    <template v-if="days.length > 0">
      <q-list link no-border>
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
          <q-item-separator :key="'separator' + id" />
        </template>
      </q-list>
    </template>

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
import { allClassesInGroup } from '../gql';
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
    if (this.$route.query.refresh && this.allClasses.length > 0) {
      this.handleUpdateScheduleItem();
    }
  },
  apollo: {
    allClasses: {
      loadingKey: 'loadingCounter',
      query: allClassesInGroup,
      skip() {
        return !this.$store.getters['user/groupId'];
      },
      variables() {
        return {
          groupId: this.$store.getters['user/groupId'],
        };
      },
    },
  },
  data() {
    return {
      allClasses: [],
      loadingCounter: 0,
    };
  },
  computed: {
    classesByDay() {
      const classes = {};

      this.days.forEach((d) => {
        classes[d.id] = [];
      });

      if (this.allClasses.length > 0) {
        this.allClasses.forEach((c) => {
          classes[c.dayOfWeek.id].push(c);
        });
      }

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
      this.$apollo.queries.allClasses.refetch();
    },
  },
};
</script>

<style>
</style>
