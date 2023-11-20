const errorLogger = require("../config/errorLogger")

const errorHandler = (err, req, res, next) => {
    res.json({ success: false, message: err.message })
    errorLogger.info(err)
    next()
}

module.exports = errorHandler