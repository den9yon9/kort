import Koa from 'koa'
const app = new Koa()
app.use((ctx, next) => {
  console.log(ctx.workspaces)
  next()
})

export default app
