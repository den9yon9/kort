import { join } from 'path'
import { parseOrigin } from '../utils'
import { promisify } from 'util'
import { exec } from 'child_process'
import buildProjects from './build'

const $ = promisify(exec)

export default class Workspace {
  origin: string
  branches: string[]
  webhook?: string
  hostname: string
  pathname: string
  path: string
  constructor(origin: string, branches: string[], webhook?: string) {
    this.origin = origin
    this.branches = branches
    this.webhook = webhook
    const { hostname, pathname } = parseOrigin(origin)
    if (!hostname || !pathname) throw new Error(`origin: ${origin}格式错误`)
    this.path = join(process.env.HOME as string, '.kort', pathname)
  }

  get source() {
    return join(this.path, 'source')
  }
  get dist() {
    return join(this.path, 'dist')
  }

  private async getProjectsByTask(task: Task) {
    await $(`git checkout ${task.branch}`, { cwd: task.branch })
    await $('git pull', { cwd: this.source })
    const { stdout } = await $(
      `pnpm ls --depth -1 --json --filter [${task.compare}]`,
      { cwd: this.source }
    )
    const projects = JSON.parse(`[${stdout.replace(/]\n\[/g, '],[')}]`)
      .flat()
      .map((item) => item.path) as string[]

    return projects
  }

  async buildTask(task: Task) {
    const projects = await this.getProjectsByTask(task)
    const result = buildProjects(projects)
  }
}
