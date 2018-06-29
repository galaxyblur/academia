import VCalendar from 'v-calendar';
import 'v-calendar/lib/v-calendar.min.css';

export default ({ Vue }) => {
  // Use v-calendar, v-date-picker & v-popover components
  Vue.use(VCalendar, {
    formats: {
      title: 'MMMM YYYY',
      weekdays: 'W',
      navMonths: 'MMM',
      input: ['YYYY/MM/DD'],
      dayPopover: 'YYYY/MM/DD',
      data: ['YYYY/MM/DD'],
    },
  });
};
