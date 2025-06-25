// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    buildAssetsDir: '/src/',
    head: {
      title: 'Business Dashboard',
      htmlAttrs: { dir: 'ltr' },
      link: [{ rel: 'icon', type: 'image/ico', href: '/favicon.ico' }]
    }
  },
  colorMode: {
    preference: 'light'
  },
  srcDir: 'src/',
  css: [
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/styles/base.scss',
    '@/assets/styles/layout.scss'
  ],
  ui: {
    icons: ['mdi']
  },
  ssr: false,
  imports: {
    dirs: ['enums', 'interfaces', 'stores']
  },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    // Only load GTM and GTag modules if not in test environment
    ...(process.env.CYPRESS
      ? []
      : [
          '@zadigetvoltaire/nuxt-gtm',
          'nuxt-gtag'
        ])
  ],
  typescript: {
    tsConfig: {
      compilerOptions: {
        noImplicitAny: false,
        strictNullChecks: false,
        strict: true
      }
    },
    // NOTE: https://github.com/vuejs/language-tools/issues/3969
    typeCheck: false
  },
  i18n: {
    lazy: true,
    defaultLocale: 'en',
    langDir: './lang',
    locales: [
      { code: 'en', file: 'en.json' }
    ]
  },
  gtm: {
    enabled: !!process.env.VUE_APP_GTM_ID?.trim(),
    id: process.env.VUE_APP_GTM_ID?.trim() || 'GTM-DUMMY', // the dummy value allows app to run if GTM ID could not be loaded
    debug: true,
    defer: true
  },
  gtag: {
    enabled: !!process.env.VUE_APP_GTAG_ID?.trim(),
    id: process.env.VUE_APP_GTAG_ID?.trim()
  },
  runtimeConfig: {
    public: {
      // Keys within public, will be also exposed to the client-side
      addressCompleteKey: process.env.VUE_APP_ADDRESS_COMPLETE_KEY,
      authApiURL: `${process.env.VUE_APP_AUTH_API_URL || ''}${process.env.VUE_APP_AUTH_API_VERSION || ''}`,
      authWebURL: process.env.VUE_APP_AUTH_WEB_URL || '',
      businessesURL: process.env.VUE_APP_BUSINESSES_URL || '',
      createURL: process.env.VUE_APP_BUSINESS_CREATE_URL || '',
      editURL: `${process.env.VUE_APP_BUSINESS_EDIT_URL || ''}`,
      filingsURL: process.env.VUE_APP_BUSINESS_FILINGS_URL || '',
      documentsURL: process.env.VUE_APP_DOCUMENTS_UI_URL || '',
      kcURL: process.env.VUE_APP_KEYCLOAK_AUTH_URL || '',
      kcRealm: process.env.VUE_APP_KEYCLOAK_REALM || '',
      kcClient: process.env.VUE_APP_KEYCLOAK_CLIENTID || '',
      ldClientId: process.env.VUE_APP_LD_CLIENT_ID || '',
      legalApiURL: `${process.env.VUE_APP_LEGAL_API_URL || ''}${process.env.VUE_APP_LEGAL_API_VERSION_2 || ''}`,
      businessApiUrl: `${process.env.VUE_APP_BUSINESS_API_URL || ''}`,
      businessApiGwUrl: `${process.env.VUE_APP_BUSINESS_API_GW_URL || ''}` +
        `${process.env.VUE_APP_BUSINESS_API_VERSION_2 || ''}`,
      businessApiKey: process.env.VUE_APP_BUSINESS_API_KEY,
      payApiURL: `${process.env.VUE_APP_PAY_API_URL || ''}${process.env.VUE_APP_PAY_API_VERSION || ''}`,
      docApiURL: `${process.env.VUE_APP_DOC_API_URL || ''}${process.env.VUE_APP_DOC_API_VERSION || ''}`,
      docApiKey: process.env.VUE_APP_DOC_API_KEY || '',
      registryHomeURL: process.env.VUE_APP_REGISTRY_HOME_URL || '',
      appEnv: `${process.env.VUE_APP_POD_NAMESPACE || 'unknown'}`,
      requireLogin: true,
      version: process.env.npm_package_version || '',
      appName: process.env.npm_package_name || '',
      appNameDisplay: 'BCROS Business Dashboard',
      noticeOfWithdrawalFormURL: `${process.env.VUE_APP_NOTICE_OF_WITHDRAWAL_FORM_URL || ''}`
    }
  }
})
