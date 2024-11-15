<script setup lang="ts">
import { ErrorCodeE } from '~/enums/error-code-e'
import { ErrorCategoryE } from '~/enums/error-category-e'
import ContactInfo from '~/components/bcros/ContactInfo.vue'

const goHome = () => {
  useBcrosNavigate().goToBcrosDashboard()
}
const route = useRoute()
const identifier = route.params.identifier as string

// only one error modal for now, if more comes, move to enum file
enum ErrorModalsE {
  UNAUTHORIZED_ACCESS_TO_ENTITY = 'UNAUTHORIZED_ACCESS_TO_ENTITY'
}

const goToEntityDashboard = async () => {
  await navigateTo({ name: RouteNameE.DASHBOARD, params: { identifier } })
}

const { accountErrors } = storeToRefs(useBcrosAccount())

const dialogToShow = computed(() => {
  const x = accountErrors.value.find((error: ErrorI) => {
    return error.category === ErrorCategoryE.ACCOUNT_ACCESS && error.type === ErrorCodeE.AUTH_ENTITY_ACCESS_ERROR
  })
  return x ? ErrorModalsE.UNAUTHORIZED_ACCESS_TO_ENTITY : ''
})

const defaultDialgoOptions = {
  title: '',
  text: '', // content slot is used
  hideClose: true,
  buttons: [] as DialogButtonI[], // button slot is used
  alertIcon: false
}

const showUnauthorizedAccess = ref(dialogToShow.value === ErrorModalsE.UNAUTHORIZED_ACCESS_TO_ENTITY)
const registriesContact = getContactInfo('registries')

</script>

<template>
  <div class="mx-auto my-auto">
    <UButton
      variant="link"
      data-cy="access-denied-retry-dashboard-page-button"
      @click="goToEntityDashboard()"
    >
      Go to manage business
    </UButton>
  </div>
  <!--  if we get to have more error modals then 2, move the error modals to their own component files -->
  <BcrosDialogCardedModal
    name="UnauthorizedAccessToEntityErrorModal"
    :display="showUnauthorizedAccess"
    :options="defaultDialgoOptions"
    @close="goHome()"
  >
    <template #header>
      <span class="text-2xl font-light">
        Unable to Access Business
      </span>
    </template>
    <template #content>
      <div class="text-[14px]">
        <p>Your account is currently unable to access this Business. This may be because of the following: </p>
        <div class="p-4">
          <li>Your account is not authorized to access this Business — contact the Business owner to get access.</li>
          <li>Your login session has timed out — please exit and then login again.</li>
          <li>The specified Business Identifier is not valid.</li>
        </div>
        <p class="mb-4">
          You can retry now, or you can exit and try to access this Business at another time.
        </p>
        <p class="mb-4">
          {{ $t('text.dialog.error.contact') }}
        </p>
        <ContactInfo :contacts="registriesContact" />
      </div>
    </template>
    <template #buttons>
      <div>
        <UButton
          variant="link"
          @click="goHome()"
        >
          Exit
        </UButton>
        <UButton
          variant="link"
          class="float-right"
          data-cy="access-denied-retry-dashboard-button"
          @click="goToEntityDashboard()"
        >
          Retry
        </UButton>
      </div>
    </template>
  </BcrosDialogCardedModal>
</template>

<style scoped lang="scss">
ul {
  display: block
}

li {
  display: list-item
}
</style>
