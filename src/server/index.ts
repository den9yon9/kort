import Koa from 'koa'
import * as koaBody from 'koa-body'
import Schedule from 'src/schedule'
import type Dispatcher from '../dispatch'
import { getInitialCommit, getSHA1 } from '../utils'

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
      return ctx.dispatcher.register(body)
    },
    async 'POST /build'() {
      let { origin, branch, selector, compare } = body
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
        sender: { login: 'manual' },
        selector,
      })
    }
  }[`${method} ${path}`]?.()
})

export default app
