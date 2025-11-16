import { faker } from '@faker-js/faker'

export class UserBuilder {
  password: string
  email: string

  private valid = true

  setValid() {
    this.valid = true
    return this
  }

  setInvalid() {
    this.valid = false
    return this
  }

  addPassword(invalidPassword = '') {
    if (this.valid) {
      this.password = faker.internet.password({ length: 10 })
    } else {
      this.password = invalidPassword
    }
    return this
  }

  addPasswordWithoutDigits() {
    this.password = 'SecurePass@Word'
    return this
  }

  addPasswordUppercase() {
    this.password = 'SECUREPASS@WORD123'
    return this
  }

  addPasswordLowcase() {
    this.password = 'securepass@word123'
    return this
  }

  addPasswordWithCyrillic() {
    this.password = 'Привет123'
    return this
  }

  addShortPassword() {
    this.password = 'Test123!abc'
    return this
  }

  addLongPassword() {
    this.password = 'TESTS1234TESTS123TESTS123TESTS123TESTS123TESTS123TESTS1234TESTS123TESTS123TESTS123TESTS123TESTS1234_test123'
    return this
  }

  addPasswordWithSpace() {
    this.password = '123 123 123'
    return this
  }

  addEmail(invalidEmail = '') {
    if (this.valid) {
      this.email = faker.internet.email()
    } else {
      this.email = invalidEmail
    }
    return this
  }

  addEmailWithoutAtSymbol() {
    this.email = 'emaildomain.com'
    return this
  }

  addEmailWithSpace() {
    this.email = 'email @domain.com'
    return this
  }
  addEmailWithTwoDots() {
    this.email = 'test..test@example.com'
    return this
  }
  addEmailWithoutDomain() {
    this.email = 'email@'
    return this
  }
  addEmptyEmail() {
    this.email = ''
    return this
  }
  addLongEmail() {
    this.email = 'emailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemailemaiemailemailemail@mail.ru'
    return this
  }

  generate() {
    return {
      email: this.email,
      password: this.password,
    }
  }
}
