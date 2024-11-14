import { ErrorCategoryE } from '~/enums/error-category-e'
import { ErrorCodeE } from '~/enums/error-code-e'

export interface ErrorI {
  category: ErrorCategoryE,
  detail?: string,
  message: string,
  statusCode: number | null,
  type?: ErrorCodeE
}

export const AccountAccessError: ErrorI = {
  category: ErrorCategoryE.ACCOUNT_ACCESS,
  message: 'Account not authorized to access this business dashboard',
  statusCode: 403,
  type: ErrorCodeE.AUTH_ENTITY_ACCESS_ERROR
}
