import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import app from '../server'
import { green } from 'kolorist'
import Workspace from 'src/workspace/workspace'

export default async function serve(
  port: number,
  workspaces: Workspace[],
  cron: string | boolean
) {
  // TODO: check workspaces
  const dispatcher = new Dispatcher(workspaces)
  app.context.dispatcher = dispatcher
  if (cron) {
    const pattern = cron === true ? '0 */5 * * * *' : cron
    const schedule = new Schedule(pattern, dispatcher)
    app.context.schedule = schedule
    console.log(`定时任务已启动: ${green(pattern)}\n`)
  }
  app.listen(port)
  console.log(`\n服务已启动port: ${green(port)}`)
}
