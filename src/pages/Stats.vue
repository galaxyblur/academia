<template>
  <q-page padding>
    <stats-chart-ranks />
    <stats-chart-persons />
  </q-page>
</template>

<script>
import StatsChartRanks from '../components/StatsChartRanks';

import StatsChartPersons from '../components/StatsChartPersons';

export default {
  name: 'stats',
  components: {
    StatsChartRanks,
    StatsChartPersons,
  },
  created() {
    this.$store.commit('app/setTitle', 'Stats');
  },
};
</script>
