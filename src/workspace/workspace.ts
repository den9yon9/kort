import { dirname, join } from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'
import buildProject from './build'
import parseOrigin from '../utils/parseOrigin'
import { rm, mkdir, rename } from 'fs/promises'
import { gitlog } from '../utils/git'
import notice from '../webhook'
import { ProjectWithState, Task } from '../types'

const $ = promisify(exec)

const kortRoot = join(process.env.HOME as string, '.kort')
const kortReleaseRoot = join(process.env.HOME as string, 'kort-release')

export default class Workspace {
  origin: string
  branches: string[]
  webhook?: string
  hostname: string
  pathname: string
  path: string
  releasePath: string
  constructor(origin: string, branches: string[], webhook?: string) {
    this.origin = origin
    this.branches = branches
    this.webhook = webhook
    const { hostname, pathname } = parseOrigin(origin)
    if (!hostname || !pathname) throw new Error(`origin: ${origin}格式错误`)
    this.hostname = hostname
    this.pathname = pathname
    this.path = join(kortRoot, pathname)
    this.releasePath = join(kortReleaseRoot, pathname)
  }

  get source() {
    return join(this.path, 'source')
  }
  get dist() {
    return join(this.path, 'dist')
  }

  compare(selector) {
    return gitlog(selector, this.source)
  }

  private async getProjects(compare: string) {
    const { stdout } = await $(
      `pnpm ls --depth -1 --json --filter [${compare}]`,
      { cwd: this.source }
    )
    const projects = JSON.parse(`[${stdout.replace(/]\n\[/g, '],[')}]`)
      .flat()
      .map((item) => item.path)

    return projects as string[]
  }

  async handleTask(task: Task) {
    await $(`git checkout ${task.branch}`, { cwd: this.source })
    await $('git pull', { cwd: this.source })
    const projects = await this.getProjects(task.compare)
    const commits = await this.compare(task.compare)

    notice(this.webhook, {
      stage: 'end',
      repository: `${this.hostname}${this.pathname}`,
      branch: task.branch,
      compare: task.compare,
      commits: commits.map((item) => item.subject),
      projects: projects.map((item) => ({ project: item, state: 'pending' }))
    })

    const result = await Promise.all(
      projects.map(async (project) => {
        try {
          await buildProject(project)
          const projectDist = join(project, 'dist')
          const targetDist = project.replace(this.source, this.dist)
          await rm(targetDist, { recursive: true, force: true })
          await mkdir(dirname(targetDist), { recursive: true })
          await rename(projectDist, targetDist)
          return { project: project, state: 'fulfilled' } as ProjectWithState
        } catch (err) {
          return {
            state: 'rejected',
            project: project,
            reason: err.message
          } as ProjectWithState
        }
      })
    )

    notice(this.webhook, {
      stage: 'end',
      repository: this.pathname,
      branch: task.branch,
      compare: task.compare,
      commits,
      projects: result
    })

    try {
      await this.commitDist(task)
    } catch (err) {
      notice(this.webhook, {
        stage: 'err',
        repository: this.pathname,
        branch: task.branch,
        compare: task.compare,
        commits,
        projects: result
      })
    }
    // TODO: 发布任务
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
