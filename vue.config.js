let path = require('path');
let webpack = require('webpack');

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,

  pwa: {
    name: 'Dogars',
    themeColor: '#bb0090'
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
  configureWebpack: {
    resolve: {
      modules: [__dirname + '/node_modules/vue-awesome']
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    }
  }
}
