import { FilingNames, FilingTypes } from '@bcrs-shared-components/enums'
import { useI18n } from 'vue-i18n'

/** check if the TodoItemI or TaskApiHeaderI has a certain filing type */
export const isTodoFilingType = (item: TodoItemI | TaskApiHeaderI, filingType: FilingTypes): boolean => {
  return item.name === filingType
}

/**
 * Converts the filing type to a filing name.
 * @param type the filing type to convert
 * @param agmYear the AGM Year to be appended to the filing name (optional)
 * @param subType the filing subtype (optional)
 * @param filingStatus the filing status (optional)
 * @returns the filing name
 */
export const filingTypeToName = (
  type: FilingTypes,
  agmYear = null as string,
  subType: FilingSubTypeE = null,
  filingStatus: FilingStatusE = null
): string => {
  const { t, te } = useI18n()
  if (!type) {
    return 'Unknown Type' // safety check
  }

  if (type === FilingTypes.CONTINUATION_IN) {
    if (
      filingStatus === FilingStatusE.DRAFT ||
      filingStatus === FilingStatusE.AWAITING_REVIEW ||
      filingStatus === FilingStatusE.CHANGE_REQUESTED
    ) {
      return te('filingTypes.continuationAuthorization')
        ? t('filingTypes.continuationAuthorization')
        : FilingNames.CONTINUATION_AUTHORIZATION
    } else {
      return te('filingTypes.continuationIn')
        ? t('filingTypes.continuationIn')
        : FilingNames.CONTINUATION_IN_APPLICATION
    }
  }

  if (subType !== null) {
    return te(`filingTypes.${type}SubTypes.${subType}`)
      ? t(`filingTypes.${type}SubTypes.${subType}`, { agmYear })
      : filingTypeToName(type, agmYear, null, filingStatus)
  }
  return te(`filingTypes.${type}`) ? t(`filingTypes.${type}`, { agmYear }) : camelCaseToWords(type)
}

/**
 * Check if the TodoItemI or TaskApiHeaderI is a staff filing todo.
 * @param item the TodoItemI or TaskApiHeaderI to check
 * @returns true if it's a staff filing todo
 */
export const isStaffTodo = (item: TodoItemI | TaskApiHeaderI): boolean => {
  return item.name === FilingTypes.AMALGAMATION_OUT ||
    item.name === FilingTypes.CONTINUATION_OUT ||
    item.name === FilingTypes.CONVERSION ||
    item.name === FilingTypes.CORRECTION ||
    item.name === FilingTypes.RESTORATION ||
    item.name === FilingTypes.NOTICE_OF_WITHDRAWAL
}

/**
 * Converts a string in "camelCase" (or "PascalCase") to a string of separate, title-case words,
 * suitable for a title or proper name.
 * @param s the string to convert
 * @returns the converted string
 */
export const camelCaseToWords = (s: string): string => {
  const words = s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  // SPECIAL CASE: convert 'Agm' to uppercase
  return words.replace('Agm', 'AGM')
}

/**
 * Converts a dissolution subtype to a filing name.
 * @param isEntityFirm whether this entity is a firm
 * @param subType the dissolution subtype
 * @returns the filing name
 */
export const dissolutionTypeToName = (isEntityFirm: boolean, subType: FilingSubTypeE): string => {
  switch (subType) {
    case FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE: return FilingNames.DISSOLUTION_ADMINISTRATIVE
    case FilingSubTypeE.DISSOLUTION_INVOLUNTARY: return 'Dissolved for Failure to File'
    case FilingSubTypeE.DISSOLUTION_VOLUNTARY: return (
      isEntityFirm ? FilingNames.DISSOLUTION_FIRM : FilingNames.DISSOLUTION_VOLUNTARY
    )
  }
  return FilingNames.UNKNOWN
}
