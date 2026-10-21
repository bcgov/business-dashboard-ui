import { defineConfig } from 'cypress'

/**
 * CI splits the e2e suite across parallel jobs (see .github/workflows/ci.yml, E2E_SHARD).
 * Each named shard runs only its globs; the 'rest' shard runs everything NOT listed here,
 * so a new spec folder is always picked up by some shard without editing this map.
 * Unset E2E_SHARD (local runs) = whole suite.
 */
const SHARDS: Record<string, string[]> = {
  // balanced on measured spec times (~55s each); draft + pending are the two heaviest specs in the suite
  filings: [
    'cypress/e2e/components/filings/**/*.cy.ts',
    'cypress/e2e/components/tombstone/**/*.cy.ts',
    'cypress/e2e/error-flows/**/*.cy.ts'
  ],
  todos: [
    'cypress/e2e/components/todos/draft.cy.ts',
    'cypress/e2e/components/todos/pending.cy.ts'
  ]
}
const shard = process.env.E2E_SHARD
if (shard && shard !== 'rest' && !SHARDS[shard]) {
  throw new Error(`Unknown E2E_SHARD "${shard}" - expected one of: ${Object.keys(SHARDS).join(', ')}, rest`)
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    ...(shard && shard !== 'rest' ? { specPattern: SHARDS[shard] } : {}),
    ...(shard === 'rest' ? { excludeSpecPattern: Object.values(SHARDS).flat() } : {}),
    // The dashboard fires its API calls in a dependent chain (settings -> account -> products -> ...),
    // so on a slow CI runner the default 5s request timeout can expire before later requests are sent.
    // Kept moderate on purpose: a request that has not appeared by now never will, and each retried
    // attempt pays this timeout in full.
    requestTimeout: 8000,
    // Retry timing-sensitive specs in CI only (no retries when running interactively).
    retries: {
      runMode: 2,
      openMode: 0
    },
    setupNodeEvents (on) {
      on('task', {
        log (message) {
          console.info(message)
          return null
        }
      })
    }
  }
})
