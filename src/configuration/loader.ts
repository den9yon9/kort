// 读取配置文件, 格式化为统一结构
import { readFile } from 'fs/promises'
import { red, yellow } from 'kolorist'
import { join, resolve } from 'path'
import { isFileExist } from '../utils'

type WorkspaceConfig = {
  origin: string
  webhook?: string
  branches?: string[]
}

export default async function loader(path: string) {
  const configPath = join(path, 'kort.json')
  if (!(await isFileExist(configPath))) {
    console.log(red(`\n当前路径未找到kort.json\n`))
    console.log(
      yellow(
        `tips: kort默认项目为当前工作路径, 你也可以指定项目路径: \n\n      kort install <projectPath>\n      kort serve <projectPath>\n`
      )
    )
    process.exit(1)
  }
  const data = await readFile(configPath, { encoding: 'utf-8' })
  const workspaces = JSON.parse(data) as WorkspaceConfig[]
  console.log(`配置文件已读取: ${configPath}`)
  return workspaces.map((item) => ({
    branches: ['master'],
    ...item
  }))
}
