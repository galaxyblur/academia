<template>
  <q-page>

    <div class="row justify-between q-my-md q-px-sm">
      <q-btn
        color="primary"
        :label="'Add ' + strings.Rank"
        icon="fas fa-plus"
        @click="handleAddCord"
        :disabled="!ranksDragOptions.disabled || loadingCounter > 0" />
      <q-btn
        v-if="ranksDragOptions.disabled"
        label="Reorder"
        icon-right="fas fa-bars"
        text-color="secondary"
        @click="handleReorder"
        :disabled="allRanks.length < 1 || loadingCounter > 0" />
      <q-btn
        v-else
        label="Save Order"
        icon-right="fas fa-cloud-upload-alt"
        text-color="positive"
        :loading="isSavingOrder"
        @click="handleSaveOrder"
        :disabled="allRanks.length < 1 || loadingCounter > 0">
      </q-btn>
    </div>

    <q-list v-if="allRanks.length > 0" link no-border>
      <draggable v-model="allRanks" :options="ranksDragOptions">
        <q-item
          v-for="(r, ri) in allRanks"
          :key="ri"
          :to="{ name: 'RanksItem', params: { id: r.id } }"
          class="rank-item"
          separator>
          <q-item-main>
            <q-item-tile label>
              {{ r.name }}
              <q-chip v-if="r.students.length > 0" dense>{{ r.students.length }}</q-chip>
            </q-item-tile>
            <q-item-tile sublabel><rank-display v-bind="r" /></q-item-tile>
          </q-item-main>
          <q-item-side
            v-if="ranksDragOptions.disabled"
            icon="fas fa-angle-right"
            right />
          <q-item-side v-else right icon="fas fa-bars" />
        </q-item>
      </draggable>
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
import draggable from 'vuedraggable';

import {
  allRankColors,
  allRanks,
  updateRank,
} from '../gql';
import RanksItemUpdate from '../components/RanksItemUpdate';
import RankColorsUpdate from '../components/RankColorsUpdate';
import RankDisplay from '../components/RankDisplay';
import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

const saveRank = function saveRank(variables) {
  const mutation = this.$apollo.mutate({
    mutation: updateRank,
    variables,
  });

  return mutation;
};

export default {
  name: 'ranks',
  components: {
    RanksItemUpdate,
    RankColorsUpdate,
    RankDisplay,
    draggable,
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
      ranksDragOptions: {
        group: 'ranks',
        dragClass: 'rank-item-drag',
        disabled: true,
      },
      isSavingOrder: false,
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
    handleReorder() {
      this.ranksDragOptions.disabled = false;
    },
    handleSaveOrder() {
      this.isSavingOrder = true;
      this.loadingCounter += 1;

      const mutations = [];

      // These are in the new order
      this.allRanks.forEach((r, i) => {
        if (r.index !== i) {
          mutations.push(saveRank.call(this, {
            id: r.id,
            name: r.name,
            index: i,
          }));
        }
      });

      Promise.all(mutations)
        .then(() => {
          this.isSavingOrder = false;
          this.allRanks = [];
          this.handleUpdateRank();
          this.loadingCounter -= 1;
          this.ranksDragOptions.disabled = true;
        });
    },
  },
};
</script>

<style scoped>
.rank-item-drag {
  background-color: white;
  border: 1px solid #000;
}
</style>
