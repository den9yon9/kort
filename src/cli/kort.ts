#!/usr/bin/env node

import configuration from '../configuration'
import { argv, cmd } from './parseArgv'
import install from './install'
import serve from './serve'
import build from './build'

const { origin, branch, compare, cron = '*/5 * * * *', port = 3010, _ } = argv

function help() {
  console.log(`Version ${require('../../package.json').version}`)
  console.log(
    [
      'Useage:',
      '\n',
      'kort install [<projectPath>]',
      'kort serve [<projectPath>] [--port <port>] [--cron [<pattern>]]',
      'kort build  --origin <origin> --branch <branch> [--compare <compare>] [--port <port>]',
      '\n'
    ].join('\n')
  )
}

function version() {
  console.log(require('../../package.json').version)
}

if (['kort', 'help', 'version', 'build'].includes(cmd)) {
  ;({
    help,
    kort: help,
    version,
    build: () => build(port, origin, branch, compare)
  }[cmd]?.())
} else {
  configuration(_[0] || '.').then((workspaces) => {
    ;({
      serve: () => serve(port, workspaces, cron),
      install: () => install(workspaces)
    }[cmd]?.())
  })
}
