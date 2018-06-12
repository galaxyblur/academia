<template>
  <div>
    <dl v-for="(g, ig) in guardians" :key="ig" class="horizontal">
      <dt>Name</dt>
      <dd>{{ g.firstName }} {{ g.lastName }}</dd>
      <dt>Phone</dt>
      <dd>
        <span v-if="g.phoneNumber">{{ g.phoneNumber }}</span>
        <span v-else>&nbsp;</span>
      </dd>
      <dt>Email</dt>
      <dd>
        <a v-if="g.emailAddress" :href="'mailto:' + g.emailAddress">{{ g.emailAddress }}</a>
        <span v-else>&nbsp;</span>
      </dd>
    </dl>
  </div>
</template>

<script>
export default {
  name: 'person-info-guardians',
  props: ['guardians'],
};
</script>
