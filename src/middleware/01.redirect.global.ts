import { RouteNameE } from '@/enums/route-name-e'

export default defineNuxtRouteMiddleware((to) => {
  const expectedRoutes = [RouteNameE.DASHBOARD]
  if (!expectedRoutes.includes(to.name as RouteNameE)) {
    // set specific identifier for development (allows going directly to localhost link)
    if (['local'].includes(useRuntimeConfig().public.appEnv)) {
      const identifier = 'BC0871427'
      return navigateTo({ name: RouteNameE.DASHBOARD, params: { identifier } })
    } else {
      useBcrosNavigate().goToBcrosDashboard()
    }
  }
})
