import * as minimist from 'minimist'
import app from '../server'
import configuration from '../configuration'
import setup from '../environment'
import { green } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const { c: config, p: port = 3008 } = argv

if (!config) throw new Error(`请使用-c指定配置文件路径`)

const workspaces = configuration(config)

async function bootstrap() {
  await setup(workspaces)

  const dispatcher = new Dispatcher(workspaces)
  app.context.dispatcher = dispatcher
  app.listen(+port)
  new Schedule(dispatcher)
  console.log(green(`服务已启动于${port}端口`))
}

bootstrap()
