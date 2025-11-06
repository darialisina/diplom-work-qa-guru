import { expect } from "@playwright/test"
import { test } from "../src/Helpers/Fixtures/index"
import { ApiTaskBuilder } from '../src/Helpers/Builders/index'

let token

test.describe("Challenge", () => {
  test.beforeAll(async ({ api }, testinfo) => {
    const response = await api.challenger.post(testinfo)
    const headers = response.headers()
    console.log(`${testinfo.project.use.apiURL}/${headers.location}`)
    token = headers["x-challenger"]
  })


  test("First Real Challenge", async ({api}, testinfo) => {
    const body = await api.challenges.get(token, testinfo)
    expect(body.challenges.length).toBe(59)
  })


   // GET Challenges
   test("GET /todos (200) @api @positive", async ({ api }, testinfo) => {
    const response = await api.todos.get(token, testinfo)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("todos")
  })

  test("GET /todos/{id} (200) @api @positive", async ({ api }, testinfo) => {
    const response = await api.todos.get(token, testinfo, '/1')

    expect(response.status).toBe(200)
    expect(response.body.todos[0]).toHaveProperty("id")
    expect(response.body.todos[0].id).toBe(1)
    expect(response.body.todos[0]).toHaveProperty("title")
    expect(response.body.todos[0]).toHaveProperty("doneStatus")
  })

  test("GET /todos/{id} (404) @api @negative", async ({ api }, testinfo) => {
    const response = await api.todos.get(token, testinfo, '/99999')

    expect(response.status).toBe(404)
    expect(response.body.errorMessages[0]).toEqual("Could not find an instance with todos/99999")
  })

  test("GET /todos (200) ?filter @api @positive", async ({ api }, testinfo) => {
    const task = new ApiTaskBuilder().addTitle().addDescription().addStatus(true).generate()
    const postResponse = await api.todos.post(token, testinfo, task)
    let isTaskInList = false

    // Проверяем, что в списке выполненных задач есть созданная
    const getResponse = await api.todos.get(token, testinfo, '?doneStatus=true')
    expect(getResponse.status).toBe(200)
    expect(getResponse.body.todos.length).toBeGreaterThan(0)
    getResponse.body.todos.forEach(todo => {
      expect(todo.doneStatus).toBe(true)
      if (todo.id == postResponse.body.id){
        isTaskInList = true
      }
    })
    expect(isTaskInList).toBeTruthy()
  })

  // HEAD Challenge
  test("HEAD /todos (200) @api @positive", async ({ api }, testinfo) => {
    const response = await api.todos.head(token, testinfo)
    expect(response.status).toBe(200)
    expect(response.headers.server).toEqual("Heroku")
  })

  // Creation Challenges with POST
  test("POST /todos (201) @api @positive", async ({ api }, testinfo) => {
    const todoData = new ApiTaskBuilder().addTitle().addDescription().addStatus(false).generate()
    const response = await api.todos.post(token, testinfo, todoData)

    expect(response.status).toBe(201)
    expect(response.body.title).toBe(todoData.title)
    expect(response.body.doneStatus).toBe(todoData.doneStatus)
    expect(response.body.description).toBe(todoData.description)
  })

  test("POST /todos (400) doneStatus @api @negative", async ({ api }, testinfo) => {
    const todoData = new ApiTaskBuilder().addTitle().addDescription().addStatus("not done").generate()
    const response = await api.todos.post(token, testinfo, todoData)

    expect(response.status).toBe(400)
    expect(response.body.errorMessages[0]).toEqual('Failed Validation: doneStatus should be BOOLEAN but was STRING')
  })

  // Creation Challenges with PUT
  test("PUT /todos/{id} (400) @api @negative", async ({ api }, testinfo) => {
    const todoData = new ApiTaskBuilder().addTitle().addStatus(false).generate()
    const response = await api.todos.put(token, testinfo, todoData, '99999')

    expect(response.status).toBe(400)
    expect(response.body.errorMessages).toContain('Cannot create todo with PUT due to Auto fields id')
    
  })

  // Update Challenges with PUT
  test("PUT /todos/{id} full (200) @api @positive", async ({ api }, testinfo) => {
    const updateData = new ApiTaskBuilder().getId('1').addTitle().addDescription().addStatus(true).generate()
    const response = await api.todos.put(token, testinfo, updateData, updateData.id)

    expect(response.status).toBe(200)
    expect(response.body.title).toBe(updateData.title)
    expect(response.body.doneStatus).toBe(updateData.doneStatus)
    expect(response.body.description).toBe(updateData.description)
  })

  test("PUT /todos/{id} partial (200) @api @positive", async ({ api }, testinfo) => {
    const updateData = new ApiTaskBuilder().getId('2').addTitle().generate()
    const response = await api.todos.put(token, testinfo, updateData, updateData.id)

    expect(response.status).toBe(200)
    expect(response.body.title).toBe(updateData.title)
  })

})
