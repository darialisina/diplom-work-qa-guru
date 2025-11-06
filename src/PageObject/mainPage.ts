import { Locator, Page } from '@playwright/test'

export class MainPage {
  page: Page

  inputPassword: Locator
  viewPasswordBtn: Locator
  inputEmail: Locator
  buttonRegistration: Locator
  errorEmail: Locator
  errorPassword: Locator

  constructor(page: Page) {
    this.page = page

    this.inputPassword = this.page.locator('.call-to-registration .registration-form .input-label').filter({hasNotText: 'Электронная'}).filter({hasNotText: 'Повторите'}).locator('input').first()
    this.viewPasswordBtn = this.page.locator('.call-to-registration .registration-form .input-label__password-toggle').first()
    this.inputEmail = this.page.locator('.call-to-registration .registration-form .input-label').filter({hasText: 'Электронная почта'}).locator('input').first()
    this.buttonRegistration = this.page.locator('.call-to-registration .registration-form__btn').first()
    this.errorEmail = this.page.locator('.call-to-registration .registration-form .input-label').filter({hasText: 'Электронная почта'}).locator('.input-label__error').first()
    this.errorPassword = this.page.locator('.call-to-registration .registration-form .input-label').filter({hasNotText: 'Электронная'}).filter({hasNotText: 'Повторите'}).locator('.input-label__error').first()
  }

  // Открыть Главную страницу
  async open(){
    await this.page.goto(`/`)
  }

  // Заполнить поля Формы регистрации
  async fillRegistrationForm(email: string, password: string){
    await this.inputPassword.fill(password)
    await this.inputEmail.fill(email)
  }

  // Отправить Форму регистрации
  async sendRegistrationForm(){
    await this.buttonRegistration.click()
  }

  // Посмотреть введенный пароль
  async uncoverPassword(){
    await this.viewPasswordBtn.click()
  }

}