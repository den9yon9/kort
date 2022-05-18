import { CronJob } from 'cron'
import { $, getSHA1 } from '../utils'
import Dispatcher from '../dispatch'

export default class Schedule {
  constructor(time: string, dispatcher: Dispatcher) {
    new CronJob(
      time,
      () => {
        // if (dispatcher.currentTask) return
        dispatcher.workspaces.forEach(async (workspace) => {
          await $('git fetch', { cwd: workspace.source })
          workspace.branches.forEach(async (branch) => {
            const base = await getSHA1(branch, workspace.source)
            const head = await getSHA1(`origin/${branch}`, workspace.source)
            if (base === head) return
            dispatcher.register({
              ref: branch,
              compare_url: `${base}...${head}`,
              repository: { html_url: workspace.origin },
              sender: { login: 'cron' }
            })
          })
        })
      },
      null,
      true
    )
  }
}
