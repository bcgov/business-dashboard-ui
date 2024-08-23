export function getBcrosHomeCrumb (): BreadcrumbI {
  const t = useNuxtApp().$i18n.t
  return {
    text: ref(t('breadcrumb.accountDashboard')),
    href: useRuntimeConfig().public.registryHomeURL + 'dashboard'
  }
}

export function getRegistryDashCrumb (): BreadcrumbI {
  const t = useNuxtApp().$i18n.t
  const account = useBcrosAccount()
  return {
    text: ref(t('breadcrumb.registryDashboard')),
    href: `${useRuntimeConfig().public.authWebURL}account/${account.currentAccount.id}/business`
  }
}

export function getStaffDashCrumb (): BreadcrumbI {
  const t = useNuxtApp().$i18n.t
  return {
    text: ref(t('breadcrumb.staffDashboard')),
    href: `${useRuntimeConfig().public.authWebURL}staff/dashboard/active`
  }
}

export function getBusinessDashCrumb (): BreadcrumbI {
  const business = useBcrosBusiness()
  const route = useRoute()
  return {
    text: ref(business.currentBusinessName || route?.params?.identifier as string || 'Unknown'),
    href: `${useRuntimeConfig().public.businessWebURL}${route?.params?.identifier || ''}`
  }
}

// export function getBreadcrumbList () {
//   const { isStaffAccount } = useBcrosAccount()
//   // const isStaffAccount = true
//   if (isStaffAccount) {
//     return [getStaffDashCrumb, getStaffDashCrumb]
//   }
//   return [getBcrosHomeCrumb, getRegistryDashCrumb, getBusinessDashCrumb]
// }
