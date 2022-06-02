import { mkdir, rm } from 'fs/promises'
import { red, yellow } from 'kolorist'
import { join } from 'path'
import type Workspace from 'src/workspace/workspace'
import {
  $,
  getInitialCommit,
  isBranchExist,
  isEmptyRepository,
  isFileExist,
  isRepository,
  stream$
} from '../utils'

// 根据配置设置workspace环境
export default async function install(workspaces: Workspace[]) {
  for (let i = 0; i < workspaces.length; i++) {
    const workspace = workspaces[i]
    const source$ = (cmd: string) => $(cmd, { cwd: workspace.source })
    const dist$ = (cmd: string) => $(cmd, { cwd: workspace.dist })
    const log = (data) => console.log(`${yellow(workspace.origin)}: ${data}`)

    // 创建workspace目录
    if (!(await isFileExist(workspace.path))) {
      await mkdir(workspace.path, { recursive: true })
      log(`工作区已创建 `)
    }

    // 克隆source仓库
    if (!(await isFileExist(workspace.source))) {
      log('开始clone...')
      await stream$(`git clone ${workspace.origin} source`, workspace.path)
      log('clone完成')
      await source$(`git config --local credential.helper store`)
    } else await stream$(`git fetch --prune`, workspace.source)

    // 准备打包分支
    await Promise.all(
      workspace.branches.map(async (branch) => {
        if (await isBranchExist(workspace.source, branch)) return
        try {
          await source$(`git checkout ${branch}`)
          log(`打包分支${branch}已创建`)
        } catch (err) {
          console.log(
            red(
              `打包分支设置失败, 请检查${workspace.origin}中是否存在${branch}分支`
            )
          )
          throw err
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
      await dist$(`git config --local credential.helper store`)
      await dist$('git config --local user.name kort')
      await dist$('git config --local user.email kort@fake.local')
      log(`dist仓库已创建`)
    }

    // dist是否空仓库
    if (await isEmptyRepository(workspace.dist)) {
      await dist$(
        `echo ${`此仓库是${workspace.origin}的打包产物仓库, 你可以clone此仓库检出想要发布的分支对外发布`} > README.md`
      )
      await dist$(`git add .`)
      await dist$('git commit -am "initial commit"')
      log(`dist仓库初始提交完成`)
      // 删除旧的release仓库
      await rm(workspace.releasePath, { recursive: true, force: true })
    }

    // 准备dist提交分支
    await Promise.all(
      workspace.branches.map(async (branch) => {
        if (!(await isBranchExist(workspace.dist, branch))) {
          // 切到第一次提交后再切新的分支出来,保障每一个dist分支是干净的
          await dist$(`git checkout ${await getInitialCommit(workspace.dist)}`)
          await dist$(`git clean -fd`)
          await dist$(`git checkout -b ${branch}`)
          log(`提交分支${branch}已创建`)
        } else {
        }
      })
    )

    // 复制源码仓库中的认证文件到dist仓库各分支中
    // for (let branch of workspace.branches) {
    //   await dist$(`git checkout ${branch}`)
    //   await source$(`git pull`)
    //   if (!(await isFileExist(join(workspace.source, '_auth')))) continue
    //   await dist$(`cp -rfa ${workspace.source}/_auth/* .`)
    //   await cpy(join(workspace.source, '_auth/*'), join(workspace.dist))
    //   const { stdout } = await dist$(`git status -s`)
    //   if (!stdout) continue
    //   await dist$(`git add .`)
    //   await dist$('git commit -am "配置认证文件"')
    //   log(`${branch}认证文件已配置`)
    // }

    // 准备发布仓库
    if (!(await isFileExist(workspace.releasePath))) {
      await mkdir(workspace.releasePath, { recursive: true })
      log(`release目录已创建 `)
    }

    await Promise.all(
      // 克隆dist仓库为release仓库
      workspace.branches.map(async (branch) => {
        const releaseBranch = join(workspace.releasePath, branch)
        if (!(await isFileExist(releaseBranch))) {
          log(`设置发布分支${branch}`)
          await stream$(
            `git clone ${join(workspace.path, 'dist')} ${branch}`,
            workspace.releasePath
          )
          await $(`git checkout ${branch}`, {
            cwd: join(workspace.releasePath, branch)
          })
          await dist$(`git config --local credential.helper store`)
          await dist$('git config --local user.name kort')
          await dist$('git config --local user.email kort@fake.local')
          log(`发布分支${branch}设置完成`)
        }
      })
    )
  }

  console.log(`\n${'所有仓库设置完成!'}\n`)

  console.log(
    yellow(
      `\n下一步: 运行kort serve启动kort服务 (如果kort服务已启动, 请重启服务使配置生效)\n`
    )
  )
}
