<template>
  <q-list separator link>
    <q-list-header v-if="listHeaderText">
      {{ listHeaderText }}
      <q-btn
        v-if="listHeaderHelpText"
        icon="fas fa-question-circle"
        size="sm"
        dense
        @click="handleListHeaderHelp" />
    </q-list-header>
    <q-item v-for="(p, pi) in persons" :key="pi" :to="{ name: 'Person', params: { id: p.id } }">
      <q-item-main>
        <q-item-tile label>
          {{ getPreferredName(p) }}
          <span v-if="getSecondaryName(p)"><small>{{ getSecondaryName(p) }}</small></span>
          <i v-if="p.isMember" class="fas fa-certificate text-positive"></i>
        </q-item-tile>
        <q-item-tile v-if="p.rank">
          <rank-display v-bind="p.rank" display-name="true" />
        </q-item-tile>
      </q-item-main>
      <q-item-side right icon="fas fa-angle-right"></q-item-side>
    </q-item>
  </q-list>
</template>

<script>
import {
  getPreferredName,
  getSecondaryName,
} from '../lib/PersonHelper';

import RankDisplay from './RankDisplay';

export default {
  name: 'persons-list',
  components: {
    RankDisplay,
  },
  props: ['persons', 'listHeaderText', 'listHeaderHelpText'],
  methods: {
    getPreferredName,
    getSecondaryName,
    handleListHeaderHelp() {
      this.$q.dialog({
        title: 'About this list',
        message: this.listHeaderHelpText,
      });
    },
  },
};
</script>

<style scoped>
</style>
