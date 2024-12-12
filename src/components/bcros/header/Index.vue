<template>
  <header
    id="bcros-main-header"
    class="bg-bcGovColor-darkBlue border-b-2 border-yellow-400"
    data-cy="bcros-header"
  >
    <div id="bcros-main-header__container" class="flex max-w-bcros mx-auto h-[68px] justify-center">
      <nav id="bcros-main-header__container__actions" class="flex flex-wrap content-center w-full">
        <a
          id="bcros-main-header__container__actions__home-redirect"
          class="flex justify-center items-center"
          @click="goToBcrosHome()"
        >
          <picture>
            <source media="(max-width:600px)" srcset="@/assets/images/gov_bc_logo_vert.png">
            <img src="@/assets/images/gov_bc_logo_horiz.png" alt="Government of British Columbia Logo">
          </picture>
          <span
            class="flex flex-wrap content-center font-bold ml-5 text-white text-lg"
            style="letter-spacing: -.03rem;"
          >
            {{ t('title.header') }}
          </span>
        </a>
        <div
          id="bcros-main-header__container__actions__menus"
          class="flex flex-auto justify-end h-full text-white"
        >
          <div v-if="authenticated" class="flex flex-wrap self-center text-sm">
            <BcrosHeaderMenu
              data-cy="notification-menu"
              :menu-button-text="$t('text.general.notifications')"
              :menu-lists="[{header: $t('text.general.notifications'), items: notificationItems}]"
            >
              <template #menu-button-text>
                <UChip color="red" position="top-right" :show="pendingApprovalCount > 0" :ui="{ base: 'ring-0'}">
                  <UIcon :alt="$t('text.general.notifications')" name="i-mdi-bell-outline" class="mr-2 text-2xl" />
                  <span class="hidden xl:flex">{{ $t('text.general.notifications') }}</span>
                </UChip>
              </template>
            </BcrosHeaderMenu>
          </div>

          <div v-if="authenticated" class="flex flex-wrap self-center text-sm">
            <BcrosHeaderMenu data-cy="logged-in-menu" :menu-lists="loggedInMenuOptions">
              <template #menu-button-text>
                <BcrosHeaderAccountLabel
                  :account-name="!personMode ? currentAccountName : ''"
                  :username="userFullName"
                />
              </template>
              <template #menu-list-header-0>
                <div class="flex px-4 mb-3">
                  <BcrosHeaderAccountLabel
                    :avatar-classes="'text-white'"
                    :account-name="!personMode ? currentAccountName : ''"
                    :username="userFullName"
                  />
                </div>
              </template>
            </BcrosHeaderMenu>
          </div>
          <div v-else class="flex flex-wrap self-center text-sm h-[36px]">
            <BcrosHeaderMenu
              data-cy="logged-out-menu"
              :menu-button-text="t('button.header.login')"
              :menu-lists="loggedOutMenuOptions"
            />
            <button
              class="text-white ml-2 p-2 hover:bg-bcGovColor-activeBlue/[0.2]"
              data-cy="logged-out-create-accnt"
              @click="createAccount()"
            >
              {{ t('button.header.createAccount') }}
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{ personMode?: boolean }>()

const config = useRuntimeConfig()
const t = useNuxtApp().$i18n.t
const {
  goToAccountInfo,
  goToBcrosHome,
  goToBcrosLogin,
  goToEditProfile,
  goToTeamMembers,
  goToTransactions,
  redirect
} = useBcrosNavigate()
// account / user
const account = useBcrosAccount()
const { currentAccount, currentAccountName, userFullName, userAccounts, pendingApprovalCount } = storeToRefs(account)
// kc / auth
const keycloak = useBcrosKeycloak()
const authenticated = computed(() => keycloak.kc.authenticated)
const { createAccount, logout } = useBcrosAuth()

function switchAccount (accountId: number) {
  account.switchCurrentAccount(accountId)
  // refresh the page so that account based checks are rerun
  const url = new URL(window.location)
  url.searchParams.set('accountid', accountId.toString())
  window.location.assign(url.toString())
}

