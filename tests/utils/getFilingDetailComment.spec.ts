import { describe, it, expect } from 'vitest'
import type { CommentIF } from '@bcrs-shared-components/interfaces'

import type { ApiResponseFilingI } from '#imports'
import { CommentTypeE, getFilingDetailComment } from '#imports'

/** Builds a minimal filing exposing only the field the helper reads. */
const buildFiling = (comments: Array<CommentIF> | undefined): ApiResponseFilingI =>
  ({ comments } as unknown as ApiResponseFilingI)

/** Builds a comment of the given type. */
const comment = (commentType: CommentTypeE | undefined, text = 'Filing text goes here.'): CommentIF => ({
  comment: text,
  submitterDisplayName: 'BC Registries Staff',
  timestamp: '2024-01-31T19:26:24.000000+00:00',
  commentType
})

describe('getFilingDetailComment', () => {
  it('returns the FILING-type comment', () => {
    const filingComment = comment(CommentTypeE.FILING, 'Entered at filing time.')

    expect(getFilingDetailComment(buildFiling([filingComment]))).toBe(filingComment)
  })

  it('picks the FILING comment out of a list that also has STAFF comments', () => {
    const staffBefore = comment(CommentTypeE.STAFF, 'Added by staff.')
    const filingComment = comment(CommentTypeE.FILING, 'Detail entered at filing time.')
    const staffAfter = comment(CommentTypeE.STAFF, 'Added later by staff.')
    const filing = buildFiling([staffBefore, filingComment, staffAfter])

    expect(getFilingDetailComment(filing)).toBe(filingComment)
  })

  it('returns null when every comment is STAFF', () => {
    const filing = buildFiling([comment(CommentTypeE.STAFF), comment(CommentTypeE.STAFF)])

    expect(getFilingDetailComment(filing)).toBeNull()
  })

  it('returns the first FILING comment when more than one is present', () => {
    const first = comment(CommentTypeE.FILING, 'first')
    const second = comment(CommentTypeE.FILING, 'second')

    expect(getFilingDetailComment(buildFiling([first, second]))).toBe(first)
  })

  it('ignores comments with no commentType', () => {
    const filing = buildFiling([comment(undefined), comment(undefined)])

    expect(getFilingDetailComment(filing)).toBeNull()
  })

  it('returns null when there are no comments', () => {
    expect(getFilingDetailComment(buildFiling([]))).toBeNull()
    expect(getFilingDetailComment(buildFiling(undefined))).toBeNull()
  })
})
