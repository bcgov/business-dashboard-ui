import { describe, it, expect } from 'vitest'
import type { CommentIF } from '@bcrs-shared-components/interfaces'

import type { ApiResponseFilingI } from '#imports'
import { getFilingDetailComment } from '#imports'

// the filing was submitted at this moment; the comment entered during the filing shares this timestamp
const FILED_GMT = 'Wed, 31 Jan 2024 19:26:24 GMT'
const FILED_UTC = '2024-01-31T19:26:24.000000+00:00' // same instant, API (UTC) format

/** Builds a minimal filing exposing only the fields the helper reads. */
const buildFiling = (
  comments: Array<CommentIF> | undefined,
  dates: { submittedDate?: string, paymentDate?: string } = { submittedDate: FILED_GMT }
): ApiResponseFilingI => ({
  ...dates,
  comments
} as unknown as ApiResponseFilingI)

/** Builds a comment with the given timestamp. */
const comment = (timestamp: string, text = 'Filing text goes here.'): CommentIF => ({
  comment: text,
  submitterDisplayName: 'BC Registries Staff',
  timestamp
})

describe('getFilingDetailComment', () => {
  it('returns the comment whose timestamp matches the filing submitted date', () => {
    const filingComment = comment(FILED_UTC, 'The quick brown fox.')
    const filing = buildFiling([filingComment])

    expect(getFilingDetailComment(filing)).toBe(filingComment)
  })

  it('matches against the payment date when there is no submitted date', () => {
    const filingComment = comment(FILED_UTC)
    const filing = buildFiling([filingComment], { paymentDate: FILED_GMT })

    expect(getFilingDetailComment(filing)).toBe(filingComment)
  })

  it('picks the filing-time comment out of a list that also has later staff comments', () => {
    const filingComment = comment(FILED_UTC, 'Detail entered at filing time.')
    const laterStaffComment = comment('2024-01-31T20:05:00.000000+00:00', 'Added later by staff.')
    // comments are sorted newest-first, so the filing-time comment is last in the list
    const filing = buildFiling([laterStaffComment, filingComment])

    expect(getFilingDetailComment(filing)).toBe(filingComment)
  })

  it('returns null when every comment is clearly after the filing time', () => {
    const filing = buildFiling([
      comment('2024-01-31T20:05:00.000000+00:00'),
      comment('2024-02-01T08:00:00.000000+00:00')
    ])

    expect(getFilingDetailComment(filing)).toBeNull()
  })

  it('matches at the tolerance boundary and rejects just beyond it', () => {
    // default tolerance is 2000ms: a comment 2s after the filing matches, 3s after does not
    const atBoundary = comment('2024-01-31T19:26:26.000000+00:00') // +2s
    const beyondBoundary = comment('2024-01-31T19:26:27.000000+00:00') // +3s

    expect(getFilingDetailComment(buildFiling([atBoundary]))).toBe(atBoundary)
    expect(getFilingDetailComment(buildFiling([beyondBoundary]))).toBeNull()
  })

  it('honours a custom tolerance', () => {
    const offByFiveSeconds = comment('2024-01-31T19:26:29.000000+00:00') // +5s
    const filing = buildFiling([offByFiveSeconds])

    expect(getFilingDetailComment(filing)).toBeNull() // outside default 2000ms
    expect(getFilingDetailComment(filing, 5000)).toBe(offByFiveSeconds) // within 5000ms
  })

  it('returns null when there are no comments', () => {
    expect(getFilingDetailComment(buildFiling([]))).toBeNull()
    expect(getFilingDetailComment(buildFiling(undefined))).toBeNull()
  })

  it('returns null when the filing has no submitted or payment date', () => {
    const filing = buildFiling([comment(FILED_UTC)], {})

    expect(getFilingDetailComment(filing)).toBeNull()
  })
})
