const { CREATED, SUCCESS } = require("../constants")

const handleResponse = (res, status, message, data) => {
  const success = [CREATED, SUCCESS].includes(status)
  res.status(status).json({ success, message, data })
}

module.exports = handleResponse