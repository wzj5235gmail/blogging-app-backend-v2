const mongoose = require('mongoose')
const request = require('supertest')
const { app, server } = require('../server')
const Post = require('../models/Post')
const { redis } = require('../config/cacheConfig')
const generateToken = require('../helpers/generateToken')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const statusCodes = require('../constants')

let adminToken
let user

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

})

afterAll(async () => {
    await Post.deleteMany({})
    await User.deleteMany({})
    await mongoose.connection.close()
    await redis.quit()
    await server.close()
})

describe('Post Controller Tests', () => {
    describe('GET /api/posts/:postId', () => {
        it('Should find a post by ID', async () => {
            const post = new Post({
                title: 'Test Post',
                content: 'This is a test post content.',
                author: user._id,
            })
            await post.save()

            const response = await request(app)
                .get(`/api/posts/${post._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body.message).toBe('Post found.')
            expect(response.body.data.title).toBe('Test Post')
            await Post.deleteOne({_id: post._id})
        })

        it('Should return a 404 error for non-existent post', async () => {
            const response = await request(app)
                .get('/api/posts/123456789012345678901234')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Not found.')
        })
    })

    describe('GET /api/posts', () => {
        it('Should find all posts', async () => {
            const post1 = new Post({
                title: 'Post 1',
                content: 'This is post 1 content.',
                author: user._id,
            })
            await post1.save()

            const post2 = new Post({
                title: 'Post 2',
                content: 'This is post 2 content.',
                author: user._id,
            })
            await post2.save()

            const response = await request(app)
                .get('/api/posts')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Items found.')
            expect(response.body.data.object).toBe('list')
            expect(response.body.data.has_more).toBe(false)
            expect(response.body.data.item_count).toBe(2)
            expect(response.body.data.data.length).toBe(2)
        })
    })

    describe('POST /api/posts', () => {
        it('Should create a new post', async () => {
            const newPostData = {
                title: 'New Test Post',
                content: 'This is a new test post content.',
                author: user._id,
            }

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newPostData)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Post created.')
        })

        it('Should return a validation error for invalid data', async () => {
            const invalidPostData = {
                // Invalid post data with missing required fields
            }

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidPostData)

            expect(response.status).toBe(statusCodes.BAD_REQUEST)
        })
    })

    describe('PUT /api/posts/:postId', () => {
        it('Should update a post', async () => {
            const existingPost = new Post({
                title: 'Existing Post',
                content: 'This is an existing post content.',
                author: user._id,
            })
            await existingPost.save()

            const updatedPostData = {
                title: 'Updated Post',
                content: 'This is an updated post content.',
            }

            const response = await request(app)
                .put(`/api/posts/${existingPost._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedPostData)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Post updated.')
        })

        it('Should return a validation error for invalid data', async () => {
            const existingPost = new Post({
                title: 'Existing Post',
                content: 'This is an existing post content.',
                author: user._id,
            })
            await existingPost.save()

            const invalidPostData = {
                title: ''
            }

            const response = await request(app)
                .put(`/api/posts/${existingPost._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidPostData)
            expect(response.status).toBe(statusCodes.BAD_REQUEST)
        })

        it('Should return 404 for a non-existent post', async () => {
            const response = await request(app)
                .put('/api/posts/123456789012345678901234')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })
    })

    describe('DELETE /api/posts/:postId', () => {
        it('Should delete a post', async () => {
            const existingPost = new Post({
                title: 'Post to be deleted',
                content: 'This is a post to be deleted.',
                author: user._id,
            })
            await existingPost.save()

            const response = await request(app)
                .delete(`/api/posts/${existingPost._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Post deleted.')
        })

        it('Should return 404 for a non-existent post', async () => {
            const response = await request(app)
                .delete('/api/posts/123456789012345678901234')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })
    })


    describe('POST /api/posts/like/:postId', () => {
        it('Should increment the likes count for a post', async () => {
            const existingPost = new Post({
                title: 'Post to be liked',
                content: 'This is a post to be liked.',
                author: user._id,
            })
            await existingPost.save()

            const response = await request(app)
                .post(`/api/posts/like/${existingPost._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Likes changed successfully.')
            expect(response.body.data.likes).toBe(existingPost.likes + 1)
        })

        it('Should return 404 for a non-existent post', async () => {
            const response = await request(app)
                .post('/api/posts/like/123456789012345678901234')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })
    })

    describe('POST /api/posts/unlike/:postId', () => {
        it('Should decrement the likes count for a post', async () => {
            const existingPost = new Post({
                title: 'Post to be unliked',
                content: 'This is a post to be unliked.',
                author: user._id,
                likes: 1,
            })
            await existingPost.save()

            const response = await request(app)
                .post(`/api/posts/unlike/${existingPost._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Likes changed successfully.')
            expect(response.body.data.likes).toBe(existingPost.likes - 1)
        })

        it('Should return 404 for a non-existent post', async () => {
            const response = await request(app)
                .post('/api/posts/unlike/123456789012345678901234')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })
    })

})

