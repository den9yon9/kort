// 读取配置文件, 格式化为统一结构
import { readFile } from 'fs/promises'
import { red } from 'kolorist'
import { join, resolve } from 'path'
import { isFileExist } from '../utils'

type WorkspaceConfig = {
  origin: string
  webhook?: string
  branches?: string[]
}

export default async function loader(path: string) {
  const configPath = join(path, 'kort.json')
  console.log(`配置文件: ${configPath}`)
  if (!(await isFileExist(configPath))) {
    console.log(red(`\n当前目录${resolve('.')}未找到kort.json\n`))
    process.exit(1)
  }
  const data = await readFile(configPath, { encoding: 'utf-8' })
  const workspaces = JSON.parse(data) as WorkspaceConfig[]
  return workspaces.map((item) => ({
    branches: ['master'],
    ...item
  }))
}
