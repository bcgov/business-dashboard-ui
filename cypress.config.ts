import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    requestTimeout: 10000, //double the default timeout
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
