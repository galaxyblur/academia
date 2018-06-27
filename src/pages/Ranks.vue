<template>
  <q-page>

    <div class="text-center q-my-md">
      <q-btn color="primary" @click="handleAddCord" :disabled="loadingCounter > 0">
        <q-icon name="fas fa-plus" />&nbsp;Add {{ strings.Rank }}
      </q-btn>
    </div>

    <q-list v-if="allRanks.length > 0" link separator no-border>
      <q-item
        v-for="(r, ri) in allRanks"
        :key="ri"
        :to="{ name: 'RanksItem', params: { id: r.id } }"
        tag="label"
        multiline>
        <q-item-main>
          <q-item-tile label>
            {{ r.name }}
            <q-chip v-if="r.students.length > 0">{{ r.students.length }}</q-chip>
          </q-item-tile>
          <q-item-tile sublabel><rank-display v-bind="r" /></q-item-tile>
        </q-item-main>
        <q-item-side right icon="fas fa-angle-right" />
      </q-item>
    </q-list>

    <div v-else-if="loadingCounter < 1" class="text-center q-my-md">
      No {{ strings.ranks }} found.
    </div>

    <ranks-item-update
      ref="ranksItemUpdate"
      :title="'Add ' + strings.Rank"
      @rank-deleted="handleUpdateRank"
      @rank-updated="handleUpdateRank" />

    <rank-colors-update ref="rankColorsUpdate" @colors-update="handleUpdateRankColors" />

  </q-page>
</template>

<script>
import {
  allRankColors,
  allRanks,
} from '../gql';
import RanksItemUpdate from '../components/RanksItemUpdate';
import RankColorsUpdate from '../components/RankColorsUpdate';
import RankDisplay from '../components/RankDisplay';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

export default {
  name: 'ranks',
  components: {
    RanksItemUpdate,
    RankColorsUpdate,
    RankDisplay,
  },
  created() {
    this.$store.commit('app/setTitle', strings.Ranks);
  },
  mounted() {
    if (this.$route.query.refresh && this.allRanks.length > 0) {
      this.handleUpdateRank();
    }
  },
  apollo: {
    allRankColors: {
      loadingKey: 'loadingCounter',
      query: allRankColors,
      skip() {
        return !this.$store.state.user.User;
      },
      variables() {
        return {
          userId: this.$store.state.user.User.id,
        };
      },
    },
    allRanks: {
      loadingKey: 'loadingCounter',
      query: allRanks,
      skip() {
        return !this.$store.state.user.User;
      },
      variables() {
        return {
          userId: this.$store.state.user.User.id,
        };
      },
    },
  },
  data() {
    return {
      allRankColors: [],
      allRanks: [],
      loadingCounter: 0,
      strings,
    };
  },
  watch: {
    loadingCounter(val) {
      if (val > 0) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    },
  },
  methods: {
    handleAddCord() {
      if (this.allRankColors.length < 1) {
        const d = this.$q.dialog({
          title: 'No Colors',
          message: `Before you can add a ${strings.rank}, you must first add some ${strings.rank} colors for your group.`,
          ok: 'Continue',
          cancel: true,
        });

        d.then(() => {
          this.$refs.ranksItemUpdate.clear();
          this.$refs.rankColorsUpdate.show();
        }, () => {});
      } else {
        this.$refs.ranksItemUpdate.clear();
        this.$refs.ranksItemUpdate.show();
      }
    },
    handleUpdateRank() {
      this.$apollo.queries.allRanks.refetch();
    },
    handleUpdateRankColors() {
      this.$apollo.queries.allRankColors.refetch();
    },
  },
};
</script>

<style>
</style>
