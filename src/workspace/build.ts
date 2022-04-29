import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import getProjectPkgManager from '../utils/getProjectPkgManager'
const $ = promisify(exec)

const installMap = {
  npm: 'npm ci',
  yarn: 'yarn install --frozen-lockfile',
  pnpm: 'pnpm install --frozen-lockfile'
}

async function checkProjectNeedBuild(projectPath: string) {
  const pkgData = await readFile(resolve(projectPath, 'package.json'), {
    encoding: 'utf-8'
  })
  const pkgInfo = JSON.parse(pkgData)
  if (!pkgInfo.scripts.build) throw new Error(`${projectPath}没有提供build脚本`)
}

async function installProject(projectPath: string) {
  const pkgManager = await getProjectPkgManager(projectPath)
  const install = installMap[pkgManager]
  await $(install, { cwd: projectPath })
}

async function buildProject(projectPath: string) {
  await installProject(projectPath)
  await checkProjectNeedBuild(projectPath)
  await $(`pnpm build`, { cwd: projectPath })
}

// 批量打包项目
export default function buildProjects(projectPaths: string[]) {
  return Promise.all(
    projectPaths.map((projectPath) =>
      buildProject(projectPath)
        .then(() => ({ success: true, projectPath }))
        .catch((err) => ({
          success: false,
          projectPath,
          reason: err.message
        }))
    )
  )
}
