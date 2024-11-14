import { RouteNameE } from '~/enums/route-name-e'

export default defineNuxtRouteMiddleware(async (to) => {
  const identifier = to.params.identifier as string

  // check account authorizations
  console.log('~~~~~~ baaaaaaaa')
  const isAllowed = await useBcrosAccount().verifyAccountAuthorizations(identifier)
  console.log('~~~~~~ 123 isAllowed', isAllowed)
  if (!isAllowed && RouteNameE.CRITICAL_ERRORS !== to.name) {
    return navigateTo({ name: RouteNameE.CRITICAL_ERRORS, params: { identifier } })
  }
})