// logged out menu options
const loginOptions = [
  {
    label: t('label.service.bcsc'),
    icon: 'i-mdi-account-card-details-outline',
    action: goToBcrosLogin,
    args: IdpHintE.BCSC
  },
  {
    label: t('label.service.bceid'),
    icon: 'i-mdi-two-factor-authentication',
    action: goToBcrosLogin,
    args: IdpHintE.BCEID
  },
  {
    label: t('label.service.idir'),
    icon: 'i-mdi-account-group-outline',
    action: goToBcrosLogin,
    args: IdpHintE.IDIR
  }
]

const loggedOutMenuOptions = [
  { header: t('title.menu.header.selectLogin') },
  { items: loginOptions }
]

// logged in menu options
const basicAccountOptions = computed(() => {
  const options: HeaderMenuItemI[] = []
  if ([LoginSourceE.BCEID, LoginSourceE.BCSC].includes(keycloak.kcUser?.loginSource)) {
    options.unshift({
      label: t('label.header.editProfile'),
      icon: 'i-mdi-account-outline',
      action: goToEditProfile
    })
  }
  options.push({
    label: t('label.header.logOut'),
    icon: 'i-mdi-logout-variant',
    action: logout,
    args: config.public.registryHomeURL
  })
  return options
})

const accountSettingsOptions = computed(() => {
  const options: HeaderMenuItemI[] = [
    { label: t('label.header.accountInfo'), icon: 'i-mdi-information-outline', action: goToAccountInfo },
    { label: t('label.header.teamMembers'), icon: 'i-mdi-account-group-outline', action: goToTeamMembers }
  ]
  if ([AccountTypeE.PREMIUM, AccountTypeE.SBC_STAFF, AccountTypeE.STAFF].includes(currentAccount.value.accountType)) {
    options.push({
      label: t('label.header.transactions'),
      icon: 'i-mdi-file-document-outline',
      action: goToTransactions
    })
  }
  return options
})

const switchAccountOptions = computed(() => {
  const options: HeaderMenuItemI[] = []
  for (const i in userAccounts.value) {
    const isActive = currentAccount.value.id === userAccounts.value[i].id
    // add active account stuff to menu list item
    options.push({
      label: userAccounts.value[i].label,
      action: isActive ? undefined : switchAccount,
      args: userAccounts.value[i].id,
      icon: isActive ? 'i-mdi-check' : '',
      setActive: isActive
    })
  }
  return options
})

const notificationItems = computed((): HeaderMenuItemI[] => {
  const label = t('text.general.pendingNotifications', pendingApprovalCount.value)
  const authURL = useRuntimeConfig().public.authWebURL
  const url = `${authURL}/account/${currentAccount.value.id}/settings/team-members`
  const options: HeaderMenuItemI[] = []
  const option: HeaderMenuItemI = {
    label
  }
  if (pendingApprovalCount.value > 0) {
    option.subLabel = t('text.general.notificationSubLabel', pendingApprovalCount.value)
    option.action = () => {
      redirect(url)
    }
  }
  options.push(option)
  return options
})

const createAccMenuItem = computed((): HeaderMenuItemI[] => {
  if ([LoginSourceE.BCROS, LoginSourceE.IDIR].includes(keycloak.kcUser?.loginSource)) {
    return []
  }
  return [{ label: t('label.header.createAccount'), icon: 'i-mdi-plus', action: createAccount }]
})

const loggedInMenuOptions: Ref<HeaderMenuOptionsI[]> = ref([])

function updateLoggedInMenuOptions () {
  const options: HeaderMenuOptionsI[] = [{ items: basicAccountOptions.value }]
  if (!props.personMode) {
    if (accountSettingsOptions.value.length > 0) {
      options.push({ header: t('title.menu.header.accountSettings'), items: accountSettingsOptions.value })
    }
    if (switchAccountOptions.value.length > 1) {
      options.push({ header: t('title.menu.header.switchAccount'), items: switchAccountOptions.value })
    }
    if (createAccMenuItem.value.length > 0) {
      options.push({ items: createAccMenuItem.value })
    }
  }
  loggedInMenuOptions.value = options
}

onBeforeMount(() => { updateLoggedInMenuOptions() })

watch(() => currentAccount.value, (val) => {
  // update loggedInMenuOptions (header menu)
  if (!val) {
    loggedInMenuOptions.value = []
  } else {
    updateLoggedInMenuOptions()
  }
})
</script>
