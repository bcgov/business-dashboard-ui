import { StatusCodes } from 'http-status-codes'
import type { ProductCodeE } from '#imports'
import { AccountAccessError } from '~/interfaces/error-i'

/** Manages bcros account data */
export const useBcrosAccount = defineStore('bcros/account', () => {
  // keycloak info
  const keycloak = useBcrosKeycloak()
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
  const isStaffAccount = computed(() => currentAccount.value.accountType === AccountTypeE.STAFF)
  // errors
  const accountErrors: Ref<ErrorI[]> = ref([])
  // api request variables
  const apiURL = useRuntimeConfig().public.authApiURL

  const pendingApprovalCount: Ref<number> = ref(0)

  async function verifyAccountAuthorizations (identifier?: string): Promise<boolean> {
    const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()
    trackUiLoadingStart('accountAuthorization')

    if (!identifier) {
      accountErrors.value.push(AccountAccessError)
      trackUiLoadingStop('accountAuthorization')
      return false
    }

    const authorizations = await useBcrosFetch(`${apiURL}/entities/${identifier}/authorizations`, {})
      .then((response) => {
        // this logic is from current dashboard, they are just checking for existence of the roles,
        // no specific role needed; possibly cause some do not have 'view' role
        return response?.data?.value?.roles?.length > 0 // includes('view')
      })
    if (authorizations) {
      trackUiLoadingStop('accountAuthorization')
      return true
    }
    trackUiLoadingStop('accountAuthorization')
    accountErrors.value.push(AccountAccessError)
    return false
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
  async function setAccountInfo (currentAccountId?: number) {
    if (!currentAccountId) {
      // try getting id from existing session storage
      currentAccountId = JSON.parse(sessionStorage.getItem(SessionStorageKeyE.CURRENT_ACCOUNT) || '{}').id
    }
    if (user.value?.keycloakGuid) {
      userAccounts.value = await getUserAccounts(user.value?.keycloakGuid) || []
      if (userAccounts && userAccounts.value.length > 0) {
        currentAccount.value = userAccounts.value[0]
        if (currentAccountId) {
          // if previous current account id selection information available set this as current account
          currentAccount.value = userAccounts.value.find(account => account.id === currentAccountId) || {} as AccountI
        }
        sessionStorage.setItem(SessionStorageKeyE.CURRENT_ACCOUNT, JSON.stringify(currentAccount.value))
      }
    }
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
      const response = await useBcrosFetch<NotificationsResponse>(`${apiURL}/users/${currentUserSub}/org/${accountId}/notifications`, {})
      return (response && response.data && response.data.count) || 0
    } else {
      return 0
    }
  }

  return {
    currentAccount,
    currentAccountName,
    userAccounts,
    userFullName,
    isStaffAccount,
    accountErrors,
    activeProducts,
    updateAuthUserInfo,
    verifyAccountAuthorizations,
    setUserName,
    setAccountInfo,
    setActiveProducts,
    hasProductAccess,
    switchCurrentAccount,
    pendingApprovalCount
  }
})
