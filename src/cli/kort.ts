#!/usr/bin/env node

import configuration from '../configuration'
import { argv, cmd } from './parseArgv'
import install from './install'
import serve from './serve'
import build from './build'

const { origin, branch, compare, cron, port = 3010, _ } = argv

function help() {
  console.log(
    [
      'kort install',
      'kort serve [--port <port>] [--cron [<pattern>]]',
      'kort build [--port <port>] --origin <origin> --branch <branch> [--compare <compare>]'
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
