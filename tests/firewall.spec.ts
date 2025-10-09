import { test, expect } from '../src/Fixtures/firewallFixtures'
import { ApiConfig } from '../src/PageObject/firewallPage'


test.describe('Межсетевые экраны', () => {

  test('Сортировка', async ({ generalFunctionsPage, firewallPage }) => {

    // Проверяем сортировка для всех табов: Аппаратные и Вируальные
    const tabLocator = [firewallPage.virtualSwitcher, firewallPage.hardwareSwitcher]
    for (let i = 0; i < tabLocator.length; i++) {

      // Перейдем на таб "Виртуальные"
      await tabLocator[i].click()

      // Проверить значение сортировки по умолчанию
      await expect.soft(firewallPage.sortButton).toHaveText('Самая низкая цена')

      // Запоминаем список конфигураций по умолчанию и их кол-во над списком
      const defaultServerName = await firewallPage.configName.allInnerTexts()
      const defaultConfigurationCount = await firewallPage.configurationCount.innerText()

      // В выпадающем списке "Сортировать" выбрать "По популярности"
      await firewallPage.sortButton.click()
      await firewallPage.popularSort.click()

      // Значение корректно установилось
      await expect.soft(firewallPage.sortButton).toHaveText('По популярности')

      let changedServerName = await firewallPage.configName.allInnerTexts()
      if (tabLocator[i] == firewallPage.virtualSwitcher) {
        // Порядок списка конфигураций изменился
        expect.soft(changedServerName).not.toEqual(defaultServerName)
      }
      else {
        // Порядок списка конфигураций не изменился
        expect.soft(changedServerName).toEqual(defaultServerName)
      }

      // А вот кол-во над списком осталось тем же
      await expect.soft(firewallPage.configurationCount).toHaveText(defaultConfigurationCount)

      // В выпадающем списке "Сортировать" выбрать "Самая высокая цена"
      await firewallPage.sortButton.click()
      await firewallPage.expensSort.click()

      // Значение корректно установилось
      await expect.soft(firewallPage.sortButton).toHaveText('Самая высокая цена')

      // Порядок списка конфигураций изменился
      changedServerName = await firewallPage.configName.allInnerTexts()
      expect.soft(changedServerName).not.toEqual(defaultServerName)
      // А вот кол-во над списком осталось тем же
      await expect.soft(firewallPage.configurationCount).toHaveText(defaultConfigurationCount)

      // Проверяем, что самая дорогая конфигурация вначале списка, а дальше цены идут на понижение
      // ОТ ДАШИ: Решила оставить эту реализацию, потому что при использовании checkFilterSort неудобно смотреть где именно падает тест
      const pricesExpArr = await firewallPage.configPrice.all()
      let startPrice = 100000000000
      for (let price of pricesExpArr) {
        let serverCost = await generalFunctionsPage.convertToNumber(price)
        expect.soft(serverCost).toBeLessThanOrEqual(startPrice)
        startPrice = serverCost
      }

      // В выпадающем списке "Сортировать" выбрать "Самая низкая цена"
      await firewallPage.sortButton.click()
      await firewallPage.cheapSort.click()

      // Значение корректно установилось
      await expect.soft(firewallPage.sortButton).toHaveText('Самая низкая цена')

      // Список конфигураций вернулся к состоянию по умолчанию
      changedServerName = await firewallPage.configName.allInnerTexts()
      expect.soft(changedServerName).toEqual(defaultServerName)
      await expect.soft(firewallPage.configurationCount).toHaveText(defaultConfigurationCount)

      // Проверяем, что самая дешевая конфигурация в начале списка, а дальше цены идут на повышение
      const pricesСheapArr = await firewallPage.configPrice.all()
      for (let price of pricesСheapArr) {
        let serverCost = await generalFunctionsPage.convertToNumber(price)
        expect.soft(serverCost).toBeGreaterThanOrEqual(startPrice)
        startPrice = serverCost
      }
    }

  })

  test('Переключение табов типа МЭ', async ({ firewallPage }) => {

    // Перейдем на таб "Виртуальные"
    await firewallPage.virtualSwitcher.click()

    // Кнопка "Виртуальные" станет активной, а "Аппаратные" - неактивной
    await expect.soft(firewallPage.virtualSwitcher).toBeChecked()
    await expect.soft(firewallPage.hardwareSwitcher).not.toBeChecked()

    // Под табами появится сообщение "Минимально необходимые параметры сервера, на котором будет ..."
    await expect.soft(firewallPage.calcContainer).toContainText('Минимально необходимые параметры сервера, на котором будет развернут соответствующий образ виртуального МЭ UserGate, указаны в документации.')

    // В фильтрах будет 2 поля: Производительность и Цена
    await expect.soft(firewallPage.performanceFilter).toBeVisible()
    await expect.soft(firewallPage.priceFilter).toBeVisible()
    await expect.soft(firewallPage.readinessFilter).toBeHidden()
    await expect.soft(firewallPage.regionFilter).toBeHidden()
    await expect.soft(firewallPage.certificatesFilter).toBeHidden()
    await expect.soft(firewallPage.portsFilter).toBeHidden()

    // Перейдем на таб "Аппаратные"
    await firewallPage.hardwareSwitcher.click()

    // Кнопка "Аппаратные" станет активной, а "Виртуальные" - неактивной
    await expect.soft(firewallPage.virtualSwitcher).not.toBeChecked()
    await expect.soft(firewallPage.hardwareSwitcher).toBeChecked()

    // Под табами будет скрыто сообщение "Минимально необходимые параметры сервера, на котором будет ..."
    await expect.soft(firewallPage.calcContainer).not.toContainText('Минимально необходимые параметры сервера, на котором будет развернут соответствующий образ виртуального МЭ UserGate, указаны в документации.')

    // В фильтрах будет 6 полей: Производительность, Готовность, Регион, Сертификаты, Порты и Цена
    await expect.soft(firewallPage.performanceFilter).toBeVisible()
    await expect.soft(firewallPage.priceFilter).toBeVisible()
    await expect.soft(firewallPage.readinessFilter).toBeVisible()
    await expect.soft(firewallPage.regionFilter).toBeVisible()
    await expect.soft(firewallPage.certificatesFilter).toBeVisible()
    await expect.soft(firewallPage.portsFilter).toBeVisible()
  })

  test('Кнопка “Удалить” в саммари', async ({ firewallPage, generalFunctionsPage}) => {

    // Проверка блока саммари
    await expect.soft(firewallPage.textInfo)
      .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

    // Добавить сервер
    await firewallPage.addConfigInSummary()

    // Удалить добавленный сервер из саммари
    await firewallPage.summaryDeleteCalc.click()
    await generalFunctionsPage.alertDelete()

    // Проверка, что саммари вернулось к изначальному состоянию
    await expect.soft(firewallPage.textInfo)
      .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

    // Добавить два любых сервера
    await firewallPage.addConfigInSummary(1)
    await firewallPage.addConfigInSummary(0, '2', 'Москва')

    // Проверка, что у каждого сервера своя кнопка удаления - "мусорное ведро" 
    await expect.soft(firewallPage.summaryDeleteConfig).toHaveCount(2)

    // Добавим еще сервер
    await firewallPage.addConfigInSummary(2)

    // Теперь кнопок "мусорное ведро" нет в саммари
    await expect.soft(firewallPage.summaryDeleteConfig).toHaveCount(0)

    // Только для последней в саммари конфигурации отображается кнопка "Удалить конфигурацию"
    await expect.soft(firewallPage.deleteConfigBtn).toHaveCount(1)

    // Развернем данные для каждой конфигурации
    const collapseBtns = await firewallPage.summaryCardCollapse.all()
    for (let i = 0; i < collapseBtns.length - 1; i++) {
      await collapseBtns[i].click()
    }

    // Теперь для всех серверов отображается кнопка "Удалить конфигурацию"
    await expect.soft(firewallPage.deleteConfigBtn).toHaveCount(3)

    // Нажать "Удалить конфигурацию"
    await firewallPage.deleteConfigBtn.first().click()
    await generalFunctionsPage.alertDelete()

    // Больше нет кнопок "Удалить конфигурацию"
    await expect.soft(firewallPage.deleteConfigBtn).toHaveCount(0)

    // Возвращаются кнопки "мусорное ведро"
    await expect.soft(firewallPage.summaryDeleteConfig).toHaveCount(2)

    // Нажать "мусорное ведро" у обеих оставшихся конфигураций
    await firewallPage.summaryDeleteConfig.first().click()
    await generalFunctionsPage.alertDelete()
    await expect.soft(firewallPage.summaryDeleteConfig).toHaveCount(0)
    await firewallPage.summaryDeleteCalc.click()
    await generalFunctionsPage.alertDelete()

    // Саммари вернется к состоянию по умолчанию
    await expect.soft(firewallPage.textInfo)
      .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
  })

  test('Карточки на странице в соотвествии с API', async ({ page, firewallPage }) => {

    // На данный момент отображаемые конфигурации отображаются просто по фильтрации по следующим uuid
    const expectedUuids = [
      '6758d562-c6f1-4d61-85dd-759569b5aa7b',
      '0f858ef3-00dd-4222-95de-c7f710ce6c40',
      'b30fd97f-2641-407a-930f-4cafe8431668',
      'c1cd7436-c824-4e33-abe1-a454dfdebb42',
      'd71edc43-de8d-427b-9de3-55a2a392a436',
      'fd4ba5ef-b6a8-4cd6-9663-ec02c636667c',
      '392dfbc5-ad7c-4116-9adb-e2e6413cc9c3'
    ]

    // Запрос с данными конфигураций
    const apiUrl = 'https://api.selectel.ru/servers/v2/pub/service/firewall?full_view=true&is_order=true'

    // Снова переходим на страницу и перехватываем ответ от API
    const firewallPageUrl = page.url()
    const responsePromise = page.waitForResponse(apiUrl)
    await page.goto(firewallPageUrl)
    const response = await responsePromise

    // Указываем TypeScript тип для данных из API
    const apiResponseData = await response.json() as { result: ApiConfig[] }
    const allApiConfigs = apiResponseData.result

    // Фильтруем данные из API, чтобы получить только те, которые мы ожидаем увидеть
    const expectedConfigs = allApiConfigs.filter(config =>
      expectedUuids.includes(config.uuid)
    )

    // Ждем, пока элементы появятся на странице
    await expect.soft(firewallPage.configName.first()).toBeVisible()

    // Получаем данные с карточек
    const displayedConfigNames = await firewallPage.configName.allTextContents()
    const displayedConfigPrices = await firewallPage.configPrice.allTextContents()

    // Проверяем, что на странице только карточки с ожидаемыми uuid
    expect.soft(displayedConfigNames.length).toEqual(expectedUuids.length)

    // Перебираем каждую конфигурацию, отображенную на странице
    const expectedConfigsSet = new Set<ApiConfig>(expectedConfigs)
    for (let i = 0; i < displayedConfigNames.length; i++) {
      const displayedName = displayedConfigNames[i].trim()
      let foundApiConfig: ApiConfig | null = null

      // Ищем соответствие в еще не найденных конфигурациях из API
      for (const apiConfig of expectedConfigsSet) {
        if (firewallPage.normalize(apiConfig.name) === firewallPage.normalize(displayedName)) {
          foundApiConfig = apiConfig
          break
        }
      }

      // Конфигурация со страницы не была найдена в ожидаемом списке API
      expect.soft(foundApiConfig).toBeDefined()

      if (foundApiConfig) {
        // Удаляем найденную конфигурацию, чтобы не проверять ее снова
        expectedConfigsSet.delete(foundApiConfig)

        // Пробуем взять цену из API
        const apiPrice = foundApiConfig.price_collection?.RUB?.month
        expect.soft(apiPrice).toBeDefined()

        // Если цена найдена, сверяем ее с той что на карточке
        if (apiPrice !== undefined) {
          const displayedPrice = displayedConfigPrices[i]
          const formattedApiPrice = apiPrice.toLocaleString('ru-RU')
          expect.soft(displayedPrice.replace(/[\s₽]/g, '')).toEqual(formattedApiPrice.replace(/[\s₽]/g, ''))
        }
      }
    }

    // Убеждаемся, что все ожидаемые конфигурации были найдены
    expect.soft(expectedConfigsSet.size).toBe(0)
  })

  test.describe('Виртуальные', () => {

    test.beforeEach(async ({ firewallPage }) => {

      // Перейдем на таб "Виртуальные"
      await firewallPage.virtualSwitcher.click()
    })

    test.describe('Фильтры', () => {

      test('Производительность', async ({ page, generalFunctionsPage, firewallPage }) => {

        // Найдем минимальные и максимальные значения для параметров на карточках
        const limitValues = await Promise.all([
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigFW),
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigIPS),
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigSSL)
        ])


        // Объект со значениями для каждого параметра
        const performanceParameter = [
          {
            name: 'FW, Гбит/с',
            values: await firewallPage.virtualConfigFW.all()
          },
          {
            name: 'IPS (СОВ), Гбит/с',
            values: await firewallPage.virtualConfigIPS.all()
          },
          {
            name: 'SSL-VPN, Гбит/с',
            values: await firewallPage.virtualConfigSSL.all()
          }]

        // Проверка для каждого параметра
        for (let i = 0; i < performanceParameter.length; i++) {

          // Нажать на выпадающий список "Производительность"
          await firewallPage.performanceFilter.click()

          // Проверяем, что параметр отображен в списке
          await expect.soft(firewallPage.performanceFilterParamTitle.nth(i), performanceParameter[i].name)
            .toHaveText(performanceParameter[i].name)

          // Проверяем, что минимальное и максимальное значение параметра соответствует значениям на карточках
          let leftDot = firewallPage.performanceFilterParamGroup.nth(i).locator('.vue-slider-dot').first()
          await expect.soft(leftDot, performanceParameter[i].name).toHaveAttribute('aria-valuenow', String(limitValues[i].min))
          let rightDot = firewallPage.performanceFilterParamGroup.nth(i).locator('.vue-slider-dot').last()
          await expect.soft(rightDot, performanceParameter[i].name).toHaveAttribute('aria-valuenow', String(limitValues[i].max))

          // Установка двух поинтеров слайдеров в случайное положение и сравнение установившихся значений
          const container = firewallPage.containerSlider.nth(i)
          const pointLeft = container.locator('.vue-slider-dot').first()
          const pointRight = container.locator('.vue-slider-dot').last()

          await firewallPage.moveFilterSlider(pointLeft, 'ArrowRight', 1)
          await firewallPage.moveFilterSlider(pointRight, 'ArrowLeft', 1)

          // Проверяем, что слайдеры корректно установлены
          let leftValue = await pointLeft.getAttribute('aria-valuenow')
          let rightValue = await pointRight.getAttribute('aria-valuenow')

          // Берем значение конфигураций после фильтрации
          const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)
          let filtredCardName = await firewallPage.configName.allInnerTexts()

          // Сбросить фильтры
          await firewallPage.resetFiltersBtn.click()

          // Проверяем, что из всех карточек соответсвующее кол-во подходящих и соответствующие имена
          let suitableCardCount = 0
          let cardName = await firewallPage.configName.allInnerTexts()
          for (let j = 0; j < performanceParameter[i].values.length; j++) {
            let num = await generalFunctionsPage.convertToNumber(performanceParameter[i].values[j])
            if (num >= Number(leftValue) && num <= Number(rightValue)) {
              suitableCardCount++
              expect.soft(filtredCardName).toContain(cardName[j])
            }
          }
          expect.soft(suitableCardCount, performanceParameter[i].name).toEqual(filtredConfigurationCount)
        }

      })

      test.describe('Цена в месяц', () => {

        test('Состояние по умолчанию', async ({ firewallPage }) => {

          // Найдем минимальное и максимальное значения для цены
          const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

          // Нажать на выпадающий список "Цена"
          await firewallPage.priceFilter.click()

          // Проверяем, что параметр отображен в списке
          await expect.soft(firewallPage.priceFilterDropdown).toContainText('Цена в месяц, ₽')

          // Локаторы для полей ввода
          const minInput = firewallPage.priceFilterDropdown.locator('input').first()
          const maxInput = firewallPage.priceFilterDropdown.locator('input').last()

          // Получаем актуальные значения, используя нашу функцию
          const actualMinValue = await firewallPage.getPlaceholderAsNumber(minInput)
          const actualMaxValue = await firewallPage.getPlaceholderAsNumber(maxInput)

          // Выполняем проверки
          expect.soft(actualMinValue, "Минимальное значение в плейсхолдере неверно").toEqual(limitValues.min)
          expect.soft(actualMaxValue, "Максимальное значение в плейсхолдере неверно").toEqual(limitValues.max)
          expect.soft(actualMinValue, "Минимальное значение в плейсхолдере 0").not.toEqual(0)
          expect.soft(actualMaxValue, "Максимальное значение в плейсхолдере 0").not.toEqual(0)

        })

        const testData = [
          {
            testName: 'Цена в месяц "От"',
            inputIndexs: [0],
            inputValues: ['min']
          },
          {
            testName: 'Цена в месяц "До"',
            inputIndexs: [1],
            inputValues: ['max']
          },
          {
            testName: 'Цена в месяц "От" и "До"',
            inputIndexs: [0, 1],
            inputValues: ['min', 'max']
          },
        ]

        for (let data of testData) {
          test(data.testName, async ({ generalFunctionsPage, firewallPage }) => {

            const defaultPriceArr = await firewallPage.configPrice.all()

            // Нажать на выпадающий список "Цена"
            await firewallPage.priceFilter.click()

            // Найдем минимальное и максимальное значения для цены
            const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

            // Ввод значений в поля ввода
            for (let i of data.inputIndexs) {
              const input = firewallPage.priceFilterDropdown.locator('input').nth(i)

              // Цена
              if (data.inputValues[i] == 'min') {
                await input.fill(String(limitValues.min + 100))
              }
              else {
                await input.fill(String(limitValues.max - 100))
              }
            }

            /// Очистить цену от лишних символов и преобразовать в число
            const arrayPrices = await generalFunctionsPage.cropTextArrayAndConvertToNumber(firewallPage.configPrice)

            /// Проверяем, что на странице, только карточки с соответствующей ценой
            if (data.inputValues.length == 1 && data.inputValues[0] == 'min') {
              arrayPrices.forEach((item) => {
                expect.soft(
                  (item: number) => item >= limitValues.min + 100,
                  `Значение ${item} меньше заданного диапазона`
                ).toBeTruthy()
              })
            }
            else if (data.inputValues.length == 1 && data.inputValues[0] == 'max') {
              arrayPrices.forEach((item) => {
                expect.soft(
                  (item: number) => item <= limitValues.max - 100,
                  `Значение ${item} больше заданного диапазона`
                ).toBeTruthy()
              })
            } else {
              arrayPrices.forEach((item) => {
                expect.soft(
                  (item: number) => ((item >= limitValues.min + 100) && (item <= limitValues.max - 100)),
                  `Значение ${item} вне заданного диапазона`
                ).toBeTruthy()
              })
            }

            // Берем значение конфигураций после фильтрации
            const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)

            // Сбросить фильтры
            await firewallPage.resetFiltersBtn.click()

            // Проверяем, что из всех карточек соответсвующее кол-во подходящих
            let suitableCardCount = 0

            for (let item of defaultPriceArr) {
              let num = await generalFunctionsPage.convertToNumber(item)
              if (data.inputValues.length == 1 && data.inputValues[0] == 'min') {
                if (num >= limitValues.min + 100) {
                  suitableCardCount++
                }
              }
              else if (data.inputValues.length == 1 && data.inputValues[0] == 'max') {
                if (num <= limitValues.max - 100) {
                  suitableCardCount++
                }
              } else {
                if (num >= limitValues.min + 100 && num <= limitValues.max - 100) {
                  suitableCardCount++
                }
              }
            }
            expect.soft(suitableCardCount).toEqual(filtredConfigurationCount)

          })
        }

        test.describe('Крайние значения в обоих каунтерах', () => {

          let limitValues
          let valueNow

          test.beforeEach(async ({ firewallPage }) => {

            // Найдем минимальное и максимальное значения для цены
            limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)
            valueNow = {
              '1': String(limitValues.min),
              '9999999': String(limitValues.max)
            }

          })

          // Входящие данные для проверки
          const dataInput = [
            { nameTest: 'Минимальное', valueInput: ['1', '1'] },
            { nameTest: 'Максимальное', valueInput: ['9999999', '9999999'] },
            { nameTest: 'Минимальные и максимальные', valueInput: ['1', '9999999'] },
          ]

          for (const checkFilter of dataInput) {

            test(`${checkFilter.nameTest}`, async ({ firewallPage }) => {

              // Нажать на выпадающий список "Цена"
              await firewallPage.priceFilter.click()

              // Ввод значений в поля ввода
              const minInput = firewallPage.priceFilterDropdown.locator('input').first()
              const maxInput = firewallPage.priceFilterDropdown.locator('input').last()

              await minInput.fill(checkFilter.valueInput[0])
              await maxInput.fill(checkFilter.valueInput[1])

              // Убрать фокус
              await firewallPage.priceFilterDropdown.click()

              await expect.soft(minInput).toHaveAttribute('aria-valuenow', valueNow[checkFilter.valueInput[0]])
              await expect.soft(maxInput).toHaveAttribute('aria-valuenow', valueNow[checkFilter.valueInput[1]])

              /// Все названия карточек и цен за месяц
              const priceMonth = await firewallPage.configPrice.allInnerTexts()
              expect.soft(priceMonth.length).toBeGreaterThanOrEqual(1)

              /// Очистить цену от лишних символов и преобразовать в число
              const pricesCard = priceMonth[0].replace(/[^\d,]/g, '').replace(',', '.')

              // Значение в поле ввода и на карточках
              expect.soft(Number(pricesCard)).toBeGreaterThanOrEqual(Number(valueNow[checkFilter.valueInput[0]]))
              expect.soft(Number(pricesCard)).toBeLessThanOrEqual(Number(valueNow[checkFilter.valueInput[1]]))
              expect.soft(Number(pricesCard)).not.toEqual(0)
            })
          }
        })

        test.describe('Ошибка валидации инпутов', () => {

          // Входящие данные для проверки
          const dataInput = [
            { nameTest: 'Минимальное', valueInput: '1' },
            { nameTest: 'Максимальное', valueInput: '9999999' },
          ]

          for (const checkFilter of dataInput) {

            test(`${checkFilter.nameTest}`, async ({ firewallPage }) => {

              const inputArr = [
                {
                  locator: firewallPage.priceFilterDropdown.locator('input').first(),
                  errorLocator: firewallPage.priceErrorMessage.first()
                },
                {
                  locator: firewallPage.priceFilterDropdown.locator('input').last(),
                  errorLocator: firewallPage.priceErrorMessage.last()
                },
              ]

              // Найдем минимальное и максимальное значения для цены
              const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

              for (let input of inputArr) {

                // Открыть выпадающий список "Производительность"
                await firewallPage.priceFilter.click()

                // Ввод значения
                await input.locator.fill(checkFilter.valueInput)

                // Проверяем, что появилось сообщение валидации
                await expect.soft(input.errorLocator).toBeVisible()
                await expect.soft(input.errorLocator).toHaveText(`Выберите от ${limitValues.min.toLocaleString('fr-FR')} до ${limitValues.max.toLocaleString('fr-FR')}`)

                // Убрать фокус
                await firewallPage.priceFilterDropdown.click()

                // Проверяем, что после снятия фокуса значение в инпуте заменилось
                if (checkFilter.valueInput === '9999999') {
                  await expect.soft(input.locator).toHaveAttribute('aria-valuenow', String(limitValues.max))
                } else {
                  await expect.soft(input.locator).toHaveAttribute('aria-valuenow', String(limitValues.min))
                }

                // Закрыть выпадающий список "Производительность"
                await firewallPage.priceFilter.click()
              }
            })
          }


          test('Ошибка валидации каунтеров', async ({ generalFunctionsPage }) => {

            // Провести проверку для валидации у каунтеров "Объем диска, ГБ"
            await generalFunctionsPage.errorTextCounters('.firewall-filters__inline-selects [prefix="От"] input')

            // Провести проверку для валидации у  каунтера "Количество копий"
            await generalFunctionsPage.errorTextCounters('.firewall-filters__inline-selects [prefix="До"] input')

          })
        })
      })

      test('Комплексная проверка фильтрации', async ({ page, firewallPage, generalFunctionsPage }) => {

        // Найдем минимальные и максимальные значения для цены
        const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

        // Возьмем параметры на карточках
        const cardHandler = await Promise.all([
          firewallPage.virtualConfigFW.all(),
          firewallPage.virtualConfigIPS.all(),
          firewallPage.configPrice.all()
        ])

        // Сформируем объект, объединяющий локатор и значения, полученные по нему
        const cardParameters = [{
          locator: firewallPage.virtualConfigFW,
          values: cardHandler[0]
        },
        {
          locator: firewallPage.virtualConfigIPS,
          values: cardHandler[1]
        },
        {
          locator: firewallPage.configPrice,
          values: cardHandler[2]
        }
        ]

        // Нажать на выпадающий список "Производительность"
        await firewallPage.performanceFilter.click()

        // Установка двух поинтеров слайдеров в случайное положение и сравнение установившихся значений
        const containerFW = firewallPage.containerSlider.nth(0)
        const pointLeftFW = containerFW.locator('.vue-slider-dot').first()
        const pointRightFW = containerFW.locator('.vue-slider-dot').last()

        await firewallPage.moveFilterSlider(pointLeftFW, 'ArrowRight', 1)
        await firewallPage.moveFilterSlider(pointRightFW, 'ArrowLeft', 1)

        // Проверяем, что слайдеры корректно установлены
        let leftValueFW = await pointLeftFW.getAttribute('aria-valuenow')
        let rightValueFW = await pointRightFW.getAttribute('aria-valuenow')

        // Установка двух поинтеров слайдеров в случайное положение и сравнение установившихся значений
        const containerIPS = firewallPage.containerSlider.nth(1)
        const pointLeftIPS = containerIPS.locator('.vue-slider-dot').first()
        const pointRightIPS = containerIPS.locator('.vue-slider-dot').last()

        await firewallPage.moveFilterSlider(pointLeftIPS, 'ArrowRight', 1)
        await firewallPage.moveFilterSlider(pointRightIPS, 'ArrowLeft', 1)

        // Проверяем, что слайдеры корректно установлены
        let leftValueIPS = await pointLeftIPS.getAttribute('aria-valuenow')
        let rightValueIPS = await pointRightIPS.getAttribute('aria-valuenow')

        // Нажать на выпадающий список "Цена"
        await firewallPage.priceFilter.click()

        // Ввод значений в поля ввода
        const minInput = firewallPage.priceFilterDropdown.locator('input').first()

        // Цена "От"
        await minInput.fill(String(limitValues.min + 100))

        /// Очистить цену от лишних символов и преобразовать в число
        const arrayFW = await generalFunctionsPage.cropTextArrayAndConvertToNumber(cardParameters[2].locator)
        const arrayIPS = await generalFunctionsPage.cropTextArrayAndConvertToNumber(cardParameters[2].locator)
        const arrayPrices = await generalFunctionsPage.cropTextArrayAndConvertToNumber(cardParameters[2].locator)

        /// Проверяем, что на странице, только карточки с большей ценой
        arrayFW.forEach((item) => {
          expect.soft(
            (item: number) => (item >= Number(leftValueFW) && item <= Number(rightValueFW)),
            `Значение ${item} вне заданного диапазона`
          ).toBeTruthy()
        })

        /// Проверяем, что на странице, только карточки с большей ценой
        arrayIPS.forEach((item) => {
          expect.soft(
            (item: number) => (item >= Number(leftValueIPS) && item <= Number(rightValueIPS)),
            `Значение ${item} вне заданного диапазона`
          ).toBeTruthy()
        })

        /// Проверяем, что на странице, только карточки с большей ценой
        arrayPrices.forEach((item) => {
          expect.soft(
            (item: number) => item >= limitValues.min + 100,
            `Значение ${item} меньше заданного диапазона`
          ).toBeTruthy()
        })

        // Берем значение конфигураций после фильтрации
        const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)
        let filtredCardName = await firewallPage.configName.allInnerTexts()

        // Сбросить фильтры
        await firewallPage.resetFiltersBtn.click()

        // Проверяем, что из всех карточек соответсвующее кол-во подходящих
        let suitableCardCount = 0
        let cardName = await firewallPage.configName.allInnerTexts()

        for (let i = 0; i < cardParameters[0].values.length; i++) {
          let fw = await generalFunctionsPage.convertToNumber(cardParameters[0].values[i])
          let ips = await generalFunctionsPage.convertToNumber(cardParameters[1].values[i])
          let price = await generalFunctionsPage.convertToNumber(cardParameters[2].values[i])
          if (price >= limitValues.min + 100) {
            if (fw >= Number(leftValueFW) && fw <= Number(rightValueFW)) {
              if (ips >= Number(leftValueIPS) && ips <= Number(rightValueIPS)) {
                suitableCardCount++
                expect.soft(filtredCardName).toContain(cardName[i])
              }
            }
          }
        }
        expect.soft(suitableCardCount).toEqual(filtredConfigurationCount)


      })
    })

    test('Соответствие данных при добавлении конфигурации', async ({ generalFunctionsPage, firewallPage }) => {

      // Проверка блока саммари до добавления
      await expect.soft(firewallPage.textInfo)
        .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

      // Берем названия конфигурации с карточки
      const serverName = await firewallPage.configName.first().innerText()

      // Нажать "Добавить" у указанного по счету сервера
      await firewallPage.addConfigButtons.first().click()

      // В заголовке модального окна указано правильно имя конфигурации
      await expect.soft(firewallPage.modalTitle).toContainText(serverName)

      // В модальном окне есть 2 блока с соответсвующим текстом
      await expect.soft(firewallPage.modalWindow).toContainText('Добавьте необходимые дополнительные модули')
      await expect.soft(firewallPage.modalWindow).toContainText('Минимальные требования к серверу')

      // В блоке Добавьте необходимые дополнительные модули будет 4 чекбокса
      await expect.soft(firewallPage.virtualCheckboxes).toHaveCount(4)

      // Добавляем в массив параметров имя конфигурации и параметры из модалки
      const parameterNames: string[] = []
      const parameterArr = await firewallPage.virtualCheckboxes.all()
      parameterNames.push(`Сертифицированный виртуальный межсетевой экран ${serverName}`)

      // Сделать все чекбоксы в модалке активными
      for (let item of parameterArr) {
        await item.locator('input').click()
        await expect.soft(item.locator('input')).toBeChecked()
        parameterNames.push(await item.innerText())
      }

      // Нажать "Добавить МЭ" в модалке
      await firewallPage.modalAddButton.click()

      // Проверка, что название конфигурации в саммари правильное
      await expect.soft(firewallPage.summaryConfigName).toHaveText(serverName)

      // Проверка, что появилась кнопка для удаления "мусорное ведро" в саммари
      await expect.soft(firewallPage.summaryDeleteCalc).toBeVisible()

      // Проверка соответствия параметров в саммари
      const pointArr = await firewallPage.summaryPoints.all()
      for (let i = 0; i < pointArr.length; i++) {
        await expect.soft(pointArr[i]).toHaveText(parameterNames[i])
      }

      // Берем цену сервера на карточке и в саммари
      const serverPrice = await generalFunctionsPage.convertToNumber(firewallPage.configPrice.first())
      const serverPriceInSummary = await generalFunctionsPage.convertToNumber(firewallPage.summaryPointsPrices.first())

      // Проверяем, что в саммари цена равна цене на карточке
      expect.soft(serverPriceInSummary).toEqual(serverPrice)

      // Проверяем, что сумма в саммари правильная
      await firewallPage.checkPricesAfterChanges(5)

      // Удалить добавленный сервер из саммари
      await firewallPage.summaryDeleteCalc.click()
      await generalFunctionsPage.alertDelete()

      // Проверка блока саммари после удаления
      await expect.soft(firewallPage.textInfo).toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
    })

  })

  test.describe('Аппаратные', () => {

    test.beforeEach(async ({ firewallPage }) => {

      // Перейдем на таб "Аппаратные"
      await firewallPage.hardwareSwitcher.click()
    })

    test.describe('Фильтры', () => {

      test('Производительность', async ({ generalFunctionsPage, firewallPage }) => {

        // Найдем минимальные и максимальные значения для параметров на карточках
        const limitValues = await Promise.all([
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigFW),
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigIPS),
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigSSL),
          firewallPage.getMinMaxFromLocators(firewallPage.virtualConfigIPSHard)

        ])

        // Объект со значениями для каждого параметра
        const performanceParameter = [
          {
            name: 'FW, Гбит/с',
            values: await firewallPage.virtualConfigFW.all()
          },
          {
            name: 'IPSec VPN, Гбит/с',
            values: await firewallPage.virtualConfigIPS.all()
          },
          {
            name: 'SSL-VPN, Гбит/с',
            values: await firewallPage.virtualConfigSSL.all()
          },
          {
            name: 'IPS (СОВ), Гбит/с',
            values: await firewallPage.virtualConfigIPSHard.all()
          }]

        // Проверка для каждого параметра
        for (let i = 0; i < performanceParameter.length; i++) {

          // Нажать на выпадающий список "Производительность"
          await firewallPage.performanceFilter.click()

          // Проверка для чекбокса "IPS (СОВ), Гбит/с"
          if (performanceParameter[i].name == 'IPS (СОВ), Гбит/с') {

            // Проверяем, что параметр отображен в списке
            await expect.soft(firewallPage.perfomanceCheckbox).toHaveText(performanceParameter[i].name)

            // До нажатия на чекбокс в фильтре 3 слайдера
            await expect.soft(firewallPage.containerSlider).toHaveCount(3)

            // Нажимаем чекбокс
            await firewallPage.perfomanceCheckbox.click()

            // После нажатия на чекбокс в фильтре 4 слайдера
            await expect.soft(firewallPage.containerSlider).toHaveCount(4)
          }
          else {
            // Проверяем, что параметр отображен в списке
            await expect.soft(firewallPage.performanceFilterParamTitle.nth(i)).toHaveText(performanceParameter[i].name)

          }

          // Проверяем, что минимальное и максимальное значение параметра соответствует значениям на карточках
          let leftDot = firewallPage.performanceFilterParamGroup.nth(i).locator('.vue-slider-dot').first()
          await expect.soft(leftDot, performanceParameter[i].name).toHaveAttribute('aria-valuenow', String(limitValues[i].min))
          let rightDot = firewallPage.performanceFilterParamGroup.nth(i).locator('.vue-slider-dot').last()
          await expect.soft(rightDot, performanceParameter[i].name).toHaveAttribute('aria-valuenow', String(limitValues[i].max))

          const container = firewallPage.containerSlider.nth(i)
          const pointLeft = container.locator('.vue-slider-dot').first()
          const pointRight = container.locator('.vue-slider-dot').last()

          await firewallPage.moveFilterSlider(pointLeft, 'ArrowRight', 1)
          await firewallPage.moveFilterSlider(pointRight, 'ArrowLeft', 1)

          // Проверяем, что слайдеры корректно установлены
          let leftValue = await pointLeft.getAttribute('aria-valuenow')
          let rightValue = await pointRight.getAttribute('aria-valuenow')

          // Берем значение конфигураций после фильтрации
          const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)
          let filtredCardName = await firewallPage.configName.allInnerTexts()

          // Сбросить фильтры
          await firewallPage.resetFiltersBtn.click()

          // Проверяем, что из всех карточек соответсвующее кол-во подходящих
          let suitableCardCount = 0
          let cardName = await firewallPage.configName.allInnerTexts()
          for (let j = 0; j < performanceParameter[i].values.length; j++) {
            let num = await generalFunctionsPage.convertToNumber(performanceParameter[i].values[j])
            if (num >= Number(leftValue) && num <= Number(rightValue)) {
              suitableCardCount++
              expect.soft(filtredCardName).toContain(cardName[j])
            }
          }
          expect.soft(suitableCardCount, performanceParameter[i].name).toEqual(filtredConfigurationCount)
        }

      })

      test('Готовность', async ({ generalFunctionsPage, firewallPage }) => {

        // Массив возможных вариантов
        const readyPeriod = ['1 день', '5 дней', 'Под заказ']

        // Проверка для каждого варианта
        for (let i = 0; i < readyPeriod.length; i++) {

          // Нажать на выпадающий список "Готовность"
          await firewallPage.readinessFilter.click()

          // Проверяем, что параметр отображен в списке
          await expect.soft(firewallPage.readinessCheckboxes.nth(i)).toHaveText(readyPeriod[i])

          // Нажимаем чекбокс
          await firewallPage.readinessCheckboxes.nth(i).click()

          // Берем значение кол-ва конфигураций после фильтрации
          const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)

          // Сбросить фильтры
          await firewallPage.resetFiltersBtn.click()

          // Проверяем, что из всех карточек соответсвующее кол-во подходящих
          let suitableCardCount = await firewallPage.configTags.filter({ hasText: readyPeriod[i] }).count()
          expect.soft(suitableCardCount).toEqual(filtredConfigurationCount)
        }

      })

      test('Сертификаты', async ({ generalFunctionsPage, firewallPage }) => {

        // Нажать на выпадающий список "Сертификаты"
        await firewallPage.certificatesFilter.click()

        // Проверяем, что параметр отображен в списке
        await expect.soft(firewallPage.certificationCheckboxes).toHaveText('Сертификат ФСТЭК')

        // Нажимаем чекбокс
        await firewallPage.certificationCheckboxes.click()

        // Берем значение конфигураций после фильтрации
        const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)

        // Сбросить фильтры
        await firewallPage.resetFiltersBtn.click()

        // Проверяем, что из всех карточек соответсвующее кол-во подходящих
        let suitableCardCount = await firewallPage.configTags.filter({ hasText: 'Сертификат ФСТЭК' }).count()
        expect.soft(suitableCardCount).toEqual(filtredConfigurationCount)

      })

      test('Порты', {
        annotation: {
          type: 'Баг еще не заведен',
          description: 'Узнать у Саши или Вани как фильтрует этот фильтр'
        },
      }, async ({ page, generalFunctionsPage, firewallPage }) => {

        // Объект со значениями для каждого параметра
        const portType = [
          {
            name: '1GE RJ45 Порты',
            apiValue: 'rj45',
            apiCount: 0
          },
          {
            name: '10GE SFP+ Порты',
            apiValue: 'sfp',
            apiCount: 0
          }]

        // На данный момент отображаемые конфигурации отображаются просто по фильтрации по следующим uuid
        const expectedUuids = [
          '6758d562-c6f1-4d61-85dd-759569b5aa7b',
          '0f858ef3-00dd-4222-95de-c7f710ce6c40',
          'b30fd97f-2641-407a-930f-4cafe8431668',
          'c1cd7436-c824-4e33-abe1-a454dfdebb42',
          'd71edc43-de8d-427b-9de3-55a2a392a436',
          'fd4ba5ef-b6a8-4cd6-9663-ec02c636667c',
          '392dfbc5-ad7c-4116-9adb-e2e6413cc9c3'
        ]

        // Запрос с данными конфигураций
        const apiUrl = 'https://api.selectel.ru/servers/v2/pub/service/firewall?full_view=true&is_order=true'

        // Снова переходим на страницу и перехватываем ответ от API
        const firewallPageUrl = page.url()
        const responsePromise = page.waitForResponse(apiUrl)
        await page.goto(firewallPageUrl)
        const response = await responsePromise
        

        // Указываем TypeScript тип для данных из API
        const apiResponseData = await response.json() as { result: ApiConfig[] }
        const allApiConfigs = apiResponseData.result

      

        // Фильтруем данные из API, чтобы получить только те, которые мы ожидаем увидеть
        const expectedConfigs = allApiConfigs.filter(config =>
          expectedUuids.includes(config.uuid)
        )

        // Получаем кол-во конфигураций, у которых есть тот или другой порт
        for (let i = 0; i < portType.length; i++) {
          portType[i].apiCount = 0;

          // Проходимся по всем отфильтрованным конфигам
          for (const configItem of expectedConfigs) {
            if (configItem.config && configItem.config.interfaces) {

              // Если находим нужный порт в респонсе, записываем в объект порта
              for (const port of configItem.config.interfaces) {
                if (port.name === portType[i].apiValue) {
                  portType[i].apiCount++;
                }
              }
            }
          }

          // Нажать на выпадающий список "Порты"
          test.step('Нажать на выпадающий список "Порты"', async (step) => {
          await firewallPage.portsFilter.click()
          step.attach('Локатор фильтра', {
            body: String(firewallPage.portsFilter)
          })
          })

          // Проверяем, что параметр отображен в списке
          await expect.soft(firewallPage.portCheckboxes.nth(i)).toHaveText(portType[i].name)

          // Нажимаем чекбокс
          await firewallPage.portCheckboxes.nth(i).click()
          await firewallPage.portsFilter.click()

          // Берем значение конфигураций после фильтрации
          const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)

          // Сбросить фильтры
          await firewallPage.resetFiltersBtn.click()

          expect.soft(portType[i].apiCount, portType[i].name).toEqual(filtredConfigurationCount)

        }

      })

      test('Регион', {
        annotation: {
          type: 'Баг заведен',
          description: 'https://jira.selectel.org/browse/WEB-8474'
        },
      }, async ({ generalFunctionsPage, firewallPage }) => {

        // Массив с регионами
        const regionArr = ['Санкт-Петербург', 'Москва', 'Новосибирск']

        await expect.soft(firewallPage.regionCheckboxes).toHaveCount(regionArr.length)

        // Проверка для каждого региона
        for (let i = 0; i < regionArr.length; i++) {

          // Нажать на выпадающий список "Регион"
          await firewallPage.regionFilter.click()

          // Проверяем, что регион отображен в списке
          await expect.soft(firewallPage.regionCheckboxes.nth(i)).toHaveText(regionArr[i])

          // Нажимаем чекбокс
          await firewallPage.regionCheckboxes.nth(i).click()

          // Берем значение конфигураций после фильтрации
          const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)

          // Сбросить фильтры
          await firewallPage.resetFiltersBtn.click()

          // Проверяем, что из всех карточек соответсвующее кол-во подходящих
          let suitableCardCount = 0
          let allAddButtons = await firewallPage.addConfigButtons.all()

          // Открываем модалки добавления конфигурации
          for (let addBtn of allAddButtons) {
            await addBtn.click()

            // Если список регионов есть, проверяем, есть ли нужный в списке
            if (await firewallPage.modalRegionInput.isVisible()) {
              await firewallPage.modalRegionInput.click()
              let configRegions = await firewallPage.modalRegionList.allInnerTexts()

              if (configRegions.includes(regionArr[i])) {
                suitableCardCount++
              }
            }
            // Если списка регионов нет, значит конфига доступна везде
            else {
              suitableCardCount++
            }

            // Закрываем модальное окно
            await firewallPage.closeModalWindow.click()
          }

          // Проверяем, что кол-во отфильтрованных карточек совпадает
          expect.soft(suitableCardCount, regionArr[i]).toEqual(filtredConfigurationCount)
        }

      })

      test.describe('Цена в месяц', () => {

        test('Состояние по умолчанию', async ({ firewallPage }) => {

          // Найдем минимальное и максимальное значения для цены
          const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

          // Нажать на выпадающий список "Производительность"
          await firewallPage.priceFilter.click()

          // Проверяем, что параметр отображен в списке
          await expect.soft(firewallPage.priceFilterDropdown).toContainText('Цена в месяц, ₽')

          // Локаторы для полей ввода
          const minInput = firewallPage.priceFilterDropdown.locator('input').first()
          const maxInput = firewallPage.priceFilterDropdown.locator('input').last()

          // Получаем актуальные значения, используя нашу функцию
          const actualMinValue = await firewallPage.getPlaceholderAsNumber(minInput)
          const actualMaxValue = await firewallPage.getPlaceholderAsNumber(maxInput)

          // Выполняем проверки
          expect.soft(actualMinValue, "Минимальное значение в плейсхолдере неверно").toEqual(limitValues.min)
          expect.soft(actualMaxValue, "Максимальное значение в плейсхолдере неверно").toEqual(limitValues.max)
          expect.soft(actualMinValue, "Минимальное значение в плейсхолдере 0").not.toEqual(0)
          expect.soft(actualMaxValue, "Максимальное значение в плейсхолдере 0").not.toEqual(0)

        })

        const testData = [
          {
            testName: 'Цена в месяц "От"',
            inputIndexs: [0],
            inputValues: ['min']
          },
          {
            testName: 'Цена в месяц "До"',
            inputIndexs: [1],
            inputValues: ['max']
          },
          {
            testName: 'Цена в месяц "От" и "До"',
            inputIndexs: [0, 1],
            inputValues: ['min', 'max']
          },
        ]

        for (let data of testData) {
          test(data.testName, async ({ generalFunctionsPage, firewallPage }) => {

            const defaultPriceArr = await firewallPage.configPrice.all()

            // Нажать на выпадающий список "Цена"
            await firewallPage.priceFilter.click()

            // Найдем минимальное и максимальное значения для цены
            const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

            // Ввод значений в поля ввода
            for (let i of data.inputIndexs) {
              const input = firewallPage.priceFilterDropdown.locator('input').nth(i)

              // Цена
              if (data.inputValues[i] == 'min') {
                await input.fill(String(limitValues.min + 100))
              }
              else {
                await input.fill(String(limitValues.max - 100))
              }
            }

            /// Очистить цену от лишних символов и преобразовать в число
            const arrayPrices = await generalFunctionsPage.cropTextArrayAndConvertToNumber(firewallPage.configPrice)

            /// Проверяем, что на странице, только карточки с соответствующей ценой
            if (data.inputValues.length == 1 && data.inputValues[0] == 'min') {
              arrayPrices.forEach((item) => {
                expect.soft(
                  (item: number) => item >= limitValues.min + 100,
                  `Значение ${item} меньше заданного диапазона`
                ).toBeTruthy()
              })
            }
            else if (data.inputValues.length == 1 && data.inputValues[0] == 'max') {
              arrayPrices.forEach((item) => {
                expect.soft(
                  (item: number) => item <= limitValues.max - 100,
                  `Значение ${item} больше заданного диапазона`
                ).toBeTruthy()
              })
            } else {
              arrayPrices.forEach((item) => {
                expect.soft(
                  (item: number) => ((item >= limitValues.min + 100) && (item <= limitValues.max - 100)),
                  `Значение ${item} вне заданного диапазона`
                ).toBeTruthy()
              })
            }

            // Берем значение конфигураций после фильтрации
            const filtredConfigurationCount = await generalFunctionsPage.convertToNumber(firewallPage.configurationCount)

            // Сбросить фильтры
            await firewallPage.resetFiltersBtn.click()

            // Проверяем, что из всех карточек соответсвующее кол-во подходящих
            let suitableCardCount = 0

            for (let item of defaultPriceArr) {
              let num = await generalFunctionsPage.convertToNumber(item)
              if (data.inputValues.length == 1 && data.inputValues[0] == 'min') {
                if (num >= limitValues.min + 100) {
                  suitableCardCount++
                }
              }
              else if (data.inputValues.length == 1 && data.inputValues[0] == 'max') {
                if (num <= limitValues.max - 100) {
                  suitableCardCount++
                }
              } else {
                if (num >= limitValues.min + 100 && num <= limitValues.max - 100) {
                  suitableCardCount++
                }
              }
            }
            expect.soft(suitableCardCount).toEqual(filtredConfigurationCount)

          })
        }

        test.describe('Крайние значения в обоих каунтерах', () => {

          let limitValues
          let valueNow

          test.beforeEach(async ({ firewallPage }) => {

            // Найдем минимальное и максимальное значения для цены
            limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)
            valueNow = {
              '1': String(limitValues.min),
              '9999999': String(limitValues.max)
            }

          })

          // Входящие данные для проверки
          const dataInput = [
            { nameTest: 'Минимальное', valueInput: ['1', '1'] },
            { nameTest: 'Максимальное', valueInput: ['9999999', '9999999'] },
            { nameTest: 'Минимальные и максимальные', valueInput: ['1', '9999999'] },
          ]

          for (const checkFilter of dataInput) {

            test(`${checkFilter.nameTest}`, async ({ firewallPage }) => {

              // Нажать на выпадающий список "Цена"
              await firewallPage.priceFilter.click()

              // Ввод значений в поля ввода
              const minInput = firewallPage.priceFilterDropdown.locator('input').first()
              const maxInput = firewallPage.priceFilterDropdown.locator('input').last()

              await minInput.fill(checkFilter.valueInput[0])
              await maxInput.fill(checkFilter.valueInput[1])

              // Убрать фокус
              await firewallPage.priceFilterDropdown.click()

              await expect.soft(minInput).toHaveAttribute('aria-valuenow', valueNow[checkFilter.valueInput[0]])
              await expect.soft(maxInput).toHaveAttribute('aria-valuenow', valueNow[checkFilter.valueInput[1]])

              /// Все названия карточек и цен за месяц
              const priceMonth = await firewallPage.configPrice.allInnerTexts()
              expect.soft(priceMonth.length).toBeGreaterThanOrEqual(1)

              /// Очистить цену от лишних символов и преобразовать в число
              const pricesCard = priceMonth[0].replace(/[^\d,]/g, '').replace(',', '.')

              // Значение в поле ввода и на карточках
              expect.soft(Number(pricesCard)).toBeGreaterThanOrEqual(Number(valueNow[checkFilter.valueInput[0]]))
              expect.soft(Number(pricesCard)).toBeLessThanOrEqual(Number(valueNow[checkFilter.valueInput[1]]))
              expect.soft(Number(pricesCard)).not.toEqual(0)
            })
          }
        })

      
        test.describe('Ошибка валидации инпутов', () => {

          // Входящие данные для проверки
          const dataInput = [
            { nameTest: 'Минимальное', valueInput: '1' },
            { nameTest: 'Максимальное', valueInput: '9999999' },
          ]

          for (const checkFilter of dataInput) {

            test(`${checkFilter.nameTest}`, async ({ firewallPage }) => {

              const inputArr = [
                {
                  locator: firewallPage.priceFilterDropdown.locator('input').first(),
                  errorLocator: firewallPage.priceErrorMessage.first()
                },
                {
                  locator: firewallPage.priceFilterDropdown.locator('input').last(),
                  errorLocator: firewallPage.priceErrorMessage.last()
                },
              ]

              // Найдем минимальное и максимальное значения для цены
              const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

              for (let input of inputArr) {

                // Открыть выпадающий список "Производительность"
                await firewallPage.priceFilter.click()

                // Ввод значения
                await input.locator.fill(checkFilter.valueInput)

                // Проверяем, что появилось сообщение валидации
                await expect.soft(input.errorLocator).toBeVisible()
                await expect.soft(input.errorLocator).toHaveText(`Выберите от ${limitValues.min.toLocaleString('fr-FR')} до ${limitValues.max.toLocaleString('fr-FR')}`)

                // Убрать фокус
                await firewallPage.priceFilterDropdown.click()

                // Проверяем, что после снятия фокуса значение в инпуте заменилось
                if (checkFilter.valueInput === '9999999') {
                  await expect.soft(input.locator).toHaveAttribute('aria-valuenow', String(limitValues.max))
                } else {
                  await expect.soft(input.locator).toHaveAttribute('aria-valuenow', String(limitValues.min))
                }

                // Закрыть выпадающий список "Производительность"
                await firewallPage.priceFilter.click()
              }
            })
          }


          test('Ошибка валидации каунтеров', async ({ generalFunctionsPage }) => {

            // Провести проверку для валидации у каунтеров "Объем диска, ГБ"
            await generalFunctionsPage.errorTextCounters('.firewall-filters__inline-selects [prefix="От"] input')

            // Провести проверку для валидации у  каунтера "Количество копий"
            await generalFunctionsPage.errorTextCounters('.firewall-filters__inline-selects [prefix="До"] input')

          })
        })

        })

      test('Комплексная проверка фильтрации', async ({ firewallPage, generalFunctionsPage }) => {

        // Найдем минимальное и максимальное значения для цены
        const limitValues = await firewallPage.getMinMaxFromLocators(firewallPage.configPrice)

        // Нажать на выпадающий список "Готовность"
        await firewallPage.readinessFilter.click()

        // Нажимаем чекбоксы
        await firewallPage.readinessCheckboxes.first().click()
        await firewallPage.readinessCheckboxes.nth(1).click()

        // Нажать на выпадающий список "Производительность"
        await firewallPage.performanceFilter.click()

        // Установка двух поинтеров слайдеров в случайное положение
        const container = firewallPage.containerSlider.first()
        const pointLeft = container.locator('.vue-slider-dot').first()
        const pointRight = container.locator('.vue-slider-dot').last()

        await firewallPage.moveFilterSlider(pointLeft, 'ArrowRight', 1)
        await firewallPage.moveFilterSlider(pointRight, 'ArrowLeft', 1)

        // Проверяем, что слайдеры корректно установлены
        let leftValue = await pointLeft.getAttribute('aria-valuenow')
        let rightValue = await pointRight.getAttribute('aria-valuenow')

        await firewallPage.performanceFilter.click()

        // Нажать на выпадающий список "Регион"
        await firewallPage.regionFilter.click()
        // Нажимаем чекбокс "Москва"
        await firewallPage.regionCheckboxes.nth(1).click()
        await firewallPage.regionFilter.click()

        // Нажать на выпадающий список "Сертификаты"
        await firewallPage.certificatesFilter.click()
        // Нажимаем чекбокс
        await firewallPage.certificationCheckboxes.click()
        await firewallPage.certificatesFilter.click()

        // Нажать на выпадающий список "Цена"
        await firewallPage.priceFilter.click()

        // Ввод значений в поле ввода
        const maxInput = firewallPage.priceFilterDropdown.locator('input').last()

        // Цена "До"
        await maxInput.fill(String(limitValues.max - 100))
        await firewallPage.priceFilter.click()

        // Проверяем параметры отображенных карточек на соответствие установленным фильтрам
        let configArr = await firewallPage.configCard.all()
        let fwValues = await firewallPage.virtualConfigFW.all()

        for (let i = 0; i < configArr.length; i++) {

          // FW, Гбит/с в заданном диапозоне
          let num = await generalFunctionsPage.convertToNumber(fwValues[i])
          expect.soft(num).toBeLessThanOrEqual(Number(rightValue))
          expect.soft(num).toBeGreaterThanOrEqual(Number(leftValue))

          // Теги на карточках соответствую фильтрам "Готовность" и "Сертификаты"
          await expect.soft(firewallPage.configTags.nth(i)).toHaveText(/1\sдень|5\sдней/)
          await expect.soft(firewallPage.configTags.nth(i)).toHaveText(/Сертификат\sФСТЭК/)

          // Проверка наличия Региона у конфигурации
          let allAddButtons = await firewallPage.addConfigButtons.all()
          await allAddButtons[i].click()

          // Если список регионов есть, проверяем, есть ли нужный в списке
          if (await firewallPage.modalRegionInput.isVisible()) {
            await firewallPage.modalRegionInput.click()
            let configRegions = await firewallPage.modalRegionList.allInnerTexts()

            expect.soft(configRegions).toContain('Москва')
          }

          // Закрываем модальное окно
          await firewallPage.closeModalWindow.click()
        }

        /// Проверка соответствия цен на карточках
        const arrayPrices = await generalFunctionsPage.cropTextArrayAndConvertToNumber(firewallPage.configPrice)

        /// Проверяем, что на странице, только карточки с меньшей ценой, чем задано
        arrayPrices.forEach((item) => {
          expect.soft(
            (item: number) => item <= limitValues.max - 100,
            `Значение ${item} больше заданного диапазона`
          ).toBeTruthy()
        })

        // Сбросить фильтры
        await firewallPage.resetFiltersBtn.click()
      })
    })


    test.describe('Добавление конфигурации в саммари', () => {

      test('Соответствие данных при добавлении конфигурации', async ({ generalFunctionsPage, firewallPage }) => {

        // Проверка блока саммари до добавления
        await expect.soft(firewallPage.textInfo).toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

        // Берем названия конфигурации с карточки
        const serverName = await firewallPage.configName.first().innerText()
        const firewallCount = 2

        await firewallPage.addConfigInSummary(0, String(firewallCount))

        // Проверка, что название конфигурации в саммари правильное
        await expect.soft(firewallPage.summaryConfigName).toHaveText(`${serverName} × ${firewallCount} шт.`)

        // Проверка, что появилась кнопка для удаления "мусорное ведро" в саммари
        await expect.soft(firewallPage.summaryDeleteCalc).toBeVisible()

        // Берем цену сервера на карточке и в саммари
        const serverPrice = await generalFunctionsPage.convertToNumber(firewallPage.configPrice.first())
        const serverPriceInSummary = await generalFunctionsPage.convertToNumber(firewallPage.summaryPointsPrices.first())

        // Проверяем, что в саммари цена равна цене на карточке
        expect.soft(serverPriceInSummary).toEqual(serverPrice * firewallCount)

        // Проверяем, что сумма в саммари правильная
        await firewallPage.checkPricesAfterChanges(1)

        // Удалить добавленный сервер из саммари
        await firewallPage.summaryDeleteCalc.click()
        await generalFunctionsPage.alertDelete()

        // Проверка блока саммари после удаления
        await expect.soft(firewallPage.textInfo).toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

      })

      test('Соответствие кол-во на карточке с суммой кол-в в пулах', async ({ generalFunctionsPage, firewallPage }) => {

        // Берем все карточки конфигураций
        const configArr = await firewallPage.configCard.all()
        const allAddButtons = await firewallPage.addConfigButtons.all()

        for (let i = 0; i < configArr.length; i++) {

          // Получаем кол-во конфиг на карточке
          const configQuantity = await generalFunctionsPage.convertToNumber(configArr[i].locator('.firewall-card__quantity'))
          let poolQuantity = 0

          // Если кол-во указано, проверяем с кол-вом в пулах
          if (configQuantity) {

            // Открываем модальное окно
            await allAddButtons[i].click()

            // Проходимся по всем регионам
            await firewallPage.modalRegionInput.click()
            let regionArr = await firewallPage.modalRegionList.all()
            for (let region of regionArr) {
              await region.click()

              await firewallPage.modalPoolInput.click()
              const quantityArr = await firewallPage.poolCountList.all()

              // Добавляем кол-во каждого пула в сумму
              for (let quantity of quantityArr) {
                poolQuantity += await generalFunctionsPage.convertToNumber(quantity)
              }
              await firewallPage.modalRegionInput.click()
            }

            // Закрываем модальное окно
            await firewallPage.closeModalWindow.click()
          }

          // Сравниваем, что значение на карточке соответствует кол-ву в пулах
          expect.soft(poolQuantity).toEqual(configQuantity)
        }


      })

      test.describe('Валидация каунтера "Кол-во межсетевых экранов"', () => {


        test('Ввод валидных значений', async ({ firewallPage, generalFunctionsPage }) => {

          // Берем все карточки конфигураций
          const configArr = await firewallPage.configCard.all()
          const allAddButtons = await firewallPage.addConfigButtons.all()

          for (let i = 0; i < configArr.length; i++) {

            // Получаем кол-во конфиг на карточке
            const configQuantity = await generalFunctionsPage.convertToNumber(configArr[i].locator('.firewall-card__quantity'))

            // Если кол-во указано, проверяем с кол-вом в пулах
            if (configQuantity) {

              // Открываем модальное окно
              await allAddButtons[i].click()

              // Проверка состояния кнопок каунтера
              await expect.soft(firewallPage.downNumButton).toBeDisabled()
              await expect.soft(firewallPage.upNumButton).toBeEnabled()

              // Получаем максимальное кол-во в пуле
              const maxCount = await generalFunctionsPage.convertToNumber(firewallPage.poolCountSelected)

              // Ввод в каунтер среднего значения
              const inputValue = maxCount - 1

              await firewallPage.modalNumInput.fill(String(inputValue))
              await expect.soft(firewallPage.modalNumInput).toHaveAttribute('aria-valuenow', String(inputValue))

              // Проверка, что кнопка "-" - незадизейблена
              await expect.soft(firewallPage.downNumButton).toBeEnabled()

              // Проверка кнопки "-"
              await firewallPage.downNumButton.click()
              await expect.soft(firewallPage.modalNumInput).toHaveAttribute('aria-valuenow', String(inputValue - 1))

              // Проверка кнопки "+"
              await firewallPage.upNumButton.click()
              await expect.soft(firewallPage.modalNumInput).toHaveAttribute('aria-valuenow', String(inputValue))

              break
            }
          }
        })

        test.describe('Ввод невалидных значений', function () {
          const testData = [
            {
              nameTest: 'Максиальное значение',
              inputValue: '999999',
              replaceValue: 'max'
            },
            {
              nameTest: 'Некорректные символы',
              inputValue: '_\)\(\*?:%;№"\!\{\}\[\]/\|\\',
              replaceValue: 'min'
            }]

          for (const data of testData) {
            test(`${data.nameTest}`, async ({ firewallPage, generalFunctionsPage }) => {

              // Берем все карточки конфигураций
              const configArr = await firewallPage.configCard.all()
              const allAddButtons = await firewallPage.addConfigButtons.all()

              for (let i = 0; i < configArr.length; i++) {

                // Получаем кол-во конфиг на карточке
                const configQuantity = await generalFunctionsPage.convertToNumber(configArr[i].locator('.firewall-card__quantity'))

                // Если кол-во указано, проверяем с кол-вом в пулах
                if (configQuantity) {

                  // Открываем модальное окно
                  await allAddButtons[i].click()

                  // Получаем кол-во серверов в выбранном пуле
                  const maxCount = await generalFunctionsPage.convertToNumber(firewallPage.poolCountSelected)

                  // Под полем "Кол-во нод" - нет сообщения об ошибке
                  await expect.soft(firewallPage.errorMessage).toBeHidden()

                  // Ввод невалидного значения
                  await firewallPage.modalNumInput.fill(data.inputValue)

                  // Появится сообщение об ошибке
                  await expect.soft(firewallPage.errorMessage).toHaveText(`Выберите от 1 до ${maxCount}`)
                  await expect.soft(firewallPage.errorMessage).toBeVisible()

                  // Нажать вне поля
                  await firewallPage.modalWindow.click()

                  // Для значений больше максимального в инпут будет подставлено максимальное значение, 
                  // а для значений меньше минимального - минимальное
                  if (data.replaceValue == 'max') {
                    await expect.soft(firewallPage.modalNumInput).toHaveAttribute('aria-valuenow', String(maxCount))
                  }
                  else {
                    await expect.soft(firewallPage.modalNumInput).toHaveAttribute('aria-valuenow', '1')
                    await firewallPage.downNumButton.waitFor()
                  }

                  // Сообщение об ошибке будет скрыто
                  await expect.soft(firewallPage.errorMessage).toBeHidden()

                  break
                }
              }
            })
          }
        })
      })


    })

  })
})

