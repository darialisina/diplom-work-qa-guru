import { expect, Locator, Page } from '@playwright/test'

export class FirewallPage {
  page: Page
  configList: FirewallPageConfigList
  summary: FirewallPageSummary
  modal: FirewallPageModal
 
  constructor(page: Page) {
    this.page = page
  this.configList = new FirewallPageConfigList(page)
  this.summary = new FirewallPageSummary(page)
  this.modal = new FirewallPageModal(page)
  }
 
  async open() {
  await this.page.goto(`/prices/calculator/?product=firewall`)
  }
 }

 // Компонент для списка конфигураций
class FirewallPageConfigList { 
  summary: FirewallPageSummary
  configurationCount: Locator
  sortButton: Locator
  sortTypeButton: Locator
  configName: Locator
  configPrice: Locator


  constructor(private page: Page) {
    this.summary = new FirewallPageSummary(page)

    // Кол-во конфигураций в списке
    this.configurationCount = page.locator('.firewall-configurations__quantity')

    // Сортировка
    this.sortButton = page.locator('.firewall-configurations__sort button').first()
    this.sortTypeButton = page.locator('.firewall-configurations__sort-slot button')

    // Карточки конфигураций
    this.configName = page.locator('.firewall-card__title .firewall-card__name')
    this.configPrice = page.locator('.firewall-card__prices')
  }

 
  // Получить состояние списка конфигураций
  async getCalculatorCondition() {
    return {
      configList: await this.configName.allInnerTexts(),
      configCount: await this.configurationCount.innerText()
    }
  }

  // Возвращаем, отсортирован ли список по цене
  async configIsSorted(order: string) {
    const configPriceArray = await this.summary.cropTextArrayAndConvertToNumber(this.configPrice)
    for (let i = 1; i < configPriceArray.length; i++) {

      if (order == 'Самая высокая цена' || order == 'Самая низкая цена') {

        if (order == 'Самая высокая цена' && configPriceArray[i] > configPriceArray[i - 1]) {
          return false
        }
        else if (order == 'Самая низкая цена' && configPriceArray[i] < configPriceArray[i - 1]) {
          return false
        }
      }
    }
    return true
  }

   // Выбрать вариант сортировки
   async chooseSorting(type: string) {
    const typeLocator = this.sortTypeButton.filter({ hasText: type })

    await this.sortButton.click()
    await typeLocator.click()
  }
  
  // Получить название определенной конфигурации
  async getConfigName(index: number) {
    return await this.configName.nth(index).innerText()
  }

   // Получить стоимость определенной конфигурации
  async getConfigPrices(index: number) {
    return {
      cardPrice: await this.summary.convertToNumber(this.configPrice.nth(index)),
      summaryPrice: await this.summary.convertToNumber(this.summary.summaryPointsPrices.nth(index))
    }
  }

 }

 // Компонент для саммари
class FirewallPageSummary {
  textInfo: Locator
  summaryDeleteCalc: Locator
  summaryDeleteConfig: Locator
  summaryConfigName: Locator
  totalPrice: Locator
  sumPriceTitle: Locator
  summaryPointsPrices: Locator
  deleteConfigBtn: Locator
  summaryCardCollapse: Locator
  confirmDeleteButton: Locator

  constructor(private page: Page) {
    this.textInfo = page.locator('.single-summary__total.h4 p')
    this.summaryDeleteConfig = page.locator('.single-summary-card__section .delete-button')
    this.summaryDeleteCalc = page.locator('.single-summary-card__title .delete-button')
    this.deleteConfigBtn = page.locator('[data-qa="hypercalc-section__button_delete_vdc_summary"]')
    this.summaryPointsPrices = page.locator('[data-qa="hypercalc__summary-service-price"]')
    this.summaryCardCollapse = page.locator('.single-summary-card__service-collapse')
    this.summaryConfigName = page.locator('[data-qa="hypercalc-summary_section-title"]')
    this.confirmDeleteButton = page.locator('.ant-popover-inner .ant-btn-primary')
    this.totalPrice = page.locator('.single-summary-card__total-price')
    this.sumPriceTitle = page.locator('.single-summary__total-price')

  }
 
  // Подтвердить удаление конфигурации из саммари
  async alertDelete() {
    const alert = this.page.locator('.ant-popover')
    const yesButton = alert.locator('.ant-btn-primary')
    await yesButton.click()
  }
  // Удалить все конфигурации из саммари
  async deleteAllServers() {
    await this.summaryDeleteCalc.click()
    await this.alertDelete()
  }
  // Раскрыть все пугкты конфигураций в саммари
  async collapseSummary() {
    const collapseBtns = await this.summaryCardCollapse.all()
    for (let i = 0; i < collapseBtns.length - 1; i++) {
      await collapseBtns[i].click()
    }
  }

