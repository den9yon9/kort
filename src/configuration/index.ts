// 解析用户配置为workspace

import loader from './loader'
import Workspace from '../workspace/workspace'

export default function configuration(configPath: string): Workspace[] {
  const config = loader(configPath)
  const workspaces: Workspace[] = []
  config
    .map(
      ({ origin, branches, webhook }) =>
        new Workspace(origin, branches, webhook)
    )
    .reverse()
    .forEach((workspace) => {
      // origin相同的配置,后面的配置覆盖前面的
      const target = workspaces.find((item) => item.origin === workspace.origin)
      if (!target) workspaces.push(workspace)
    })

  return workspaces.reverse()
}
