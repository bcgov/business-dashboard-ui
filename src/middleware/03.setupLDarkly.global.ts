export default defineNuxtRouteMiddleware(() => {
  // initialize ldarkly
  // must come after account setup (ie, auth)
  useBcrosLaunchdarkly().init()
})
