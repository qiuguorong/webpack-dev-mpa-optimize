const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const path = require('path')
const portfinder = require('portfinder')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 此处可更改为 --config 形式
const webpackConfig = require('./webpack.dev.conf.js')

// CLI Argument Vector
const yargs = require('yargs')
yargs.alias('p', 'page')
const argv = yargs.argv

// 默认关键字，用于一些必须启动的内容
const defaultKeywords = ['debug', 'login', 'index']

// 文件夹或者文件路径 模糊匹配到关键字
const isChunkOrPathMatchKeyWords = (chunkOrPath, keys) => {
  let isMatch = false
  keys.forEach(key => {
    if (chunkOrPath.indexOf(key) !== -1) {
      isMatch = true
    }
  })
  return isMatch
}

// HtmlWebpackPlugin 模糊匹配到关键字
const isHtmlPluginMatchKeyWords = (plugin, argvKeys) => {
  if (plugin && plugin.options) {
    const chunkKey = plugin.options.chunkKey
    const chunkTemplate = path.dirname(plugin.options.template)
    if (chunkKey) {
      return isChunkOrPathMatchKeyWords(chunkKey, argvKeys)
    } else if (chunkTemplate) {
      return isChunkOrPathMatchKeyWords(chunkTemplate, argvKeys)
    }
  }
  return false
}

// 兼容npm run dev:part -- --page=keyword
// 兼容npm run dev:part -- -p=keyword
// 兼容npm run dev:part -p=keyword
// 兼容npm run dev:part keyword
const getCLIArgvKeyword = () => {
  let _argvPage = ''
  if (typeof(argv.page) === 'string') {
    _argvPage = argv.page
  } else if(argv._.length > 0) {
    _argvPage = argv._[0]
  } else if(argv['=']) {
    _argvPage = argv['=']
  }
  return _argvPage
}

const argvKeyword = getCLIArgvKeyword()

if (argvKeyword) {
  const keywords = argvKeyword.split(',').concat(defaultKeywords)
  // 处理entry，留下匹配到关键字的chunks
  const afterFilterEntries = {}
  Object.keys(webpackConfig.entry).forEach(chunk => {
    if (isChunkOrPathMatchKeyWords(chunk, keywords)) {
      afterFilterEntries[chunk] = webpackConfig.entry[chunk]
    }
  })
  webpackConfig.entry = afterFilterEntries

  // 处理plugins, HtmlWebpackPlugin plugins 按需引入
  // chunkKey 更精准的匹配，否则使用template路径匹配
  const afterFilterPlugins = []
  webpackConfig.plugins.forEach(plugin => {
    if (plugin instanceof HtmlWebpackPlugin) {
      isHtmlPluginMatchKeyWords(plugin, keywords) && afterFilterPlugins.push(plugin)
    } else {
      afterFilterPlugins.push(plugin)
    }
  })
  webpackConfig.plugins = afterFilterPlugins

  console.log('entries', afterFilterEntries)
}

const compiler = webpack(webpackConfig)
const devServerOptions = Object.assign({}, webpackConfig.devServer || {}, {
  // 此处可覆盖，也可使用dev.conf里的内容
  contentBase: path.resolve(__dirname, '../dist'),
  host: '127.0.0.1',
  port: 8080,
  open: true,
  progress: true
})
// port 检查并自增
portfinder.basePort = devServerOptions.port
portfinder.getPortPromise().then(port => {
  devServerOptions.port = port
  const server = new WebpackDevServer(compiler, devServerOptions)
  const _host = devServerOptions.host
  const _port = devServerOptions.port
  server.listen(_port, _host, () => {
    console.log(`Starting server on http://${_host}:${_port}`)
  })
})
