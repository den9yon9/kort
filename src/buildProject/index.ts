import { exec } from 'child_process'
import { resolve } from 'path'
import { promisify } from 'util'
import { isProjectNeedBuild, getProjectPkgManager } from './parseProject'

const $ = promisify(exec)

const installMap = {
  npm: 'npm ci',
  yarn: 'yarn install --frozen-lockfile',
  pnpm: 'pnpm install --frozen-lockfile'
}

async function installProject(projectPath: string) {
  const pkgManager = await getProjectPkgManager(projectPath)
  const install = installMap[pkgManager]
  await $(install, { cwd: projectPath })
}

async function buildProject(projectPath: string) {
  await installProject(projectPath)
  if (!(await isProjectNeedBuild(projectPath))) return
  await $(`pnpm build`, { cwd: projectPath })
  return resolve(projectPath, 'dist')
}

export default buildProject
