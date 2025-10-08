import { expect, Locator, Page } from '@playwright/test'
import GeneralFunctionsPage from '../PageObject/generalFunctionsPage'

interface Port {
  name: string
  speed: number
}

interface FirewallConfig {
  interfaces: Port[] | null
  parameters: {
    name: string
    speed: number
  }[] | null
}

export interface ApiConfig {
  uuid: string
  name: string
  config: FirewallConfig
  price_collection?: {
    RUB?: {
      month?: number
    }
  }
}

export default class FirewallPage {
  page: Page
  generalFunctionsPage: GeneralFunctionsPage

  virtualSwitcher: Locator
  hardwareSwitcher: Locator
  configurationCount: Locator
  sortButton: Locator
  popularSort: Locator
  cheapSort: Locator
  expensSort: Locator
  configName: Locator
  configPrice: Locator
  calcContainer: Locator
  performanceFilter: Locator
  priceFilter: Locator
  readinessFilter: Locator
  regionFilter: Locator
  certificatesFilter: Locator
  portsFilter: Locator
  textInfo: Locator
  addConfigButtons: Locator
  modalTitle: Locator
  modalNumInput: Locator
  modalAddButton: Locator
  modalItem: Locator
  modalRegionInput: Locator
  modalPoolInput: Locator
  modalRegionList: Locator
  summaryDeleteConfig: Locator
  summaryDeleteCalc: Locator
  deleteConfigBtn: Locator
  summaryCardCollapse: Locator
  performanceFilterParamTitle: Locator
  performanceFilterParamGroup: Locator
  virtualConfigFW: Locator
  virtualConfigSSL: Locator
  virtualConfigIPS: Locator
  performanceFilterParamDot: Locator
  resetFiltersBtn: Locator
  priceFilterDropdown: Locator
  priceErrorMessage: Locator
  modalWindow: Locator
  virtualCheckboxes: Locator
  summaryConfigName: Locator
  summaryPoints: Locator
  summaryPointsPrices: Locator
  customCard: Locator
  perfomanceCheckbox: Locator
  containerSlider: Locator
  virtualConfigIPSHard: Locator
  readinessCheckboxes: Locator
  configTags: Locator
  regionCheckboxes: Locator
  closeModalWindow: Locator
  certificationCheckboxes: Locator
  portCheckboxes: Locator
  configCard: Locator
  poolCountSelected: Locator
  poolCountList: Locator
  downNumButton: Locator
  upNumButton: Locator
  errorMessage: Locator
  confirmDeleteButton: Locator
  totalPrice: Locator
  sumPriceTitle: Locator

