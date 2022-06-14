import { Task } from '../types'
import { parseOrigin } from '../utils'
import type Workspace from '../workspace/workspace'

export default class Dispatcher {
  workspaces: Workspace[]
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
    origin: string
    branch: string
    sender: string
    selector: string
  }) {
    const workspace = this.findWorkspace(data.origin)
    if (!workspace) return `未找到${data.origin}相关配置`
    if (!workspace.branches.includes(data.branch))
      return `未找到${data.branch}相关配置`
    this.queue.push(data)
    if (!this.currentTask) this.dispatch()
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
