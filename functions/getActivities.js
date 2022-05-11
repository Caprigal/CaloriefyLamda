const pg = require('pg')

const conString = process.env.PSQL_CONN_STRING //Can be found in the Details page
let client

exports.handler = (event, context, callback) => {
  client = new pg.Client(conString)

  client.connect(function (err) {
    if (err) {
      return callback(null, {
        statusCode: 400,
        body: err.message,
      })
    }
    client.query('SELECT * FROM activities ORDER BY id ASC', function (err, result) {
      client.end()
      if (err) {
        return callback(null, {
          statusCode: 400,
          body: err.message,
        })
      }
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(result.rows),
      })
    })
  })
}
