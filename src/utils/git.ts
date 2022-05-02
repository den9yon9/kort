import { exec } from 'child_process'
import { promisify } from 'util'

const $ = promisify(exec)

export const popString = (str: string) =>
  str.split('').reverse().join('').substring(1).split('').reverse().join('')

export const gitlog = async (selector: string, cwd: string) => {
  const { stdout } = await $(
    `git log ${selector} --pretty=format:'{%n  "commit": "%H",%n  "abbreviated_commit": "%h",%n  "tree": "%T",%n  "abbreviated_tree": "%t",%n  "parent": "%P",%n  "abbreviated_parent": "%p",%n  "refs": "%D",%n  "encoding": "%e",%n  "subject": "%s",%n  "sanitized_subject_line": "%f",%n  "body": "%b",%n  "commit_notes": "%N",%n  "verification_flag": "%G?",%n  "signer": "%GS",%n  "signer_key": "%GK",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  },%n  "commiter": {%n    "name": "%cN",%n    "email": "%cE",%n    "date": "%cD"%n  }%n},'`,
    { cwd }
  )
  return JSON.parse(`[${popString(stdout)}]`)
}

export const gitshow = async (commit: string, cwd: string) => {
  const { stdout } = await $(
    `git show ${commit} --pretty=format:'{%n  "commit": "%H",%n  "abbreviated_commit": "%h",%n  "tree": "%T",%n  "abbreviated_tree": "%t",%n  "parent": "%P",%n  "abbreviated_parent": "%p",%n  "refs": "%D",%n  "encoding": "%e",%n  "subject": "%s",%n  "sanitized_subject_line": "%f",%n  "body": "%b",%n  "commit_notes": "%N",%n  "verification_flag": "%G?",%n  "signer": "%GS",%n  "signer_key": "%GK",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  },%n  "commiter": {%n    "name": "%cN",%n    "email": "%cE",%n    "date": "%cD"%n  }%n}'`,
    { cwd }
  )
  return JSON.parse(`[${popString(stdout)}]`)
}

export const shortSelector = (selector: string) =>
  selector
    .split('...')
    .map((item) => item.substring(0, 6))
    .join('...')
