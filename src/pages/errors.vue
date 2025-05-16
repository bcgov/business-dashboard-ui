<script setup lang="ts">
import { AuthorizedActionsE } from '~/enums/authorized-actions-e'
import { ErrorCodeE } from '~/enums/error-code-e'
import { ErrorCategoryE } from '~/enums/error-category-e'
import ContactInfo from '~/components/bcros/ContactInfo.vue'
import { isAuthorized } from '~/utils/authorizations'
import { filingTypeToName } from '~/utils/todo/task-filing/helper'

const goHome = () => {
  useBcrosNavigate().goToBcrosDashboard()
}
const route = useRoute()
const identifier = route.params.identifier as string
const invalidNameRequest = route.query.invalidNr as string
const nrState = route.query.invalidNrType as NameRequestStateE
const { dashboardIsLoading } = storeToRefs(useBcrosDashboardUi())
const { checkIsTempReg, bootstrapFilingType } = useBcrosBusinessBootstrap()
const isTempReg = checkIsTempReg(identifier)
const businessOrFiling = isTempReg ? filingTypeToName(bootstrapFilingType) : 'Business'

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
      // Note: getNrState() function currently does not return this state
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
    v-if="!dashboardIsLoading"
    name="UnauthorizedAccessToEntityErrorModal"
    :display="(showUnauthorizedAccess || !!invalidNameRequest)"
    :options="defaultDialogOptions"
    @close="goHome()"
  >
    <template #header>
      <span class="text-2xl font-light">
        <template v-if="showUnauthorizedAccess">
          {{ `Unable to Access ${ businessOrFiling }` }}
        </template>
        <template v-else>
          Invalid Name Request
        </template>
      </span>
    </template>

    <template #content>
      <div class="text-[14px]">
        <!-- Auth Error Dialog for business and bootstrap business -->
        <template v-if="showUnauthorizedAccess">
          <p class="mb-4">
            Your account is currently unable to access this {{ businessOrFiling }}.
            This may be because of the following:
          </p>
          <ul class="list-disc list-outside mb-4 ml-4 [&>li]:pl-2">
            <li>
              Your account is not authorized to access this {{ businessOrFiling }} &mdash; contact the
              {{ isTempReg ? 'account' : 'Business' }} owner to get access.
            </li>
            <li>Your login session has timed out &mdash; please exit and then login again.</li>
            <li v-if="isTempReg">
              The specified URL is not valid &mdash; exit and return to the Business Registry page.
            </li>
            <li v-else>
              The specified Business Identifier is not valid.
            </li>
          </ul>
        </template>
        <!-- Invalid Name Request Dialog -->
        <template v-else>
          <p class="mb-4">
            {{ nrErrorMessage }}
          </p>
        </template>
        <p class="mb-4">
          You can retry now, or you can exit and try to access this {{ businessOrFiling }} at another time.
        </p>
        <template v-if="!isAuthorized(AuthorizedActionsE.NO_CONTACT_INFO)">
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
