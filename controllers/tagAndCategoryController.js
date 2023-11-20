const expressAsyncHandler = require('express-async-handler')
const paginate = require('express-paginate')
const statusCodes = require("../constants")
const Tag = require("../models/Tag")
const Category = require('../models/Category')
const handleResponse = require("../helpers/handleResponse")
const getObjectOr404 = require('../helpers/getObjectOr404')
const getFilteredQuery = require('../helpers/getFilteredQuery')
const { matchedData, validationResult } = require('express-validator')
const getSortParam = require('../helpers/getSortParam')



const createItem = (Item) => {
    return expressAsyncHandler(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(statusCodes.BAD_REQUEST)
            let errorMsg = ''
            result.array().forEach(i => {
                errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
            })
            throw new Error(errorMsg)
        }
        const { name } = matchedData(req)
        const item = await Item.findOne({ name })
        if (item) {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error('Item already exists.')
        }
        const newItem = new Item({ name })
        await newItem.save()
        handleResponse(res, statusCodes.SUCCESS, 'Item created.', newItem)
    })
}

const deleteItem = (Item) => {
    return expressAsyncHandler(async (req, res) => {
        const { tagId, categoryId } = req.params
        let item
        if (tagId) {
            item = await getObjectOr404(res, Item, { _id: tagId })
        } else if (categoryId) {
            item = await getObjectOr404(res, Item, { _id: categoryId })
        } else {
            res.status(statusCodes.NOT_FOUND)
            throw new Error('No id given.')
        }
        await item.deleteOne()
        handleResponse(res, statusCodes.SUCCESS, 'Item deleted.')
    })
}

const findItemById = (Item) => {
    return expressAsyncHandler(async (req, res) => {
        const { tagId, categoryId } = req.params
        let item
        if (tagId) {
            item = await getObjectOr404(res, Item, { _id: tagId })
        } else if (categoryId) {
            item = await getObjectOr404(res, Item, { _id: categoryId })
        } else {
            res.status(statusCodes.NOT_FOUND)
            throw new Error('No id given.')
        }
        handleResponse(res, statusCodes.SUCCESS, 'Item found.', item)
    })
}

const findAllItems = (Item) => {
    return expressAsyncHandler(async (req, res) => {
        const query = getFilteredQuery(req, res, 'Tag')
        const sortParam = getSortParam(req, 'name')
        const [results, itemCount] = await Promise.all([
            Item.find(query).sort(sortParam).limit(req.query.limit).skip(req.skip).lean().exec(),
            Item.count(query)
        ])
        const pageCount = Math.ceil(itemCount / req.query.limit)
        handleResponse(res, statusCodes.SUCCESS, 'Items found.', {
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount),
            item_count: results.length,
            data: results
        })
    })
}

const updateItemName = (Item) => {
    return expressAsyncHandler(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(statusCodes.BAD_REQUEST)
            let errorMsg = ''
            result.array().forEach(i => {
                errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
            })
            throw new Error(errorMsg)
        }
        const { newName } = matchedData(req)
        const { tagId, categoryId } = req.params
        let item
        if (tagId) {
            item = await getObjectOr404(res, Item, { _id: tagId })
        } else if (categoryId) {
            item = await getObjectOr404(res, Item, { _id: categoryId })
        } else {
            res.status(statusCodes.NOT_FOUND)
            throw new Error('No id given.')
        }
        item.name = newName
        await item.save()
        handleResponse(res, statusCodes.SUCCESS, 'Item name updated.', item)
    })
}

module.exports = {
    createTag: createItem(Tag),
    deleteTag: deleteItem(Tag),
    findTagById: findItemById(Tag),
    findAllTags: findAllItems(Tag),
    updateTagName: updateItemName(Tag),
    createCategory: createItem(Category),
    deleteCategory: deleteItem(Category),
    findCategoryById: findItemById(Category),
    findAllCategorys: findAllItems(Category),
    updateCategoryName: updateItemName(Category),
}