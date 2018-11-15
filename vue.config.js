let path = require('path');
let webpack = require('webpack');

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,

  pwa: {
    name: 'WeebRTC',
    themeColor: '#bb0090',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',  
  },
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
