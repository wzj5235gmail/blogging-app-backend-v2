const bunyan = require('bunyan')

const errorLogger = bunyan.createLogger({
    name: 'BlogApp',
    streams: [{
        path: 'logs/error.log',
    }]
})

module.exports = errorLogger