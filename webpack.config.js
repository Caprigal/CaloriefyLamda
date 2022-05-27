// webpack.functions.js
module.exports = {
  optimization: {minimize: false},
  devtool: "source-map",
  target: "node",
  alias: {
    'pg-native': path.join(__dirname, 'aliases/pg-native.js'),
    'pgpass$': path.join(__dirname, 'aliases/pgpass.js'),
  },
}