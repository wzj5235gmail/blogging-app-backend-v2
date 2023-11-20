const mongoose = require('mongoose')
const request = require('supertest')
const { app, server } = require('../server')
const Post = require('../models/Post')
const { redis } = require('../config/cacheConfig')
const generateToken = require('../helpers/generateToken')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const statusCodes = require('../constants')
const Comment = require('../models/Comment')

let adminToken
let user
let post
let comment

beforeAll(async () => {

    await mongoose.connection.close()
    await mongoose.connect(
        process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/blog-test'
    )

    const userData = {
        username: 'admin',
        password: await bcrypt.hash('AdminPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
        email: 'admin@example.com',
        name: 'Admin',
        role: 'Admin',
    }

    user = new User(userData)
    await user.save()

    const adminPayload = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    }
    adminToken = await generateToken(adminPayload)

    post = new Post({
        title: 'Test Post',
        content: 'This is a test post content.',
        author: user._id,
    })
    await post.save()

    comment = new Comment({
        post: post._id,
        author: user._id,
        content: 'This is a test comment.',
    })
    await comment.save()

    comment = new Comment({
        post: post._id,
        author: user._id,
        content: 'This is another test comment.',
    })
    await comment.save()

})

afterAll(async () => {
    await Post.deleteMany({})
    await User.deleteMany({})
    await Comment.deleteMany({})
    await mongoose.connection.close()
    await redis.quit()
    await server.close()
})

describe('Comment Controller Tests', () => {
    describe('GET /api/comments/:commentId', () => {
        it('Should retrieve a comment by ID', async () => {
            const response = await request(app)
                .get(`/api/comments/${comment._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Comment found.')
        })

        it('Should return a 404 error for a non-existent comment', async () => {
            const nonExistentCommentId = '123456789012345678901234'

            const response = await request(app)
                .get(`/api/comments/${nonExistentCommentId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })
    })

    describe('GET /api/comments/all/:postId', () => {
        it('Should retrieve all comments of a post', async () => {
            const response = await request(app)
                .get(`/api/comments/all/${post._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Items found.')
            expect(response.body.data.data).toBeInstanceOf(Array)
            expect(response.body.data.data.length).toBe(2)
        })

    })

    describe('POST /api/comments', () => {
        it('Should create a new comment', async () => {
            const newCommentData = {
                postId: post._id,
                content: 'This is a new test comment content.',
            }
            const response = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newCommentData)
            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Comment created.')
            expect(response.body.data.post).toBe(post._id.toString())
            expect(response.body.data.content).toBe('This is a new test comment content.')
        })

        it('Should return a validation error for invalid comment data', async () => {
            const invalidCommentData = {
                // Invalid comment data with missing data
            }

            const response = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidCommentData)

            expect(response.status).toBe(statusCodes.BAD_REQUEST)
        })
    })

    describe('DELETE /api/comments/:commentId', () => {
        it('Should delete a comment and decrease post comment count', async () => {
            const commentToBeDeleted = new Comment({
                post: post._id,
                author: user._id,
                content: 'This is a comment to be deleted.',
            })
            await commentToBeDeleted.save()
            const response = await request(app)
                .delete(`/api/comments/${commentToBeDeleted._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Comment deleted.')

            const deletedComment = await Comment.findById(commentToBeDeleted._id)
            expect(deletedComment).toBeNull()

            const updatedPost = await Post.findById(post._id)
            expect(updatedPost.comments).toBe(Math.max(0, post.comments - 1))
        })

        it('Should return a 404 error for a non-existent comment', async () => {
            const nonExistentCommentId = '123456789012345678901234'

            const response = await request(app)
                .delete(`/api/comments/${nonExistentCommentId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })

    })

    describe('PUT /api/comments/:commentId', () => {
        it('Should update a comment', async () => {
            const updatedContent = 'Updated test comment content.'
            const response = await request(app)
                .put(`/api/comments/${comment._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ content: updatedContent })

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Comment updated.')

            const updatedComment = await Comment.findById(comment._id)
            expect(updatedComment.content).toBe(updatedContent)
        })

        it('Should return a 404 error for a non-existent comment', async () => {
            const nonExistentCommentId = '123456789012345678901234'

            const response = await request(app)
                .put(`/api/comments/${nonExistentCommentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ content: 'Updated content' })

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })

    })

    describe('POST /api/comments/like/:commentId', () => {
        it('Should increment likes for a comment', async () => {
            const response = await request(app)
                .post(`/api/comments/like/${comment._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Likes changed.')

            const updatedComment = await Comment.findById(comment._id)
            expect(updatedComment.likes).toBe(comment.likes + 1)
        })

    })

    describe('POST /api/comments/unlike/:commentId', () => {
        it('Should decrement likes for a comment', async () => {
            comment.likes = 1
            await comment.save()

            const response = await request(app)
                .post(`/api/comments/unlike/${comment._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Likes changed.')

            const updatedComment = await Comment.findById(comment._id)
            expect(updatedComment.likes).toBe(0)
        })

    })

})