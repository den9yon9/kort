import { CronJob } from 'cron'
import Dispatcher from 'src/dispatch'

export default class Schedule {
  private cron: CronJob
  private dispatcher: Dispatcher
  constructor(dispatcher: Dispatcher) {
    this.dispatcher = dispatcher
    this.cron = new CronJob(
      '*/20 * * * * *',
      () => {
        dispatcher.workspaces.forEach((workspace) => {
          workspace.branches.forEach((branch) => {
            dispatcher.register({
              ref: branch,
              compare_url: encodeURIComponent(`${branch}...origin/${branch}`),
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
