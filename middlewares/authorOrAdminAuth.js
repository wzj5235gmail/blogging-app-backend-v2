const { default: mongoose } = require("mongoose")
const getObjectOr404 = require("../helpers/getObjectOr404")
const statusCodes = require("../constants")
const expressAsyncHandler = require("express-async-handler")

const authorOrAdminAuth = (Model) => {
    if (!(Model.prototype instanceof mongoose.Model)) {
        throw new Error('Unknown model.')
    }
    return expressAsyncHandler(async (req, res, next) => {
        let itemIdKey = Object.keys(req.params).find((paramKey) => /.*Id/.test(paramKey))
        // try {
        if (!itemIdKey) {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error('Item ID not found in params.')
        }
        const item = await getObjectOr404(res, Model, { _id: req.params[itemIdKey] })
        if (item.author.toString() !== req.user.userId.toString()) {
            res.status(statusCodes.UNAUTHORIZED)
            throw new Error('Unauthorized.')
        } else {
            next()
        }
        // } catch (error) {
        //     next(error)
        // }
    })
}

module.exports = authorOrAdminAuth