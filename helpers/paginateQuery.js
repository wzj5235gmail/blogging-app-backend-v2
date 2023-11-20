const expressAsyncHandler = require('express-async-handler')

const paginateQuery = expressAsyncHandler(async (Model) => {
    if (!(Model instanceof mongoose.Model)) {
        throw new Error('Model must be mongoose Model object.')
    }
    const [results, itemCount] = await Promise.all([
        Model.find({}).limit(req.query.limit).skip(req.skip).lean().exec(),
        Model.count({})
    ])
    const pageCount = Math.ceil(itemCount / req.query.limit)
    return { results, pageCount }
})

module.exports = paginateQuery