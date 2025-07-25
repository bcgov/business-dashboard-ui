import { StatusCodes } from 'http-status-codes'
import type { AuthorizedActionsE, ProductCodeE } from '#imports'
import { AccountAccessError } from '~/interfaces/error-i'

/** Manages bcros account data */
export const useBcrosAccount = defineStore('bcros/account', () => {
  // keycloak info
  const keycloak = useBcrosKeycloak()
  // Gather legal API config
  const authorizedActions: Ref<AuthorizedActionsE[]> = ref([])
  // selected user account
  const currentAccount: Ref<AccountI> = ref({} as AccountI)
  const currentAccountName = computed((): string => currentAccount.value?.label || '')
  const activeProducts: Ref<ProductI[]> = ref([])
  // user info
  const user = computed(() => keycloak.kcUser)
  const userAccounts: Ref<AccountI[]> = ref([])
  const userFirstName = computed(() => user.value?.firstName || '-')
  const userLastName = computed(() => user.value?.lastName || '')
  const userFullName = computed(() => `${userFirstName.value} ${userLastName.value}`)
  const isCAAccount = computed(() => activeProducts?.value?.some(
    product => product.code === ProductCodeE.CA_SEARCH &&
    product.subscriptionStatus === ProductStatusE.ACTIVE
  ))
  // errors
  const accountErrors: Ref<ErrorI[]> = ref([])
  // api request variables
  const apiURL = useRuntimeConfig().public.authApiURL

  const pendingApprovalCount: Ref<number> = ref(0)

  // get roles from KC token
  const authRoles = computed(() => keycloak.kcUserRoles)

  function verifyAccountAuthorizations (identifier?: string): boolean {
    const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()
    trackUiLoadingStart('accountAuthorization')

    if (!identifier) {
      accountErrors.value.push(AccountAccessError)
      trackUiLoadingStop('accountAuthorization')
      return false
    }

    // safety check
    if (!Array.isArray(authRoles.value)) {
      accountErrors.value.push(AccountAccessError)
      throw new TypeError('Invalid roles')
    }

    // Check that the list of actions isn't empty
    const allRoles = Object.values(AuthorizationRolesE)
    if (!allRoles.some(role => authRoles.value.includes(role))) {
      accountErrors.value.push(AccountAccessError)
      throw new TypeError('Missing valid role')
    }
    trackUiLoadingStop('accountAuthorization')
    return true
  }

  /** Get user information from AUTH */
  async function getAuthUserProfile (identifier: string) {
    return await useBcrosFetch<KCUserI>(`${apiURL}/users/${identifier}`)
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching user info.', error.value)
          accountErrors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.USER_INFO
          })
        }
        return data.value
      })
  }

  /**
   * Return the list of authorized actions for the current user.
   */
  function getAuthorizedActions (): Array<AuthorizedActionsE> {
    if (!authorizedActions.value || authorizedActions.value.length < 1) {
      console.warn('No authorized actions found.')
      return []
    }
    return authorizedActions.value
  }

  /** Update user information in AUTH with current token info */
  async function updateAuthUserInfo () {
    return await useBcrosFetch<KCUserI>(`${apiURL}/users`, { method: 'POST', body: { isLogin: true } })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          // not too worried if this errs -- log for ops
          console.error('Error updating Auth with login attempt', error)
        }
        return data.value
      })
  }

  /** Set user name information */
  async function setUserName () {
    if (user.value?.loginSource === LoginSourceE.BCEID) {
      // get from auth
      const authUserInfo = await getAuthUserProfile('@me')
      if (authUserInfo) {
        userFirstName.value = authUserInfo.firstName
        userLastName.value = authUserInfo.lastName
      }
      return
    }
    userFirstName.value = user.value?.firstName || '-'
    userLastName.value = user.value?.lastName || ''
  }

  /** Get the user's account list */
  async function getUserAccounts (keycloakGuid: string) {
    return await useBcrosFetch<UserSettingsI[]>(`${apiURL}/users/${keycloakGuid}/settings`)
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching user settings / account list.', error.value)
          accountErrors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ACCOUNT_LIST
          })
          return
        }
        return data.value.filter(userSettings => (userSettings.type === UserSettingsTypeE.ACCOUNT)) as AccountI[]
      })
  }

  /** Get all the current account products. */
  async function getAccountProducts (): Promise<ProductI[]> {
    const config = { baseURL: apiURL, params: { include_hidden: true } }
    fetchPendingApprovalCount().then((count) => { pendingApprovalCount.value = count })
    return await useBcrosFetch<ProductI[]>(`orgs/${currentAccount.value?.id}/products`, config)
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.info(error)
          accountErrors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ACCOUNT_PRODUCTS
          })
        }
        if (data.value instanceof Object) {
          return data.value
        }
        // NB: for some reason useFetch is returning this response list as a string
        return JSON.parse((data.value as unknown) as string)
      })
  }

  /** Check if the current account has the product. */
  function hasProductAccess (code: ProductCodeE) {
    // check if product code in activeProducts
    return !!activeProducts.value?.find(product => product.code === code)
  }

  /** Set the active products for the current account. */
  async function setActiveProducts () {
    try {
      const products = await getAccountProducts()
      activeProducts.value = products.filter(product => product.subscriptionStatus === ProductStatusE.ACTIVE)
    } catch (error) {
      console.warn(error)
      accountErrors.value.push({
        category: ErrorCategoryE.ACCOUNT_ACCESS,
        message: 'Error getting/setting active user products.',
        statusCode: null,
        type: ErrorCodeE.AUTH_PRODUCTS_ERROR
      })
    }
  }

  /** Set the user account list and current account */
  async function setAccountInfo (currentAccountId: number) {
    const queryAccountId = currentAccountId
    if (isNaN(currentAccountId)) {
      // try getting id from existing session storage
      currentAccountId = JSON.parse(sessionStorage.getItem(SessionStorageKeyE.CURRENT_ACCOUNT) || '{}').id
    }
    if (user.value?.keycloakGuid) {
      userAccounts.value = await getUserAccounts(user.value.keycloakGuid) || []
      if (userAccounts && userAccounts.value.length > 0) {
        currentAccount.value = userAccounts.value[0]
        // If we have an accountid that matches in our current account switch to that
        if (currentAccountId && userAccounts.value.find(account => account.id === currentAccountId)) {
          currentAccount.value = userAccounts.value.find(account => account.id === currentAccountId) || {} as AccountI
        }
        sessionStorage.setItem(SessionStorageKeyE.CURRENT_ACCOUNT, JSON.stringify(currentAccount.value))

        // If we set a new currentAccountId, change it in the URL and reload.
        if (currentAccountId !== queryAccountId || currentAccountId !== Number(currentAccount.value.id)) {
          // currentAccount takes precedent over any other number.
          currentAccountId = Number(currentAccount.value.id)
          const url = new URL(window.location.href)
          url.searchParams.delete('accountid')
          url.searchParams.set('accountid', currentAccountId.toString())
          // Cypress is not happy if we reload the page, so avoid that here.
          if (!sessionStorage.getItem('FAKE_CYPRESS_LOGIN')) {
            window.location.assign(url.href)
          }
        }
      }
    }
  }

  /**
   * Load action called in useBcrosAuth.
   * Uses the fetchAuthorizedActions to fetch the actions from the Legal API and set them in the store.
   */
  async function loadAuthorizedActions (): Promise<void> {
    const authorizedActions = await fetchAuthorizedActions().catch(() => null)
    // verify we have _some_ authorized actions
    if (!Array.isArray(authorizedActions) || authorizedActions.length < 1) {
      // Throw error and redirect to error page
      console.error('Invalid or missing authorized actions')
    }

    setAuthorizedActions(authorizedActions)
  }

  /**
    * @param authorizedActionsIn The list of authorized actions to set in the store.
    * This will replace the current list of authorized actions.
    */
  function setAuthorizedActions (authorizedActionsIn: AuthorizedActionsE[]) {
    authorizedActions.value = authorizedActionsIn
  }

  /** Switch the current account to the given account ID if it exists in the user's account list */
  function switchCurrentAccount (accountId: number) {
    for (const i in userAccounts.value) {
      if (userAccounts.value[i].id === accountId) {
        currentAccount.value = userAccounts.value[i]
      }
    }
    sessionStorage.setItem(SessionStorageKeyE.CURRENT_ACCOUNT, JSON.stringify(currentAccount.value))
  }

  async function fetchPendingApprovalCount (): Promise<number> {
    if (currentAccount?.value?.id) {
      const accountId = currentAccount.value.id
      const currentUserSub = user.value.keycloakGuid
      interface NotificationsResponse {
        count: number
      }
      const url = `${apiURL}/users/${currentUserSub}/org/${accountId}/notifications`
      const response = await useBcrosFetch<NotificationsResponse>(url, {})
      return (response && response.data && response.data.count) || 0
    } else {
      return 0
    }
  }

  /**
   * Fetches authorized actions (aka permissions) from the Legal API.
   */
  async function fetchAuthorizedActions (): Promise<AuthorizedActionsE[]> {
    return await useBcrosLegalApi().fetch<{authorizedPermissions: AuthorizedActionsE}>(
      '/permissions', {})
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching authorized actions.', error.value)
          accountErrors.value.push({
            statusCode: error.value?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ACCOUNT_ACCESS
          })
          return []
        }
        if (Array.isArray(data.value.authorizedPermissions)) {
          return data.value.authorizedPermissions
        }
      })
  }
  return {
    currentAccount,
    currentAccountName,
    userAccounts,
    userFullName,
    isCAAccount,
    accountErrors,
    activeProducts,
    updateAuthUserInfo,
    verifyAccountAuthorizations,
    setUserName,
    setAccountInfo,
    setAuthorizedActions, // For testing purposes
    loadAuthorizedActions,
    getAuthorizedActions,
    setActiveProducts,
    hasProductAccess,
    switchCurrentAccount,
    pendingApprovalCount,
    authRoles
  }
})
