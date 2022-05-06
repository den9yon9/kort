import { CronJob } from 'cron'
import Dispatcher from '../dispatch'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getSHA1 } from '../utils/git'

const $ = promisify(exec)

export default class Schedule {
  private cron: CronJob
  private dispatcher: Dispatcher
  constructor(time: string, dispatcher: Dispatcher) {
    this.dispatcher = dispatcher
    this.cron = new CronJob(
      time,
      () => {
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
