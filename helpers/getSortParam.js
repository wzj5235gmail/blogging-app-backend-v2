getSortParam = (req, defaultParam) => {
    const order = req.query.order || defaultParam
    let sortParam = {}
    if (order.startsWith('-')) {
        sortParam[`${order.substring(1)}`] = -1
    } else {
        sortParam[order] = 1
    }
    return sortParam
}

module.exports = getSortParam