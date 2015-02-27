var webpack = require('webpack');

module.exports = {
  entry: "./src/auxy.js",
  output: {
    path: __dirname + '/build',
    filename: "auxy.js"
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
//      { test: /\.json$/, loader: 'json-loader' },
//      { test: /\.js$/, loader: 'jsx-loader?harmony' }
    ]
  },

  plugins: [
//    new webpack.optimize.CommonsChunkPlugin('shared.js')
  ]
}
