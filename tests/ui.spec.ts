import { test, expect } from '../src/Helpers/Fixtures/fixtures'
import { UserBuilder } from '../src/Helpers/Builders/index'


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

      await expect(app.firewallPage.textInfo)
        .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')

      for (let i = 0; i < delType.count; i++) {
        await app.firewallPage.addConfigInSummary(i)
      }

      if (delType.count == 2) {
        await expect(app.firewallPage.summaryDeleteConfig).toHaveCount(2)
      }
      else if (delType.count == 1) {
        await expect(app.firewallPage.summaryDeleteConfig).toHaveCount(0)
      }
      else {
        await app.firewallPage.collapseSummary()
        await expect(app.firewallPage.deleteConfigBtn).toHaveCount(delType.count)
      }

      await app.firewallPage.deleteAllServers()

      // Проверка, что саммари вернулось к изначальному состоянию
      await expect(app.firewallPage.textInfo)
        .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
    })
  }


  test('Соответствие данных при добавлении конфигурации', async ({ app, goFirewallPage }) => {

    const serverName = await app.firewallPage.getConfigName(0)
    const firewallCount = 2

    await app.firewallPage.addConfigInSummary(0, String(firewallCount))
    const configPrices = await app.firewallPage.getConfigPrices(0)

    // Проверка, что название конфигурации в саммари правильное
    await expect(app.firewallPage.summaryConfigName).toHaveText(`${serverName} × ${firewallCount} шт.`)
    expect(configPrices.summaryPrice).toEqual(configPrices.cardPrice * firewallCount)

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
          const user = new UserBuilder()
            .setInvalid()
            .addEmail(inputData.email)
            .addPassword()
            .generate()

          await app.mainPage.fillRegistrationForm(user.email, user.password)
          await app.mainPage.sendRegistrationForm()

          // Проверка, что в поле записано только 100 символов, если пытались ввести больше
          if (user.email.length > 100) {
            await expect.soft(app.mainPage.inputEmail).toHaveValue(user.email.slice(0, 100))
          } else {
            await expect.soft(app.mainPage.inputEmail).toHaveValue(user.email)
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
          testName: 'Пароль длиннее 100 символов',
          password:
            'TESTS1234TESTS123TESTS123TESTS123TESTS123TESTS123TESTS1234TESTS123TESTS123TESTS123TESTS123TESTS1234_test123',
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
      ]

      for (const inputData of inputDatainForm) {
        test(`${inputData.testName}`, async ({ app, goMainPage }) => {

          const user = new UserBuilder()
            .setInvalid()
            .addEmail()
            .addPassword(inputData.password)
            .generate()

          await app.mainPage.fillRegistrationForm(user.email, user.password)
          await app.mainPage.sendRegistrationForm()

          // Проверка, что в поле записано только 100 символов, если пытались ввсети больше
          if (user.password.length > 100) {
            await expect.soft(app.mainPage.inputPassword).toHaveValue(user.password.slice(0, 100))
          } else {
            await expect.soft(app.mainPage.inputPassword).toHaveValue(user.password)
          }
          // Проверка текста сообщения под полем
          await expect.soft(app.mainPage.errorPassword).toHaveText(inputData.validationText)
        })
      }
    })

  })

  test('Просмотр пароля', async ({ app, goMainPage }) => {
    const user = new UserBuilder()
      .addEmail()
      .addPassword()
      .generate()

    await app.mainPage.fillRegistrationForm(user.email, user.password)

    await expect.soft(app.mainPage.inputPassword).toHaveAttribute('type', 'password')

    await app.mainPage.uncoverPassword()

    // Проверка, что значение в поле "Пароль" соответствует вводимому
    await expect.soft(app.mainPage.inputPassword).toHaveValue(user.password)
    await expect.soft(app.mainPage.inputPassword).toHaveAttribute('type', 'text')
  })
})
