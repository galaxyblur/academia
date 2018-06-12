<template>
  <div class="rank-display">
    <div class="float-left on-left">
      <div
        v-for="(c, ci) in colors"
        :key="ci"
        class="person-rank-color"
        :style="{ backgroundColor: c.color.value }"></div>
    </div>
    <div v-if="displayName" class="float-left"><small><i>{{ name }}</i></small></div>
    <div class="rank-display-clear"></div>
  </div>
</template>

<script>
export default {
  name: 'rank-display',
  props: [
    'name',
    'colors',
    'displayName',
  ],
};
</script>

<style scoped>
.rank-display .person-rank-color {
  content: " ";
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0;
  padding: 0 5px;
  border: 1px solid #555;
  border-radius: 3px;
}

.rank-display .rank-display-clear {
  clear: both;
}
</style>
