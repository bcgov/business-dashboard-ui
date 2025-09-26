import { FilingNames, FilingTypes } from '@bcrs-shared-components/enums'
import { camelCaseToWords } from '~/utils/todo/task-filing/helper'

export const useFilingTypeToName = () => {
  /**
   * Converts the filing type to a filing name.
   * @param type the filing type to convert
   * @param agmYear the AGM Year to be appended to the filing name (optional)
   * @param subType the filing subtype (optional)
   * @param filingStatus the filing status (optional)
   * @returns the filing name
   */
  function filingTypeToName (
    type: FilingTypes,
    agmYear = null as string,
    subType: FilingSubTypeE = null,
    filingStatus: FilingStatusE = null
  ): string {
    const { t, te } = useNuxtApp().$i18n
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

  return {
    filingTypeToName
  }
}
