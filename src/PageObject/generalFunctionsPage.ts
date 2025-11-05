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

  // Подтвердить удаление конфигурации из саммари
  async alertDelete() {
    const alert = this.page.locator('.ant-popover')
    const yesButton = alert.locator('.ant-btn-primary')
    await yesButton.click()
  }

  // Преобразовать строку в число
  async convertToNumber(priceLocator: Locator) {
    const priceLocatorGetText = await priceLocator.innerText()
    const cleanAndConvertPrice = Number(priceLocatorGetText.replace(/[^\d,]/g, '').replace(',', '.'))

    return cleanAndConvertPrice
  }

  // Преобразовать массив строк в числа
  async cropTextArrayAndConvertToNumber(arrayPriceLocator: Locator) {
    const pricesServiceArray = await arrayPriceLocator.allInnerTexts()
    return pricesServiceArray.map(text => {
      const match = text.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/)
      return parseFloat(match ? match[0] : '0')
    })
  }

}