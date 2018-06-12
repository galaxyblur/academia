<template>
  <div id='stats-chart-ranks'>
    <span v-if="allRanks.length < 1" class="faded">
      <em>No data found for {{ strings.ranks }}.</em>
    </span>
  </div>
</template>

<script>
import { Chart } from 'frappe-charts/dist/frappe-charts.min.esm';
import 'frappe-charts/dist/frappe-charts.min.css';
import { allRanks } from '../gql';
import strings from '../json/strings';

export default {
  name: 'stats-chart-ranks',
  apollo: {
    allRanks: {
      loadingKey: 'loadingCounter',
      query: allRanks,
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
      allRanks: [],
      chart: undefined,
      loadingCounter: 0,
      strings,
    };
  },
  computed: {
    chartLabels() {
      const labels = [];

      this.allRanks.forEach((r) => {
        labels.push(r.name);
      });

      return labels;
    },
    chartValues() {
      const values = [];

      this.allRanks.forEach((r) => {
        values.push(r.students.length);
      });

      return values;
    },
    chartData() {
      return {
        labels: this.chartLabels,
        datasets: [
          {
            title: 'Ranks',
            color: 'blue',
            values: this.chartValues,
          },
        ],
      };
    },
  },
  watch: {
    allRanks(val) {
      if (!this.chart && val.length > 0) {
        this.chart = new Chart('#stats-chart-ranks', {
          title: `Count of ${strings.Persons} by ${strings.Rank}`,
          data: this.chartData,
          type: 'bar',
          y_axis_mode: 'tick',
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
