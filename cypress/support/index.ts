// cypress/support/index.ts
import { ApiResponseFilingI } from '../../src/interfaces/filing-i'
import { BusinessI } from '../../src/interfaces/business-i'

declare global {
  namespace Cypress {
    interface Chainable {
      interceptBusinessInfo (identifier: string, legalType: string, isHistorical?: boolean): Chainable<null>,

      interceptBusinessInfoFor (business: BusinessI): Chainable<null>,

      interceptBusinessContact (identifier: string, legalType: string): Chainable<null>,

      interceptAffiliationRequests (
        hasAffiliationInvitations: boolean, hasAffiliationInvitationError: boolean): Chainable<null>,

      interceptAddresses (legalType: string): Chainable<null>,

      interceptParties (legalType: string, hasCustodian: boolean): Chainable<null>,

      interceptPayApiResponse (code: string): Chainable<null>,

      interceptTasks (fixture: string): Chainable<null>,

      interceptFilingHistory (businessIdentifier: string, filings: ApiResponseFilingI[]): Chainable<null>,

      interceptAuthorizations (businessIdentifier: string): Chainable<null>,
      
      interceptAuthorizedActions (actions: string[]): Chainable<null>,
        
      interceptAllowableActions (isStaff: boolean, legalType?: string, state?: string): Chainable<null>,

      visitBusinessDash (
        identifier?: string,
        legalType?: string,
        isHistorical?: boolean,
        hasAffiliationInvitations?: boolean,
        hasAffiliationInvitationError?: boolean,
        taskFixture?: string
      ): Chainable,

      visitBusinessDashFor (
        path: string,
        identifier?: string,
        hasAffiliationInvitations?: boolean,
        hasAffiliationInvitationError?: boolean,
        taskFixture?: string,
        filings?: ApiResponseFilingI[],
        asStaff?: boolean
      ): Chainable,

      visitTempBusinessDash (draftFiling?: unknown, asStaff?: boolean): Chainable

      visitBusinessDashAuthError (identifier?: string, legalType?: string, errorType?: string): Chainable

      visitTempBusinessDashAuthError (errorType?: string, draftFiling?: unknown): Chainable
    }
  }
}
