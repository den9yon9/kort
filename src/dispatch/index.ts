import { basename } from 'path'
import { Task } from '../types'
import parseOrigin from '../utils/parseOrigin'
import type Workspace from '../workspace/workspace'

export default class Dispatcher {
  readonly workspaces: Workspace[]
  private currentTask: Task | null = null
  private queue: Task[] = []

  constructor(workspaces: Workspace[]) {
    this.workspaces = workspaces
  }

  findWorkspaceByOrigin(origin: string) {
    const { hostname, pathname } = parseOrigin(origin)
    const workspace = this.workspaces.find(
      (item) => item.hostname === hostname && item.pathname === pathname
    )
    if (!workspace) throw new Error(`未找到此任务对应的工作区`)
    return workspace
  }

  register(data: {
    ref: string
    compare_url: string
    repository: { html_url: string }
    sender: { login: string }
  }) {
    this.queue.push({
      origin: data.repository.html_url,
      branch: basename(data.ref),
      compare: basename(data.compare_url),
      compare_url: data.compare_url,
      sender: data.sender.login
    })
    if (this.currentTask === null) this.dispatch()
    return '任务已存入队列'
  }

  private dispatch() {
    const task = this.queue.pop()
    if (task) this.handle(task)
    else this.currentTask = null
  }

  private async handle(task: Task) {
    const workspace = this.findWorkspaceByOrigin(task.origin)
    await workspace.handleTask(task)
    this.dispatch()
  }
}
