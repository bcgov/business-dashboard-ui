import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
  routes: _routes => [
    {
      name: RouteNameE.DASHBOARD,
      path: '/:identifier?',
      component: () => import('~/pages/dashboard.vue').then(r => r.default || r),
      meta: {
        layout: 'business',
        title: 'Business Dashboard',
        breadcrumbs: [getBcrosHomeCrumb, getRegistryDashCrumb, getBusinessDashCrumb],
        staffBreadcrumbs: [getStaffDashCrumb, getBusinessDashCrumb]
      }
      // beforeEnter(to, _from, next) {
      //   // If identifier is missing
      //   if (!to.params.identifier) {
      //     next({ name: RouteNameE.DASHBOARD, params: { identifier: 'default_identifier' } })
      //   } else {
      //     next()
      //   }
      // }
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
