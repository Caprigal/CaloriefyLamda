const pg = require('pg')
require('dotenv').config()
const headers = {
  'access-control-allow-methods': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '2592000',
  'Access-Control-Allow-Credentials': 'true',
}

exports.handler = async (event, context) => {
  const client = new pg.Client(process.env.PSQL_CONN_STRING)

  try {
    client.connect()
    const response = await client.query(`SELECT * FROM intakes ORDER BY id ASC`)

    client.end()
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(response.rows),
    }
  } catch (err) {
    client.end()
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }
  }
}
