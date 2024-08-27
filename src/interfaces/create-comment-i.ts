export interface CreateCommentI {
  // if this is specified on a filing comment it fails, if it is NOT specified on a business comment it fails
  // the error in either case just says that comment/comment is invalid in the schema which isn't super helpful
  businessId?: string
  comment: string
  filingId?: number
}
