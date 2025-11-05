import { expect, Locator, Page } from '@playwright/test'
import { FirewallPage, GeneralFunctionsPage, MainPage } from './index';

export class App {

    page: Page
    generalFunctionsPage: GeneralFunctionsPage
    firewallPage: FirewallPage
    mainPage: MainPage

    constructor(page) {
        this.page = page
        this.generalFunctionsPage = new GeneralFunctionsPage(page)
        this.firewallPage = new FirewallPage(page)
        this.mainPage = new MainPage(page)
    }
}