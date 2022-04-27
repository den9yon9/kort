// 解析用户配置为workspace
import { parse } from 'uri-js'
import { basename, dirname, join } from 'path'
import loader from './loader'
import { Workspace } from '../types/idnex'

function fillProtocal(origin: string) {
  return origin.startsWith('git@') ? `ssh://${origin}` : origin
}

export default function parser(configPath: string): Workspace[] {
  const config = loader(configPath)
  return config.map(({ origin, branches, webhook }) => {
    const { host, path } = parse(fillProtocal(origin))
    if (!host || !path) throw new Error(`origin: ${origin}格式错误`)
    return {
      origin,
      branches,
      webhook,
      path: join(
        process.env.HOME as string,
        host,
        dirname(path),
        basename(path, '.git')
      ),
      get source() {
        return join(this.path, 'source')
      },
      get dist() {
        return join(this.path, 'dist')
      }
    }
  })
}
