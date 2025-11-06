import { defineConfig, devices } from '@playwright/test'

const { BASE_URL, CI} = process.env

const baseUrls = {
  PROD: 'https://selectel.ru'
}


export default defineConfig({
  timeout: 60 * 1000,
  testDir: './tests',
  fullyParallel: true,
  retries: 2,
  workers: CI
? 4
: 5,
  maxFailures: 0,
  reporter: [['line'], ['html', { open: 'never' }], ['allure-playwright']],


  use: {
    baseURL: BASE_URL || baseUrls.PROD,
    screenshot: 'only-on-failure',
    apiURL: 'https://apichallenges.eviltester.com',
    actionTimeout: 20 * 1000, 

    launchOptions: {
      slowMo: 20,
      headless: true
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ]
})
