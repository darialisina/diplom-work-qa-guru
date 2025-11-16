import { expect } from "@playwright/test"
import { test } from "../src/Helpers/Fixtures/index"
import { ApiTaskBuilder } from '../src/Helpers/Builders/index'

test.describe("Challenge", () => {

  test("First Real Challenge", async ({ api, apiToken }, testinfo) => {
    // Отправляем GET запрос для получения списка всех челленджей
    const body = await api.challenges.get(apiToken, testinfo)
    // Проверяем, что в списке ровно 59 челленджей
    expect(body.challenges.length).toBe(59)
  })


  // GET Challenges
  test("GET /todos (200) @api @positive", async ({ api, apiToken }, testinfo) => {
    // Отправляем GET запрос для получения списка всех задач
    const response = await api.todos.get(apiToken, testinfo)

    // Проверяем успешный статус ответа
    expect(response.status).toBe(200)

    // Проверяем наличие свойства todos в ответе
    expect(response.body).toHaveProperty("todos")
    expect(response.body.todos[0]).toHaveProperty("id")
    expect(response.body.todos[0]).toHaveProperty("title")
    expect(response.body.todos[0]).toHaveProperty("description")
    expect(response.body.todos[0]).toHaveProperty("doneStatus")
  })

  test("GET /todos/{id} (200) @api @positive", async ({ api, apiToken }, testinfo) => {
    // ID получаемой задачи
    const todoId = '1'

    // отправляем GET запрос для получения задачи с заданным ID
    const response = await api.todos.get(apiToken, testinfo, `/${todoId}`)

    // проверяем успешный статус ответа
    expect(response.status).toBe(200)
    // проверяем наличие и корректность всех необходимых полей
    expect(response.body.todos[0]).toHaveProperty("id")
    expect(response.body.todos[0].id).toBe(1)
    expect(response.body.todos[0]).toHaveProperty("title")
    expect(response.body.todos[0]).toHaveProperty("description")
    expect(response.body.todos[0]).toHaveProperty("doneStatus")
  })

  test("GET /todos/{id} (404) @api @negative", async ({ api, apiToken }, testinfo) => {
    // ID получаемой задачи
    const todoId = '99999'

    // отправляем GET запрос с несуществующим ID задачи
    const response = await api.todos.get(apiToken, testinfo, `/${todoId}`)

    // проверяем статус ошибки 404
    expect(response.status).toBe(404)
    // проверяем корректное сообщение об ошибке
    expect(response.body.errorMessages[0]).toEqual("Could not find an instance with todos/99999")
  })

  test("GET /todos (200) ?filter @api @positive", async ({ api, apiToken }, testinfo) => {
    // создаем задачу со статусом "выполнена"
    const task = new ApiTaskBuilder().addTitle().addDescription().addStatus(true).generate()
    const postResponse = await api.todos.post(apiToken, testinfo, task)
    let isTaskInList = false

    // отправляем GET запрос с фильтром по выполненным задачам
    const getResponse = await api.todos.get(apiToken, testinfo, '?doneStatus=true')

    // проверяем успешный статус ответа
    expect(getResponse.status).toBe(200)
    // проверяем, что список не пустой
    expect(getResponse.body.todos.length).toBeGreaterThan(0)
    // проверяем, что все задачи в списке имеют статус "выполнена"
    getResponse.body.todos.forEach(todo => {
      expect(todo.doneStatus).toBe(true)
      // Проверяем, что созданная задача присутствует в отфильтрованном списке
      if (todo.id == postResponse.body.id) {
        isTaskInList = true
      }
    })
    // проверяем, что созданная задача найдена в списке
    expect(isTaskInList).toBeTruthy()
  })

  // HEAD Challenge
  test("HEAD /todos (200) @api @positive", async ({ api, apiToken }, testinfo) => {
    // отправляем HEAD запрос для получения заголовков без тела ответа
    const response = await api.todos.head(apiToken, testinfo)

    // проверяем успешный статус ответа
    expect(response.status).toBe(200)
    // проверяем заголовок server в ответе
    expect(response.headers.server).toEqual("Heroku")
  })

  // Creation Challenges with POST
  test("POST /todos (201) @api @positive", async ({ api, apiToken }, testinfo) => {
    // создаем данные для новой задачи с заголовком, описанием и статусом
    const todoData = new ApiTaskBuilder().addTitle().addDescription().addStatus(false).generate()

    // отправляем POST запрос для создания новой задачи
    const response = await api.todos.post(apiToken, testinfo, todoData)

    // проверяем статус успешного создания
    expect(response.status).toBe(201)
    // проверяем, что созданная задача содержит корректный заголовок
    expect(response.body.title).toBe(todoData.title)
    // проверяем, что созданная задача содержит корректный статус
    expect(response.body.doneStatus).toBe(todoData.doneStatus)
    // проверяем, что созданная задача содержит корректное описание
    expect(response.body.description).toBe(todoData.description)
  })

  test("POST /todos (400) doneStatus @api @negative", async ({ api, apiToken }, testinfo) => {
    // создаем данные с некорректным типом поля doneStatus (строка вместо boolean)
    const todoData = new ApiTaskBuilder().addTitle().addDescription().addStatus("not done").generate()

    // отправляем POST запрос с невалидными данными
    const response = await api.todos.post(apiToken, testinfo, todoData)

    // проверяем статус ошибки валидации
    expect(response.status).toBe(400)
    // проверяем сообщение об ошибке валидации типа данных
    expect(response.body.errorMessages[0]).toEqual('Failed Validation: doneStatus should be BOOLEAN but was STRING')
  })

  // Creation Challenges with PUT
  test("PUT /todos/{id} (400) @api @negative", async ({ api, apiToken }, testinfo) => {
    // создаем данные для новой задачи без поля id
    const todoData = new ApiTaskBuilder().addTitle().addStatus(false).generate()

    // пытаемся создать новую задачу с помощью PUT для несуществующего ID
    const response = await api.todos.put(apiToken, testinfo, todoData, '99999')

    // проверяем статус ошибки валидации
    expect(response.status).toBe(400)
    // проверяем сообщение, что нельзя создавать задачу с помощью PUT
    expect(response.body.errorMessages).toContain('Cannot create todo with PUT due to Auto fields id')

  })

  // Update Challenges with PUT
  test("PUT /todos/{id} full (200) @api @positive", async ({ api, apiToken }, testinfo) => {
    // создаем полные данные для обновления задачи с ID, заголовком, описанием и статусом
    const updateData = new ApiTaskBuilder().getId('1').addTitle().addDescription().addStatus(true).generate()

    // отправляем PUT запрос для полного обновления существующей задачи
    const response = await api.todos.put(apiToken, testinfo, updateData, updateData.id)

    // проверяем успешный статус ответа
    expect(response.status).toBe(200)
    // проверяем, что заголовок обновлен корректно
    expect(response.body.title).toBe(updateData.title)
    // проверяем, что статус обновлен корректно
    expect(response.body.doneStatus).toBe(updateData.doneStatus)
    // проверяем, что описание обновлено корректно
    expect(response.body.description).toBe(updateData.description)
  })

  test("PUT /todos/{id} partial (200) @api @positive", async ({ api, apiToken }, testinfo) => {
    // создаем частичные данные для обновления (только ID и заголовок)
    const updateData = new ApiTaskBuilder().getId('2').addTitle().generate()

    // отправляем PUT запрос для частичного обновления существующей задачи
    const response = await api.todos.put(apiToken, testinfo, updateData, updateData.id)

    // проверяем успешный статус ответа
    expect(response.status).toBe(200)
    // проверяем, что заголовок обновлен корректно
    expect(response.body.title).toBe(updateData.title)
    expect(response.body).toHaveProperty("description")
    expect(response.body).toHaveProperty("doneStatus")
  })

})
