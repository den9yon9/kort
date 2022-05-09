// 读取配置文件, 格式化为统一结构
import { readFileSync } from 'fs'
import { red } from 'kolorist'
import { resolve } from 'path'

type ConfigCooked = Array<{
  origin: string
  branches: string[]
  webhook?: string
}>

type ConfigRaw = Array<string> | ConfigCooked

const configPath = resolve('.', '.kortrc.json')

export default function loader() {
  try {
    const data = readFileSync(configPath, { encoding: 'utf8' })
    const config = JSON.parse(data)
    return format(config)
  } catch (err) {
    console.log(err.message)
    console.log(red(`当前目录${configPath}下未查找到.kortrc.json文件`))
    process.exit(1)
  }
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
