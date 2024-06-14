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
          <p class="font-normal mt-7">
            If this issue persists, please contact us.
          </p>
          <bcros-contact-info class="font-normal font-16 mt-4" :contacts="getContactInfo('registries')" />
        </template>
      </bcros-dialog>
      <div v-if="appLoading">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-[50px] text-gray-700 absolute top-40 left-[50%]"
        />
      </div>
      <NuxtPage v-else />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
import { StatusCodes } from 'http-status-codes'

const appLoading = ref(false)
// // errors
const errorDisplay = ref(false)
const errorContactInfo = ref(false)
const errorInfo: Ref<DialogOptionsI | null> = ref(null)

const account = useBcrosAccount()
const { accountErrors } = storeToRefs(account)

onMounted(async () => {
  appLoading.value = true
  if (accountErrors.value?.length > 0) {
    handleError(accountErrors.value[0])
    appLoading.value = false
    return
  }
  if (account.currentAccount?.id) {
    // load account products
    console.info('Loading active products...', account.currentAccount)
    await account.setActiveProducts()
    if (accountErrors.value?.length > 0) { return }
  }
  const identifier = useRoute().params.identifier as string
  await useBcrosBusiness().loadBusiness(identifier)
  console.info('App ready.')
  appLoading.value = false
})

const handleError = (error: ErrorI) => {
  console.info(error)
  switch (error?.category) {
    case ErrorCategoryE.ACCOUNT_ACCESS:
      errorInfo.value = getAuthAccessError()
      if (error.statusCode === StatusCodes.UNAUTHORIZED) {
        errorInfo.value.text = 'This account does not have access to this application.'
        errorInfo.value.textExtra = [
          'Please contact the BC Registries Ops team to request access.']
        // don't send error to sentry for ^
      } else {
        errorInfo.value.text = 'We are unable to determine your account access at this ' +
          'time. Please try again later.'
        // Sentry.captureException(error)
      }
      errorContactInfo.value = true
      errorDisplay.value = true
      break
    case ErrorCategoryE.ACCOUNT_SETTINGS:
      errorInfo.value = getDefaultError()
      errorContactInfo.value = true
      errorDisplay.value = true
      // Sentry.captureException(error)
      break
    default:
      errorInfo.value = getDefaultError()
      errorContactInfo.value = true
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
watch(accountErrors.value, (val) => { if (val && val.length > 0) { handleError(val[0]) } })
</script>
