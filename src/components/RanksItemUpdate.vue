<template>
  <q-modal
    v-model="isOpen"
    ref="ranksItemUpdateModal"
    :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>{{ title }}</q-toolbar-title>
      </q-toolbar>
      <div id="ranks-item-update-modal-footer" class="layout-padding bg-light" slot="footer">
        <q-btn
          v-if="rank"
          color="negative"
          @click="removeRank"
          :loading="isRemoveRankLoading"
          class="float-left">
          Remove
        </q-btn>
        <q-btn-group>
          <q-btn color="faded" @click="hide">Cancel</q-btn>
          <q-btn color="primary" @click="save" :loading="isSaveLoading">Save</q-btn>
        </q-btn-group>
      </div>
      <div class="layout-padding">
        <q-field error-label="invalid name" :error="$v.rankMod.name.$error" class="q-py-sm">
          <q-input float-label="Name" v-model="rankMod.name" />
        </q-field>
        <template v-if="rankColorInstances.length > 0">
          <q-field v-for="(c, ci) in rankColorInstances" :key="ci" class="q-py-sm">
            <q-select
              :stack-label="'Color ' + (ci + 1)"
              :options="rankColorOptions"
              :color="c.qcolor"
              :inverted="!c.qcolortextInvert"
              :inverted-light="c.qcolortextInvert"
              :after="getRemoveColorIconSettings(c, ci)"
              v-model="c.colorVal"
            />
          </q-field>
        </template>
        <q-field
          class="q-py-sm"
          error-label="please add at least one color"
          :error="$v.rankColorInstances.$error">
          <q-select
            stack-label="Add color"
            value=""
            :options="rankColorOptions"
            @change="handleAddedColor"
          />
        </q-field>
        <div class="text-center q-py-md">
          <q-btn color="tertiary" @click="$refs.rankColorsUpdate.show()" flat>
            <q-icon name="fas fa-paint-brush" />&nbsp;Manage {{ strings.Rank }} Colors
          </q-btn>
        </div>
        <rank-colors-update ref="rankColorsUpdate" @colors-update="handleColorsUpdate" />
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import colors from '../json/colors';
import RankColorsUpdate from './RankColorsUpdate';

import {
  allRankColors,
  updateRank,
  createRank,
  deleteRank,
  createRankColorInstance,
  deleteRankColorInstance,
  addToRankColorInstanceInRank,
  updateRankColorInstance,
} from '../gql';

import { getStrings } from '../lib/StringsHelper';

const strings = getStrings();

const rmvRankColorInstances = function rmvRankColorInstances(instances) {
  const promises = [];

  instances.forEach((c) => {
    const mutation = this.$apollo.mutate({
      mutation: deleteRankColorInstance,
      variables: {
        id: c.id,
      },
    });

    promises.push(mutation);
  });

  return Promise.all(promises);
};

const saveRankColorInstances = function saveRankColorInstances(rColors) {
  const promises = [];

  rColors.forEach((c) => {
    const mutation = this.$apollo.mutate({
      mutation: createRankColorInstance,
      variables: {
        colorId: c.color.id,
      },
    });

    promises.push(mutation);
  });

  return Promise.all(promises);
};

const saveColorInstancesInRank = function saveColorInstancesInRank(instances, rank) {
  const promises = [];

  instances.forEach((c) => {
    const mutation = this.$apollo.mutate({
      mutation: addToRankColorInstanceInRank,
      variables: {
        rankId: rank.id,
        rankColorInstanceId: c.id,
      },
    });

    promises.push(mutation);
  });

  return Promise.all(promises);
};

const getRankColorByValue = function getRankColorByValue(rColors, val) {
  const match = rColors.filter(c => c.value === val);
  let color;

  if (match.length > 0) {
    [color] = match;
  }

  return color;
};

const saveChangedColorInstances = function saveChangedColorInstances(instances) {
  const promises = [];

  instances.forEach((c) => {
    const color = getRankColorByValue(this.allRankColors, c.colorVal);

    if (color) {
      const mutation = this.$apollo.mutate({
        mutation: updateRankColorInstance,
        variables: {
          id: c.id,
          colorId: color.id,
        },
      });

      promises.push(mutation);
    }
  });

  return Promise.all(promises);
};

