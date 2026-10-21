import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // The dashboard fires its API calls in a dependent chain (settings -> account -> products -> ...),
    // so on a slow CI runner the default 5s request timeout expires before later requests are even sent.
    requestTimeout: 15000,
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
