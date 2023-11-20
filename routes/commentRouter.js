const express = require('express')
const { findAllCommentsOfPost, findCommentById, createComment, deleteComment, updateComment, likeComment, unlikeComment } = require('../controllers/commentController')
const jwtAuthentication = require('../middlewares/jwtAuthentication')
const authorOrAdminAuth = require('../middlewares/authorOrAdminAuth')
const Comment = require('../models/Comment')
const { cacheMiddleware } = require('../config/cacheConfig')
const { body } = require('express-validator')
const commentRouter = express.Router()


// Auth not required
commentRouter.get('/all/:postId', cacheMiddleware, findAllCommentsOfPost)
// commentRouter.get('/all/:postId', findAllCommentsOfPost)
commentRouter.get('/:commentId', cacheMiddleware, findCommentById)

// Require auth
const createUpdateValidation = [
    body('content').trim().notEmpty().withMessage('Should not be empty.').escape(),
    body('postId').trim().notEmpty().withMessage('Should not be empty.'),
    body('parentCommentId').optional().trim().notEmpty().withMessage('Should not be empty.'),
]
commentRouter.post('/', [jwtAuthentication, createUpdateValidation], createComment)
commentRouter.delete('/:commentId', [jwtAuthentication, authorOrAdminAuth(Comment)], deleteComment)
commentRouter.put('/:commentId', [jwtAuthentication, authorOrAdminAuth(Comment), createUpdateValidation], updateComment)
commentRouter.post('/like/:commentId', jwtAuthentication, likeComment)
commentRouter.post('/unlike/:commentId', jwtAuthentication, unlikeComment)

module.exports = commentRouter