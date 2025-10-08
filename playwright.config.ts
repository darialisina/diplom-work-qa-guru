import { defineConfig, devices } from '@playwright/test'

const { BASE_URL, CI} = process.env

const baseUrls = {
  PROD: 'https://selectel.ru',
  MASTER: 'https://master.selectel-ru.stg.sites.selectel.org',
  STG: 'https://web-6133.selectel-ru.stg.sites.selectel.org',
  DEVELOP: 'https://develop.selectel-ru.stg.sites.selectel.org'
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
  reporter: process.env.CI
? [['blob']]
: [['html', { open: 'never' }]],


  use: {
    baseURL: BASE_URL || baseUrls.PROD,
    screenshot: 'only-on-failure',
    actionTimeout: 20 * 1000, // Глобальный таймаут для всех действий с локаторами
    // trace: 'on-first-retry',

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

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !CI,
  // },
})
