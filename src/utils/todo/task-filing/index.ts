import { v4 as UUIDv4 } from 'uuid'
import { FilingTypes, CorpTypeCd } from '@bcrs-shared-components/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'
import { addActionButton } from './button-loader'
import { addExpansionContent, addSubtitleOrContent, getDraftTitle, getTitle } from './content-loader'
import { filingTypeToName } from './helper'

/** Build TodoItemI from filing TaskToDoI  */
// https://docs.google.com/spreadsheets/d/1rJY3zsrdHS2qii5xb7hq1gt-D55NsakJtdu9ld9d80U/edit?gid=0#gid=0
export const buildFilingTodo = async (task: TaskI) : Promise<TodoItemI | null> => {
  const filing = task.task.filing
  const header = filing.header
  const business = useBcrosBusiness()

  let newTodo: TodoItemI | null = null

  let corpFullDescription = ''
  if (business) {
    corpFullDescription = GetCorpFullDescription(business.currentBusiness.legalType)
  }
  const agmExtension = filing.agmExtension
  const agmLocationChange = filing.agmLocationChange
  const alteration = filing.alteration
  const amalgamation = filing.amalgamationApplication
  const annualReport = filing.annualReport
  const consentContinuationOut = filing.consentContinuationOut
  const continuationOut = filing.continuationOut
  const continuationIn = filing.continuationIn
  const conversion = filing.conversion
  const correction = filing.correction
  const dissolution = filing.dissolution
  const incorporationApplication = filing.incorporationApplication
  const registration = filing.registration
  const restoration = filing.restoration
  const specialResolution = filing.specialResolution

  if (header) {
    const paymentStatusCode = header.paymentStatusCode
    const payErrorObj = paymentStatusCode && await getPayErrorObj(paymentStatusCode)

    newTodo = {
      uiUuid: UUIDv4(),
      name: header.name,
      filingId: header.filingId,
      title: getTitle(filing),
      draftTitle: getDraftTitle(filing),
      status: header.status,
      enabled: task.enabled,
      order: task.order,
      paymentMethod: header.paymentMethod || null,
      paymentToken: header.paymentToken || null,
      payErrorObj,
      isPayCompleted: (paymentStatusCode === 'COMPLETED')
    } as TodoItemI

    // determine the subtitle (a single line of string) or content (a template to render below title) for the newTodo
    addSubtitleOrContent(newTodo)

    // Add the filingSubType field to newTodo if needed
    if (dissolution) { newTodo.filingSubType = dissolution.dissolutionType }
    if (restoration) { newTodo.filingSubType = restoration.type }

    // Add the legalType field to newTodo if needed
    if (alteration || dissolution || restoration || specialResolution) {
      newTodo.legalType = corpFullDescription
    }

    // Add the warning field to newTodo if needed
    if (business && (agmExtension || agmLocationChange || consentContinuationOut || continuationOut || conversion)) {
      newTodo.warnings = business.currentBusiness.warnings.map(warning => warning.message)
    }

    // For alteration filing, add isAlteringToBen field to newTodo
    if (alteration) {
      newTodo.isAlteringToBen = (
        business.currentBusiness.legalType !== CorpTypeCd.BENEFIT_COMPANY &&
        alteration.business?.legalType === CorpTypeCd.BENEFIT_COMPANY
      )
    }

    // Add isEmptyFiling field to newTodo if needed
    if (amalgamation || continuationIn || incorporationApplication || registration) {
      const emptyAmagamation = !(
        amalgamation?.amalgamatingBusinesses ||
        amalgamation?.offices ||
        amalgamation?.contactPoint ||
        amalgamation?.parties ||
        amalgamation?.shareStructure?.shareClasses
      )

      const emptyContinuationIn = !(
        continuationIn?.authorization ||
        continuationIn?.contactPoint ||
        continuationIn?.foreignJurisdiction ||
        continuationIn?.offices ||
        continuationIn?.parties ||
        continuationIn?.shareStructure
      )

      const emptyIncorporationApplication = !(
        incorporationApplication?.offices ||
        incorporationApplication?.contactPoint ||
        incorporationApplication?.parties ||
        incorporationApplication?.shareClasses
      )

      const emptyRegistration = !(
        registration?.offices ||
        registration?.contactPoint ||
        registration?.parties ||
        registration?.shareClasses
      )

      newTodo.isEmptyFiling =
        emptyAmagamation || emptyContinuationIn || emptyIncorporationApplication || emptyRegistration
    }

    // For AR filing, add relevant fields to newTodo
    if (annualReport) {
      newTodo.ARFilingYear = header.ARFilingYear
      newTodo.arMinDate = header.arMinDate
      newTodo.arMaxDate = header.arMaxDate
      newTodo.nextArDate = annualReport.nextArDate
    }

    // TO-DO -- Add the nameRequest field to newTodo if needed; ticket #22685

    // For Continuation In filing, add submission information (e.g., submitter, submittedDate, latestReviewComment)
    if (continuationIn) {
      newTodo.submitter = header.submitter
      newTodo.submittedDate = new Date(header.date)
      newTodo.latestReviewComment = header.latestReviewComment
    }

    // For Correction filing, add the comment, correctedFilingId, correctedFilingType field to newTodo
    if (correction) {
      newTodo.correctedFilingId = correction.correctedFilingId
      newTodo.correctedFilingType = filingTypeToName(correction.correctedFilingType as FilingTypes)
      newTodo.comment = correction.comment
    }

    // Add the actionButton for newTodo
    addActionButton(newTodo)

    // Determine the extension content panel
    addExpansionContent(newTodo)
  } else {
    console.error('ERROR - invalid header in filing =', filing)
  }

  return newTodo
}
