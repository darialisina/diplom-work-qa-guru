import { test as base, expect } from '@playwright/test'
import { App } from '../../PageObject/appPage'

type Fixtures = {
  app: App
  goFirewallPage: void
  goMainPage: void
}

export const test = base.extend<Fixtures>({

  app: async ({ page }, use) => {
    const app = new App(page);
    await use(app);
  },

  goFirewallPage: async ({ app }, use) => {
    await app.firewallPage.open()
    await use()
    await app.generalFunctionsPage.close()
  },

  goMainPage: async ({ app }, use) => {
    await app.mainPage.open()
    await use()
    await app.generalFunctionsPage.close()
  },

})

export { expect }