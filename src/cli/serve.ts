import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import app from '../server'
import { green } from 'kolorist'
import Workspace from 'src/workspace/workspace'

export default async function serve(
  port: number,
  workspaces: Workspace[],
  cron: string
) {
  // TODO: check workspaces
  const dispatcher = new Dispatcher(workspaces)
  const schedule = new Schedule(cron, dispatcher)
  dispatcher.schedule = schedule

  app.context.dispatcher = dispatcher
  app.context.schedule = schedule
  app.listen(port)

  console.log(`\n服务已启动port: ${green(port)}`)
  console.log(`定时任务已启动: ${green(cron)}\n`)
}
