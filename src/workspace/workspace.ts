import { join } from 'path'
import { parseOrigin } from '../utils'
import notice from '../webhook'
import { Project, Task } from '../types'
import { $, gitlog } from '../utils'
import buildProject from './buildProject'
import { mkdir } from 'fs/promises'

const multiRemote = false
const kortRoot = join(process.env.HOME as string, '.kort')
const kortReleaseRoot = join(process.env.HOME as string, 'kort-release')

export default class Workspace {
  origin: string
  branches: string[]
  webhook?: string
  hostname: string
  pathname: string
  constructor({
    origin,
    branches,
    webhook
  }: {
    origin: string
    branches: string[]
    webhook?: string
  }) {
    this.origin = origin
    this.branches = branches
    this.webhook = webhook
    const { hostname, pathname } = parseOrigin(origin)
    if (!hostname || !pathname) throw new Error(`origin: ${origin}格式错误`)
    this.hostname = hostname
    this.pathname = pathname
  }

  get path() {
    return join(
      kortRoot,
      multiRemote ? join(this.hostname, this.pathname) : this.pathname
    )
  }

  get releasePath() {
    return join(
      kortReleaseRoot,
      multiRemote ? join(this.hostname, this.pathname) : this.pathname
    )
  }

  get source() {
    return join(this.path, 'source')
  }
  get dist() {
    return join(this.path, 'dist')
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
    const commits = await gitlog(task.compare, this.source)
    const projects = await this.getProjects(task.compare)

    try {
      await notice(this.webhook, {
        state: 'pending',
        task: {
          sender: task.sender,
          repository: this.path.replace(`${kortRoot}/`, ''),
          branch: task.branch,
          compare: task.compare_url,
          commits
        },
        projects
      })

      await Promise.all(
        projects.map(async (project) => {
          try {
            await buildProject(project.path)
            await $(`git checkout ${task.branch}`, { cwd: this.dist })
            const projectDist = join(project.path, 'dist')
            const targetDist = project.path.replace(this.source, this.dist)
            await mkdir(targetDist, { recursive: true })
            await $(`git rm -rf --ignore-unmatch .`, { cwd: targetDist })
            // 单仓多包时, git rm -rf . 会把targetDist目录本身也删掉, 所以这里要检测一下targetDist
            await mkdir(targetDist, { recursive: true })
            // FIXME: 替换mv为平台无关命令
            await $(`mv ${projectDist}/* ${targetDist}/`)
            project.state = 'fulfilled'
          } catch (err) {
            project.state = 'rejected'
            project.reason = err
          }
        })
      )

      await this.commitDist(task)

      await $('git pull', {
        cwd: join(this.releasePath, task.branch)
      })

      await notice(this.webhook, {
        state: 'fulfilled',
        task: {
          sender: task.sender,
          repository: this.path.replace(`${kortRoot}/`, ''),
          branch: task.branch,
          compare: task.compare_url,
          commits
        },
        projects
      })
    } catch (err) {
      await notice(this.webhook, {
        state: 'rejected',
        error: err,
        task: {
          sender: task.sender,
          repository: this.path.replace(`${kortRoot}/`, ''),
          branch: task.branch,
          compare: task.compare_url,
          commits
        },
        projects
      })
    }
  }

  private async commitDist(task: Task) {
    // 工作区不干净才去提交代码
    const { stdout } = await $(`git status -s`, { cwd: this.dist })
    if (stdout) {
      await $(`git add .`, { cwd: this.dist })
      await $(`git commit -m 'sender: ${task.sender}'`, { cwd: this.dist })
    } else console.log('dist无更新: 你的任务可能无需打包')
  }
}
