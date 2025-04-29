<script setup lang="ts">
import { StatusCodes } from 'http-status-codes'
import { ErrorCodeE } from '~/enums/error-code-e'
const t = useNuxtApp().$i18n.t

// // errors
const errorDisplay = ref(false)
const errorContactInfo = ref(false)
const errorInfo: Ref<DialogOptionsI | null> = ref(null)

const account = useBcrosAccount()
const { accountErrors } = storeToRefs(account)
const business = useBcrosBusiness()
const { errors } = storeToRefs(business)

const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()
const loaderTrackingId = 'main-app-loading'

onMounted(async () => {
  trackUiLoadingStart(loaderTrackingId)
  if (accountErrors.value?.length > 0) {
    handleError(accountErrors.value[0])
    trackUiLoadingStop(loaderTrackingId)
    return
  }
  if (errors.value?.length > 0) {
    handleError(errors.value[0])
    trackUiLoadingStop(loaderTrackingId)
    return
  }
  if (account.currentAccount?.id) {
    // load account products
    console.info('Loading active products...', account.currentAccount)
    await account.setActiveProducts()
    if (accountErrors.value?.length > 0) {
      return
    }
  }
  trackUiLoadingStop(loaderTrackingId)
  console.info('App ready')
})

const handleError = (error: ErrorI) => {
  switch (error?.category) {
    case ErrorCategoryE.ACCOUNT_ACCESS:
      errorInfo.value = getAuthAccessError()
      if (error.statusCode === StatusCodes.UNAUTHORIZED) {
        errorInfo.value.title = t('text.dialog.error.loadBusinessFetchError.title.accessRestricted')
        errorInfo.value.text = t('text.dialog.error.loadBusinessFetchError.text.accessRestricted')
        errorInfo.value.alertIcon = true
        errorInfo.value.hideClose = true
        errorInfo.value.buttons = [{
          text: t('button.dialog.goToBRD'),
          slotId: 'ok',
          color: 'primary',
          onClickClose: true,
          onClick: () => {
            useBcrosNavigate().goToBcrosDashboard()
          }
        }]
      } else {
        errorInfo.value.text = 'We are unable to determine your account access at this ' +
          'time. Please try again later.'
        // Sentry.captureException(error)
      }
      errorContactInfo.value = false
      errorDisplay.value = error.type !== ErrorCodeE.AUTH_ENTITY_ACCESS_ERROR
      break

    case ErrorCategoryE.ENTITY_BASIC:
      if (error.statusCode === StatusCodes.NOT_FOUND) {
        errorInfo.value = getNotFoundError()
        errorInfo.value.title = t('text.dialog.error.loadBusinessFetchError.title.invalidLink')
        errorInfo.value.text = t('text.dialog.error.loadBusinessFetchError.text.invalidLink')
        errorInfo.value.alertIcon = true
        errorContactInfo.value = false
        // don't send error to sentry for ^
      } else if (error.statusCode === StatusCodes.UNAUTHORIZED) {
        errorInfo.value = getSessionExpiredError()
      } else if (error.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
        errorInfo.value = getPageNotFoundError()
        errorInfo.value.title = t('text.dialog.error.loadBusinessFetchError.title.pageNotFound')
        errorInfo.value.text = t('text.dialog.error.loadBusinessFetchError.text.pageNotFound')
        errorInfo.value.alertIcon = true
        errorContactInfo.value = true
        errorInfo.value.contact = t('text.dialog.error.loadBusinessFetchError.contact')
      } else {
        errorInfo.value.text = 'We are unable to determine your account at this ' +
          'time. Please try again later.'
        // Sentry.captureException(error)
      }
      errorDisplay.value = true
      break

    case ErrorCategoryE.ACCOUNT_SETTINGS:
      errorInfo.value = getDefaultError()
      errorContactInfo.value = true
      errorInfo.value.contact = t('text.dialog.error.contact')
      errorDisplay.value = true
      // Sentry.captureException(error)
      break
    default:
      errorInfo.value = getDefaultError()
      errorContactInfo.value = true
      errorInfo.value.contact = t('text.dialog.error.contact')
      errorDisplay.value = true
    // Sentry.captureException(error)
  }
}

const clearDialog = () => {
  errorDisplay.value = false
  errorContactInfo.value = false
  errorInfo.value = null
}

// watchers for errors
watch([accountErrors.value, errors.value], ([accountVal, errorVal]) => {
  if (accountVal && accountVal.length > 0) {
    handleError(accountVal[0])
  } else if (errorVal && errorVal.length > 0) {
    handleError(errorVal[0])
  }
})
</script>

<template>
  <div class="bg-bcGovGray-100">
    <NuxtLayout>
      <bcros-dialog
        id="error-dialog"
        attach="#appHeader"
        :display="errorDisplay"
        :options="errorInfo"
        @close="clearDialog"
      >
        <template v-if="errorContactInfo" #extra-content>
          <p class="font-normal mt-4">
            {{ errorInfo.contact }}
          </p>
          <bcros-contact-info class="font-normal font-16 mt-4" :contacts="getContactInfo('registries')" />
        </template>
      </bcros-dialog>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
