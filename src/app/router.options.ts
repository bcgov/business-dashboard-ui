import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
  // https://router.vuejs.org/api/interfaces/routeroptions.html#routes
  // alternatively, could put this inside the setup for each page
  routes: _routes => [
    {
      name: RouteNameE.DASHBOARD,
      path: '/:identifier',
      component: () => import('~/pages/dashboard.vue').then(r => r.default || r),
      meta: {
        layout: 'business',
        title: 'Business Dashboard',
        breadcrumbs: [getBcrosHomeCrumb, getRegistryDashCrumb, getBusinessDashCrumb],
        staffBreadcrumbs: [getStaffDashCrumb, getBusinessDashCrumb]
      }
    },
    {
      name: RouteNameE.CRITICAL_ERRORS,
      path: '/errors/entity/:identifier',
      component: () => import('~/pages/errors.vue').then(r => r.default || r),
      meta: {
        layout: 'default',
        title: 'Business Dashboard',
        breadcrumbs: [getBcrosHomeCrumb, getRegistryDashCrumb, getBusinessDashCrumb],
        staffBreadcrumbs: [getStaffDashCrumb, getBusinessDashCrumb]
      }
    }
  ]
}
