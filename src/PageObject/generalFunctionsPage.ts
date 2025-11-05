import {test, expect, Page, BrowserContext, Locator} from '@playwright/test';
import * as fs from 'node:fs'
import * as path from 'node:path'

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COOKIE_PATH = path.join(__dirname, '../../tests/Data for Tests/cookies/cookies.json')



export class GeneralFunctionsPage {
  page: Page;
  context?: BrowserContext;
  productCatalog: Locator;

  constructor(page: Page, context?: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  async close(){
    await this.page.close()
  }

  


  /// Отключить чат и нотификейшн
  async removeComponents() {

    const removeElement = async (selector) => {
      // Ожидание появления элемента
      await this.page.waitForSelector(selector, { state: 'attached', timeout: 5000 })
        .catch(() => {}); // Игнорируем ошибки

      // Удаление элемента, если он появился
      if (await this.page.locator(selector).count() > 0) {
        await this.page.evaluate((sel) => {
          const element = document.querySelector(sel);
          if (element) element.remove();
        }, selector);
      }
    };

    await removeElement('[id="popmechanic-snippet"]')


    // Удаляем уведомление о Cookies
    await this.page.addLocatorHandler(this.page.locator('.ant-notification .cookie-notification'), async (locator) => {
      const closeButton = locator.locator('.ant-notification-close-x');
      if (await closeButton.isVisible()) {
        await closeButton.click();  // Закрываем уведомление о куки
        // console.log('Отключил куки')
      }
    }, { times: 1 });  // Обработчик срабатывает только один раз, чтобы закрыть уведомление

    // Удаляем окно чата
    await this.page.addLocatorHandler(this.page.locator('.woot-widget-bubble').locator('visible=true'), async (locator) => {
      if (await locator.isVisible()) {
        await locator.evaluate((element) => element.remove()); // Удаляем окно чата
      }
      // console.log('Отключил окно чата')
    });

    
  }

  // Подтвердить удаление конфигурации из саммари
async alertDelete()  {
  const alert = this.page.locator('.ant-popover')
  const message = alert.locator('.ant-popover-message-title')
  await expect.soft(message).toHaveText('Вы уверены, что хотите удалить?')
  const yesButton = alert.locator('.ant-btn-primary')
  await yesButton.click()
  await expect.soft(alert).toBeHidden()
}



  // Поиск неккоректных значений
  async findIncorrectValue() {

    // Массив из искомых текстов для поиска
    const searchText = [
      'NaN',
      'undefined',
      '&amp;nbsp;'
    ]

    for (const text of searchText) {

      if (await this.page.locator(`:text-is("${text}")`).first().isVisible()) {
        expect.soft(text).toBeNull()
      }
    }

  }


  // Очистка массива от лишних символов у готового массива, а именно &nbsp;
  async clearStringArrayWithoutExtractions(array:string[]) {

    const arrayNameClear: string[] = []

    // Локатор
    for (const str of array) {
        const cleanedText = str
        .replace(/<!---->|<br>/g, '')
        .replace(/&nbsp;|\\n|\s{2,}/g, ' ')
        .replace('<span class="nobr">', '')
        .replace("<span class='nobr'>", '')
        .replace('</span>', '')
        .trim();
        arrayNameClear.push(cleanedText)
    }
    return arrayNameClear

  }

  // Преобразовать строку в число
  async convertToNumber(priceLocator:Locator) {
  
    const priceLocatorGetText = await priceLocator.innerText()
    const cleanAndConvertPrice = Number(priceLocatorGetText.replace(/[^\d,]/g, '').replace(',', '.'))

    return cleanAndConvertPrice

  }

  // Преобразовать массив строк в числа
  async cropTextArrayAndConvertToNumber(arrayPriceLocator:Locator) {
    const pricesServiceArray = await arrayPriceLocator.allInnerTexts()
    return pricesServiceArray.map(text => {
      const match = text.replace(/\s/g, '').replace(',', '.').match(/[\d.]+/);
      return parseFloat(match ? match[0] : '0');
    });
  }


  // Получить текущую дату
  async currentData() {

    // Получите текущую дату
    const currentDate = new Date()

    // Преобразуйте дату в нужный формат (например, YYYY-MM-DD)
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0') // Месяцы начинаются с 0
    const day = String(currentDate.getDate()).padStart(2, '0')

    const formattedDate = `${day}-${month}-${year}`

    // console.log(formattedDate) // Вывести текущую дату в консоль

    return formattedDate

  }


  // Проверить ошибки в консоли на странице
  async collectErrorConsole() {

    // Штатные ошибки
    const ignoredErrorPatterns = [
      'Failed to load resource: the server responded with a status of 401',
      '$httpErr: 401',
      'HTTPError: 401',
      'Access to fetch at',
      'Failed to load resource: net::ERR_FAILED',
      '$httpErr: Failed to fetch',
      'at _callee$',
      'at tryCatch',
      'at Generator.invoke [as _invoke]',
      'at Generator.next',
      'at asyncGeneratorStep',
      'at _next',
      'TypeError: Failed to fetch',
      'Failed to load resource: the server responded with a status of 429',
      `Refused to connect to 'https://www.google.com/`,
      'Failed to load resource: net::ERR_CONNECTION_RESET',
      'https://www.google.ru/ads',
      'https://mc.yandex.ru'
    ]

    // Массив с собранными ошибками
    const uniqueErrorConsole: string[] = []

    // Вывод ошибки из консоли браузера
    this.page.on('console', msg => {
      const errorMessage = msg.text() // Получаем текстовое представление сообщения

      // Проверяем, является ли тип сообщения ошибкой
      if (msg.type() === 'error') {
        // Проверяем, есть ли в errorMessage хотя бы один из шаблонов ошибок из ignoredErrorPatterns
        const shouldIgnoreError = ignoredErrorPatterns.some(pattern => errorMessage.includes(pattern))

        if (!shouldIgnoreError && !uniqueErrorConsole.includes(errorMessage)) {
          uniqueErrorConsole.push(errorMessage)

          // console.log(errorMessage)
        }
      }
    })

    // console.log(uniqueErrorConsole)
    return uniqueErrorConsole
  }

  // Записать в файл собранные ошибки
  async writeCollectedErrors(uniqueErrorConsole:string[]) {

    // Путь к директории файлов
    const pathFolderErrors = 'console_errors'
    if (!fs.existsSync(pathFolderErrors)) {
      fs.mkdirSync(pathFolderErrors, { recursive: true });
    }

    const getUrl = this.page.url()
    const getCurrentDate = await this.currentData()
    
    // Массив с ошибками
    const arrayDataError: string[] = []

    // Собрать массив с данными об ошибках и страницах,на которых они возникают
    if (uniqueErrorConsole.length > 0) {
      arrayDataError.push(`Дата прогона: ${getCurrentDate}\n`)
      arrayDataError.push(`Страница: ${getUrl}\n`)
      arrayDataError.push(uniqueErrorConsole.join('\n'))
      arrayDataError.push(' \n\n\n\n')


      // Записать в файл данные об ошибках
      fs.appendFile(`${pathFolderErrors}/Desktop.txt`, arrayDataError.join(''), err => {
        if (err) throw err
      })

    }

  }


// Взять итоговую сумму и преобразовать ее в число
async cropTextToNumber(value:Locator) {

  const getText = await value.locator('visible=true').innerText()
  const match = (getText.replace(/\s/gm, '')).match(/[\d,.]+/mg);
  const cropText = Number((match ? match[0] : '0').replace(',', '.'));
  const fixedCropText = Number(cropText.toFixed(2))
  return fixedCropText

}

/// Заблочить ненужные запросы
async blockUnwantedRequests() {

  const blockList = [
    'chatwoot.selectel.ru',
    'metrics.selectel.ru',
    'mc.yandex.ru',
    'api.mindbox.ru',
    'top-fwz1.mail.ru',
    'vk.com',
    'statuspal.io',
    'relay.selectel.ru',
    'player.vimeo.com',
    'f.vimeocdn.com',
    'vimeo.com/ablincoln',
    'widgets.mango-office.ru',
    'dct.mango-office.ru',
    'www.gstatic.com/cast',
    'www.gstatic.com/eureka',
    'hog.selectel.ru',           // PostHog (главный виновник!)
    'telegram.org/js/pixel.js',   // Telegram пиксель
    'telegram.org/pxl',          // Telegram трекинг
    'privacy-cs.mail.ru',        // Mail.ru приватность (CSP блокирует)
    'web-static.mindbox.ru',     // Mindbox дополнительные скрипты
    'fonts.googleapis.com',      // Google Fonts (если не нужны)
    'fonts.gstatic.com',         // Google Fonts assets
  ];

  await test.step('Блокировка всех ненужных запросов', async() => {
    await this.page.unroute('**/*');
    await this.page.route('**/*', (route) => {
      const url = route.request().url();
      if (blockList.some(domain => url.includes(domain))) {
        return route.abort();
      }
      return route.continue();
    });
  })

}




 // Проверка ошибки валидации у каунтера
 async errorTextCounters(locatorArrayCounters:string) {

  const arrayCounters = this.page.locator(locatorArrayCounters).locator('visible=true')
  await this.checkErrorValidation(arrayCounters)
}

// Проверка ошибки валидации основная функция
async checkErrorValidation(arrayCounters:Locator) {

  for (let i = 0; i < await arrayCounters.count(); i++){

    // Очистка поля
    await arrayCounters.nth(i).fill('')

    // Доп действие для смены фокуса, для того,чтобы последнее вводимое значение применилось
    await this.page.locator('.single-summary__total-price').click()

    // Взять значение из каунтера (Минимальное)
    const inputFieldMin = await arrayCounters.nth(i).getAttribute('aria-valuenow')

    // Ввести максимальное число
    await arrayCounters.nth(i).fill('99999999999999')

    // Доп действие для смены фокуса, для того,чтобы последнее вводимое значение применилось
    await this.page.locator('.single-summary__total-price').click()

    // Взять значение из каунтера (Максимальное)
    const inputFieldMax = await arrayCounters.nth(i).getAttribute('aria-valuenow')

    // Очистка поля
    await arrayCounters.nth(i).fill('')

    // Взять текст ошибки
    const errorVisible = this.page.locator('.single-summary__total-price').locator('visible=true').nth(0)

    //// Expects ////
    await expect.soft(errorVisible, 'Текст ошибки отличается у каунтера').toHaveText(`Выберите от ${(Number(inputFieldMin).toLocaleString('ru-RU'))} до ${(Number(inputFieldMax).toLocaleString('ru-RU'))}`)
  }
}

}