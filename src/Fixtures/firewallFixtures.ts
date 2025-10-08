import { test as base, expect } from '../Fixtures/generalFixtures'
import FirewallPage from '../PageObject/firewallPage'

// Здесь мы описываем, какие фикстуры предоставляет этот файл.
type FirewallFixtures = {
  firewallPage: FirewallPage
  autoSetup: void // void, потому что она ничего не возвращает, только выполняет действия.
}

// Мы берем `test` из generalFixtures и добавляем к нему новые, специфичные для CDN фикстуры.
export const test = base.extend<FirewallFixtures>({

  // Эта фикстура просто создает экземпляр CdnPage. 
  // Она будет вызвана автоматически, если тест запросит `cdnPage`.
  firewallPage: async ({ page }, use) => {
    const firewallPage = new FirewallPage(page)
    await use(firewallPage)
  },

  // Свойство `auto: true` означает, что Playwright выполнит ее ПЕРЕД КАЖДЫМ ТЕСТОМ
  // в файлах, где импортирован этот `test`, даже если ее не вызывать в аргументах.
  autoSetup: [async ({ page, generalFunctionsPage }, use) => {

    // Шаг 1: Переходим на нужную страницу
    await page.goto(`/prices/calculator/?product=firewall`, {waitUntil: 'domcontentloaded'})
    await generalFunctionsPage.preActionsNew()

    // Шаг 3: Проверяем, что находимся в исходном состоянии
    const textInfo = page.locator('.single-summary__total.h4 p')
    await expect.soft(textInfo).toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
    await expect.soft(page.locator('.single-summary-card__total-price')).toBeHidden()

    // Шаг 5: Передаем управление тесту. Теперь страница готова.
    await use()
  }, { auto: true }],

})

// Экспортируем expect для удобства
export { expect }