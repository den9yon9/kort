// 解析用户配置为workspace

import loader from './loader'
import Workspace from '../workspace/workspace'

export default async function configuration(path: string) {
  const workspacesConfig = await loader(path)
  const workspaces: Workspace[] = []
  workspacesConfig
    .map((configItem) => new Workspace({ ...configItem, dir: path }))
    // origin相同的配置,后面的配置覆盖前面的
    .reverse()
    .forEach((workspace) => {
      const target = workspaces.find((item) => item.origin === workspace.origin)
      if (!target) workspaces.push(workspace)
    })
  return workspaces
}
