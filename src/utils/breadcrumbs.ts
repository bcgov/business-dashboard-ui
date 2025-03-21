export function getBcrosHomeCrumb (): BreadcrumbI {
  const t = useNuxtApp().$i18n.t
  const account = useBcrosAccount()
  return {
    text: ref(t('breadcrumb.accountDashboard')),
    href: useRuntimeConfig().public.registryHomeURL + `dashboard/?accountid=${account.currentAccount.id}`
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
  const bootstrap = useBcrosBusinessBootstrap()
  const name = business.currentBusinessName ?? bootstrap.bootstrapName
  const route = useRoute()
  const t = useNuxtApp().$i18n.t
  return {
    text: ref(name || route?.params?.identifier as string || t('text.general.unknown')),
    href: `${useRuntimeConfig().public.businessWebURL}${route?.params?.identifier || ''}`
  }
}
