import { basename } from 'path'
import { Task } from '../types'
import { parseOrigin } from '../utils'
import type Workspace from '../workspace/workspace'

export default class Dispatcher {
  workspaces: Workspace[]
  private currentTask: Task | null = null
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
    sender: { login: string }
  }) {
    const origin = data.repository.html_url
    const branch = basename(data.ref)
    const compare = basename(data.compare_url)
    const compare_url = data.compare_url
    const sender = data.sender.login
    const workspace = this.findWorkspace(origin)
    if (!workspace)
      return `
    未找到${origin}相关配置, 请检查:
    1. ~/.kortrc.json中是否有相关配置
    2. 配置更新后是否重启了服务
    `
    if (!workspace.branches.includes(branch))
      return `
    未找到${origin}相关配置, 请检查:
    1. ~/.kortrc.json中是否有相关配置
    2. 配置更新后是否重启了服务
    `
    this.queue.push({
      origin,
      branch,
      compare,
      compare_url,
      sender
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
    const workspace = this.findWorkspace(task.origin)
    if (workspace) await workspace.handleTask(task)
    this.dispatch()
  }
}
