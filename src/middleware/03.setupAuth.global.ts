export default defineNuxtRouteMiddleware(async (to) => {
  // setup auth
  if (!to.query.error) {
    // keycloak redirects with the error param when not logged in (nuxt/keycloak issue)
    //   - removing ^ condition will cause an infinite loop of keycloak redirects when not authenticated
    const { kcURL, kcRealm, kcClient } = useRuntimeConfig().public
    let accountNumber = to?.params?.accountid || to?.query?.accountid || undefined
    if (Array.isArray(accountNumber)) {
      accountNumber = accountNumber[0]
    }
    await useBcrosAuth().setupAuth(
      { url: kcURL, realm: kcRealm, clientId: kcClient },
      accountNumber
    )
  }
  // For cypress tests. NOTE: all api calls will need to be intercepted/stubbed
  if (process.client && (
    sessionStorage?.getItem('FAKE_CYPRESS_LOGIN') === 'true' ||
    sessionStorage?.getItem('FAKE_CYPRESS_LOGIN') === 'trueStaff'
  )) {
    const { kc } = useBcrosKeycloak()
    // set test kc values
    kc.tokenParsed = {
      firstname: 'TestFirst',
      lastname: 'TestLast',
      name: 'TestFirst TestLast',
      username: 'testUsername',
      email: 'testEmail@test.com',
      sub: 'testSub',
      loginSource: 'IDIR',
      realm_access: { roles: ['public_user'] }
    }

    if (sessionStorage?.getItem('FAKE_CYPRESS_LOGIN') === 'trueStaff') {
      kc.tokenParsed.realm_access = { roles: ['staff'] }
    }

    kc.authenticated = true
    // set account stuff (normally would happen after kc init in 'setupAuth')
    const account = useBcrosAccount()
    await account.setUserName()
    let accountNumber = to?.params?.accountid || to?.query?.accountid || undefined
    if (Array.isArray(accountNumber)) {
      accountNumber = accountNumber[0]
    }
    await account.setAccountInfo(+accountNumber)
    await account.loadAuthorizedActions()
  }
})
