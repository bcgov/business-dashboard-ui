import type { FilingTypes } from '@bcrs-shared-components/enums'

export interface PendingItemI {
  title: string,
  name: string,
  expandable: boolean,
  submitter: string,
  submittedDate: string,
  filingType: FilingTypes
}
