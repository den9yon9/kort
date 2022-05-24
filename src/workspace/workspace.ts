import { join, resolve } from 'path'
import { isRepositoryHasRemote, log, parseOrigin } from '../utils'
import notice from '../webhook'
import { Project, Task } from '../types'
import { $, gitlog } from '../utils'
import buildProject from './buildProject'
import { mkdir } from 'fs/promises'

const multiRemote = false
export default class Workspace {
  origin: string
  branches: string[]
  webhook?: string
  hostname: string
  pathname: string
  dir: string
  constructor({
    origin,
    branches,
    webhook,
    dir
  }: {
    origin: string
    branches: string[]
    webhook?: string
    dir
  }) {
    this.origin = origin
    this.branches = branches
    this.webhook = webhook
    const { hostname, pathname } = parseOrigin(origin)
    if (!hostname || !pathname) throw new Error(`origin: ${origin}格式错误`)
    this.hostname = hostname
    this.pathname = pathname
    this.dir = dir
  }

  get storage() {
    return resolve(this.dir, '.kort', 'storage')
  }

  get release() {
    return this.dir
  }

  get path() {
    return join(
      this.storage,
      multiRemote ? join(this.hostname, this.pathname) : this.pathname
    )
  }

  get releasePath() {
    return join(
      this.release,
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
        name: item.path.replace(`${this.storage}/`, '').replace('/source', ''),
        path: item.path,
        state: 'pending'
      }))

    return projects as Project[]
  }

  async handleTask(task: Task) {
    try {
      await $(`git checkout ${task.branch}`, { cwd: this.source })
      await $('git pull', { cwd: this.source })
      const commits = await gitlog(task.compare, this.source)
      const projects = await this.getProjects(task.compare)

      try {
        await notice(this.webhook, {
          state: 'pending',
          task,
          commits,
          projects
        })

        for (let i = 0; i < projects.length; i++) {
          const project = projects[i]
          try {
            await buildProject(project.path)
          } catch (err) {
            project.state = 'rejected'
            project.reason = err
          }
        }

        await $(`git checkout ${task.branch}`, { cwd: this.dist })

        // 多项目提交有git操作, 需要串行执行, 避免单仓多git进程冲突
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i]
          // 只操作打包成功的项目
          if (project.state === 'rejected') continue
          try {
            await this.checkSource()
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
        }

        await this.commitDist(task)

        await $('git pull', {
          cwd: join(this.releasePath, task.branch)
        })

        await notice(this.webhook, {
          state: 'fulfilled',
          task,
          commits,
          projects
        })
      } catch (err) {
        await notice(this.webhook, {
          state: 'rejected',
          error: err,
          task,
          commits,
          projects
        })
      }
    } catch (err) {
      await notice(this.webhook, {
        state: 'rejected',
        error: err,
        task
      })
    }
  }

  private async commitDist(task: Task) {
    // 工作区不干净才去提交代码
    await $(`git add .`, { cwd: this.dist })
    const { stdout } = await $(`git status -s`, { cwd: this.dist })
    if (stdout) {
      await $(`git commit -m 'sender: ${task.sender}'`, { cwd: this.dist })
      if (await isRepositoryHasRemote(this.dist))
        await $(`git push`, { cwd: this.dist })
    } else log('dist无更新: 你的任务可能无需打包')
  }

  private async checkSource() {
    const result = await $(`git status -s`, { cwd: this.source })
    if (result.stdout) {
      await $(`git reset HEAD --hard`, { cwd: this.source })
      throw {
        reason: '源码仓库工作区有变更',
        desc: 'CI服务器上源码仓库的工作区应该是"clean"的, CI才能干净地切换分支和保证打包结果的一致性, 请检查你的build脚本是否合理',
        ...result
      }
    }
  }
}
