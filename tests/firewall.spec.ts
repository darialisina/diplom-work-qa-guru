import { test, expect } from '../src/Helpers/Fixtures/fixtures'


test.describe('Межсетевые экраны', () => {

  const sortingTypes = ['По популярности', 'Самая низкая цена', 'Самая высокая цена']
  for (const type of sortingTypes) {
    test(`Сортировка - ${type}`, async ({ app, goFirewallPage }) => {

      await expect(app.firewallPage.sortButton).toHaveText('Самая низкая цена')
      const defaultCalculatorCondition = await app.firewallPage.getCalculatorCondition()

      if (type != 'Самая низкая цена') {
        await app.firewallPage.chooseSorting(type)
      }
      let changedCalculatorCondition = await app.firewallPage.getCalculatorCondition()

      await expect(app.firewallPage.sortButton).toHaveText(type)
      expect(changedCalculatorCondition.configCount).toEqual(defaultCalculatorCondition.configCount)
      expect(await app.firewallPage.configIsSorted(type)).toBeTruthy()

      if (type == 'Самая высокая цена') {
        expect(changedCalculatorCondition.configList).not.toEqual(defaultCalculatorCondition.configList)
      }
      else {
        expect(changedCalculatorCondition.configList).toEqual(defaultCalculatorCondition.configList)
      }

    })
  }

  const deleteCases = [
    {
      name: 'При одной добавленной конфигурации',
      count: 1
    },
    {
      name: 'При добавленнии двух конфигураций',
      count: 2
    },
    {
      name: 'При добавленнии трех и более конфигураций',
      count: 3
    }]
  for (const delType of deleteCases) {
    test(`Кнопка “Удалить” в саммари - ${delType.name}`, async ({ app, goFirewallPage }) => {

      // Проверка блока саммари
      await expect.soft(app.firewallPage.textInfo)
        .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

      for (let i = 0; i < delType.count; i++) {
        await app.firewallPage.addConfigInSummary(i)
      }

      if (delType.count == 2) {
        await expect.soft(app.firewallPage.summaryDeleteConfig).toHaveCount(2)
      }
      else if (delType.count > 2) {
        await app.firewallPage.collapseSummary()
        // Теперь для всех серверов отображается кнопка "Удалить конфигурацию"
        await expect.soft(app.firewallPage.deleteConfigBtn).toHaveCount(3)
      }
      else {
        // Теперь кнопок "мусорное ведро" нет в саммари
        await expect.soft(app.firewallPage.summaryDeleteConfig).toHaveCount(0)
      }

      await app.firewallPage.deleteAllServers()

      // Проверка, что саммари вернулось к изначальному состоянию
      await expect.soft(app.firewallPage.textInfo)
        .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
    })
  }


    test('Соответствие данных при добавлении конфигурации', async ({ app, goFirewallPage }) => {

      // Берем названия конфигурации с карточки
      const serverName = await app.firewallPage.getConfigName(0)
      const firewallCount = 2

      await app.firewallPage.addConfigInSummary(0, String(firewallCount))

      const serverPrice = await app.generalFunctionsPage.convertToNumber(app.firewallPage.configPrice.first())
      const serverPriceInSummary = await app.generalFunctionsPage.convertToNumber(app.firewallPage.summaryPointsPrices.first())

      // Проверка, что название конфигурации в саммари правильное
      await expect.soft(app.firewallPage.summaryConfigName).toHaveText(`${serverName} × ${firewallCount} шт.`)

      // Проверяем, что в саммари цена равна цене на карточке
      expect.soft(serverPriceInSummary).toEqual(serverPrice * firewallCount)

      // Проверяем, что сумма в саммари правильная
      await app.firewallPage.checkPricesAfterChanges(1)
    })
})


