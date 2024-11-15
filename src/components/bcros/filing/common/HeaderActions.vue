<template>
  <div class="flex flex-row items-center">
    <!-- the main button -->
    <UButton
      v-if="!isBootstrapFiling || !isExpanded"
      variant="ghost"
      class="px-3 py-2"
      data-cy="filing-main-action-button"
      @click="() => {
        isExpanded = !isExpanded
        if (props.filing.documents === undefined && props.filing.documentsLink) {
          loadDocumentList()
        }
      }"
    >
      <template v-if="filing.availableOnPaperOnly">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.requestACopy') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.close') }}</strong>
      </template>
      <template v-else-if="isTypeStaff || isBootstrapFiling">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.view') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hide') }}</strong>
      </template>
      <template v-else-if="filing.documentsLink">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.viewDocument') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hideDocuments') }}</strong>
      </template>
    </UButton>

    <!-- the drop-down menu -->
    <UDropdown
      v-if="!isDisableNonBenCorps() && hasRoleStaff && isBusiness"
      :items="actions"
      :popper="{ placement: 'bottom-end' }"
      padding="p-3"
      data-cy="header.actions.dropdown"
      class="text-blue-500"
    >
      <UButton variant="ghost" label="" trailing-icon="i-mdi-chevron-down" />
    </UDropdown>
    <UModal v-model="isCommentOpen" :ui="{base: 'absolute left-10 top-5 bottom-5'}">
      <BcrosComment :comments="filing.comments" :filing="filing" @close="showCommentDialog(false)" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { type ApiResponseFilingI, FilingStatusE, isFilingStatus, isStaffFiling } from '#imports'

const { getStoredFlag } = useBcrosLaunchdarkly()
const { hasRoleStaff } = storeToRefs(useBcrosKeycloak())
const { isAllowedToFile, isBaseCompany, isDisableNonBenCorps, isEntityCoop, isEntityFirm } = useBcrosBusiness()
const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { isBootstrapFiling } = useBcrosBusinessBootstrap()
const { currentBusinessIdentifier } = storeToRefs(useBcrosBusiness())

const isCommentOpen = ref(false)
const isExpanded = defineModel('isExpanded', { type: Boolean, required: true })

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const t = useNuxtApp().$i18n.t

const isTypeStaff = computed(() => isStaffFiling(props.filing))

/** Whether this entity is a business (and not a temporary registration). */
// todo: how do we handle stuff that is in session storage
// const isBusiness = !!sessionStorage.getItem('BUSINESS_ID')
const isBusiness = !!currentBusiness.value?.identifier

/**
 * Whether to disable correction for THIS filing.
 * (This is function instead of a getter so that we always query the realtime FF.)
 */
const disableCorrection = (): boolean => {
  // disable if not allowed
  const isAllowed =
    !!getStoredFlag('supported-correction-entities')?.includes(currentBusiness.value?.legalType) &&
    isAllowedToFile(FilingTypes.CORRECTION)
  if (!isAllowed) {
    return true
  }

  // disable if filing is paper-only
  if (props.filing.availableOnPaperOnly) {
    return true
  }

  // disable if filing is future effective but is not completed or corrected
  if (
    props.filing.isFutureEffective &&
    !(isFilingStatus(props.filing, FilingStatusE.COMPLETED) || isFilingStatus(props.filing, FilingStatusE.CORRECTED))
  ) {
    return true
  }

  switch (true) {
    case isFilingType(props.filing, FilingTypes.ADMIN_FREEZE):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.ALTERATION):
      return false
    case isFilingType(props.filing, FilingTypes.AGM_EXTENSION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.AGM_LOCATION_CHANGE):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.AMALGAMATION_APPLICATION):
      // disable if not a base company (safety check for filing compatibility)
      return !isBaseCompany
    case isFilingType(props.filing, FilingTypes.AMALGAMATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.ANNUAL_REPORT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_ADDRESS):
      return false
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_COMPANY_INFO):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_DIRECTORS):
      return false
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_NAME):
      return false
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_REGISTRATION):
      // disable if not a firm (safety check for filing compatibility)
      return !isEntityFirm
    case isFilingType(props.filing, FilingTypes.CONSENT_AMALGAMATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CONSENT_CONTINUATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CONTINUATION_IN):
      // disable if not a base company (safety check for filing compatibility)
      return !isBaseCompany
    case isFilingType(props.filing, FilingTypes.CONTINUATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CONVERSION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CORRECTION):
      // disable if not a firm, base company, or coop (safety check for filing compatibility)
      return !isEntityFirm && !isBaseCompany && !isEntityCoop
    case isFilingType(props.filing, FilingTypes.COURT_ORDER):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.DISSOLUTION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.DISSOLVED):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.INCORPORATION_APPLICATION):
      // disable if not a base company or coop (safety check for filing compatibility)
      return !isBaseCompany && !isEntityCoop
    case isFilingType(props.filing, FilingTypes.PUT_BACK_ON):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.REGISTRATION):
      // disable if not a firm (safety check for filing compatibility)
      return !isEntityFirm
    case isFilingType(props.filing, FilingTypes.REGISTRARS_NOTATION):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.REGISTRARS_ORDER):
      return true // staff filing not allowed
    case isFilingType(props.filing, undefined, FilingSubTypeE.FULL_RESTORATION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.SPECIAL_RESOLUTION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.TRANSITION):
      return true // not supported
  }

  console.info('disableCorrection(), unhandled filing =', props.filing)

  return true // safe fallback
}

