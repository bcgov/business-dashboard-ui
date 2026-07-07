import '@bcrs-shared-components/interfaces'
import type { CommentTypeE } from '../enums/comment-type-e'

// The shared CommentIF has no commentType; the API now returns it, so add it here.
declare module '@bcrs-shared-components/interfaces' {
  interface CommentIF {
    /** Type of comment: FILING (entered as part of the filing) or STAFF (added by staff). */
    commentType?: CommentTypeE
  }
}