test.describe('Форма регистрации', () => {

  test.describe('Ввод невалидных значений', () => {
    test.describe('Email', () => {
      const inputDatainForm = [
        {
          testName: 'Ввод email без @',
          email: 'emaildomain.com',
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Ввод email с пробелом',
          email: 'email @domain.com',
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Ввод email с двумя точками подряд',
          email: 'test..test@example.com',
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Ввод email без домена',
          email: 'email@',
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Пустое значение в поле для email',
          email: '',
          validationText: 'Введите email',
        },
        {
          testName: 'Ввод email длиннее 100 символов',
          email:
            'emailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemaiemailemailemail@mail.ru',
          validationText: 'Введите корректный email',
        },
      ]

      for (const inputData of inputDatainForm) {
        test(`${inputData.testName}`, async ({ app, goMainPage }) => {
          const password = '321stseT'


          // Ввод значений
          await app.mainPage.inputPassword.fill(password)

          // Ввод некорректного email
          await app.mainPage.inputEmail.fill(inputData.email)

          // Нажать на кнопку Регистраиция
          await app.mainPage.buttonRegistration.click()

          // Проверка, что в поле записано только 100 символов, если пытались ввести больше
          if (inputData.email.length > 100) {
            await expect.soft(app.mainPage.inputEmail).toHaveValue(inputData.email.slice(0, 100))
          } else {
            // Проверка, что установленное в поле значение соответствует вводимому
            await expect.soft(app.mainPage.inputEmail).toHaveValue(inputData.email)
          }

          // Проверка текста сообщения под полем
          await expect.soft(app.mainPage.errorEmail).toHaveText(inputData.validationText)
        })
      }
    })

    test.describe('Пароль', () => {
      const inputDatainForm = [
        {
          testName: 'Пароль меньше 12 символов',
          password: 'Test123!abc',
          validationText: 'Пароль должен содержать более 12 символов',
        },
        {
          testName: 'Пароль без цифр',
          password: 'SecurePass@Word',
          validationText: 'Пароль должен содержать цифры',
        },
        {
          testName: 'Пароль не латинскими буквами',
          password: 'Привет123',
          validationText: 'Кириллические символы в пароле не допускаются',
        },
        {
          testName: 'Пароль без букв в верхнем регистре',
          password: 'mytest123@pass',
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
        {
          testName: 'Пароль без букв в нижнем регистре',
          password: 'PASSWORD123!',
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
        {
          testName: 'Пароль с пробелами',
          password: '123 123 123',
          validationText: 'Пароль не может содержать символ № или пробел',
        },
        {
          testName: 'Пароль без спецсимволов',
          password: 'TestPassword456',
          validationText: `Пароль должен содержать спецсимволы: !\"#$%&'()*+,-./:;<=>?@[\\]^_{|}~`,
        },
        {
          testName: 'Пароль длиннее 100 символов',
          password:
            'TESTS1234TESTS123TESTS123TESTS123TESTS123TESTS123TESTS1234TESTS123TESTS123TESTS123TESTS123TESTS1234_test123',
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
      ]

      for (const inputData of inputDatainForm) {
        test(`${inputData.testName}`, async ({ app, goMainPage }) => {

          // Константа емейла
          const email = 'email@selectel.ru'


          // Ввод значений
          await app.mainPage.inputEmail.fill(email)

          // Ввод некорректного пароля
          await app.mainPage.inputPassword.fill(inputData.password)

          // Нажать на кнопку Регистраиция
          await app.mainPage.buttonRegistration.click()

          // Проверка, что в поле записано только 100 символов, если пытались ввсети больше
          if (inputData.password.length > 100) {
            await expect.soft(app.mainPage.inputPassword).toHaveValue(inputData.password.slice(0, 100))
          } else {
            // Проверка, что установленное в поле значение соответствует вводимому
            await expect.soft(app.mainPage.inputPassword).toHaveValue(inputData.password)
          }
          // Проверка текста сообщения под полем
          await expect.soft(app.mainPage.errorPassword).toHaveText(inputData.validationText)
        })
      }
    })

  })

  test('Просмотр пароля', async ({ app, goMainPage }) => {
    const password = 'Test1234'

    // Ввод значений
    await app.mainPage.inputPassword.fill(password)

    // Проверка, что пароль скрыт
    await expect.soft(app.mainPage.inputPassword).toHaveAttribute('type', 'password')

    // Нажать на кнопку "Глаз"
    await app.mainPage.viewPasswordBtn.click()

    // Проверка, что значение в поле "Пароль" соответствует вводимому
    await expect.soft(app.mainPage.inputPassword).toHaveValue(password)

    // Проверка, что пароль теперь отображается
    await expect.soft(app.mainPage.inputPassword).toHaveAttribute('type', 'text')
  })
})
