import { v4 as UUIDv4 } from 'uuid'
import { FilingTypes, CorpTypeCd } from '@bcrs-shared-components/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'
import { addActionButton } from './button-loader'
import { addExpansionContent, addSubtitleOrContent, getDraftTitle, getTitle } from './content-loader'

const filingTypeToName = useFilingTypeToName().filingTypeToName

/** Build TodoItemI from filing TaskToDoI  */
// https://docs.google.com/spreadsheets/d/1rJY3zsrdHS2qii5xb7hq1gt-D55NsakJtdu9ld9d80U/edit?gid=0#gid=0
export const buildFilingTodo = async (task: TaskI): Promise<TodoItemI> => {
  const { bootstrapFiling, bootstrapLegalType } = useBcrosBusinessBootstrap()
  const { linkedNr } = storeToRefs(useBcrosBusinessBootstrap())
  const { currentBusiness } = useBcrosBusiness()
  if (!!currentBusiness && !!bootstrapFiling) {
    console.error('Attempted buildFilingTodo without initializing the business or bootstrap first.')
    return
  }

  const filing = task?.task?.filing
  const header = filing?.header
  const filingData = filing[header?.name]
  if (!filing || !header || !filingData) {
    console.error('ERROR - invalid task provided =', task)
  }

  const corpFullDescription = GetCorpFullDescription(currentBusiness?.legalType || bootstrapLegalType)
  const isFilingType = (filingTypes: FilingTypes[]) => filingTypes.includes(header.name)

  const paymentStatusCode = header.paymentStatusCode
  const payErrorObj = paymentStatusCode && await getPayErrorObj(paymentStatusCode)

  const newTodo: TodoItemI = {
    uiUuid: UUIDv4(),
    name: header.name,
    filingId: header.filingId,
    title: getTitle(filing, corpFullDescription),
    draftTitle: getDraftTitle(filing),
    status: header.status,
    enabled: task.enabled,
    nameRequest: linkedNr.value,
    order: task.order,
    paymentMethod: header.paymentMethod || null,
    paymentToken: header.paymentToken || null,
    payErrorObj,
    isPayCompleted: (paymentStatusCode === PaymentStatusCodeE.COMPLETED)
  }

  // determine the subtitle (a single line of string) or content (a template to render below title) for the newTodo
  addSubtitleOrContent(newTodo)

  // Add the filingSubType field to newTodo if needed
  if (isFilingType([FilingTypes.DISSOLUTION])) {
    newTodo.filingSubType = filingData.dissolutionType
  }
  if (isFilingType([FilingTypes.RESTORATION, FilingTypes.CHANGE_OF_RECEIVERS, FilingTypes.CHANGE_OF_LIQUIDATORS])) {
    newTodo.filingSubType = filingData.type
  }

  // Add the legalType field to newTodo if needed
  if (isFilingType([
    FilingTypes.ALTERATION, FilingTypes.DISSOLUTION,
    FilingTypes.RESTORATION, FilingTypes.SPECIAL_RESOLUTION])
  ) {
    newTodo.legalType = corpFullDescription
  }

  // Add the warning field to newTodo if needed
  if (isFilingType([
    FilingTypes.AGM_EXTENSION, FilingTypes.AGM_LOCATION_CHANGE,
    FilingTypes.CONSENT_CONTINUATION_OUT, FilingTypes.CONTINUATION_OUT,
    FilingTypes.CONVERSION])
  ) {
    newTodo.warnings = currentBusiness.warnings.map(warning => warning.message)
  }

  // For alteration filing, add isAlteringToBen field to newTodo
  if (isFilingType([FilingTypes.ALTERATION])) {
    newTodo.isAlteringToBen = (
      currentBusiness.legalType !== CorpTypeCd.BENEFIT_COMPANY &&
      filingData.business?.legalType === CorpTypeCd.BENEFIT_COMPANY
    )
  }

  // Add isEmptyFiling field to newTodo if needed (only affects business bootstrap)
  const isCommonSectionsEmpty = !(
    filingData?.offices ||
    filingData?.contactPoint ||
    filingData?.parties
  )
  if (bootstrapFiling && isCommonSectionsEmpty) {
    switch (header.name) {
      case FilingTypes.AMALGAMATION_APPLICATION:
        newTodo.isEmptyFiling = !(
          filingData?.amalgamatingBusinesses ||
          filingData?.shareStructure?.shareClasses
        )
        break
      case FilingTypes.CONTINUATION_IN:
        newTodo.isEmptyFiling = !(
          filingData?.authorization ||
          filingData?.foreignJurisdiction ||
          filingData?.shareStructure
        )
        break
      case FilingTypes.INCORPORATION_APPLICATION:
      case FilingTypes.REGISTRATION:
        newTodo.isEmptyFiling = !filingData?.shareClasses
        break
    }
  }

  // For AR filing, add relevant fields to newTodo
  if (isFilingType([FilingTypes.ANNUAL_REPORT])) {
    newTodo.ARFilingYear = header.ARFilingYear
    newTodo.arMinDate = header.arMinDate
    newTodo.arMaxDate = header.arMaxDate
    newTodo.nextArDate = filingData.nextArDate
  }

  // For Continuation In filing, add submission information (e.g., submitter, submittedDate, latestReviewComment)
  if (isFilingType([FilingTypes.CONTINUATION_IN])) {
    newTodo.submitter = header.submitter
    newTodo.submittedDate = new Date(header.date)
    newTodo.latestReviewComment = header.latestReviewComment
  }

  // For Correction filing, add the comment, correctedFilingId, correctedFilingType field to newTodo
  if (isFilingType([FilingTypes.CORRECTION])) {
    newTodo.correctedFilingId = filingData.correctedFilingId
    newTodo.correctedFilingType = filingTypeToName(filingData.correctedFilingType as FilingTypes)
    newTodo.comment = filingData.comment
  }

  // Add the actionButton for newTodo
  addActionButton(newTodo)

  // Determine the extension content panel
  addExpansionContent(newTodo)

  return newTodo
}
