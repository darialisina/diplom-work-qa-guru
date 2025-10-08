import { test as base, expect, Page, BrowserContext } from '@playwright/test'
import GeneralFunctionsPage from '../PageObject/generalFunctionsPage'

// Описываем типы фикстур, доступных в тестах
type AllFixtures = {
  page: Page
  context: BrowserContext
  generalFunctionsPage: GeneralFunctionsPage
}

export const test = base.extend<AllFixtures>({

  // ФИКСТУРА 1: Создание контекста браузера (выполняется первой)
  context: [async ({ browser }, use) => {
    // Создаем изолированную среду браузера
    const context: BrowserContext = await browser.newContext()
    
    // Передаем контекст в тест и другие зависимые фикстуры
    await use(context)
    
    // Cleanup: закрываем контекст после теста
    await context.close()
  }, {scope: 'test'}],

  // ФИКСТУРА 2: Создание страницы (зависит от context)
  page: async ({ context }, use) => {

    // Создаем новую страницу внутри контекста
    const page: Page = await context.newPage()
    
    // Передаем страницу в тест
    await use(page)
    
    // Cleanup: закрываем страницу
    await page.close()
  },

  // ФИКСТУРА 3: Настройка Page Object (зависит от page и context)
  generalFunctionsPage: [async ({ page }, use) => {

    // Создаем Page Object
    const generalFunctionsPage = new GeneralFunctionsPage(page)
    
    // Настраиваем отслеживание ошибок консоли
    let errorPage: string[] = await generalFunctionsPage.collectErrorConsole()
    
    // Блокируем ненужные запросы
    await generalFunctionsPage.blockUnwantedRequests()
    
    // Передаем готовый объект в тест
    await use(generalFunctionsPage)
    
    // Cleanup: сохраняем собранные ошибки
    await generalFunctionsPage.writeCollectedErrors(errorPage)
  }, {scope: 'test'}],

})

export { expect }

