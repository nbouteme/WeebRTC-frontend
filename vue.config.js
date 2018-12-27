let path = require('path');
let webpack = require('webpack');

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,

  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
  configureWebpack: {
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    }, 
    plugins: [
      new webpack.DefinePlugin({
        BUILD: JSON.stringify(process.env.NODE_ENV)
      })
    ]
  }
}
