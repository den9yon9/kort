import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { $ } from '../utils'
import getProjectPkgManager from './getProjectPkgManager'

const installMap = {
  npm: 'npm ci',
  yarn: 'yarn install --frozen-lockfile',
  pnpm: 'pnpm install --frozen-lockfile'
}

async function checkProjectNeedBuild(project: string) {
  const pkgData = await readFile(resolve(project, 'package.json'), {
    encoding: 'utf-8'
  })
  const pkgInfo = JSON.parse(pkgData)
  if (!pkgInfo.scripts.build) throw { reason: `${project}没有提供build脚本` }
}

async function installProject(project: string) {
  const pkgManager = await getProjectPkgManager(project)
  const install = installMap[pkgManager]
  await $(install, { cwd: project })
}

export default async function buildProject(project: string) {
  await installProject(project)
  await checkProjectNeedBuild(project)
  await $(`pnpm build`, { cwd: project })
}
