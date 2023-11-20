const jwt = require('jsonwebtoken')

const generateToken = async (payload) => {
    const secret = process.env.JWT_SECRET || 'mysecret'
    const expireTime = process.env.TOKEN_EXPIRE_TIME || '30m'
    const token = await jwt.sign(payload, secret, { 'expiresIn': expireTime })
    return token
}

module.exports = generateToken