const removeRank = function removeRank(rank) {
  return new Promise((res, rej) => {
    const mutation = this.$apollo.mutate({
      mutation: deleteRank,
      variables: {
        id: rank.id,
      },
    });

    mutation.catch(err => rej(err));

    mutation.then((result) => {
      if (result && result.data.deleteRank) {
        rmvRankColorInstances.call(this, rank.colors)
          .catch(err => rej(err))
          .then(() => res(result));
      }
    });
  });
};

const saveRank = function saveRank(variables) {
  const mutation = this.$apollo.mutate({
    mutation: updateRank,
    variables,
  });

  return mutation;
};

const saveNewRank = function saveNewRank(variables) {
  variables.groupId = this.$store.getters['user/groupId'];

  const mutation = this.$apollo.mutate({
    mutation: createRank,
    variables,
  });

  return mutation;
};

const rankDefaults = {
  id: undefined,
  name: undefined,
  colors: [],
};

const rankColorDefaults = {
  id: undefined,
  name: '',
  value: '',
};

const rankColorInstanceDefaults = {
  id: undefined,
  weight: 0,
  color: Object.assign({}, rankColorDefaults),
};

export default {
  name: 'ranks-item-update',
  components: {
    RankColorsUpdate,
  },
  apollo: {
    allRankColors: {
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
  },
  props: ['title', 'rank'],
  computed: {
    rankColorOptions() {
      const opts = [];

      if (this.allRankColors && this.allRankColors.length > 0) {
        this.allRankColors.forEach((c) => {
          const [colorObj] = colors.filter(cc => cc.hex === c.value);

          opts.push({
            label: c.name,
            value: c.value,
            leftColor: colorObj.qcolor,
            icon: 'fas fa-circle',
          });
        });
      }

      return opts;
    },
  },
  data() {
    return {
      isOpen: false,
      allRankColors: [],
      rankColorInstances: [],
      rankColorInstancesRmvd: [],
      rankMod: Object.assign({}, rankDefaults, this.rank),
      strings,
      isRemoveRankLoading: false,
      isSaveLoading: false,
    };
  },
  mounted() {
    if (this.rank && this.rank.colors) {
      this.rank.colors.forEach((inst) => {
        const instance = {
          id: inst.id,
          color: undefined,
          colorVal: undefined,
        };

        if (inst.color) {
          instance.color = inst.color;
          instance.colorVal = inst.color.value;
        }

        const [cRef] = colors.filter(c => c.hex === inst.color.value);

        if (cRef) {
          instance.qcolor = cRef.qcolor;
          instance.qcolortextInvert = cRef.qcolortext === 'black';
        }

        this.rankColorInstances.push(instance);
      });
    }
  },
  methods: {
    clear() {
      this.rankColorInstances = [];
      this.rankMod = {};
      this.rankColorInstancesRmvd = [];
      this.rank = undefined;
    },
    show() {
      this.isOpen = true;
    },
    hide() {
      this.isOpen = false;
    },
    getRemoveColorIconSettings(color, index) {
      return [
        {
          icon: 'fas fa-times',
          handler: (evt) => {
            evt.stopPropagation();
            this.$q.dialog({
              title: `Remove "${color.color.name.toLowerCase()}" from "Color ${index + 1}"?`,
              cancel: true,
              ok: 'Remove',
            }).then(() => {
              const rmvd = this.rankColorInstances.splice(index, 1);
              this.rankColorInstancesRmvd = this.rankColorInstancesRmvd.concat(rmvd);
            }, () => {});
          },
        },
      ];
    },
    handleAddedColor(newColorVal) {
      const [newColorMatch] = this.allRankColors.filter(c => c.value === newColorVal);

      if (newColorMatch) {
        const [cRef] = colors.filter(c => c.hex === newColorMatch.value);
        const newColor = Object.assign(
          {},
          rankColorInstanceDefaults,
          {
            color: Object.assign({}, newColorMatch),
            colorVal: newColorMatch.value,
            qcolor: cRef.qcolor,
            qcolortextInvert: cRef.qcolortext === 'black',
          },
        );

        this.rankColorInstances.push(newColor);
      }
    },
    removeRank() {
      this.isRemoveRankLoading = true;
      this.$q.dialog({
        title: `Are you sure you want to remove this ${strings.rank}?`,
        cancel: true,
        ok: 'Remove',
      }).then(() => {
        removeRank.call(this, this.rank)
          .catch((err) => {
            this.isRemoveRankLoading = false;
            this.$q.notify(err.message);
          })
          .then(() => {
            this.isRemoveRankLoading = false;
            this.$emit('rank-deleted');
            this.hide();
            this.$q.notify(`${strings.Rank} removed!`);
          });
      }, () => {});
    },
    save() {
      this.isSaveLoading = true;
      // Required to validate all fields
      this.$v.rankMod.$touch();
      this.$v.rankColorInstances.$touch();

      if (this.$v.rankMod.$error || this.$v.rankColorInstances.$error) {
        this.isSaveLoading = false;
        return;
      }

      let removedColorInstancesProm = Promise.resolve([]);

      // Removed color instances
      if (this.rankColorInstancesRmvd.length > 0) {
        removedColorInstancesProm = rmvRankColorInstances.call(this, this.rankColorInstancesRmvd);
      }

      const colorsWithoutInstanceId = this.rankColorInstances.filter(c => !c.id);
      let newColorInstancesProm = Promise.resolve([]);

      // New color instances to save
      if (colorsWithoutInstanceId.length > 0) {
        newColorInstancesProm = saveRankColorInstances.call(this, colorsWithoutInstanceId);
      }

      // Changed color instances
      const colorsChanged = this.rankColorInstances.filter(c => c.color.value !== c.colorVal);
      let changedColorInstancesProm = Promise.resolve([]);

      if (colorsChanged.length > 0) {
        changedColorInstancesProm = saveChangedColorInstances.call(this, colorsChanged);
      }

      const instanceEditsProm = Promise.all([
        removedColorInstancesProm,
        newColorInstancesProm,
        changedColorInstancesProm,
      ]);

      instanceEditsProm.catch((err) => {
        this.isSaveLoading = false;
        this.$q.notify(err.message);
      });

      instanceEditsProm.then((instanceEditsResults) => {
        const newColorInstances = instanceEditsResults[1];
        const variables = Object.assign({}, this.rankMod);
        let mutation;

        if (this.rankMod.id) {
          mutation = saveRank.call(this, variables);
        } else {
          mutation = saveNewRank.call(this, variables);
        }

        mutation.then((rankResult) => {
          let mutationColorInstanceLinks = Promise.resolve([]);

          if (newColorInstances.length > 0) {
            const instancesToSave = [];
            const rank = rankResult.data.createRank || rankResult.data.updateRank;

            newColorInstances.forEach((i) => {
              if (i.data && i.data.createRankColorInstance && i.data.createRankColorInstance.id) {
                instancesToSave.push(i.data.createRankColorInstance);
              }
            });

            mutationColorInstanceLinks = saveColorInstancesInRank.call(this, instancesToSave, rank);
          }

          mutationColorInstanceLinks.catch((err) => {
            this.isSaveLoading = false;
            this.$q.notify(err.message);
          });

          mutationColorInstanceLinks.then(() => {
            this.isSaveLoading = false;
            this.$emit('rank-updated');
            this.hide();
            this.$q.notify(`${strings.Rank} saved!`);
          });
        });

        mutation.catch((error) => {
          this.isSaveLoading = false;
          this.$q.notify(error.message);
        });
      });
    },
    handleColorsUpdate() {
      this.$apollo.queries.allRankColors.refetch();
    },
  },
  validations: {
    rankColorInstances: { required },
    rankMod: {
      name: { required },
    },
  },
};
</script>

<style scoped>
#ranks-item-update-modal-footer {
  text-align: right;
}
</style>
