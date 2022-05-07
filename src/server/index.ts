import Koa from 'koa'
import * as koaBody from 'koa-body'
import type Dispatcher from '../dispatch'
import { getInitialCommit, getSHA1 } from '../utils'

const app = new Koa<Koa.DefaultState, { dispatcher: Dispatcher }>()

app.use(koaBody())

app.use(async (ctx) => {
  const { method, path, body, query } = ctx.request
  ctx.body = await {
    'GET /'() {
      return 'hello world!'
    },
    'POST /'() {
      return ctx.dispatcher.register(body)
    },
    async 'POST /build'() {
      const { origin, branch } = body
      const workspace = ctx.dispatcher.findWorkspace(origin)
      if (!workspace) return `${origin}未配置`
      if (!workspace.branches.includes(branch)) return `${branch}未配置`
      const head = await getSHA1(branch, workspace.source)
      const base = await getInitialCommit(workspace.source)
      if (base === head) return
      return ctx.dispatcher.register({
        ref: branch,
        compare_url: `${base}...${head}`,
        repository: { html_url: workspace.origin },
        sender: { login: 'server' }
      })
    }
  }[`${method} ${path}`]?.()
})

export default app
