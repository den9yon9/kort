#!/usr/bin/env node

import * as minimist from 'minimist'
import app from '../server'
import configuration from '../configuration'
import setup from '../environment'
import { green } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const {
  _,
  c: config = `${process.env.HOME}/.kortrc.json`,
  p: port = 3008,
  t: time = '0 */5 * * * *',
  s: serve,
  v: version,
  b: build
} = argv

if (version) console.log(process.env['npm_package_version'])
else kort()

function kort() {
  if (!config) throw new Error(`请使用-c指定配置文件路径`)

  const workspaces = configuration(config)
  const dispatcher = new Dispatcher(workspaces)

  setup(workspaces).then(() => {
    if (!serve) {
      new Schedule(time, dispatcher)
      console.log(green(`\n定时任务已启动(cron pattern: ${time})\n`))
    } else {
      app.context.dispatcher = dispatcher
      app.listen(port)
      console.log(green(`\nkort服务已启动于${port}端口\n`))
    }
  })
}
