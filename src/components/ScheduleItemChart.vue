<template>
  <div id='schedule-item-chart'>
    <span v-if="total < 1" class="faded"><em>No historical data found for this class.</em></span>
  </div>
</template>

<script>
import { date } from 'quasar';
import { Chart } from 'frappe-charts/dist/frappe-charts.min.esm';
import 'frappe-charts/dist/frappe-charts.min.css';

const DAY_OF_WEEK_INDEX = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export default {
  name: 'schedule-item-chart',
  props: ['schedule-item', 'look-back-days'],
  computed: {
    chartDays() {
      // Get the latest occurrence of dayOfWeek
      const today = new Date();
      const dayIndex = DAY_OF_WEEK_INDEX.indexOf(this.scheduleItem.dayOfWeek.name);
      const lastOccurrenceDayOfWeek = (today.getDate() - today.getDay()) + dayIndex;
      const latestDate = new Date();
      latestDate.setDate(lastOccurrenceDayOfWeek);

      // Create a value for every previous dayOfWeek going back look-back-days
      let daysBack = 0;
      const days = [
        latestDate,
      ];

      while (daysBack <= this.lookBackDays) {
        daysBack += 7;

        const addDate = new Date();
        addDate.setTime(latestDate.getTime());
        addDate.setDate(addDate.getDate() - daysBack);
        addDate.setHours(0, 0, 0, 0);

        days.push(addDate);
      }

      return days;
    },
    chartLabels() {
      const labels = [];

      this.chartDays.forEach((d) => {
        labels.push(date.formatDate(d, 'MMM D'));
      });

      labels.reverse();
      return labels;
    },
    chartValues() {
      const values = [];

      this.chartDays.forEach((d) => {
        let v = 0;
        const att = this.scheduleItem.attendances.filter((a) => {
          const ad = new Date(a.classOccurredAt);
          ad.setHours(0, 0, 0, 0);
          return ad.getTime() === d.getTime();
        });

        if (att.length > 0) {
          v = att[0].personsInAttendance.length;
        }

        values.push(v);
      });

      values.reverse();
      return values;
    },
    total() {
      return this.chartValues.reduce((a, b) => a + b);
    },
    chartData() {
      return {
        labels: this.chartLabels,
        datasets: [
          {
            title: 'Attendance',
            color: 'green',
            values: this.chartValues,
          },
        ],
      };
    },
  },
  mounted() {
    if (this.total > 0) {
      const c = new Chart('#schedule-item-chart', { // eslint-disable-line no-unused-vars
        title: `Class Attendance Last ${this.lookBackDays} Days`,
        data: this.chartData,
        y_axis_mode: 'tick',
      });
    }
  },
};
</script>

<style scoped>
</style>
