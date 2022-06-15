import { CronJob } from 'cron'
import { $, getSHA1, shortSelector } from '../utils'
import Dispatcher from '../dispatch'

export default class Schedule {
  constructor(time: string, dispatcher: Dispatcher) {
    new CronJob(
      time,
      async () => {
        await Promise.allSettled(
          dispatcher.workspaces.map(async (workspace) => {
            if (dispatcher.currentTask?.origin === workspace.origin) return
            await $('git fetch', { cwd: workspace.source })
            workspace.branches.map(async (branch) => {
              const base = await getSHA1(branch, workspace.source)
              const head = await getSHA1(`origin/${branch}`, workspace.source)
              if (base === head) return
              const compare = `${base}...${head}`
              dispatcher.register({
                origin: workspace.origin,
                branch,
                sender: 'cron',
                selector: `[${shortSelector(compare)}]`
              })
            })
          })
        )
      },
      null,
      true
    )
  }
}
