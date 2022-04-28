import { exec } from 'child_process'
import { Task } from 'src/types'
import { promisify } from 'util'
import { parseOrigin } from 'src/utils'
const $ = promisify(exec)

export function getTask(task: Task) {
  // TODO: 解析出task的workspace
  const { hostname, pathname } = parseOrigin(task.origin)
  
}

export function getProjects(task: Task) {}
