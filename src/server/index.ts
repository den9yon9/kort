import Koa from 'koa'
import * as koaBody from 'koa-body'
import type Dispatcher from 'src/dispatch'

const app = new Koa<Koa.DefaultState, { dispatcher: Dispatcher }>()

app.use(koaBody())

app.use((ctx) => {
  if (ctx.request.method.toLowerCase() !== 'post') return
  const data = ctx.request.body
  // TODO: 格式化task
  const task = data

  ctx.dispatcher.register(task)
  ctx.body = '任务已接受,等待处理'
})

export default app
