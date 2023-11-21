const apicache = require("apicache-plus")
const { Redis } = require("ioredis")

const config = {
  host: process.env.REDIS_HOST
}
const redis = new Redis(config)
const cacheWithRedis = apicache.options({ redisClient: redis })

const cacheMiddleware = cacheWithRedis(process.env.CACHE_TIME || '5 minutes')

module.exports = { cacheMiddleware, redis }