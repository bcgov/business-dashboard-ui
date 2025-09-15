import { FilingNames, FilingTypes } from '@bcrs-shared-components/enums'

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
  if (!type) {
    return 'Unknown Type' // safety check
  }
  switch (type) {
    case FilingTypes.ADMIN_FREEZE:
      // FUTURE: add freeze/unfreeze checks here
      return FilingNames.ADMIN_FREEZE
    case FilingTypes.AGM_EXTENSION: return FilingNames.AGM_EXTENSION
    case FilingTypes.AGM_LOCATION_CHANGE: return FilingNames.AGM_LOCATION_CHANGE
    case FilingTypes.ALTERATION: return FilingNames.ALTERATION
    case FilingTypes.AMALGAMATION_APPLICATION:
      if (subType === FilingSubTypeE.AMALGAMATION_HORIZONTAL) {
        return `${FilingNames.AMALGAMATION_APPLICATION} Short-form (Horizontal)`
      }
      if (subType === FilingSubTypeE.AMALGAMATION_REGULAR) {
        return `${FilingNames.AMALGAMATION_APPLICATION} (Regular)`
      }
      if (subType === FilingSubTypeE.AMALGAMATION_VERTICAL) {
        return `${FilingNames.AMALGAMATION_APPLICATION} Short-form (Vertical)`
      }
      return FilingNames.AMALGAMATION_APPLICATION
    case FilingTypes.ANNUAL_REPORT: return FilingNames.ANNUAL_REPORT + (agmYear ? ` (${agmYear})` : '')
    case FilingTypes.CHANGE_OF_ADDRESS: return FilingNames.CHANGE_OF_ADDRESS
    case FilingTypes.CHANGE_OF_COMPANY_INFO: return FilingNames.CHANGE_OF_COMPANY_INFO
    case FilingTypes.CHANGE_OF_DIRECTORS: return FilingNames.CHANGE_OF_DIRECTORS
    case FilingTypes.CHANGE_OF_OFFICERS: return FilingNames.CHANGE_OF_OFFICERS
    case FilingTypes.CHANGE_OF_NAME: return FilingNames.CHANGE_OF_NAME
    case FilingTypes.CHANGE_OF_REGISTRATION: return FilingNames.CHANGE_OF_REGISTRATION
    case FilingTypes.CONTINUATION_IN:
      if ([FilingStatusE.DRAFT, FilingStatusE.AWAITING_REVIEW, FilingStatusE.CHANGE_REQUESTED].includes(filingStatus)) {
        return FilingNames.CONTINUATION_AUTHORIZATION
      } else { return FilingNames.CONTINUATION_IN_APPLICATION }
    case FilingTypes.CONVERSION: return FilingNames.CONVERSION
    case FilingTypes.CORRECTION: return FilingNames.CORRECTION
    case FilingTypes.COURT_ORDER: return FilingNames.COURT_ORDER
    case FilingTypes.DISSOLUTION:
      // FUTURE: move dissolution subtype checks here
      return FilingNames.DISSOLUTION
    case FilingTypes.DISSOLVED: return FilingNames.DISSOLVED
    case FilingTypes.INCORPORATION_APPLICATION: return FilingNames.INCORPORATION_APPLICATION
    case FilingTypes.REGISTRARS_NOTATION: return FilingNames.REGISTRARS_NOTATION
    case FilingTypes.REGISTRARS_ORDER: return FilingNames.REGISTRARS_ORDER
    case FilingTypes.REGISTRATION: return FilingNames.REGISTRATION
    case FilingTypes.RESTORATION:
      if (subType === FilingSubTypeE.LIMITED_RESTORATION_TO_FULL) { return FilingNames.RESTORATION_CONVERSION }
      if (subType === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) { return FilingNames.RESTORATION_EXTENSION }
      if (subType === FilingSubTypeE.FULL_RESTORATION) { return FilingNames.RESTORATION_FULL }
      if (subType === FilingSubTypeE.LIMITED_RESTORATION) { return FilingNames.RESTORATION_LIMITED }
      return FilingNames.RESTORATION_APPLICATION
    case FilingTypes.SPECIAL_RESOLUTION: return FilingNames.SPECIAL_RESOLUTION
    case FilingTypes.TRANSITION: return FilingNames.TRANSITION_APPLICATION
    case FilingTypes.PUT_BACK_ON: return FilingNames.PUT_BACK_ON
    case FilingTypes.NOTICE_OF_WITHDRAWAL: return FilingNames.NOTICE_OF_WITHDRAWAL
  }
  // fallback for unknown filings
  return camelCaseToWords(type)
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
