var pg = require('pg')
//or native libpq bindings
//var pg = require('pg').native

var conString = process.env.PSQL_CONN_STRING //Can be found in the Details page
var client = new pg.Client(conString)

exports.handler = (event, context, callback) => {
  client.connect(function (err) {
    if (err) {
      return callback(null, {
        statusCode: 400,
        body: err.message,
      })
    }
    client.query('SELECT * FROM activities ORDER BY id ASC', function (err, result) {
      if (err) {
        client.end()
        return callback(null, {
          statusCode: 400,
          body: err.message,
        })
      }
      client.end()
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(result.rows),
      })
    })
  })
}
