import { v4 as UUIDv4 } from 'uuid'
import type { AffiliationInvitationI } from '~/interfaces/affiliation-invitation-i'
import type { TodoItemI } from '~/interfaces/todo-i'

export const buildTodoItemIfFromAffiliationInvitation =
  (affiliationInvitation: AffiliationInvitationI, order: number) => {
    const newTodo: TodoItemI = {
      uiUuid: UUIDv4(),
      draftTitle: null,
      enabled: true,
      filingId: -1, // not a filing
      name: null,
      order,
      subtitle: `From: ${affiliationInvitation.fromOrg.name}`,
      status: null,
      title: 'Request for authorization to manage this business',
      affiliationInvitationDetails: {
        id: affiliationInvitation.id,
        fromOrgName: affiliationInvitation.fromOrg.name,
        additionalMessage: affiliationInvitation.additionalMessage || ''
      }
    }
    return newTodo
  }

/**
 * Fetches affiliation invites tied to this entity.
 * @param authApiUrl
 * @param businessId the business identifier (aka entity inc no)
 * @param orgId org which has access rights to display (current logged in org)
 * @returns the axios response
 */
export const fetchAffiliationInvitations = async (authApiUrl: string, businessId: string, orgId: number) => {
  const url = `${authApiUrl}/affiliationInvitations`
  // return axios.get(url, { params: { toOrgId: orgId, businessIdentifier: businessId, statuses: 'PENDING' } })

  return await useBcrosFetch<{ affiliationInvitations: Array<AffiliationInvitationI> }>(url,
    { params: { toOrgId: orgId, businessIdentifier: businessId, statuses: 'PENDING' } })
    .then(({ data, error }) => {
      if (error.value || !data.value) {
        console.warn('fetchAffiliationInvitations() error - invalid response =', error?.value)
        throw new Error('Failed to fetch affiliation invitations')
      }
      return data?.value.affiliationInvitations
    })
}

/**
 * Authorizes or refuses authorization for this invitation.
 * @param authApiUrl
 * @param affiliationInvitationId id of affiliation to approve or not
 * @param isAuthorized boolean stating if invitation is authorized (true) or not authorized (false)
 * @returns the axios response
 */
export const authorizeAffiliationInvitation =
  async (authApiUrl: string, affiliationInvitationId: number, isAuthorized: boolean) => {
    const action = isAuthorized ? 'accept' : 'refuse'
    const authorizePath = `/affiliationInvitations/${affiliationInvitationId}/authorization/${action}`
    const url = authApiUrl + authorizePath

    return await useBcrosFetch<AffiliationInvitationI>(url, { method: 'PATCH' })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('authorizeAffiliationInvitation() error - invalid response =', error?.value)
          throw new Error('failed to approve/refuse affiliationInvitation')
        }
        return data?.value
      })
  }
