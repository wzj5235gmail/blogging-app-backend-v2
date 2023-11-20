const statusCodes = require("../constants")

const roleAuthorization = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(statusCodes.FORBIDDEN)
      throw new Error('You are not allowed to access this endpoint.')
    }
    next()
  }
}

module.exports = roleAuthorization