export function getBcrosHomeCrumb (): BreadcrumbI {
  const t = useNuxtApp().$i18n.t
  return {
    text: ref(t('breadcrumbs.accountDashboard')),
    href: useRuntimeConfig().public.registryHomeURL + 'dashboard'
  }
}

export function getRegistryDashCrumb (): BreadcrumbI {
  const t = useNuxtApp().$i18n.t
  const account = useBcrosAccount()
  return {
    text: ref(t('breadcrumbs.registryDashboard')),
    href: `${useRuntimeConfig().public.authWebURL}account/${account.currentAccount.id}/business`
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
