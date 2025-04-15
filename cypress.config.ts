import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    "chromeWebSecurity": false, // To avoid CORS issues.
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
