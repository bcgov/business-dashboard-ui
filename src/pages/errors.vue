<script setup lang="ts">
import { ErrorCodeE } from '~/enums/error-code-e'
import { ErrorCategoryE } from '~/enums/error-category-e'
import ContactInfo from '~/components/bcros/ContactInfo.vue'

const goHome = () => {
  useBcrosNavigate().goToBcrosDashboard()
}
const { isStaffAccount } = useBcrosAccount()
const route = useRoute()
const identifier = route.params.identifier as string
const invalidNameRequest = route.query.invalidNr as string
const nrState = route.query.invalidNrType as NameRequestStateE
const isTempReg = await useBcrosBusinessBootstrap().checkIsTempReg(identifier)

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

const defaultDialogOptions = {
  title: '',
  text: '', // content slot is used
  hideClose: true,
  buttons: [] as DialogButtonI[], // button slot is used
  alertIcon: false
}

const showUnauthorizedAccess = ref(dialogToShow.value === ErrorModalsE.UNAUTHORIZED_ACCESS_TO_ENTITY)

const registriesContact = getContactInfo('registries')

const getNrErrorMessage = (nrState: NameRequestStateE): string => {
  switch (nrState) {
    case NameRequestStateE.EXPIRED:
      return 'The name request has expired.'
    case NameRequestStateE.CONSUMED:
      return 'The name request has already been consumed.'
    case NameRequestStateE.NOT_APPROVED:
      return 'The name request has not been approved.'
    case NameRequestStateE.NOT_FOUND:
      return 'The name request number could not be found.'
    case NameRequestStateE.NEED_CONSENT:
      return 'The name request number is awaiting consent.'
    default:
      return 'An unexpected error has occurred.'
  }
}

const nrErrorMessage = invalidNameRequest ? getNrErrorMessage(nrState) : ''
</script>

<template>
  <!--  if we get to have more error modals then 2, move the error modals to their own component files -->
  <BcrosDialogCardedModal
    name="UnauthorizedAccessToEntityErrorModal"
    :display="showUnauthorizedAccess || !!invalidNameRequest"
    :options="defaultDialogOptions"
    @close="goHome()"
  >
    <template #header>
      <span class="text-2xl font-light">
        <template v-if="showUnauthorizedAccess">
          {{ isTempReg ? 'Unable to Access Incorporation Application' : 'Unable to Access Business' }}
        </template>
        <template v-else>
          Invalid Incorporation Application
        </template>
      </span>
    </template>

    <template #content>
      <div class="text-[14px]">
        <!-- Business Auth Error Dialog -->
        <template v-if="showUnauthorizedAccess">
          <!-- auth error for bootstrap business -->
          <template v-if="isTempReg">
            <p class="font-15">
              Your account is currently unable to access this Incorporation Application.
              This may be because of the following:
            </p>
            <ul>
              <li>
                Your account is not authorized to access this Incorporation Application &mdash; contact
                the account owner to get access.
              </li>
              <li>Your login session has timed out &mdash; please exit and then login again.</li>
              <li>The specified URL is not valid &mdash; exit and return to the Business Registry page.</li>
            </ul>
            <p class="mt-4">
              You can retry now, or you can exit and try to access this Incorporation Application
              at another time.
            </p>
          </template>
          <!-- auth error for bootstrap business -->
          <templale v-else>
            <p>Your account is currently unable to access this Business. This may be because of the following:</p>
            <ul>
              <li>
                Your account is not authorized to access this Business &mdash; contact the Business owner to get access.
              </li>
              <li>Your login session has timed out &mdash; please exit and then login again.</li>
              <li>The specified Business Identifier is not valid.</li>
            </ul>
            <p class="mb-4">
              You can retry now, or you can exit and try to access this Business at another time.
            </p>
          </templale>
        </template>
        <!-- Invalid Name Request Dialog -->
        <template v-else>
          <p class="font-15">
            {{ nrErrorMessage }}
          </p>
          <p class="mt-4">
            You can retry now, or you can exit and try to access this Incorporation Application
            at another time.
          </p>
        </template>

        <template v-if="!isStaffAccount">
          <p class="mb-4">
            {{ $t('text.dialog.error.contact') }}
          </p>
          <ContactInfo :contacts="registriesContact" />
        </template>
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
