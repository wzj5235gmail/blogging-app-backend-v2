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
postRouter.post('/all', [jwtAuthentication, roleAuthorization(['Admin'])], async (req, res) => {
    const data = req.body
    data.forEach(async i => {
        const post = new Post(i)
        await post.save()
        const user = await User.findById(post.author)
        user.posts = [...user.posts, post._id]
        await user.save()
    })
    res.send('ok')
})


module.exports = postRouter