  // Проверка суммы цен в саммари
  async checkPricesAfterChanges(countPrice: number) {
    const totalPriceAfterChanges = await this.convertToNumber(this.totalPrice)
    const sumPriceAfterChanges = await this.convertToNumber(this.sumPriceTitle)
    const pricesServiceArrayAfterChanges = await this.cropTextArrayAndConvertToNumber(this.summaryPointsPrices)

    expect.soft(totalPriceAfterChanges).toBe(sumPriceAfterChanges)
    expect.soft(pricesServiceArrayAfterChanges.length).toBe(countPrice)
    expect.soft(pricesServiceArrayAfterChanges.slice(1).every(item => item != 0)).toBeTruthy()
    expect.soft(Math.round(await this.sumAllValueNumbers(pricesServiceArrayAfterChanges)))
      .toEqual(Math.round(totalPriceAfterChanges))
  }

    // Сложение значений из поступившего массива
    async sumAllValueNumbers(arrayValue: number[]) {
      const reducer = (accumulator: number, currentValue: number) => accumulator + currentValue
      const sumAllPrices = Number(((arrayValue.reduce(reducer)).toFixed(2)))
      return sumAllPrices
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

 // Компонент для модального окна
class FirewallPageModal { 
  addConfigButtons: Locator
  modalTitle: Locator
  modalNumInput: Locator
  modalAddButton: Locator
  modalRegionInput: Locator
  modalPoolInput: Locator
  modalRegionList: Locator
  modalItem: Locator
  modalWindow: Locator

  constructor(private page: Page) {
    // Модальное окно добавления конфигурации
    this.addConfigButtons = page.locator('.firewall-card__btn button')
    this.modalTitle = page.locator('.ant-modal-header h3')
    this.modalNumInput = page.locator('.add-modal .s-input-number__wrapper input')
    this.modalAddButton = page.locator('.add-modal__btns button')
    this.modalItem = page.locator('.add-modal__item')
    this.modalRegionInput = this.modalItem.filter({ hasText: 'Регион' }).locator('.ant-select-selection__rendered')
    this.modalPoolInput = this.modalItem.filter({ hasText: 'Пул' }).locator('.ant-select-selection__rendered')
    this.modalRegionList = this.modalItem.filter({ hasText: 'Регион' }).locator('.ant-select-dropdown-menu-item')
    this.modalWindow = page.locator('.ant-modal-content')
  }
 
  // Добавить конфигурацию в расчет
  async addConfigInSummary(index = 0, firewallCount = '1', region = 'Санкт-Петербург') {
    await this.addConfigButtons.nth(index).click()

    const modalTitleText = await this.modalTitle.innerText()
    await this.modalNumInput.fill(firewallCount)

    let haveRegionInput = await this.modalRegionInput.count()
    if (region != 'Санкт-Петербург' && haveRegionInput != 0) {
      await this.modalRegionInput.click()
      await this.modalRegionList.filter({ hasText: region }).click()
    }

    await this.modalAddButton.click()
    return modalTitleText
  }
 }

// export class FirewallPage1 {



//   constructor(page: Page) {
//     this.page = page

//     // Кол-во конфигураций в списке
//     this.configurationCount = page.locator('.firewall-configurations__quantity')

//     // Сортировка
//     this.sortButton = page.locator('.firewall-configurations__sort button').first()
//     this.sortTypeButton = page.locator('.firewall-configurations__sort-slot button')

//     // Карточки конфигураций
//     this.configName = page.locator('.firewall-card__title .firewall-card__name')
//     this.configPrice = page.locator('.firewall-card__prices')
//     this.addConfigButtons = page.locator('.firewall-card__btn button')


//     // Саммари
//     this.textInfo = page.locator('.single-summary__total.h4 p')
//     this.summaryDeleteConfig = page.locator('.single-summary-card__section .delete-button')
//     this.summaryDeleteCalc = page.locator('.single-summary-card__title .delete-button')
//     this.deleteConfigBtn = page.locator('[data-qa="hypercalc-section__button_delete_vdc_summary"]')
//     this.summaryPointsPrices = page.locator('[data-qa="hypercalc__summary-service-price"]')
//     this.summaryCardCollapse = page.locator('.single-summary-card__service-collapse')
//     this.summaryConfigName = page.locator('[data-qa="hypercalc-summary_section-title"]')
//     this.confirmDeleteButton = page.locator('.ant-popover-inner .ant-btn-primary')
//     this.totalPrice = page.locator('.single-summary-card__total-price')
//     this.sumPriceTitle = page.locator('.single-summary__total-price')

//     // Модальное окно добавления конфигурации
//     this.modalTitle = page.locator('.ant-modal-header h3')
//     this.modalNumInput = page.locator('.add-modal .s-input-number__wrapper input')
//     this.modalAddButton = page.locator('.add-modal__btns button')
//     this.modalItem = page.locator('.add-modal__item')
//     this.modalRegionInput = this.modalItem.filter({ hasText: 'Регион' }).locator('.ant-select-selection__rendered')
//     this.modalPoolInput = this.modalItem.filter({ hasText: 'Пул' }).locator('.ant-select-selection__rendered')
//     this.modalRegionList = this.modalItem.filter({ hasText: 'Регион' }).locator('.ant-select-dropdown-menu-item')
//     this.modalWindow = page.locator('.ant-modal-content')
//   }

//   // Открыть страницу "Межсетевые экраны"
//   async open() {
//     await this.page.goto(`/prices/calculator/?product=firewall`)
//   }

//   // Получить состояние списка конфигураций
//   async getCalculatorCondition() {
//     return {
//       configList: await this.configName.allInnerTexts(),
//       configCount: await this.configurationCount.innerText()
//     }
//   }

//   // Возвращаем, отсортирован ли список по цене
//   async configIsSorted(order: string) {
//     const configPriceArray = await this.cropTextArrayAndConvertToNumber(this.configPrice)
//     for (let i = 1; i < configPriceArray.length; i++) {

//       if (order == 'Самая высокая цена' || order == 'Самая низкая цена') {

//         if (order == 'Самая высокая цена' && configPriceArray[i] > configPriceArray[i - 1]) {
//           return false
//         }
//         else if (order == 'Самая низкая цена' && configPriceArray[i] < configPriceArray[i - 1]) {
//           return false
//         }
//       }
//     }
//     return true
//   }

//   // Выбрать вариант сортировки
//   async chooseSorting(type: string) {
//     const typeLocator = this.sortTypeButton.filter({ hasText: type })

//     await this.sortButton.click()
//     await typeLocator.click()
//   }

//   // Добавить конфигурацию в расчет
//   async addConfigInSummary(index = 0, firewallCount = '1', region = 'Санкт-Петербург') {
//     await this.addConfigButtons.nth(index).click()

//     const modalTitleText = await this.modalTitle.innerText()
//     await this.modalNumInput.fill(firewallCount)

//     let haveRegionInput = await this.modalRegionInput.count()
//     if (region != 'Санкт-Петербург' && haveRegionInput != 0) {
//       await this.modalRegionInput.click()
//       await this.modalRegionList.filter({ hasText: region }).click()
//     }

//     await this.modalAddButton.click()
//     return modalTitleText
//   }

//   // Удалить все конфигурации из саммари
//   async deleteAllServers() {
//     await this.summaryDeleteCalc.click()
//     await this.alertDelete()
//   }

//   // Раскрыть все пугкты конфигураций в саммари
//   async collapseSummary() {
//     const collapseBtns = await this.summaryCardCollapse.all()
//     for (let i = 0; i < collapseBtns.length - 1; i++) {
//       await collapseBtns[i].click()
//     }
//   }

//   // Получить название определенной конфигурации
//   async getConfigName(index: number) {
//     return await this.configName.nth(index).innerText()
//   }

//   // Получить стоимость определенной конфигурации
//   async getConfigPrices(index: number) {
//     return {
//       cardPrice: await this.convertToNumber(this.configPrice.nth(index)),
//       summaryPrice: await this.convertToNumber(this.summaryPointsPrices.nth(index))
//     }
//   }

//   // Проверка суммы цен в саммари
//   async checkPricesAfterChanges(countPrice: number) {
//     const totalPriceAfterChanges = await this.convertToNumber(this.totalPrice)
//     const sumPriceAfterChanges = await this.convertToNumber(this.sumPriceTitle)
//     const pricesServiceArrayAfterChanges = await this.cropTextArrayAndConvertToNumber(this.summaryPointsPrices)

//     expect.soft(totalPriceAfterChanges).toBe(sumPriceAfterChanges)
//     expect.soft(pricesServiceArrayAfterChanges.length).toBe(countPrice)
//     expect.soft(pricesServiceArrayAfterChanges.slice(1).every(item => item != 0)).toBeTruthy()
//     expect.soft(Math.round(await this.sumAllValueNumbers(pricesServiceArrayAfterChanges)))
//       .toEqual(Math.round(totalPriceAfterChanges))
//   }

//   // Сложение значений из поступившего массива
//   async sumAllValueNumbers(arrayValue: number[]) {
//     const reducer = (accumulator: number, currentValue: number) => accumulator + currentValue
//     const sumAllPrices = Number(((arrayValue.reduce(reducer)).toFixed(2)))
//     return sumAllPrices
//   }

//     // Подтвердить удаление конфигурации из саммари
//     async alertDelete() {
//       const alert = this.page.locator('.ant-popover')
//       const yesButton = alert.locator('.ant-btn-primary')
//       await yesButton.click()
//     }
  
//     // Преобразовать строку в число
//     async convertToNumber(priceLocator: Locator) {
//       const priceLocatorGetText = await priceLocator.innerText()
//       const cleanAndConvertPrice = Number(priceLocatorGetText.replace(/[^\d,]/g, '').replace(',', '.'))
  
//       return cleanAndConvertPrice
//     }
  
//     // Преобразовать массив строк в числа
//     async cropTextArrayAndConvertToNumber(arrayPriceLocator: Locator) {
//       const pricesServiceArray = await arrayPriceLocator.allInnerTexts()
//       return pricesServiceArray.map(text => {
//         const match = text.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/)
//         return parseFloat(match ? match[0] : '0')
//       })
//     }

// }