export const useBcrosNavigate = () => {
  const config = useRuntimeConfig()
  const account = useBcrosAccount()
  const business = useBcrosBusiness()

  /** Redirect to the given URL with necessary BCROS args */
  function redirect (url: string, params?: { [key: string]: string }, target = '_self') {
    // get account id and set in params
    const redirectURL = new URL(url)
    const accountId = account.currentAccount.id
    const businessId = business.currentBusiness?.identifier
    if (accountId) {
      redirectURL.searchParams.append('accountid', accountId.toString())
    }
    if (businessId) {
      redirectURL.searchParams.append('businessid', businessId.toString())
    }
    for (const [key, value] of Object.entries(params ?? {})) {
      redirectURL.searchParams.append(key, value)
    }
    // assume URL is always reachable
    window.open(redirectURL, target)
  }

  //
  // common redirects
  //
  function goToAccountInfo () {
    redirect(config.public.authWebURL + `account/${account.currentAccount.id}/settings/account-info`)
  }
  function goToBcrosDashboard () {
    redirect(config.public.registryHomeURL + 'dashboard')
  }
  function goToBcrosHome () {
    redirect(config.public.registryHomeURL)
  }
  function goToBcrosLogin (idpHint: string) {
    /** Redirect to bcros login page given the login type. */
    window.location.assign(`${config.public.registryHomeURL}signin/${idpHint}`)
  }
  function goToBusinessProfilePage () {
    redirect(config.public.authWebURL + '/businessprofile')
  }
  function goToCreateAccount () {
    redirect(config.public.authWebURL + 'choose-authentication-method')
  }
  function goToCreateUI (path: string, params?: { [key: string]: string }) {
    redirect(config.public.createURL + path, params)
  }
  function goToDigitalCredentialsPage () {
    redirect(config.public.filingsURL + `/${business.currentBusiness.identifier}/digital-credentials/`)
  }
  function goToEditProfile () {
    redirect(config.public.authWebURL + 'userprofile')
  }
  function goToEditUI (path: string, params?: { [key: string]: string }) {
    redirect(config.public.editURL + path, params)
  }
  function goToFilingsUI (path: string, params?: { [key: string]: string }) {
    redirect(config.public.filingsURL + path, params)
  }
  function goToSetupAccount () {
    redirect(config.public.authWebURL + 'setup-account')
  }
  function goToTeamMembers () {
    redirect(config.public.authWebURL + `account/${account.currentAccount.id}/settings/team-members`)
  }
  function goToTransactions () {
    redirect(config.public.authWebURL + `account/${account.currentAccount.id}/settings/transactions`)
  }
  function goToOfficerEdit () {
    redirect(config.public.officerEditURL + `/officer-change/${business.currentBusiness.identifier}`)
  }

  return {
    goToAccountInfo,
    goToBcrosDashboard,
    goToBcrosHome,
    goToBcrosLogin,
    goToBusinessProfilePage,
    goToCreateAccount,
    goToCreateUI,
    goToDigitalCredentialsPage,
    goToEditProfile,
    goToEditUI,
    goToFilingsUI,
    goToSetupAccount,
    goToTeamMembers,
    goToTransactions,
    goToOfficerEdit,
    redirect
  }
}
