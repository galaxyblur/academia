// Configuration for your app
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (ctx) {
  const urlDefault = 'http://localhost:8080';
  const urlEnv = process.env.URL ? process.env.URL : urlDefault;
  const artDefault = 'capoeira';
  const artEnv = process.env.APP_ART_FORM ? process.env.APP_ART_FORM : artDefault;

  return {
    // app plugins (/src/plugins)
    plugins: [
      'i18n',
      'axios',
      'apollo',
      'vuelidate',
      'vue-scrollto',
    ],
    css: [
      'app.styl',
    ],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      // 'material-icons', // optional, you are not bound to it
      // 'ionicons',
      // 'mdi',
      'fontawesome',
    ],
    supportIE: false,
    build: {
      env: {
        AUTH_CALLBACK_URL: JSON.stringify(`${urlEnv}/auth-callback`),
        ART_FORM: JSON.stringify(artEnv),
      },
      scopeHoisting: true,
      vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack(cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/,
        });

        cfg.plugins.push(new webpack.DefinePlugin({ 'global.GENTLY': false }));

        if (!ctx.dev) {
          // copy _redirects file
          cfg.plugins.push(new CopyWebpackPlugin([
            {
              from: 'src/_redirects',
              to: cfg.output.path,
            },
          ]));
        }
      },
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: true, // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QListHeader',
        'QItem',
        'QItemMain',
        'QItemSide',
        'QItemSeparator',
        'QLayoutFooter',
        'QBtnGroup',
        'QTabs',
        'QRouteTab',
        'QCard',
        'QCardMain',
        'QCardTitle',
        'QModal',
        'QModalLayout',
        'QField',
        'QInput',
        'QOptionGroup',
        'QDatetime',
        'QItemTile',
        'QCheckbox',
        'QSelect',
        'QPopover',
        'QChip',
        'QPageSticky',
        'QToggle',
        'QCollapsible',
        'QAlert',
      ],
      directives: [
        'Ripple',
      ],
      // Quasar plugins
      plugins: [
        'Dialog',
        'Loading',
        'Notify',
      ],
      iconSet: 'fontawesome',
      // i18n: 'de' // Quasar language
    },
    // animations: 'all' --- includes all animations
    animations: [
    ],
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack() { // (cfg)
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'quasar-app'
      },
    },
  };
};
