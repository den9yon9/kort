import { mkdir } from 'fs/promises'
import { green, red, yellow } from 'kolorist'
import { join } from 'path'
import type Workspace from '../workspace/workspace'
import {
  $,
  isBranchExist,
  isEmptyRepository,
  isFileExist,
  isRepository
} from '../utils'

// 根据配置设置workspace环境
export default async function setup(workspaces: Workspace[]) {
  const result = await Promise.allSettled(
    workspaces.map(async (workspace) => {
      const path$ = (cmd: string) => $(cmd, { cwd: workspace.path })
      const source$ = (cmd: string) => $(cmd, { cwd: workspace.source })
      const dist$ = (cmd: string) => $(cmd, { cwd: workspace.dist })
      const log = (data) => console.log(`${yellow(workspace.path)}: ${data}`)

      // 创建workspace目录
      if (!(await isFileExist(workspace.path))) {
        await mkdir(workspace.path, { recursive: true })
        log(`工作区创建完成 `)
      }

      // 克隆source仓库
      if (!(await isFileExist(workspace.source))) {
        log(`开始克隆远程仓库${workspace.origin}, 请稍后...`)
        await path$(`git clone ${workspace.origin} source`)
        log(`${workspace.origin}克隆完成`)
      }

      // 准备打包分支
      await Promise.all(
        workspace.branches.map(async (branch) => {
          if (!(await isBranchExist(workspace.source, branch))) {
            try {
              await source$(`git checkout ${branch}`)
              log(`打包分支${branch}已创建`)
            } catch (err) {
              throw new Error(
                `${workspace.origin}仓库中没有分支${branch}, 请检查配置的打包分支是否正确`
              )
            }
          } else {
          }
        })
      )

      // 准备dist目录
      if (!(await isFileExist(workspace.dist))) {
        await mkdir(workspace.dist, { recursive: true })
        log(`dist目录已创建`)
      }

      // 初始化dist仓库
      if (!(await isRepository(workspace.dist))) {
        await dist$(`git init`)
        await dist$('git config --local user.name kort')
        await dist$('git config --local user.email kort@fake.local')
        log(`dist仓库已创建`)
      }

      // dist是否空仓库
      if (await isEmptyRepository(workspace.dist)) {
        await dist$(`echo 'hello world!' > README.md`)
        await dist$(`git add .`)
        await dist$('git commit -am "initial commit"')
        log(`dist仓库初始提交完成`)
        // 删除旧的release仓库
        await $(`rm -rf ${workspace.releasePath}`)
      }

      // 准备dist提交分支
      await Promise.all(
        workspace.branches.map(async (branch) => {
          if (!(await isBranchExist(workspace.dist, branch))) {
            await $(`git branch ${branch}`, { cwd: workspace.dist })
            log(`提交分支${branch}已创建`)
          } else {
          }
        })
      )

      // 准备发布仓库
      if (!(await isFileExist(workspace.releasePath))) {
        await mkdir(workspace.releasePath, { recursive: true })
        log(`release目录创建完成 `)
      }

      await Promise.all(
        // 克隆dist仓库为release仓库
        workspace.branches.map(async (branch) => {
          const releaseBranch = join(workspace.releasePath, branch)
          if (!(await isFileExist(releaseBranch))) {
            log(`正在设置发布分支${branch}, 请稍后...`)
            await $(`git clone ${join(workspace.path, 'dist')} ${branch}`, {
              cwd: workspace.releasePath
            })
            await $(`git checkout ${branch}`, {
              cwd: `${workspace.releasePath}/${branch}`
            })
            log(`发布分支${branch}设置完成`)
          }
        })
      )

      return workspace
    })
  )

  const fulfilled = result.filter(({ status }) => status === 'fulfilled')
  const rejected = result.filter((item) => item.status === 'rejected')

  if (fulfilled.length)
    console.log(
      green(
        `\n${fulfilled.length}个个仓库设置成功:\n${fulfilled
          .map((item: PromiseFulfilledResult<Workspace>) => item.value.origin)
          .join('\n')}\n`
      )
    )

  if (rejected.length)
    console.log(
      red(
        `\n${rejected.length}个仓库设置失败: \n${rejected
          .map((item: PromiseRejectedResult) => item.reason)
          .join('\n')}\n`
      )
    )

  if (rejected.length !== 0) throw new Error('服务启动失败')
}
