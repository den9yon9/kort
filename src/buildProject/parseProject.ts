// 分析项目是否需要打包 & 要使用的包管理器

import { PathLike } from 'fs'
import { access, readFile } from 'fs/promises'
import { resolve } from 'path'

function isFileExist(path: PathLike) {
  return access(path)
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}

export async function isProjectNeedBuild(projectPath: string) {
  const pkgData = await readFile(resolve(projectPath, 'package.json'), {
    encoding: 'utf-8'
  })
  const pkgInfo = JSON.parse(pkgData)
  return Boolean(pkgInfo.scripts.build)
}

const lockFileMap = [
  {
    pkgManager: 'pnpm',
    lockfile: 'pnpm-lock.yaml'
  },
  {
    pkgManager: 'npm',
    lockfile: 'package-lock.json'
  },
  {
    pkgManager: 'yarn',
    lockfile: 'yarn.lock'
  }
]

export async function getProjectPkgManager(projectPath: string) {
  const lockfiles = await Promise.all(
    lockFileMap.map(async ({ pkgManager, lockfile }) => {
      const ifExist = await isFileExist(resolve(projectPath, lockfile))
      return { ifExist, lockfile, pkgManager }
    })
  )
  const existLockfiles = lockfiles.filter((item) => item.ifExist)

  if (existLockfiles.length === 0)
    throw new Error(
      `无法安装依赖: ${projectPath}未找到任何lockfile,请提交你的lockfile后再提交任务`
    )

  if (existLockfiles.length > 1)
    throw new Error(
      `无法安装依赖: ${projectPath}有多个lockfile: ${existLockfiles.map(
        ({ lockfile }) => lockfile
      )}, 打包服务不知道要使用哪一个lockfile来安装你的依赖, 请删除多余的lockfile, 并重新安装你的依赖后再提交任务`
    )

  const [{ pkgManager }] = existLockfiles

  return pkgManager as 'npm' | 'yarn' | 'pnpm'
}
