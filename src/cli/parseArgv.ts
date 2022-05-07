import * as minimist from 'minimist'

function parseArgv() {
  let cmd = process.argv[2]
  let argv: minimist.ParsedArgs

  if (cmd.startsWith('-')) {
    cmd = 'kort'
    argv = minimist(process.argv.slice(2), { string: ['_'] })
  } else {
    argv = minimist(process.argv.slice(3), { string: ['_'] })
  }
  return { cmd, argv }
}

export const { cmd, argv } = parseArgv()
