const expressAsyncHandler = require("express-async-handler")
const statusCodes = require("../constants")
const validateObjectId = require("./validateObjectId")

const getObjectOr404 = expressAsyncHandler(async (res, model, query, populate) => {
    if (typeof query !== 'object') {
        res.status(statusCodes.BAD_REQUEST)
        throw new Error('Query must be an object.')
    }
    if (query.hasOwnProperty('_id') && !validateObjectId(query._id)) {
        res.status(statusCodes.BAD_REQUEST)
        throw new Error('Id invalid.')
    }
    populate = populate || ''
    const obj = await model.findOne(query).populate(populate)
    if (!obj) {
        res.status(statusCodes.NOT_FOUND)
        throw new Error('Not found.')
    }
    return obj
})

module.exports = getObjectOr404