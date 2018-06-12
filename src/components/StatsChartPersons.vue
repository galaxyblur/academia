<template>
  <div id="stats-chart-persons">
    <span v-if="allPersons.length < 1" class="faded">
      <em>No data found for {{ strings.persons }}.</em>
    </span>
  </div>
</template>

<script>
import { date } from 'quasar';
import { allPersonsStudents } from '../gql';
import strings from '../json/strings';
import { getMinChildAge } from '../lib/PersonHelper';
import { Chart } from 'frappe-charts/dist/frappe-charts.min.esm';
import 'frappe-charts/dist/frappe-charts.min.css';

const minChildAge = getMinChildAge();

export default {
  name: 'stats-chart-persons',
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
    },
  },
  data() {
    return {
      allPersons: [],
      chart: undefined,
      loadingCounter: 0,
      strings,
    };
  },
  computed: {
    chartLabels() {
      return [
        'Adults',
        'Children',
        'Unknown',
      ];
    },
    chartValues() {
      return [
        this.personsAdults.length,
        this.personsChildren.length,
        this.personsUnknown.length,
      ];
    },
    chartData() {
      return {
        labels: this.chartLabels,
        datasets: [
          {
            title: 'Students',
            values: this.chartValues,
          },
        ],
      };
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
  },
  watch: {
    allPersons(val) {
      if (!this.chart && val.length > 0) {
        this.chart = new Chart('#stats-chart-persons', {
          title: `${strings.Persons} by Age`,
          data: this.chartData,
          type: 'percentage',
        });
      }
    },
    loadingCounter(val) {
      if (val > 0) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    },
  },
};
</script>

<style scoped>
</style>
