import { RouteNameE } from '~/enums/route-name-e'

export default defineNuxtRouteMiddleware(async (to) => {
  const identifier = to.params.identifier as string
  const bootstrapBusiness = useBcrosBusinessBootstrap()
  const isTempReg = await bootstrapBusiness.checkIsTempReg(identifier)

  if (!isTempReg) {
    return
  }

  await bootstrapBusiness.loadBusinessBootstrap(identifier, true)

  // check if the name request is valid
  if (bootstrapBusiness.nameRequestInvalid && RouteNameE.CRITICAL_ERRORS !== to.name) {
    return navigateTo({
      name: RouteNameE.CRITICAL_ERRORS,
      params: { identifier },
      query: { invalidNr: 'true', invalidNrType: bootstrapBusiness.nameRequestInvalidType as string }
    })
  }
})
