import { WarningTypesE } from '~/enums/warning-types-e'

/**
 * Collapses the MISSING_REQUIRED_BUSINESS_INFO warnings on a corp into one bullet per category
 * ("Office address" / "Director address") for the Review Imported Data todo item.
 * Legal API stamps `data.officeType` on office warnings and `data.partyId` on director warnings (lear #4867).
 * @param warnings the business warnings from the Legal API
 * @returns the translated category labels, office first
 */
export const getMissingInfoCategories = (warnings: Array<BusinessWarningI> = []): Array<string> => {
  const t = useNuxtApp().$i18n.t
  const missingInfo = warnings.filter(warning => warning.warningType === WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO)

  const categories: Array<string> = []
  if (missingInfo.some(warning => warning.data?.officeType)) {
    categories.push(t('text.todoItem.reviewImportedData.officeAddress'))
  }
  if (missingInfo.some(warning => warning.data?.partyId)) {
    categories.push(t('text.todoItem.reviewImportedData.directorAddress'))
  }
  return categories
}

/**
 * Whether the business has missing info the Review Imported Data todo item does not cover.
 * The todo lists the corp office / director address warnings (the ones carrying `data.officeType` or
 * `data.partyId`); anything else, eg a firm's missing start date, still needs the Missing Information alert.
 * NB: keyed on the warnings rather than allowedActions, which drops the filing once a draft exists.
 * @param warnings the business warnings from the Legal API
 */
export const hasMissingInfoOutsideReviewTodo = (warnings: Array<BusinessWarningI> = []): boolean =>
  warnings.some(warning =>
    warning.warningType === WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO &&
    !warning.data?.officeType &&
    !warning.data?.partyId
  )
