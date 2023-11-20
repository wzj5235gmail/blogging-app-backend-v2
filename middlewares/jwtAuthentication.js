const statusCodes = require("../constants")
const jwt = require('jsonwebtoken')

const jwtAuthentication = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    res.status(statusCodes.UNAUTHORIZED)
    throw new Error('No credentials provided.')
  }
  jwt.verify(token, process.env.JWT_SECRET || 'mysecret', (error, user) => {
    if (error) {
      console.log(error)
      res.status(statusCodes.UNAUTHORIZED)
      throw new Error('Invalid credentials.')
    }
    req.user = user
    next()
  })
}

module.exports = jwtAuthentication