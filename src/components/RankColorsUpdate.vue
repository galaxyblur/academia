<template>
  <q-modal
    v-model="isOpen"
    ref="rankColorsUpdateModal"
    :content-css="{minWidth: '80vw', minHeight: '80vh'}">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>Manage Your Group's {{ strings.Rank }} Colors</q-toolbar-title>
      </q-toolbar>
      <div id="rank-colors-update-modal-footer" class="layout-padding bg-light" slot="footer">
        <q-btn color="faded" @click="hide">Cancel</q-btn>
        <q-btn color="primary" @click="save" loader>Save</q-btn>
      </div>
      <div class="layout-padding">
        <q-list link>
          <q-item v-for="(c, ci) in colors" :key="ci" tag="label">
            <q-item-side>
              <q-checkbox v-model="rankColors" :val="c.name" @change="handleColorStatusChange">
              </q-checkbox>
            </q-item-side>
            <q-item-main>
              <q-item-tile label>
                <q-chip
                  small
                  class="shadow-1"
                  :color="c.qcolor"
                  :text-color="c.qcolortext || 'white'">
                  {{ c.name }}
                </q-chip>
              </q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import colors from '../json/colors';
import strings from '../json/strings';

import {
  allRankColors,
  createRankColor,
  deleteRankColor,
} from '../gql';

const saveRemovedRankColors = function saveRemovedRankColors(removedColors) {
  const promises = [];

  removedColors.forEach((color) => {
    const mutation = this.$apollo.mutate({
      mutation: deleteRankColor,
      variables: color,
    });

    promises.push(new Promise((res, rej) => {
      mutation.then((resp) => {
        const removedColor = Object.assign({ id: resp.data.deleteRankColor.id }, color);
        res(removedColor);
      }).catch(err => rej(err));
    }));
  });

  return Promise.all(promises);
};

const saveNewRankColors = function saveNewRankColors(newColors) {
  const promises = [];

  newColors.forEach((color) => {
    color.groupId = this.$store.getters['user/groupId'];

    const mutation = this.$apollo.mutate({
      mutation: createRankColor,
      variables: color,
    });

    promises.push(new Promise((res, rej) => {
      mutation.then((resp) => {
        const addedColor = Object.assign({ id: resp.data.createRankColor.id }, color);
        res(addedColor);
      }).catch(err => rej(err));
    }));
  });

  return Promise.all(promises);
};

export default {
  name: 'rank-colors-update',
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
      result({ data }) {
        if (data.allRankColors && data.allRankColors.length > 0) {
          data.allRankColors.forEach(c => this.rankColors.push(c.name));
        }
      },
    },
  },
  data() {
    return {
      isOpen: false,
      colors,
      allRankColors: [],
      rankColors: [],
      strings,
    };
  },
  methods: {
    show() {
      this.isOpen = true;
    },
    hide() {
      this.isOpen = false;
    },
    handleColorStatusChange(checkedColors) {
      this.allRankColors.forEach((c) => {
        if (checkedColors.indexOf(c.name) < 0 && c.instances && c.instances.length > 0) {
          this.rankColors.push(c.name);
          this.$q.dialog({
            title: 'Color in use',
            message: `Sorry, you cannot remove the color "${c.name}" because
              it is being used by ${c.instances.length} ${strings.ranks}`,
          });
        }
      });
    },
    save(event, done) {
      // Required to validate all fields
      this.$v.rankColors.$touch();

      if (this.$v.rankColors.$error) {
        done();
        return;
      }

      const variablesNewColors = [];
      const variablesRemovedColors = [];

      colors.forEach((c) => {
        const existingColor = this.allRankColors.filter(rc => rc.value === c.hex);
        const indexInActiveColors = this.rankColors.indexOf(c.name);

        if (indexInActiveColors >= 0 && existingColor.length < 1) {
          // Color was added
          variablesNewColors.push({
            name: c.name,
            value: c.hex,
          });
        } else if (indexInActiveColors < 0 && existingColor.length > 0) {
          // Color was removed
          if (!existingColor[0].instances || existingColor[0].instances.length < 1) {
            variablesRemovedColors.push({
              id: existingColor[0].id,
            });
          }
        }
      });

      const mutations = [];

      if (variablesNewColors.length > 0) {
        mutations.push(saveNewRankColors.call(this, variablesNewColors));
      }

      if (variablesRemovedColors.length > 0) {
        mutations.push(saveRemovedRankColors.call(this, variablesRemovedColors));
      }

      if (mutations.length > 0) {
        const mutation = Promise.all(mutations);

        mutation.then(() => {
          done();
          this.$emit('colors-update');
          this.hide();
          this.$q.notify(`${strings.Rank} colors saved!`);
        });

        mutation.catch((error) => {
          done();
          this.$q.notify(error.message);
        });
      }
    },
  },
  validations: {
    rankColors: { required },
  },
};
</script>

<style scoped>
.rank-colors-update-sample {
  display: inline-block;
  width: 21px;
  height: 21px;
  border: 1px solid black;
  border-radius: 3px;
}

#rank-colors-update-modal-footer {
  text-align: right;
}
</style>
