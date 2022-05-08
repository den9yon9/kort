// 解析用户配置为workspace

import loader from './loader'
import Workspace from '../workspace/workspace'

export default function configuration(configPath: string) {
  const config = loader(configPath)
  const workspaces: Workspace[] = []
  config
    .map((configItem) => new Workspace(configItem))
    // origin相同的配置,后面的配置覆盖前面的
    .reverse()
    .forEach((workspace) => {
      const target = workspaces.find((item) => item.origin === workspace.origin)
      if (!target) workspaces.push(workspace)
    })
  return workspaces
}
