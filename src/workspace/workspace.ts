import { dirname, join } from 'path'
import parseOrigin from '../utils/parseOrigin'
import { rm, mkdir, rename } from 'fs/promises'
import notice from '../webhook'
import { Project, Task } from '../types'
import { $, gitlog } from '../utils'
import buildProject from './buildProject'

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
    this.path = join(kortRoot, hostname, pathname)
    this.releasePath = join(kortReleaseRoot, pathname)
  }

  get source() {
    return join(this.path, 'source')
  }
  get dist() {
    return join(this.path, 'dist')
  }

  async compare(selector) {
    return await gitlog(selector, this.source)
  }

  private async getProjects(compare: string) {
    const { stdout } = await $(
      `pnpm ls --depth -1 --json --filter [${compare}]`,
      { cwd: this.source }
    )
    const projects = JSON.parse(`[${stdout.replace(/]\n\[/g, '],[')}]`)
      .flat()
      .map((item) => ({
        name: item.path.replace(`${kortRoot}/`, '').replace('/source', ''),
        path: item.path,
        state: 'pending'
      }))

    return projects as Project[]
  }

  async handleTask(task: Task) {
    await $(`git checkout ${task.branch}`, { cwd: this.source })
    await $('git pull', { cwd: this.source })
    const commits = await this.compare(task.compare)
    const projects = await this.getProjects(task.compare)

    try {
      await notice(this.webhook, {
        title: '开始处理',
        detail: {
          sender: task.sender,
          repository: `${this.hostname}${this.pathname}`,
          branch: task.branch,
          compare: task.compare_url,
          commits: commits.map((item) => item.subject),
          projects
        }
      })

      await Promise.all(
        projects.map(async (project) => {
          try {
            await buildProject(project.path)
            const projectDist = join(project.path, 'dist')
            const targetDist = project.path.replace(this.source, this.dist)
            await rm(targetDist, { recursive: true, force: true })
            await mkdir(dirname(targetDist), { recursive: true })
            await rename(projectDist, targetDist)
            project.state = 'fulfilled'
          } catch (err) {
            project.state = 'rejected'
            project.reason = err.message
          }
        })
      )

      await this.commitDist(task)

      await $('git pull', { cwd: join(this.releasePath, task.branch) })

      await notice(this.webhook, {
        title: '发布成功',
        detail: {
          sender: task.sender,
          repository: `${this.hostname}${this.pathname}`,
          branch: task.branch,
          compare: task.compare_url,
          commits: commits.map((item) => item.subject),
          projects
        }
      })
    } catch (err) {
      await notice(this.webhook, {
        title: '出错了',
        desc: err.message,
        detail: {
          sender: task.sender,
          repository: `${this.hostname}${this.pathname}`,
          branch: task.branch,
          compare: task.compare_url,
          commits: commits.map((item) => item.subject),
          projects
        }
      })
    }
  }

  private async commitDist(task: Task) {
    // 工作区不干净才去提交代码
    const { stdout } = await $(`git status`, { cwd: this.dist })
    if (!stdout.includes('working tree clean')) {
      await $(`git add .`, { cwd: this.dist })
      await $(`git commit -m 'sender: ${task}'`, { cwd: this.dist })
    } else {
      console.log('dist无更新: 你的任务可能无需打包')
    }
  }
}
