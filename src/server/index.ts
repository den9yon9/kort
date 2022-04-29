import Koa from 'koa'
import * as koaBody from 'koa-body'
import type Dispatcher from 'src/dispatch'

const app = new Koa<Koa.DefaultState, { dispatcher: Dispatcher }>()

app.use(koaBody())

app.use((ctx, next) => {
  if ((ctx.request.method = 'post')) {
    // TODO: 验证body是否为Task
    ctx.dispatcher.register(ctx.request.body)
  }
  ctx.body = '任务已接受,等待处理'
  next()
})

export default app
