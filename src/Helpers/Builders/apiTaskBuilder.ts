import { faker } from '@faker-js/faker'

export class ApiTaskBuilder {
  id
  title
  description
  doneStatus

  getId(id) {
    this.id = id
    return this
  }

  addTitle() {
    this.title = faker.book.title()
    return this
  }

  addDescription() {
    this.description = faker.commerce.productDescription()
    return this
  }

  addStatus(status) {
    this.doneStatus = status
        return this
  }

  generate() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      doneStatus: this.doneStatus
    }
  }
}
