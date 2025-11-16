import { Page, Locator } from '@playwright/test';

export class GeneralFunctionsPage {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  // Закрыть страницу
  async close() {
    await this.page.close()
  }

}