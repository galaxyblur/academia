<template>
  <q-tabs align="justify">
    <q-route-tab
      label="Today"
      icon="fas fa-sun"
      to="/"
      exact
      slot="title"
    />
    <q-route-tab
      label="Students"
      icon="fa fa-users"
      to="/persons"
      slot="title"
    />
    <q-route-tab
      label="Schedule"
      icon="fas fa-calendar-alt"
      to="/schedule"
      slot="title"
    />
    <q-route-tab
      label="More"
      icon="fa fa-ellipsis-h"
      to="/more"
      exact
      slot="title"
    />
  </q-tabs>
</template>

<script>
export default {
  name: 'app-nav',
};
</script>

<style>
</style>
