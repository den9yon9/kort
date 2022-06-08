import { basename } from 'path'
import Schedule from 'src/schedule'
import { Task } from '../types'
import { parseOrigin, shortSelector } from '../utils'
import type Workspace from '../workspace/workspace'

export default class Dispatcher {
  workspaces: Workspace[]
  schedule?: Schedule
  currentTask: Task | undefined
  private queue: Task[] = []

  constructor(workspaces: Workspace[]) {
    this.workspaces = workspaces
  }

  findWorkspace(origin: string) {
    const { hostname, pathname } = parseOrigin(origin)
    return this.workspaces.find(
      (item) => item.hostname === hostname && item.pathname === pathname
    )
  }

  register(data: {
    ref: string
    compare_url: string
    repository: { html_url: string }
    sender: { login: string },
    selector?: string
  }) {
    const origin = data.repository.html_url
    const branch = basename(data.ref)
    const compare = shortSelector(basename(data.compare_url))
    const sender = data.sender.login
    const selector = data.selector || `[${compare}]`
    const workspace = this.findWorkspace(origin)
    if (!workspace) return `未找到${origin}相关配置`
    if (!workspace.branches.includes(branch)) return `未找到${origin}相关配置`
    this.queue.push({
      origin,
      branch,
      selector,
      sender
    })
    if (!this.currentTask && !this.schedule?.isBusy) this.dispatch()
    return '任务已存入队列'
  }

  dispatch() {
    this.currentTask = this.queue.pop()
    if (this.currentTask) this.handle(this.currentTask)
  }

  private async handle(task: Task) {
    const workspace = this.findWorkspace(task.origin)
    if (workspace) await workspace.handleTask(task)
    this.dispatch()
  }
}
