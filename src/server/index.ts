import Koa from 'koa'
import * as koaBody from 'koa-body'
import type Dispatcher from 'src/dispatch'

const app = new Koa<Koa.DefaultState, { dispatcher: Dispatcher }>()

app.use(koaBody())

app.use((ctx) => {
  if (ctx.request.method.toLowerCase() !== 'post') return
  const data = ctx.request.body
  const result = ctx.dispatcher.register(data)
  ctx.body = result
})

export default app
