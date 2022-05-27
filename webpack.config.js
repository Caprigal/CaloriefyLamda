const webpack = require('webpack');

module.exports = {
  optimization: {minimize: false},
  devtool: "source-map",
  target: "node",
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/)
  ]

}