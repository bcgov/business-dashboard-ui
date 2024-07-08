import { AffiliationInvitationStatusE, AffiliationInvitationTypeE } from '~/enums/affiliation-invitation-e'

export interface AffiliationInvitationI {
  id: number
  status: AffiliationInvitationStatusE
  type: AffiliationInvitationTypeE
  businessIdentifier: string,
  additionalMessage: string
  fromOrg: {
    name: string
    id: number
  },
  toOrg: {
    name: string
    id: number
  },
}
