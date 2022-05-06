// 读取配置文件, 格式化为统一结构
import { readFileSync } from 'fs'

type ConfigCooked = Array<{
  origin: string
  branches: string[]
  webhook?: string
}>

type ConfigRaw = Array<string> | ConfigCooked

export default function loader(configPath: string) {
  const data = readFileSync(configPath, { encoding: 'utf8' })
  const config = JSON.parse(data)
  return format(config)
}

function format(configRaw: ConfigRaw): ConfigCooked {
  return configRaw.map((item) => {
    if (typeof item === 'string')
      return {
        origin: item,
        branches: ['master']
      }

    return { ...item, branches: item.branches || ['master'] }
  })
}
