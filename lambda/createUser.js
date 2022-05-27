const pg = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid')
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
  const { username, email, password, birthdate, lifestyle, gender, weight, height, basecalorieburn } = JSON.parse(event.body)
  let user
  let userExists

  /* Handle httpMethod variations and errors */
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headers, body: 'Method Not Allowed' }
  }

  if (!username || !email || !password) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ stack: null, message: 'Please include all the fields!' }),
    }
  }
  /* Handle httpMethod variations and errors */

  try {
    client.connect()
    userExists = await client.query(`SELECT * FROM users WHERE email = '${email}' OR username = '${username}'`)

    if (userExists.rowCount) {
      client.end()
      return {
        statusCode: 400,
        headers: headers,
        body: 'User already exists',
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user = await client.query(
      `INSERT INTO users (id, username, email, password, birthdate, lifestyle, gender, weight, height, basecalorieburn) VALUES ('${uuidv4()}', '${username}', '${email}', '${hashedPassword}', '${birthdate}', '${lifestyle}', '${gender}', '${weight}', '${height}', '${basecalorieburn}') RETURNING *`
    )

    client.end()
    return {
      headers: headers,
      statusCode: 201,
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