import { expect, Locator, Page } from '@playwright/test'
import { GeneralFunctionsPage } from '../PageObject/index'

export class FirewallPage {
  page: Page
  generalFunctionsPage: GeneralFunctionsPage

  configurationCount: Locator
  sortButton: Locator
  sortTypeButton: Locator
  configName: Locator
  configPrice: Locator
  addConfigButtons: Locator
  textInfo: Locator
  summaryDeleteCalc: Locator
  summaryCardCollapse: Locator
  summaryConfigName: Locator
  confirmDeleteButton: Locator
  totalPrice: Locator
  sumPriceTitle: Locator
  modalTitle: Locator
  modalNumInput: Locator
  modalAddButton: Locator
  modalItem: Locator
  modalRegionInput: Locator
  modalPoolInput: Locator
  modalRegionList: Locator
  modalWindow: Locator
  summaryDeleteConfig: Locator
  deleteConfigBtn: Locator
  summaryPointsPrices: Locator


  constructor(page: Page) {
    this.page = page
    this.generalFunctionsPage = new GeneralFunctionsPage(this.page)

    // Кол-во конфигураций в списке
    this.configurationCount = page.locator('.firewall-configurations__quantity')

    // Сортировка
    this.sortButton = page.locator('.firewall-configurations__sort button').first()
    this.sortTypeButton = page.locator('.firewall-configurations__sort-slot button')

    // Карточки конфигураций
    this.configName = page.locator('.firewall-card__title .firewall-card__name')
    this.configPrice = page.locator('.firewall-card__prices')
    this.addConfigButtons = page.locator('.firewall-card__btn button')


    // Саммари
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

    // Модальное окно добавления конфигурации
    this.modalTitle = page.locator('.ant-modal-header h3')
    this.modalNumInput = page.locator('.add-modal .s-input-number__wrapper input')
    this.modalAddButton = page.locator('.add-modal__btns button')
    this.modalItem = page.locator('.add-modal__item')
    this.modalRegionInput = this.modalItem.filter({ hasText: 'Регион' }).locator('.ant-select-selection__rendered')
    this.modalPoolInput = this.modalItem.filter({ hasText: 'Пул' }).locator('.ant-select-selection__rendered')
    this.modalRegionList = this.modalItem.filter({ hasText: 'Регион' }).locator('.ant-select-dropdown-menu-item')
    this.modalWindow = page.locator('.ant-modal-content')
  }

  async open(){
    await this.page.goto(`/prices/calculator/?product=firewall`)
  }

  async getCalculatorCondition(){
    return {
      configList: await this.configName.allInnerTexts(),
      configCount: await this.configurationCount.innerText()
    }
  }

  async configIsSorted(order: string) {
    const configPriceArray = await this.configPrice.all()
    for (let i = 1; i < configPriceArray.length; i++) {

      if (order == 'Самая высокая цена' || order == 'Самая низкая цена'){
      const prevPrice = await this.generalFunctionsPage.convertToNumber(configPriceArray[i - 1])
      const currentPrice = await this.generalFunctionsPage.convertToNumber(configPriceArray[i])

      if (order == 'Самая высокая цена' && currentPrice > prevPrice) {
        return false
      }
      else if (order == 'Самая низкая цена' && currentPrice < prevPrice) {
        return false
      }}

    }
    return true
  }

  async chooseSorting(type: string){
    const typeLocator = this.sortTypeButton.filter({ hasText: type })

    await this.sortButton.click()
    await typeLocator.click()
  }

  // Добавление конфигурации в расчет
  async addConfigInSummary(index = 0, firewallCount = '1', region = 'Санкт-Петербург') {

    // Нажать "Добавить" у указанного по счету сервера
    await this.addConfigButtons.nth(index).click()

    // Сохраняем название сервера в модалке
    const modalTitleText = await this.modalTitle.innerText()

    // Ввод количества нод
    await this.modalNumInput.fill(firewallCount)

    // Наличие инпута региона
    let haveRegionInput = await this.modalRegionInput.count()
    // Изменяем регион
    if (region != 'Санкт-Петербург' && haveRegionInput != 0) {
      // Раскрыть список "Регион"
      await this.modalRegionInput.click()
      await this.modalRegionList.filter({ hasText: region }).click()

    }

    // Нажать "Добавить сервер" в модалке
    await this.modalAddButton.click()

    // Возвращаем название сервера из модалки
    return modalTitleText
  }

  async deleteAllServers(){
    // Удалить добавленный сервер из саммари
    await this.summaryDeleteCalc.click()
    await this.generalFunctionsPage.alertDelete()
  }

  async collapseSummary(){
    // Развернем данные для каждой конфигурации
    const collapseBtns = await this.summaryCardCollapse.all()
    for (let i = 0; i < collapseBtns.length - 1; i++) {
      await collapseBtns[i].click()
    }
  }

  async getConfigName(index: number){
    return await this.configName.nth(index).innerText()
  }

  async checkPricesAfterChanges(countPrice:number) {

    // Цены после изменений
    const totalPriceAfterChanges = await this.generalFunctionsPage.convertToNumber(this.totalPrice)
    const sumPriceAfterChanges = await this.generalFunctionsPage.convertToNumber(this.sumPriceTitle)
    const pricesServiceArrayAfterChanges = await this.generalFunctionsPage.cropTextArrayAndConvertToNumber(this.summaryPointsPrices)

    // Сравнение суммы в карточке саммари и над саммари
    expect.soft(totalPriceAfterChanges).toBe(sumPriceAfterChanges)

    // Количество цен (Без конфигурации)
    expect.soft(pricesServiceArrayAfterChanges.length).toBe(countPrice)

    // Сравнение без первого элемента массива
    expect.soft(pricesServiceArrayAfterChanges.slice(1).every(item => item != 0)).toBeTruthy()

    // Сравнение суммы значений установленных ресурсов с итоговой суммой    
    expect.soft(Math.round(await this.sumAllValueNumbers(pricesServiceArrayAfterChanges)))
    .toEqual(Math.round(totalPriceAfterChanges))
 }

 async sumAllValueNumbers(arrayValue:number[]) {
  const reducer = (accumulator:number, currentValue:number) => accumulator + currentValue
  const sumAllPrices = Number(((arrayValue.reduce(reducer)).toFixed(2)))
  return sumAllPrices
}



}