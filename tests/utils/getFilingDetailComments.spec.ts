import { describe, it, expect } from 'vitest'
import type { CommentIF } from '@bcrs-shared-components/interfaces'

import type { ApiResponseFilingI } from '#imports'
import { CommentTypeE, getFilingDetailComments } from '#imports'

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

describe('getFilingDetailComments', () => {
  it('returns the FILING-type comment', () => {
    const filingComment = comment(CommentTypeE.FILING, 'Entered at filing time.')

    expect(getFilingDetailComments(buildFiling([filingComment]))).toEqual([filingComment])
  })

  it('returns every FILING comment (eg, a correction records two)', () => {
    const first = comment(CommentTypeE.FILING, 'This filing was corrected on 2024-01-31.')
    const second = comment(CommentTypeE.FILING, 'Reason for the correction.')
    const filing = buildFiling([first, second])

    expect(getFilingDetailComments(filing)).toEqual([first, second])
  })

  it('picks the FILING comments out of a list that also has STAFF comments, preserving order', () => {
    const staffBefore = comment(CommentTypeE.STAFF, 'Added by staff.')
    const filingComment = comment(CommentTypeE.FILING, 'Detail entered at filing time.')
    const staffAfter = comment(CommentTypeE.STAFF, 'Added later by staff.')
    const filing = buildFiling([staffBefore, filingComment, staffAfter])

    expect(getFilingDetailComments(filing)).toEqual([filingComment])
  })

  it('returns an empty array when every comment is STAFF', () => {
    const filing = buildFiling([comment(CommentTypeE.STAFF), comment(CommentTypeE.STAFF)])

    expect(getFilingDetailComments(filing)).toEqual([])
  })

  it('ignores comments with no commentType', () => {
    const filing = buildFiling([comment(undefined), comment(undefined)])

    expect(getFilingDetailComments(filing)).toEqual([])
  })

  it('returns an empty array when there are no comments', () => {
    expect(getFilingDetailComments(buildFiling([]))).toEqual([])
    expect(getFilingDetailComments(buildFiling(undefined))).toEqual([])
  })
})
