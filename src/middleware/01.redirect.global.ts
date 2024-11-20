import { RouteNameE } from '@/enums/route-name-e'

export default defineNuxtRouteMiddleware((to) => {
  const expectedRoutes = [RouteNameE.DASHBOARD, RouteNameE.CRITICAL_ERRORS]
  if (!expectedRoutes.includes(to.name as RouteNameE)) {
    useBcrosNavigate().goToBcrosDashboard()
  }
})
