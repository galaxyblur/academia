<template>
  <div>
    <v-date-picker
      v-if="$q.screen.gt.sm"
      :max-date="today"
      popover-direction="top"
      v-model="pDate">
      <q-field class="q-py-sm" :helper="helperText">
        <q-input
          readonly
          :float-label="label"
          :value="getDateFormatted(pDate)"
          :after="[
            {
              icon: 'fas fa-times-circle',
              handler: () => { pDate = null },
              error: false,
            }
          ]"
          />
      </q-field>
    </v-date-picker>
    <q-field v-else class="q-py-sm" :helper="helperText">
      <q-datetime
        :float-label="label"
        type="date"
        v-model="pDate" />
    </q-field>
  </div>
</template>

<script>
import { date } from 'quasar';

export default {
  name: 'person-date-picker',
  props: ['person-date', 'label', 'helper-text'],
  data() {
    return {
      pDate: this.personDate ? new Date(this.personDate) : null,
      today: new Date(),
    };
  },
  methods: {
    getDateFormatted(d) {
      let dF = '';

      if (d) {
        dF = date.formatDate(d, 'YYYY/MM/DD');
      }

      return dF;
    },
  },
  watch: {
    pDate() {
      this.$emit('change', this.pDate);
    },
  },
};
</script>
