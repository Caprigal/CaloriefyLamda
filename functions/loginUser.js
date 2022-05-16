const pg = require('pg')
const bcrypt = require('bcryptjs')
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
  const { username, password } = JSON.parse(event.body)
  let user

  /* Handle httpMethod variations and errors */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!username || !password) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ stack: null, message: 'Please include all the fields!' }),
    }
  }
  /* Handle httpMethod variations and errors */

  try {
    client.connect()

    user = await client.query(`SELECT * FROM users WHERE username = '${username}'`)

    client.end()

    if (user.rowCount === 0) {
      return {
        statusCode: 401,
        headers: headers,
        body: JSON.stringify({ stack: null, message: 'Invalid credentials!' }),
      }
    }

    if (user.rowCount !== 0 && (await bcrypt.compare(password, user.rows[0].password))) {
      return {
        headers: headers,
        statusCode: 200,
        body: JSON.stringify({
          _id: user.rows[0].id,
          username: user.rows[0].username,
          email: user.rows[0].email,
          birthdate: user.rows[0].birthdate,
          lifestyle: user.rows[0].lifestyle,
          gender: user.rows[0].gender,
          weight: user.rows[0].weight,
          height: user.rows[0].height,
          basecalorieburn: user.rows[0].basecalorieburn,
          token: await generateToken(user.rows[0].id),
        }),
      }
    } else {
      return {
        headers: headers,
        statusCode: 401,
        body: JSON.stringify({ stack: null, message: 'Invalid credentials!' }),
      }
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

const generateToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}