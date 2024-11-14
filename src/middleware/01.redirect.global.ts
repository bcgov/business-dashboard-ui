import { RouteNameE } from '@/enums/route-name-e'

export default defineNuxtRouteMiddleware((to) => {
  const expectedRoutes = [RouteNameE.DASHBOARD, RouteNameE.CRITICAL_ERRORS]
  if (!expectedRoutes.includes(to.name as RouteNameE)) {
    // TODO: remove dev/test redirects once other apps are redirecting to here properly
    // set specific identifier for development (allows going directly to localhost link)
    if (['local', 'pr', 'dev'].includes(useRuntimeConfig().public.appEnv)) {
      const identifier = 'BC0871427'
      return navigateTo({ name: RouteNameE.DASHBOARD, params: { identifier } })
    } else if (['test'].includes(useRuntimeConfig().public.appEnv)) {
      const identifier = 'BC1052139'
      return navigateTo({ name: RouteNameE.DASHBOARD, params: { identifier } })
    } else {
      useBcrosNavigate().goToBcrosDashboard()
    }
  }
})
