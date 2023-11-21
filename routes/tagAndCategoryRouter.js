const express = require('express')
const jwtAuthentication = require('../middlewares/jwtAuthentication')
const {
    createTag,
    deleteTag,
    findTagById,
    findAllTags,
    updateTagName,
    createCategory,
    deleteCategory,
    findCategoryById,
    findAllCategorys,
    updateCategoryName,
} = require('../controllers/tagAndCategoryController')
const roleAuthorization = require('../middlewares/roleAuthorization')
const { cacheMiddleware } = require('../config/cacheConfig')
const { body } = require('express-validator')
const Tag = require('../models/Tag')
const Category = require('../models/Category')


const tagAndCategoryRouter = express.Router()

// Auth not required
// tagAndCategoryRouter.get('/categories', cacheMiddleware, findAllCategorys)
// tagAndCategoryRouter.get('/categories/:categoryId', cacheMiddleware, findCategoryById)
// tagAndCategoryRouter.get('/tags', cacheMiddleware, findAllTags)
// tagAndCategoryRouter.get('/tags/:tagId', cacheMiddleware, findTagById)
tagAndCategoryRouter.get('/categories', findAllCategorys)
tagAndCategoryRouter.get('/categories/:categoryId', findCategoryById)
tagAndCategoryRouter.get('/tags', findAllTags)
tagAndCategoryRouter.get('/tags/:tagId', findTagById)

// Auth required
tagAndCategoryRouter.post('/tags', jwtAuthentication, body('name').trim().notEmpty().escape(), createTag)

// Admin or Staff required
const middlewares = [jwtAuthentication, roleAuthorization(['Admin', 'Staff'])]
tagAndCategoryRouter.post('/categories', middlewares, body('name').trim().notEmpty().escape(), createCategory)
tagAndCategoryRouter.delete('/categories/:categoryId', middlewares, deleteCategory)
tagAndCategoryRouter.put('/categories/:categoryId', middlewares, body('newName').trim().notEmpty().escape(), updateCategoryName)
tagAndCategoryRouter.delete('/tags/:tagId', middlewares, deleteTag)
tagAndCategoryRouter.put('/tags/:tagId', middlewares, body('newName').trim().notEmpty().escape(), updateTagName)

tagAndCategoryRouter.post('/tagsMulti', [jwtAuthentication, roleAuthorization(['Admin'])], async (req, res) => {
    const tags = req.body
    tags.forEach(async i => {
        let tag = new Tag({ name: i.name })
        await tag.save()
    })
    res.send('success')
})
tagAndCategoryRouter.post('/categoriesMulti', [jwtAuthentication, roleAuthorization(['Admin'])], async (req, res) => {
    const cats = req.body
    cats.forEach(async i => {
        let cat = new Category({ name: i.name })
        await cat.save()
    })
    res.send('success')
})

module.exports = tagAndCategoryRouter