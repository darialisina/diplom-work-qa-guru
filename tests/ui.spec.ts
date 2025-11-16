import { test, expect } from '../src/Helpers/Fixtures/fixtures'
import { UserBuilder } from '../src/Helpers/Builders/index'


test.describe('Межсетевые экраны', () => {

  test(`Сортировка - По популярности`, async ({ app, goFirewallPage }) => {

    const type = 'По популярности'

    // Ожидание появления кнопки сортировки
    await app.firewallPage.configList.sortButton.waitFor({ state: 'visible' })

    // сохраняем состояние калькулятора до изменения сортировки
    const defaultCalculatorCondition = await app.firewallPage.configList.getCalculatorCondition()

    // изменяем сортировку
    await app.firewallPage.configList.chooseSorting(type)
    //Получаем состояние калькулятора после изменения сортировки
    let changedCalculatorCondition = await app.firewallPage.configList.getCalculatorCondition()

    // проверяем, что тип сортировки изменился на выбранный
    await expect(app.firewallPage.configList.sortButton).toHaveText(type)
    // проверяем, что количество конфигураций не изменилось
    expect(changedCalculatorCondition.configCount).toEqual(defaultCalculatorCondition.configCount)
    // проверяем, что конфигурации отсортированы согласно выбранному типу
    expect(await app.firewallPage.configList.configIsSorted(type)).toBeTruthy()

    // порядок конфигураций должен остаться прежним
    expect(changedCalculatorCondition.configList).toEqual(defaultCalculatorCondition.configList)
  })

  test(`Сортировка - Самая низкая цена`, async ({ app, goFirewallPage }) => {

    const type = 'Самая низкая цена'
    const changeType = 'По популярности'

    // Ожидание появления кнопки сортировки
    await app.firewallPage.configList.sortButton.waitFor({ state: 'visible' })

    // сохраняем состояние калькулятора до изменения сортировки
    const defaultCalculatorCondition = await app.firewallPage.configList.getCalculatorCondition()

    // изменяем сортировку
    await app.firewallPage.configList.chooseSorting(changeType)
    await app.firewallPage.configList.chooseSorting(type)
    //Получаем состояние калькулятора после изменения сортировки
    let changedCalculatorCondition = await app.firewallPage.configList.getCalculatorCondition()

    // проверяем, что тип сортировки изменился на выбранный
    await expect(app.firewallPage.configList.sortButton).toHaveText(type)
    // проверяем, что количество конфигураций не изменилось
    expect(changedCalculatorCondition.configCount).toEqual(defaultCalculatorCondition.configCount)
    // проверяем, что конфигурации отсортированы согласно выбранному типу
    expect(await app.firewallPage.configList.configIsSorted(type)).toBeTruthy()

    // порядок конфигураций должен остаться прежним
    expect(changedCalculatorCondition.configList).toEqual(defaultCalculatorCondition.configList)
  })

  test(`Сортировка - Самая высокая цена`, async ({ app, goFirewallPage }) => {

    const type = 'Самая высокая цена'

    // Ожидание появления кнопки сортировки
    await app.firewallPage.configList.sortButton.waitFor({ state: 'visible' })

    // сохраняем состояние калькулятора до изменения сортировки
    const defaultCalculatorCondition = await app.firewallPage.configList.getCalculatorCondition()

    // изменяем сортировку
    await app.firewallPage.configList.chooseSorting(type)

    //Получаем состояние калькулятора после изменения сортировки
    let changedCalculatorCondition = await app.firewallPage.configList.getCalculatorCondition()

    // проверяем, что тип сортировки изменился на выбранный
    await expect(app.firewallPage.configList.sortButton).toHaveText(type)
    // проверяем, что количество конфигураций не изменилось
    expect(changedCalculatorCondition.configCount).toEqual(defaultCalculatorCondition.configCount)
    // проверяем, что конфигурации отсортированы согласно выбранному типу
    expect(await app.firewallPage.configList.configIsSorted(type)).toBeTruthy()

    // для сортировки "Самая высокая цена" порядок конфигураций должен измениться
    expect(changedCalculatorCondition.configList).not.toEqual(defaultCalculatorCondition.configList)

  })

  test(`Кнопка "Удалить" в саммари - При одной добавленной конфигурации`, async ({ app, goFirewallPage }) => {

    // добавляем в саммари заданное количество конфигураций
    await app.firewallPage.modal.addConfigInSummary()

    // при одной конфигурации кнопки удаления не должно быть видно
    await expect(app.firewallPage.summary.summaryDeleteConfig).toHaveCount(0)

    // удаляем все добавленные конфигурации
    await app.firewallPage.summary.deleteAllServers()

    // проверяем, что саммари вернулось к изначальному состоянию
    await expect(app.firewallPage.summary.textInfo)
      .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
  })


  test(`Кнопка "Удалить" в саммари - При добавлении двух конфигураций`, async ({ app, goFirewallPage }) => {
    // кол-во добавляемых серверов
    const configCount = 2

    // добавляем в саммари заданное количество конфигураций
    for (let i = 0; i < configCount; i++) {
      await app.firewallPage.modal.addConfigInSummary(i)
    }

    // при двух конфигурациях должны быть видны 2 кнопки удаления
    await expect(app.firewallPage.summary.summaryDeleteConfig).toHaveCount(2)

    // удаляем все добавленные конфигурации
    await app.firewallPage.summary.deleteAllServers()

    // проверяем, что саммари вернулось к изначальному состоянию
    await expect(app.firewallPage.summary.textInfo)
      .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
  })


  test(`Кнопка "Удалить" в саммари - При добавлении трех и более конфигураций`, async ({ app, goFirewallPage }) => {
    // кол-во добавляемых серверов
    const configCount = 3

    // добавляем в саммари заданное количество конфигураций
    for (let i = 0; i < configCount; i++) {
      await app.firewallPage.modal.addConfigInSummary(i)
    }

    // при трех и более конфигурациях разворачиваем саммари и проверяем количество кнопок
    await app.firewallPage.summary.collapseSummary()
    await expect(app.firewallPage.summary.deleteConfigBtn).toHaveCount(configCount)

    // удаляем все добавленные конфигурации
    await app.firewallPage.summary.deleteAllServers()

    // проверяем, что саммари вернулось к изначальному состоянию
    await expect(app.firewallPage.summary.textInfo)
      .toHaveText('Внесите продукт в расчет, чтобы отобразилась итоговая стоимость инфраструктуры')
  })



  test('Соответствие данных при добавлении конфигурации', async ({ app, goFirewallPage }) => {

    // получаем название первой конфигурации
    const serverName = await app.firewallPage.configList.getConfigName(0)
    // указываем количество межсетевых экранов для добавления
    const firewallCount = 2

    // добавляем в саммари конфигурацию с указанным количеством
    await app.firewallPage.modal.addConfigInSummary(0, String(firewallCount))
    //Получаем цены конфигурации из карточки и саммари
    const configPrices = await app.firewallPage.configList.getConfigPrices(0)

    // проверяем, что название конфигурации в саммари отображается корректно
    await expect(app.firewallPage.summary.summaryConfigName).toHaveText(`${serverName} × ${firewallCount} шт.`)
    // проверяем, что цена в саммари равна цене карточки, умноженной на количество
    expect(configPrices.summaryPrice).toEqual(configPrices.cardPrice * firewallCount)

    // проверяем, что итоговая сумма в саммари рассчитана правильно
    await app.firewallPage.summary.checkPricesAfterChanges(1)
  })
})


