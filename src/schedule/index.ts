import { CronJob } from 'cron'
import { $, getSHA1 } from '../utils'
import Dispatcher from '../dispatch'

export default class Schedule {
  isBusy = false
  constructor(time: string, dispatcher: Dispatcher) {
    new CronJob(
      time,
      async () => {
        if (dispatcher.currentTask || this.isBusy) return
        this.isBusy = true
        await Promise.allSettled(
          dispatcher.workspaces.map(async (workspace) => {
            await $('git fetch', { cwd: workspace.source })
            workspace.branches.map(async (branch) => {
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
        )
        this.isBusy = false
        dispatcher.dispatch()
      },
      null,
      true
    )
  }
}
