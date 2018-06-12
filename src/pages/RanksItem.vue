<template>
  <q-page padding>
    <div v-if="Rank">
      <q-card>
        <q-card-title>
          {{ Rank.name }}
          <q-icon slot="right" name="fas fa-ellipsis-v">
            <q-popover ref="popover">
              <q-list link class="no-border">
                <q-item @click.native="$refs.popover.hide(); $refs.ranksItemUpdate.show();">
                  <q-item-main :label="'Edit ' + strings.Rank" />
                </q-item>
              </q-list>
            </q-popover>
          </q-icon>
        </q-card-title>
        <q-card-main>
          <dl class="horizontal">
            <dt>Colors</dt>
            <dd><rank-display v-bind="Rank" /></dd>
          </dl>
        </q-card-main>
      </q-card>
      <q-card flat>
        <q-card-main>
          <template v-if="Rank.students.length > 0">
            <persons-list :list-header-text="rankPersonsListHeaderText" :persons="Rank.students" />
          </template>
          <p v-else>No {{ strings.persons }} have this {{ strings.rank }}.</p>
        </q-card-main>
      </q-card>
    </div>
    <ranks-item-update
      v-if="Rank"
      ref="ranksItemUpdate"
      :title="'Edit ' + strings.Rank"
      :rank="Rank"
      @rank-deleted="handleRankDeleted"
      @rank-updated="handleRankUpdated" />
  </q-page>
</template>

<script>
import { RankById } from '../gql';
import strings from '../json/strings';
import PersonsList from '../components/PersonsList';
import RanksItemUpdate from '../components/RanksItemUpdate';
import RankDisplay from '../components/RankDisplay';

export default {
  name: 'ranks-item',
  components: {
    PersonsList,
    RanksItemUpdate,
    RankDisplay,
  },
  apollo: {
    Rank: {
      query: RankById,
      variables() {
        return {
          id: window.unescape(this.$route.params.id),
        };
      },
    },
  },
  data() {
    return {
      Rank: undefined,
      strings,
    };
  },
  computed: {
    rankPersonsListHeaderText() {
      return `${this.Rank.students.length} ${strings.persons} with this ${strings.rank}`;
    },
  },
  methods: {
    handleRankDeleted() {
      setTimeout(() => {
        this.$router.push({ name: 'Ranks', query: { refresh: 1 } });
      }, 1000);
    },
    handleRankUpdated() {
      this.$apollo.queries.Rank.refetch();
    },
  },
  created() {
    this.$store.commit('app/setTitle', strings.Ranks);
  },
};
</script>

<style>
</style>