test.describe('Форма регистрации', () => {

  test.describe('Ввод невалидных значений', () => {
    test.describe('Email', () => {
      const inputDatainForm = [
        {
          testName: 'Ввод email без @',
          emailGenerator: (builder) => builder.addEmailWithoutAtSymbol().email,
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Ввод email с пробелом',
          emailGenerator: (builder) => builder.addEmailWithSpace().email,
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Ввод email с двумя точками подряд',
          emailGenerator: (builder) => builder.addEmailWithTwoDots().email,
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Ввод email без домена',
          emailGenerator: (builder) => builder.addEmailWithoutDomain().email,
          validationText: 'Введите корректный email',
        },
        {
          testName: 'Пустое значение в поле для email',
          emailGenerator: (builder) => builder.addEmptyEmail().email,
          validationText: 'Введите email',
        },
        {
          testName: 'Ввод email длиннее 100 символов',
          emailGenerator: (builder) => builder.addLongEmail().email,
          validationText: 'Введите корректный email',
        },
      ]

      for (const inputData of inputDatainForm) {
        test(`${inputData.testName}`, async ({ app, goMainPage }) => {
          // Создаем отдельный builder для генерации email
          const emailBuilder = new UserBuilder()
          const email = inputData.emailGenerator(emailBuilder)

          // создаем пользователя с валидным email и невалидным паролем
          const user = new UserBuilder()
            .setInvalid()
            .addEmail(email)
            .addPassword()
            .generate()

          // заполняем форму регистрации
          await app.mainPage.fillRegistrationForm(user.email, user.password)
          // отправляем форму регистрации
          await app.mainPage.sendRegistrationForm()

          // проверяем, что в поле записано только 100 символов, если пытались ввести больше
          if (user.email.length > 100) {
            await expect(app.mainPage.inputEmail).toHaveValue(user.email.slice(0, 100))
          } else {
            await expect(app.mainPage.inputEmail).toHaveValue(user.email)
          }

          // проверяем корректность текста сообщения валидации под полем
          await expect(app.mainPage.errorEmail).toHaveText(inputData.validationText)
        })
      }
    })

    test.describe('Пароль', () => {
      const inputDatainForm = [
        {
          testName: 'Пароль меньше 12 символов',
          passwordGenerator: (builder) => builder.addShortPassword().password,
          validationText: 'Пароль должен содержать более 12 символов',
        },
        {
          testName: 'Пароль без цифр',
          passwordGenerator: (builder) => builder.addPasswordWithoutDigits().password,
          validationText: 'Пароль должен содержать цифры',
        },
        {
          testName: 'Пароль не латинскими буквами',
          passwordGenerator: (builder) => builder.addPasswordWithCyrillic().password,
          validationText: 'Кириллические символы в пароле не допускаются',
        },
        {
          testName: 'Пароль без букв в верхнем регистре',
          passwordGenerator: (builder) => builder.addPasswordLowcase().password,
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
        {
          testName: 'Пароль без букв в нижнем регистре',
          passwordGenerator: (builder) => builder.addPasswordUppercase().password,
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
        {
          testName: 'Пароль с пробелами',
          passwordGenerator: (builder) => builder.addPasswordWithSpace().password,
          validationText: 'Пароль не может содержать символ № или пробел',
        },
        {
          testName: 'Пароль длиннее 100 символов',
          passwordGenerator: (builder) => builder.addLongPassword().password,
          validationText: 'Пароль должен содержать буквы обоих регистров',
        },
      ]

      for (const inputData of inputDatainForm) {
        test(`${inputData.testName}`, async ({ app, goMainPage }) => {

          // Создаем отдельный builder для генерации пароля
          const passwordBuilder = new UserBuilder()
          const password = inputData.passwordGenerator(passwordBuilder)

          // создаем пользователя с валидным email и невалидным паролем
          const user = new UserBuilder()
            .setInvalid()
            .addEmail()
            .addPassword(password)
            .generate()

          // заполняем форму регистрации
          await app.mainPage.fillRegistrationForm(user.email, user.password)
          // отправляем форму регистрации
          await app.mainPage.sendRegistrationForm()

          // проверяем, что в поле записано только 100 символов, если пытались ввести больше
          if (user.password.length > 100) {
            await expect(app.mainPage.inputPassword).toHaveValue(user.password.slice(0, 100))
          } else {
            await expect(app.mainPage.inputPassword).toHaveValue(user.password)
          }
          // проверяем корректность текста сообщения валидации под полем
          await expect(app.mainPage.errorPassword).toHaveText(inputData.validationText)
        })
      }
    })

  })

  test('Просмотр пароля', async ({ app, goMainPage }) => {
    // создаем пользователя с валидными данными
    const user = new UserBuilder()
      .addEmail()
      .addPassword()
      .generate()

    // заполняем форму регистрации
    await app.mainPage.fillRegistrationForm(user.email, user.password)

    // проверяем, что поле пароля имеет тип "password" (скрытый)
    await expect(app.mainPage.inputPassword).toHaveAttribute('type', 'password')

    // нажимаем на кнопку "Показать пароль"
    await app.mainPage.uncoverPassword()

    // проверяем, что значение в поле "Пароль" соответствует введенному
    await expect(app.mainPage.inputPassword).toHaveValue(user.password)
    // проверяем, что тип поля изменился на "text" (видимый)
    await expect(app.mainPage.inputPassword).toHaveAttribute('type', 'text')
  })
})
