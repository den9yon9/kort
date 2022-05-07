import Koa from 'koa'
import * as koaBody from 'koa-body'
import type Dispatcher from '../dispatch'
import * as Router from '@koa/router'
import { getInitialCommit, getSHA1 } from '../utils'

const app = new Koa<Koa.DefaultState, { dispatcher: Dispatcher }>()
const router = new Router<Koa.DefaultState, { dispatcher: Dispatcher }>()

app.use(koaBody())

router.post('/', (ctx) => {
  const data = ctx.request.body
  const result = ctx.dispatcher.register(data)
  ctx.body = result
})

router.post('/build', async (ctx) => {
  const { origin, branch } = ctx.request.body
  const workspace = ctx.dispatcher.findWorkspace(origin, branch)
  if (workspace) {
    const head = await getSHA1(branch, workspace.source)
    const base = await getInitialCommit(workspace.source)
    if (base === head) return
    ctx.dispatcher.register({
      ref: branch,
      compare_url: `${base}...${head}`,
      repository: { html_url: workspace.origin },
      sender: { login: 'build' }
    })
  } else
    ctx.body = `未找到对应的workspace, 请检查${origin}或${branch}是否已设置`
})

app.use(router.routes()).use(router.allowedMethods())

export default app
