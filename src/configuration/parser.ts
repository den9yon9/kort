// 解析用户配置为workspace

import { join } from 'path'
import loader from './loader'
import { Workspace } from '../types/index'
import { parseOrigin } from 'src/utils'

export default function parser(configPath: string): Workspace[] {
  const config = loader(configPath)
  const workspaces: Workspace[] = []
  config
    .map(({ origin, branches, webhook }) => {
      const { hostname, pathname } = parseOrigin(origin)
      if (!hostname || !pathname) throw new Error(`origin: ${origin}格式错误`)
      return {
        origin,
        branches,
        webhook,
        hostname,
        pathname,
        path: join(process.env.HOME as string, '.kort', pathname),
        get source() {
          return join(this.path, 'source')
        },
        get dist() {
          return join(this.path, 'dist')
        }
      }
    })
    .reverse()
    .forEach((workspace) => {
      // origin相同的配置,后面的配置覆盖前面的
      const target = workspaces.find((item) => item.origin === workspace.origin)
      if (!target) workspaces.push(workspace)
    })

  return workspaces.reverse()
}
