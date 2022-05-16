const pg = require('pg')
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
  /* Handle httpMethod variations and errors */

  const intakes = JSON.parse(event.body)

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

  const b =
    '(' +
    intakes
      .map((i) => {
        let name = i.name ? "'" + i.name + "', " : ' ,'
        let calories = i.calories ? i.calories + ', ' : ' ,'
        let serving_size_g = i.serving_size_g ? i.serving_size_g + ', ' : '0, '
        let fat_total_g = i.fat_total_g ? i.fat_total_g + ', ' : '0, '
        let protein_g = i.protein_g ? i.protein_g + ', ' : '0, '
        let carbohydrates_total_g = i.carbohydrates_total_g ? i.carbohydrates_total_g + ', ' : '0, '
        let created_by = "'" + user.id + "', "
        let performed_at = i.performed_at ? "'" + i.performed_at + "'" : "'" + new Date().toISOString() + "'"

        return (
          "'" +
          uuidv4() +
          "', " +
          name +
          calories +
          serving_size_g +
          fat_total_g +
          protein_g +
          carbohydrates_total_g +
          created_by +
          performed_at
        )
      })
      .join('),(') +
    ')'

  const query =
    'INSERT INTO intakes (id, name, calories, serving_size_g, fat_total_g, protein_g, carbohydrates_total_g, created_by, performed_at) VALUES ' +
    b +
    ' RETURNING *'

  try {
    const response = await client.query(query)

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
