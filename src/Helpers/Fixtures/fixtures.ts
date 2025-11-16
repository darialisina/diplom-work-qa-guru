import { test as base, expect } from '@playwright/test'
import { App } from '../../PageObject/appPage'
import { Api } from "../../Services/apiService"

type Fixtures = {
  app: App
  api: Api
  apiToken
  goFirewallPage: void
  goMainPage: void
}

export const test = base.extend<Fixtures>({

  app: async ({ page }, use) => {
    const app = new App(page)
    await use(app)
  },

  api: async ({ request }, use) => {
    const api = new Api(request)
    await use(api)
  },

  apiToken: async ({ api }, use, testinfo) => {
    const response = await api.challenger.post(testinfo)
    const headers = response.headers()
    const token = headers["x-challenger"]
    await use(token)
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