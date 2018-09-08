<template>
  <dl class="horizontal">
    <template v-if="isStudent">
      <dt>{{ strings.Rank }}</dt>
      <dd>
        <rank-display v-if="person.rank" v-bind="person.rank" :display-name="true" />
        <span v-else>&nbsp;</span>
      </dd>
    </template>
    <dt>Phone</dt>
    <dd>
      <span v-if="person.phoneNumber">{{ person.phoneNumber }}</span>
      <span v-else>&nbsp;</span>
    </dd>
    <dt>Email</dt>
    <dd>
      <a v-if="person.emailAddress" :href="'mailto:' + person.emailAddress">
        {{ person.emailAddress }}
      </a>
      <span v-else>&nbsp;</span>
    </dd>
    <template v-if="isStudent">
      <dt>Exp</dt>
      <dd v-html="getExperienceDisplay(person.startedExperienceAt)"></dd>
      <dt>Age</dt>
      <dd v-html="getAgeDisplay(person.birthdate)"></dd>
      <dt>Birthday</dt>
      <dd v-html="getBirthdayDisplay(person.birthdate)"></dd>
    </template>
  </dl>
</template>

<script>
import moment from 'moment';
import { date } from 'quasar';
import { isStudent } from '../lib/PersonHelper';
import RankDisplay from './RankDisplay';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'person-info',
  components: {
    RankDisplay,
  },
  props: ['person'],
  data() {
    return {
      strings,
    };
  },
  computed: {
    isStudent() {
      return this.person ? isStudent(this.person) : undefined;
    },
  },
  methods: {
    getAgeDisplay(dStr) {
      return dStr ? moment().diff(moment(dStr), 'years') : '&nbsp;';
    },
    getBirthdayDisplay(dStr) {
      let d;
      let display = '&nbsp;';

      if (date.isValid(dStr)) {
        d = new Date(dStr);
        display = date.formatDate(d.getTime(), 'MMMM D');
      }

      return display;
    },
    getExperienceDisplay(dStr) {
      return dStr ? moment(dStr).fromNow(true) : '&nbsp;';
    },
  },
};
</script>

<style scoped>
</style>
