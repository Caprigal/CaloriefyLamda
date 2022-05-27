// webpack.functions.js
module.exports = {
  optimization: {minimize: false},
  devtool: "source-map",
  target: "node",
  alias: {
    'pg-native': path.join(__dirname, 'alias/pg-native.js'),
    'pgpass$': path.join(__dirname, 'alias/pgpass.js'),
  },
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/)
  ]

}