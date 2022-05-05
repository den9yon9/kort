import { basename } from 'path'
import { Task } from '../types'
import { shortSelector } from '../utils/git'
import parseOrigin from '../utils/parseOrigin'
import type Workspace from '../workspace/workspace'
export default class Dispatcher {
  private workspaces: Workspace[]
  private currentTask: Task | null = null
  private queue: Task[] = []

  constructor(workspaces: Workspace[]) {
    this.workspaces = workspaces
  }

  findWorkspaceByOrigin(origin: string) {
    const { hostname, pathname } = parseOrigin(origin)
    console.log(hostname, pathname, this.workspaces)
    const workspace = this.workspaces.find(
      (item) => item.hostname === hostname && item.pathname === pathname
    )
    if (!workspace) throw new Error(`未找到此任务对应的工作区`)
    return workspace
  }

  register(data: any) {
    this.queue.push({
      origin: data.repository.html_url,
      branch: basename(data.ref),
      compare: shortSelector(basename(data.compare_url || data.compare)),
      compare_url: data.compare_url || data.compare,
      sender: data.sender.login
    })
    if (this.currentTask === null) this.dispatch()
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
