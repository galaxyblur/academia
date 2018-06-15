<template>
  <q-page>
    <q-list link separator>
      <q-item v-for="(i, ii) in items" :key="ii" :to="{ name: i.routeName }" tag="label" multiline>
        <q-item-side :icon="i.icon" />
        <q-item-main>
          <q-item-tile label>{{ i.label }}</q-item-tile>
          <q-item-tile sublabel>{{ i.sublabel }}</q-item-tile>
        </q-item-main>
        <q-item-side right icon="fas fa-angle-right"></q-item-side>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'more',
  created() {
    this.$store.commit('app/setTitle', 'More');
  },
  data() {
    return {
      items: [
        {
          routeName: 'Ranks',
          icon: 'fas fa-bolt',
          label: strings.Ranks,
          sublabel: `View and edit the ${strings.ranks} for your group.`,
        },
        {
          routeName: 'PersonGuardians',
          icon: 'fas fa-user-circle',
          label: 'Parents/Guardians',
          sublabel: 'A list of parents/guardians for your group.',
        },
        {
          routeName: 'Stats',
          icon: 'fas fa-chart-bar',
          label: 'Stats',
          sublabel: 'View some interesting data about your group.',
        },
      ],
      strings,
    };
  },
};
</script>

<style>
</style>
