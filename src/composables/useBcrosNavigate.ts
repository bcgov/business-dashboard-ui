export const useBcrosNavigate = () => {
  const config = useRuntimeConfig()
  const account = useBcrosAccount()
  const business = useBcrosBusiness()

  /** Redirect to the given URL with necessary BCROS args */
  function redirect (url: string, params?: { [key: string]: string }, target = '_self') {
    // get account id and set in params
    const redirectURL = new URL(url)
    const accountId = account.currentAccount.id
    if (accountId) {
      redirectURL.searchParams.append('accountid', accountId.toString())
    }
    for (const [key, value] of Object.entries(params ?? {})) {
      redirectURL.searchParams.append(key, value)
    }
    // assume URL is always reachable
    window.open(redirectURL, target)
  }

  // common redirects
  function goToBcrosHome () { redirect(config.public.registryHomeURL) }
  function goToBcrosDashboard () { redirect(config.public.registryHomeURL + 'dashboard') }
  function goToBcrosLogin (idpHint: string) {
    /** Redirect to bcros login page given the login type. */
    window.location.assign(`${config.public.registryHomeURL}signin/${idpHint}`)
  }
  function goToEditProfile () { redirect(config.public.authWebURL + 'userprofile') }
  function goToAccountInfo () {
    redirect(config.public.authWebURL + `account/${account.currentAccount.id}/settings/account-info`)
  }
  function goToTeamMembers () {
    redirect(config.public.authWebURL + `account/${account.currentAccount.id}/settings/team-members`)
  }
  function goToTransactions () {
    redirect(config.public.authWebURL + `account/${account.currentAccount.id}/settings/transactions`)
  }
  function goToCreateAccount () {
    redirect(config.public.authWebURL + 'choose-authentication-method')
  }
  function goToSetupAccount () {
    redirect(config.public.authWebURL + 'setup-account')
  }
  function goToDigitalCredentialsPage () {
    redirect(config.public.filingURL + `/${business.currentBusiness.identifier}/digital-credentials/`)
  }

  function goToBusinessProfilePage () {
    redirect(config.public.authWebURL + '/businessprofile')
  }

  function goToCreatePage (path: string, params?: { [key: string]: string }) {
    redirect(config.public.createURL + path, params)
  }

  function goToFilingUI (path: string, params?: { [key: string]: string }) {
    redirect(config.public.filingURL + path, params)
  }

  function goToEditPage (path: string, params?: { [key: string]: string }) {
    redirect(config.public.editApiURL + path, params)
  }

  return {
    redirect,
    goToBcrosDashboard,
    goToBcrosHome,
    goToBcrosLogin,
    goToAccountInfo,
    goToCreateAccount,
    goToEditProfile,
    goToSetupAccount,
    goToTeamMembers,
    goToTransactions,
    goToDigitalCredentialsPage,
    goToCreatePage,
    goToFilingUI,
    goToEditPage,
    goToBusinessProfilePage
  }
}