  constructor(page: Page) {
    this.page = page
    this.generalFunctionsPage = new GeneralFunctionsPage(this.page)

    // Свитчер
    this.virtualSwitcher = page.locator('.firewall-calculator__switcher').getByText('Виртуальные')
    this.hardwareSwitcher = page.locator('.firewall-calculator__switcher').getByText('Аппаратные')

    // Кол-во конфигураций в списке
    this.configurationCount = page.locator('.firewall-configurations__quantity')

    // Сортировка
    this.sortButton = page.locator('.firewall-configurations__sort button').first()
    this.popularSort = page.locator('.firewall-configurations__sort-slot button').filter({ hasText: 'По популярности' })
    this.cheapSort = page.locator('.firewall-configurations__sort-slot button').filter({ hasText: 'Самая низкая цена' })
    this.expensSort = page.locator('.firewall-configurations__sort-slot button').filter({ hasText: 'Самая высокая цена' })

    // Карточки конфигураций
    this.configName = page.locator('.firewall-card__title .firewall-card__name')
    this.configPrice = page.locator('.firewall-card__prices')
    this.virtualConfigFW = page.locator('.firewall-card__params').locator('li:nth-child(1)')
    this.virtualConfigIPS = page.locator('.firewall-card__params').locator('li:nth-child(2)')
    this.virtualConfigSSL = page.locator('.firewall-card__params').locator('li:nth-child(3)')
    this.virtualConfigIPSHard = page.locator('.firewall-card__params').locator('li:nth-child(4)')
    this.addConfigButtons = page.locator('.firewall-card__btn button')
    this.configTags = page.locator('.firewall-card__tags')
    this.configCard = page.locator('.firewall-card')

    // Контейнер калькулятора
    this.calcContainer = page.locator('.firewall-calculator')

    // Фильтры
    this.performanceFilter = page.locator('[data-qa="selectel-server-fix-filter-group-performance"]')
    this.performanceFilterParamGroup = page.locator('.fake-select__filter-group')
    this.performanceFilterParamTitle = this.performanceFilterParamGroup.locator('.fake-select__range-filter-title')
    this.perfomanceCheckbox = this.performanceFilterParamGroup.locator('.ant-checkbox-wrapper')
    this.priceFilter = page.locator('[data-qa="selectel-server-fix-filter-group-price"]')
    this.readinessFilter = page.locator('[data-qa="selectel-server-fix-filter-group-readiness"]')
    this.regionFilter = page.locator('[data-qa="selectel-server-fix-filter-group-region"]')
    this.certificatesFilter = page.locator('[data-qa="selectel-server-fix-filter-group-certificates"]')
    this.portsFilter = page.locator('[data-qa="selectel-server-fix-filter-group-ports"]')
    this.resetFiltersBtn = page.locator('.firewall-filters__reset-btn')
    this.priceFilterDropdown = page.locator('.firewall-filters__price-filter-wrapper')
    this.priceErrorMessage = page.locator('.firewall-filters__price-filter-wrapper .s-input-number__additional--error')
    this.containerSlider = page.locator('.fake-select__dropdown .s-range-slider')
    this.readinessCheckboxes = page.locator('.fake-select').filter({ hasText: 'Готовность' }).locator('.ant-checkbox-wrapper')
    this.regionCheckboxes = page.locator('.fake-select').filter({ hasText: 'Регион' }).locator('.ant-checkbox-wrapper')
    this.certificationCheckboxes = page.locator('.fake-select').filter({ hasText: 'Сертификаты' }).locator('.ant-checkbox-wrapper')
    this.portCheckboxes = page.locator('.fake-select').filter({ hasText: 'Порты' }).locator('.ant-checkbox-wrapper')

    // Саммари
    this.textInfo = page.locator('.single-summary__total.h4 p')
    this.summaryDeleteConfig = page.locator('.single-summary-card__section .delete-button')
    this.summaryDeleteCalc = page.locator('.single-summary-card__title .delete-button')
    this.deleteConfigBtn = page.locator('[data-qa="hypercalc-section__button_delete_vdc_summary"]')
    this.summaryCardCollapse = page.locator('.single-summary-card__service-collapse')
    this.summaryConfigName = page.locator('[data-qa="hypercalc-summary_section-title"]')
    this.summaryPoints = page.locator('[data-qa="hypercalc__summary-service-name"]')
    this.summaryPointsPrices = page.locator('[data-qa="hypercalc__summary-service-price"]')
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
    this.virtualCheckboxes = page.locator('.software-add-modal__checkbox-wrap')
    this.closeModalWindow = page.locator('.ant-modal-close-x')
    this.poolCountSelected = page.locator('.ant-select-selection-selected-value .pool-select-option__count')
    this.poolCountList = page.locator('.ant-select-dropdown-menu-item .pool-select-option__count')
    this.downNumButton = page.locator('[aria-label="Decrement number"]')
    this.upNumButton = page.locator('[aria-label="Increment number"]')
    this.errorMessage = page.locator('.add-modal__item .s-input-number__additional--error')

    // Страница
    this.customCard = page.locator('.s-section').filter({ hasText: 'Базовые конфигурации МЭ' }).locator('.custom-card')

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


  normalize = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/межсетевой экран|мэ|сертифицированный/g, '') // Удаляем ключевые слова
      .replace(/\(custom\)|custom/g, '') // Удаляем "(custom)"
      .replace(/[^a-z0-9]/g, ''); // Оставляем только буквы и цифры
  }

  async getMinMaxFromLocators(locator: Locator) {
    const locatorArr = await locator.all()

    // Параллельно конвертируем все найденные элементы в числа
    const numPromises = locatorArr.map(element => this.generalFunctionsPage.convertToNumber(element))
    const numArr = await Promise.all(numPromises)

    // Если массив пуст, возвращаем значения по умолчанию
    if (numArr.length === 0) {
      return { min: 0, max: 0, numArr: [] }
    }

    return {
      min: Math.min(...numArr),
      max: Math.max(...numArr),
    }
  }


  // Преобразование строки в числа и умножение этих значений
  productConvertedNumbers(value: string) {
    let product
    if (value.includes(' × ')) {
      const parts = value.split(' × ')
      const num1 = parseInt(parts[0])
      const num2 = parseInt(parts[1])
      product = num1 * num2
    } else {
      product = parseInt(value)
    }

    return product
  }

  async getPlaceholderAsNumber(inputLocator: Locator) {
    const placeholder = await inputLocator.getAttribute('placeholder')
    const placeholderString = placeholder ?? ''; // Ensure placeholder is a string, default to empty string if null
    const [cleanedValue] = await this.generalFunctionsPage.clearStringArrayWithoutExtractions([placeholderString])

    // Используем правильный regex для удаления всех пробелов и парсим в число
    return parseInt(cleanedValue.replace(/\s/g, ''), 10)
  }

  // Передвижение слайдера в фильтрах
  async moveFilterSlider(pointLocator: Locator, direction: string, stepsCount: number) {
    await pointLocator.focus()

    // Перемещаем поинтер
    for (let i = 0; i < stepsCount; i++) {
      await this.page.keyboard.press(direction)
      await this.page.waitForTimeout(50)
    }
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