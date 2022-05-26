const pg = require('pg')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const headers = {
  'access-control-allow-methods': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '2592000',
  'Access-Control-Allow-Credentials': 'true',
}

exports.handler = async (event, context) => {
  const client = new pg.Client(process.env.PSQL_CONN_STRING)
  let user

  /* Handle httpMethod variations and errors */
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
    }
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers: headers, body: 'Method Not Allowed' }
  }
  /* Handle httpMethod variations and errors */

  /* Token verification, get User by token */
  if (!event.headers.authorization && !event.headers.authorization.startsWith('Bearer')) {
    return { statusCode: 401, headers: headers, body: 'Not authorized' }
  }

  const decoded = jwt.verify(event.headers.authorization.replace('Bearer ', ''), process.env.JWT_SECRET)

  try {
    client.connect()

    const response = await client.query(`SELECT * FROM users WHERE id = '${decoded.id}'`)
    user = response.rows[0]
  } catch (err) {
    client.end()
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify('Invalid token!'),
    }
  }
  /* Token verification, get User by token */

  try {
    const response = await client.query(
      `DELETE FROM activities WHERE created_by = '${user.id}' AND id = '${event.queryStringParameters.id}'`
    )

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
