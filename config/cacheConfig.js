const apicache = require("apicache-plus")
const { Redis } = require("ioredis")

const redis = new Redis()
const cacheWithRedis = apicache.options({ redisClient: redis })

const cacheMiddleware = cacheWithRedis(process.env.CACHE_TIME || '5 minutes')

module.exports = { cacheMiddleware, redis }