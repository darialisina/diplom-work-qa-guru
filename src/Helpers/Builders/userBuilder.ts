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

  addEmail(invalidEmail = '') {
    if (this.valid) {
      this.email = faker.internet.email()
    } else {
      this.email = invalidEmail
    }
    return this
  }

  generate() {
    return {
      email: this.email,
      password: this.password,
    }
  }
}
