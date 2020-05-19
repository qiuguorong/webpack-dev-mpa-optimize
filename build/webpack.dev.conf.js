'use strict'

const webpack = require('webpack')
const path = require('path')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const getMultiEntry = (globPath, options = {}) => {
  var entries = {}, basename, tmp, pathname
  glob.sync(globPath, options).forEach(entry => {
    basename = path.basename(entry, path.extname(entry))
    tmp = entry.split('/').splice(-4)
    pathname = tmp[tmp.length-2]
    entries[pathname] = entry
  });
  return entries;
}

const devWebpackConfig = {
  mode: 'development',
  context: path.resolve(__dirname, '../'),
  entry: getMultiEntry('./src/pages/**/*.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].js',
  },
  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    contentBase: './dist',
    compress: true,
    host: '127.0.0.1',
    port: '8080',
    open: true
  },
  plugins: [
    // cli webpack-dev-server --hot 会自动注入，node api形式需要手动添加
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  ]
}

var pages = getMultiEntry('./src/pages/**/*.html');
for (var pathname in pages) {
  // 配置生成的html文件，定义路径等
  var conf = {
    filename: pathname + '.html',
    template: pages[pathname],
    chunks: [pathname],
    inject: true
  };
  // 需要生成几个html文件，就配置几个HtmlWebpackPlugin对象
  devWebpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
}

module.exports = devWebpackConfig