/** Called by File a Correction button to correct the subject filing. */
const correctThisFiling = async (): Promise<void> => {
  // filing: ApiResponseFilingI1 = props.filing
  // show file correction dialog, which will then route to Edit UI
  // this.setCurrentFiling(filing)
  // setFileCorrectionDialog(true) todo: will be done in ticket #22550
}

const showCommentDialog = (show?: boolean) => {
  if (typeof show !== 'boolean') {
    show = true
  }

  isCommentOpen.value = show
}

const actions: any[][] = [[
  {
    label: t('button.filing.actions.fileACorrection'),
    click: correctThisFiling,
    disabled: disableCorrection(),
    icon: 'i-mdi-file-document-edit-outline'
  },
  {
    label: t('button.filing.actions.addDetail'),
    click: showCommentDialog,
    disabled: !(isBusiness && hasRoleStaff),
    icon: 'i-mdi-comment-plus'
  }
]]

const pushDocument = (title: string, filename: string, link: string) => {
  if (title && filename && link) {
    props.filing.documents.push({ title, filename, link } as DocumentI)
  } else {
    // eslint-disable-next-line no-console
    console.log(`invalid document = ${title} | ${filename} | ${link}`)
  }
}

const unknownStr = `[${t('text.general.unknown')}]`
/**
 * Converts a string in "camelCase" (or "PascalCase") to a string of separate, title-case words,
 * suitable for a title or proper name.
 * @param s the string to convert
 * @returns the converted string
 */
const camelCaseToWords = (s: string): string => {
  const words = s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  // SPECIAL CASE: convert 'Agm' to uppercase
  return words.replace('Agm', 'AGM')
}

const loadDocumentList = async () => {
  if (!props.filing.documents && props.filing.documentsLink) {
    // eslint-disable-next-line no-console
    console.log('loading filing documents for: ', props.filing.documentsLink)
    // todo: add global UI loader start and end #22059
    try {
      props.filing.documents = []
      const documentListObj = await fetchDocumentList(props.filing.documentsLink)
      const fetchedDocuments: FetchDocumentsI = documentListObj.documents || {}

      for (const groupName in fetchedDocuments) {
        if (groupName === 'legalFilings' && Array.isArray(fetchedDocuments.legalFilings)) {
          // iterate over legalFilings array
          for (const legalFilings of fetchedDocuments.legalFilings) {
            // iterate over legalFilings properties
            for (const legalFiling in legalFilings) {
              // this is a legal filing output
              let title: string
              // use display name for primary document's title
              if (legalFiling === props.filing.name) {
                title = props.filing.displayName
              } else {
                title = t(`filing.name.${legalFiling}`)
                if (title === `filing.name.${legalFiling}`) {
                  title = camelCaseToWords(legalFiling)
                }
              }
              const date = dateToYyyyMmDd(new Date(props.filing.submittedDate))
              const filename = `${currentBusinessIdentifier} ${title} - ${date}.pdf`
              const link = legalFilings[legalFiling]
              pushDocument(title, filename, link)
            }
          }
        } else if (groupName === 'staticDocuments' && Array.isArray(fetchedDocuments.staticDocuments)) {
          // iterate over staticDocuments array
          for (const document of fetchedDocuments.staticDocuments) {
            const title = document.name
            const filename = title
            const link = document.url
            pushDocument(title, filename, link)
          }
        } else if (groupName === 'uploadedCourtOrder') {
          const fileNumber = props.filing.data?.order?.fileNumber || unknownStr
          const title = hasRoleStaff ? `${props.filing.displayName} ${fileNumber}` : `${props.filing.displayName}`
          const filename = title
          const link = fetchedDocuments[groupName] as string
          pushDocument(title, filename, link)
        } else {
          // this is a submission level output
          const title = camelCaseToWords(groupName)
          const date = dateToYyyyMmDd(new Date(props.filing.submittedDate))
          const filename = `${currentBusinessIdentifier} ${title} - ${date}.pdf`
          const link = fetchedDocuments[groupName] as string
          pushDocument(title, filename, link)
        }
      }
    } catch (error) {
      // set property to null to retry next time
      props.filing.documents = null
      // eslint-disable-next-line no-console
      console.log('loadDocuments() error =', error)
      // FUTURE: enable some error dialog?
    }
  }
}
</script>
