const express = require('express')
const {
    findPostById,
    findAllPosts,
    createPost,
    deletePost,
    updatePost,
    likePost,
    unlikePost } = require('../controllers/postController')
const jwtAuthentication = require('../middlewares/jwtAuthentication')
const authorOrAdminAuth = require('../middlewares/authorOrAdminAuth')
const Post = require('../models/Post')
const { body } = require('express-validator')
const cacheMiddleware = require('../config/cacheConfig')
const User = require('../models/User')
const roleAuthorization = require('../middlewares/roleAuthorization')
const Category = require('../models/Category')
const Tag = require('../models/Tag')


const postRouter = express.Router()

// Auth not required
postRouter.get('/', cacheMiddleware, findAllPosts)
postRouter.get('/:postId', cacheMiddleware, findPostById)
// postRouter.get('/', findAllPosts)
// postRouter.get('/:postId', findPostById)

// Require auth
const createValidations = [
    body('title').trim().notEmpty().withMessage('Should not be empty.'),
    body('content').trim().notEmpty().withMessage('Should not be empty.'),
    body('coverImage').optional().trim().isURL().withMessage('Should be URL.'),
    body('summary').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('category').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('tags').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('status').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('featured').optional().isBoolean().withMessage("Should be either 'true' or 'false'."),
]

postRouter.post('/', createValidations, jwtAuthentication, createPost)
const deleteUpdateAuth = [jwtAuthentication, authorOrAdminAuth(Post)]
postRouter.delete('/:postId', deleteUpdateAuth, deletePost)
const updateValidations = [
    body('title').optional().trim().notEmpty().withMessage('Should not be empty.'),
    body('content').optional().trim().notEmpty().withMessage('Should not be empty.'),
    body('coverImage').optional().trim().isURL().withMessage('Should be URL.'),
    body('summary').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('category').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('tags').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('status').optional().trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('featured').optional().isBoolean().withMessage("Should be either 'true' or 'false'."),
]
postRouter.put('/:postId', [deleteUpdateAuth, updateValidations], updatePost)
postRouter.post('/like/:postId', jwtAuthentication, likePost)
postRouter.post('/unlike/:postId', jwtAuthentication, unlikePost)


// Require admin auth
// postRouter.post('/all', [jwtAuthentication, roleAuthorization(['Admin'])], async (req, res) => {
postRouter.post('/all', async (req, res) => {
    const data = req.body
    for (const i of data) {
        await User.findOneAndUpdate(
            { username: i.author.username },
            i.author,
            { upsert: true }
        )
        let user = await User.findOne({ username: i.author.username })
        let userId = user._id

        await Category.findOneAndUpdate(
            { name: i.category.name },
            i.category,
            { upsert: true }
        )
        let category = await Category.findOne({ name: i.category.name })
        let categoryId = category._id

        let tagIds = []
        for (let t of i.tags) {
            await Tag.findOneAndUpdate(
                { name: t.name },
                t,
                { upsert: true }
            )
            let tag = await Tag.findOne({ name: t.name })
            tagIds.push(tag._id)
        }
        const existingPost = await Post.findOne({ title: i.title })
        if (!existingPost) {
            const post = new Post({
                title: i.title,
                content: i.content,
                coverImage: i.coverImage,
                author: userId,
                category: categoryId,
                tags: tagIds,
                featured: i.featured,
                publishDate: new Date(i.publishDate),
            })
            await post.save()
            let user = await User.findOne({ username: i.author.username })
            user.posts = [...user.posts, post._id]
            await user.save()
        }
    }
    res.send('ok')
})


module.exports = postRouter