const statusCodes = require("../constants")

const throttleOptions = {
    "rate": "500/s",
    "on_throttled": function (req, res, next, bucket) {
        // Possible course of actions:
        // 1) Log request
        // 2) Add client ip address to a ban list
        // 3) Send back more information
        // res.set("X-Rate-Limit-Limit", 5)
        // res.set("X-Rate-Limit-Remaining", 0)
        // bucket.etime = expiration time in Unix epoch ms, only available
        // for fixed time windows
        // res.set("X-Rate-Limit-Reset", bucket.etime)
        res.status(statusCodes.TOO_MANY_REQUESTS).json({ error: "Please try again at a later time." })
    }
}

module.exports = throttleOptions