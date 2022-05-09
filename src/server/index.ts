import Koa from 'koa'
import * as koaBody from 'koa-body'
import configuration from '../configuration'
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
    'POST /reload'() {
      ctx.dispatcher.workspaces = configuration()
      return 'kort服务已更新'
    },
    'POST /'() {
      return ctx.dispatcher.register(body)
    },
    async 'POST /build'() {
      let { origin, branch, compare } = body
      const workspace = ctx.dispatcher.findWorkspace(origin)
      if (!workspace) return `${origin}未配置`
      if (!workspace.branches.includes(branch)) return `${branch}未配置`
      if (!compare) {
        const head = await getSHA1(branch, workspace.source)
        const base = await getInitialCommit(workspace.source)
        if (base === head) return
        compare = `${base}...${head}`
      }
      return ctx.dispatcher.register({
        ref: branch,
        compare_url: compare,
        repository: { html_url: workspace.origin },
        sender: { login: 'server' }
      })
    }
  }[`${method} ${path}`]?.()
})

export default app
