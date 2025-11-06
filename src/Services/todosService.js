import { test } from "@playwright/test"

export class TodosService {

    constructor(request) {
        this.request = request
    }

    async get(token, testinfo, param = '') {
        return test.step('GET /todos ', async () => {
            let response
            response = await this.request.get(`${testinfo.project.use.apiURL}/todos${param}`,
                {
                    headers: { "x-challenger": token }
                })
            return { status: response.status(), body: await response.json() }
        })
    }

    async post(token, testinfo, body) {
        return test.step("POST /todos", async () => {
            const response = await this.request.post(`${testinfo.project.use.apiURL}/todos`, {
                headers: { "x-challenger": token , "Content-Type": "application/json"},
                data: body
              })
            return { status: response.status(), body: await response.json() }
        })
    }

    async head(token, testinfo) {
        return test.step("HEAD /todos", async () => {
            const response = await this.request.head(`${testinfo.project.use.apiURL}/todos`, {
                headers: { "x-challenger": token }
              })
            return { status: response.status(), headers: response.headers() }
        })
    }

    async put(token, testinfo, body, param='') {
        return test.step("PUT /todos", async () => {
            const response = await this.request.put(`${testinfo.project.use.apiURL}/todos/${param}`, {
                headers: { "x-challenger": token, "Content-Type": "application/json" },
                data: body
              })
            return { status: response.status(), body: await response.json() }
        })
    }
}