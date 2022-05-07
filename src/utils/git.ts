import { $, popString } from '.'

export const gitlog = async (selector: string, cwd: string) => {
  const { stdout } = await $(`git log ${selector} --pretty=format:'"%s",'`, {
    cwd
  })
  const commits = JSON.parse(`[${popString(stdout)}]`) as Array<string>
  return [...commits.slice(0, 20), '...']
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
    .map((item) => item.substring(0, 6))
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
