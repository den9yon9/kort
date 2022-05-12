import { $ } from '.'

export const gitlog = async (selector: string, cwd: string) => {
  const { stdout } = await $(`git log ${selector} --pretty=format:'"%s",'`, {
    cwd
  })
  const commits = JSON.parse(
    `[${stdout.substring(0, stdout.length - 1)}]`
  ) as Array<string>
  return commits.length > 20 ? [...commits.slice(0, 20), '...'] : commits
}

export const getSHA1 = async (ref: string, cwd: string) => {
  const { stdout } = await $(`git rev-parse ${ref}`, { cwd })
  return stdout.trim()
}

export const getInitialCommit = async (path: string) => {
  const { stdout } = await $('git rev-list --max-parents=0 HEAD', { cwd: path })
  return stdout.trim()
}

export const shortSelector = (selector: string) =>
  selector
    .split('...')
    .map((item) => item.substring(0, 8))
    .join('...')

export function isBranchExist(path: string, branch: string) {
  return $(`git rev-parse --verify ${branch}`, { cwd: path })
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}

export function isRepository(path: string) {
  return $('git rev-parse --is-inside-work-tree', { cwd: path })
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}

export function isEmptyRepository(path: string) {
  return $('git log', { cwd: path })
    .then(() => Promise.resolve(false))
    .catch(() => Promise.resolve(true))
}

export async function isRepositoryHasRemote(path: string) {
  const { stdout } = await $('git remote', { cwd: path })
  return Boolean(stdout)
}
