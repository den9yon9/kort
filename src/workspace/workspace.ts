import { dirname, join } from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'
import buildProjects from './build'
import parseOrigin from 'src/utils/parseOrigin'
import { rm, mkdir, rename } from 'fs/promises'

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

  async handleTask(task: Task) {
    const projects = await this.getProjectsByTask(task)
    const result = await buildProjects(projects)
    await this.mvProjectsDist(
      task,
      result.filter((item) => item.success).map((item) => item.projectPath)
    )
    await this.commitDist(task)
    return result
  }

  // 剪切task打出的dist到page-dist仓库
  private async mvProjectsDist(task: Task, projects: string[]) {
    await $(`git checkout ${task.branch}`, { cwd: this.dist })
    await Promise.all(
      projects.map(async (item) => {
        const projectDist = join(item, 'dist')
        const targetDist = item.replace(this.source, this.dist)
        await rm(targetDist, { recursive: true, force: true })
        await mkdir(dirname(targetDist), { recursive: true })
        await rename(projectDist, targetDist)
      })
    )
  }

  // 提交task对应的page-dist
  private async commitDist(task: Task) {
    // 工作区不干净才去提交代码
    const { stdout } = await $(`git status`, { cwd: this.dist })
    if (!stdout.includes('working tree clean')) {
      await $(`git add .`, { cwd: this.dist })
      await $(`git commit -m 'sender: ${task}'`, { cwd: this.dist })
    } else {
      throw new Error('dist无更新: 你的任务可能无需打包')
    }
  }
}
