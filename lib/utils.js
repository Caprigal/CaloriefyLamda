const jwt = require('jsonwebtoken')
require('dotenv').config()

const headers = {
  'access-control-allow-methods': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '2592000',
  'Access-Control-Allow-Credentials': 'true',
}

const generateToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

module.exports = {
  generateToken,
  headers
}
