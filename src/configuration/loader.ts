// 读取配置文件, 格式化为统一结构
import { writeFile, readFile } from 'fs/promises'
import { red } from 'kolorist'
import { join } from 'path'
import { isFileExist } from '../utils'

type Config = {
  storage: string
  release: string
  server: {
    port: number
    cron?: string
  }
  workspaces: {
    origin: string
    webhook?: string
    branches: string[]
  }[]
}

const defaultConfig = {
  storage: join(process.env.HOME as string, '.kort'),
  release: join(process.env.HOME as string, 'kort-release'),
  server: {
    port: 3010
  },
  workspaces: []
}

async function genDefaultConfig() {
  const defaultConfigPath = join(process.env.HOME as string, 'kort.config.json')
  if (!(await isFileExist(defaultConfigPath))) {
    await writeFile(defaultConfigPath, JSON.stringify(defaultConfig))
    console.log(`默认配置文件已生成于${defaultConfigPath}`)
  }
  return defaultConfigPath
}

export default async function loader(configPath?: string) {
  if (!configPath) configPath = await genDefaultConfig()
  if (!(await isFileExist(configPath))) {
    console.log(red(`未找到${configPath}`))
    process.exit(1)
  }
  const data = await readFile(configPath, { encoding: 'utf-8' })
  const config = { ...defaultConfig, ...(JSON.parse(data) as Config) }
  config.workspaces.forEach((item) => {
    if (!item.branches) item.branches = ['master']
  })
  return config
}
