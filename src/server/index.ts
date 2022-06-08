import Koa from 'koa'
import * as koaBody from 'koa-body'
import { basename } from 'path'
import Schedule from 'src/schedule'
import type Dispatcher from '../dispatch'
import { shortSelector } from '../utils'

const app = new Koa<
  Koa.DefaultState,
  { dispatcher: Dispatcher; schedule: Schedule }
>()

app.use(koaBody())

app.use(async (ctx) => {
  const { method, path, body } = ctx.request
  ctx.body = await {
    'GET /'() {
      return 'hello world!'
    },
    'POST /'() {
      const data = body as {
        ref: string
        compare_url: string
        repository: { html_url: string }
        sender: { login: string }
      }

      const origin = data.repository.html_url
      const branch = basename(data.ref)
      const selector = `[${shortSelector(basename(data.compare_url))}]`
      const sender = data.sender.login
      return ctx.dispatcher.register({ origin, branch, selector, sender })
    },
    async 'POST /build'() {
      return ctx.dispatcher.register({ ...body, sender: 'manual' })
    }
  }[`${method} ${path}`]?.()
})

export default app
