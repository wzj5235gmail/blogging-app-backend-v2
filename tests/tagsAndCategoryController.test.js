const mongoose = require('mongoose')
const request = require('supertest')
const { app, server } = require('../server')
const Post = require('../models/Post')
const { redis } = require('../config/cacheConfig')
const generateToken = require('../helpers/generateToken')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const statusCodes = require('../constants')
const Tag = require('../models/Tag')
const Category = require('../models/Category')

let adminToken
let user
let post
let tag

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

    tag = new Tag({ name: 'Test Tag 1' })
    await tag.save()
    tag = new Tag({ name: 'Test Tag 2' })
    await tag.save()

})

afterAll(async () => {
    await Post.deleteMany({})
    await User.deleteMany({})
    await Tag.deleteMany({})
    await Category.deleteMany({})
    await mongoose.connection.close()
    await redis.quit()
    await server.close()
})

describe('Tag and Category Controller Tests', () => {

    describe('GET /api/tags/:tagId', () => {
        it('Should return a tag by ID', async () => {
            const response = await request(app)
                .get(`/api/tags/${tag._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Item found.')
            expect(response.body.data.name).toBe('Test Tag 2')
        })

        it('Should return a 404 error for a non-existent tag ID', async () => {
            const nonExistentTagId = '123456789012345678901234'

            const response = await request(app)
                .get(`/api/tags/${nonExistentTagId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })

    })

    describe('GET /api/tags', () => {
        it('Should return a list of tags', async () => {
            const response = await request(app)
                .get('/api/tags')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Items found.')
            expect(response.body.data).toBeInstanceOf(Object)
            expect(response.body.data.data).toHaveLength(2)
        })

    })

    describe('POST /api/tags', () => {
        it('Should create a new tag', async () => {
            const tagName = 'Test Tag 3'
            const response = await request(app)
                .post('/api/tags')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: tagName })

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Item created.')

            const createdTag = await Tag.findOne({ name: tagName })
            expect(createdTag).not.toBeNull()
            expect(createdTag.name).toBe(tagName)
        })

        it('Should return a 400 error for an existing tag name', async () => {
            const response = await request(app)
                .post('/api/tags')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Test Tag 1' })

            expect(response.status).toBe(statusCodes.BAD_REQUEST)
            expect(response.body.message).toBe('Item already exists.')
        })

    })

    describe('DELETE /api/tags/:tagId', () => {
        it('Should delete a tag', async () => {
            const createdTag = await Tag.create({ name: 'Test Tag to be deleted' })

            const response = await request(app)
                .delete(`/api/tags/${createdTag._id}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Item deleted.')

            const deletedTag = await Tag.findById(createdTag._id)
            expect(deletedTag).toBeNull()
        })

        it('Should return a 404 error for a non-existent tag', async () => {
            const nonExistentTagId = '123456789012345678901234'

            const response = await request(app)
                .delete(`/api/tags/${nonExistentTagId}`)
                .set('Authorization', `Bearer ${adminToken}`)

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })

    })

    describe('PUT /api/tags/:tagId', () => {
        it('Should update the name of a tag', async () => {
            const updatedTagName = 'Updated Test Tag'

            const response = await request(app)
                .put(`/api/tags/${tag._id.toString()}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ newName: updatedTagName })

            expect(response.status).toBe(statusCodes.SUCCESS)
            expect(response.body.message).toBe('Item name updated.')

            const updatedTag = await Tag.findById(tag._id)
            expect(updatedTag.name).toBe(updatedTagName)
        })

        it('Should return a 404 error for updating a non-existent tag', async () => {
            const nonExistentTagId = '123456789012345678901234'
            const updatedTagName = 'Updated Test Tag'

            const response = await request(app)
                .put(`/api/tags/${nonExistentTagId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ newName: updatedTagName })

            expect(response.status).toBe(statusCodes.NOT_FOUND)
            expect(response.body.message).toBe('Not found.')
        })

    })
})
