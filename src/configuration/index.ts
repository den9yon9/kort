// 解析用户配置为workspace

import loader from './loader'
import Workspace from '../workspace/workspace'

export default async function configuration(configPath?: string) {
  const config = await loader(configPath)
  const workspaces: Workspace[] = []
  config.workspaces
    .map(
      (configItem) =>
        new Workspace({
          ...configItem,
          storage: config.storage,
          release: config.release
        })
    )
    // origin相同的配置,后面的配置覆盖前面的
    .reverse()
    .forEach((workspace) => {
      const target = workspaces.find((item) => item.origin === workspace.origin)
      if (!target) workspaces.push(workspace)
    })
  return { ...config, workspaces }
}
