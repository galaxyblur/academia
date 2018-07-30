/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding initialization code.
 * Use "quasar new plugin <name>" and add it there.
 * One plugin per concern. Then reference the file(s) in quasar.conf.js > plugins:
 * plugins: ['file', ...] // do not add ".js" extension to it.
 **/



import 'quasar-extras/fontawesome/fontawesome.css'




import 'quasar-app-styl'


import 'src/css/app.styl'


import Vue from 'vue'
import createApp from './app.js'




import pI18n from 'src/plugins/i18n'

import pAxios from 'src/plugins/axios'

import pApollo from 'src/plugins/apollo'

import pVcalendar from 'src/plugins/v-calendar'

import pVuelidate from 'src/plugins/vuelidate'

import pVuescrollto from 'src/plugins/vue-scrollto'











Vue.config.devtools = true
Vue.config.performance = true
Vue.config.productionTip = false



console.info('[Quasar] Running SPA with IOS theme.')



const { app, store, router } = createApp()




;[pI18n,pAxios,pApollo,pVcalendar,pVuelidate,pVuescrollto].forEach(plugin => {
  plugin({
    app,
    router,
    store,
    Vue,
    ssrContext: null
  })
})









new Vue(app)






