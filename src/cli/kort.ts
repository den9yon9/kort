import * as minimist from 'minimist'
import configuration from '../configuration'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const [cmd] = argv._
const { c, config, p, project, w, workspace } = argv

if (cmd === 'reload' && (c || config)) {
  const workspaces = configuration(c || config)
  console.log(workspaces)
}

if (cmd === 'build' && (p || project)) {
  // TODO: build project
}

if (cmd === 'build' && (w || workspace)) {
  // TODO: build workspace
}

if (cmd === 'log' && (w || workspace)) {
  // TODO: log workspace
}
