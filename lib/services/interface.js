// process.env.SUPPRESS_NO_CONFIG_WARNING = true
const scanner = require('./scanner.js')
const compiler = require('./compiler.js')
const template = require('./_template.js')
const fileWriter = require('./file-writer.js')
const monitor = require('./monitor.js')
const path = require('path')
const createBundles = require('./createBundles')
const log = require('./log')
const config = require('config') || {}
const defaults = require('../../config.defaults.json')

// returnResult is for tests usage
const Builder = (options, returnResult = false) => async () => {
  const files = await scanner(options)
  const routeData = await compiler(files)
  const fileContent = template(routeData, options)

  if (returnResult) {
    return fileContent
  } else {
    createBundles(routeData, options) // run bundle creation async
    writeUrlIndex(routeData, options)
    const file = options.routifyDir + '/routes.js'
    await fileWriter(fileContent, file)
    log('Generated routes')
  }
}

function writeUrlIndex(routeData, options) {
  const routes = routeData
    .filter(({ isFallback, isLayout }) => !isFallback && !isLayout)
    .filter(({ path }) => !path.match(/\/\:/))
  const paths = routes.map(({ path }) => path)
  fileWriter(
    'module.exports = ' + JSON.stringify(paths, 0, 2),
    options.routifyDir + '/urlIndex.js'
  )
}

function getSpaEntry() {
  if (process.env.SPA_ENTRY) {
    let entry = process.env.SPA_ENTRY.replace(/^\/+|\/+$/, '')
    if (entry.indexOf('/') > -1) {
      throw new Error('SPA_ENTRY is invalid')
    }
    return '/'+ entry
  }
}

// NOTE we want to keep this method synchronous to easily expose its public
// API (i.e. the object it returns)
const start = function start(inputOptions) {
  const options = { ...defaults, ...config, ...inputOptions }
  options.pages = path.resolve(options.pages).replace(/\\/g, '/')
  options.baseUrl = process.env.BASE_URL ||''
  options.spaEntry = getSpaEntry() || ''

  fileWriter(JSON.stringify(options, 0, 2), options.routifyDir + '/config.json')
  fileWriter(
    'export default ' + JSON.stringify(options, 0, 2) +'\n\n'+
    'export const baseUrl = "'+ options.baseUrl +'"\n\n'+
    'export const spaEntry = "'+ options.spaEntry +'"\n',
    options.routifyDir + '/config.js'
  )

  const build = Builder(options)
  const buildPromise = build()

  const watch = !options.singleBuild && monitor(options, build)

  if (watch) {
    if (options.childProcess) runChildProcess(options.childProcess)
    return {
      // used by plugins (e.g. Rollup) to block the build until routes are
      // really ready
      waitIdle: async () => Promise.all([buildPromise, watch.waitIdle()]),

      // allows to cleanly closes test runner
      close: () => watch.close(),
    }
  } else
    return {
      waitIdle: async () => await buildPromise,
      close() {},
    }
}

function runChildProcess(name) {
  require('child_process').spawn('npm', ['run', name], {
    cwd: process.cwd(),
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
  })
}

module.exports = {
  Builder, // for tests
  start,
}
