#!/usr/bin/env node

import configuration from '../configuration'
import { argv, cmd } from './parseArgv'
import install from './install'
import serve from './serve'
import build from './build'
import { resolve } from 'path'
import { readFile } from 'fs/promises'

const { origin, branch, compare, cron, port = 3010 } = argv

function help() {
  console.log(
    [
      'kort install',
      'kort serve [--port <port>] [--cron [<pattern>]]',
      'kort build --port <port> --origin <origin> --branch <branch> [--compare <compare>]'
    ].join('\n')
  )
}

function version() {
  readFile(resolve(process.argv[1], '..', '..', '..', 'package.json'), {
    encoding: 'utf-8'
  }).then((data) => {
    console.log(JSON.parse(data).version)
  })
}

if (['kort', 'help', 'version'].includes(cmd)) {
  ;({
    help,
    kort: help,
    version
  }[cmd]?.())
} else {
  configuration().then((workspaces) => {
    ;({
      serve: () => serve(port, workspaces, cron),
      install: () => install(workspaces),
      build: () => build(port, origin, branch, compare)
    }[cmd]?.())
  })
}
