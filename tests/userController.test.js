const mongoose = require('mongoose')
const User = require('../models/User')
const request = require('supertest')
const { app,server } = require('../server')
const bcrypt = require('bcrypt')
// const { redis } = require('../config/cacheConfig')
const generateToken = require('../helpers/generateToken')

let adminToken
let guestToken

beforeAll(async () => {

    await mongoose.connection.close()
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/blog-test')
    const testUsers = [
        {
            username: 'admin',
            password: await bcrypt.hash('AdminPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
            email: 'admin@example.com',
            name: 'Admin',
            role: 'Admin',
        },
        {
            username: 'user1',
            password: await bcrypt.hash('User1Password123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
            email: 'user1@example.com',
            name: 'User 1',
            role: 'Guest',
        },
        {
            username: 'user2',
            password: await bcrypt.hash('User2Password123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
            email: 'user2@example.com',
            name: 'User 2',
            role: 'Guest',
        },
        {
            username: 'user3',
            password: await bcrypt.hash('User3Password123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
            email: 'user3@example.com',
            name: 'User 3',
            role: 'Guest',
        },
        {
            username: 'user4',
            password: await bcrypt.hash('User4Password123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
            email: 'user4@example.com',
            name: 'User 4',
            role: 'Guest',
        },
        {
            username: 'user5',
            password: await bcrypt.hash('User5Password123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
            email: 'user5@example.com',
            name: 'User 5',
            role: 'Guest',
        },
    ]
    testUsers.forEach(async i => {
        let newUser = new User(i)
        await newUser.save()
    })
    let payload = {
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin',
    }
    adminToken = await generateToken(payload)
    payload = {
        username: 'user1',
        email: 'user1@example.com',
        role: 'Guest',
    }
    guestToken = await generateToken(payload)
})

afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
    // await redis.quit()
    await server.close()
})

describe('User Controller Tests', () => {

    describe('GET /api/users', () => {
        it('Should get all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(200)
            expect(response.body.data.data).toBeInstanceOf(Array)
        })

        it('Should get all users with pagination', async () => {
            const response = await request(app)
                .get('/api/users?page=2')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(200)
            expect(response.body.data.data).toBeInstanceOf(Array)
        })

        it('Should get users matching search query', async () => {
            const response = await request(app)
                .get('/api/users?search=testuser')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(200)
            expect(response.body.data.data).toBeInstanceOf(Array)
        })

        it('Should get users ordered by username descending', async () => {
            const response = await request(app)
                .get('/api/users?order=-username')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(200)
            expect(response.body.data.data).toBeInstanceOf(Array)
        })

        it('Should return with status code 403 for guest user', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${guestToken}`)
            expect(response.status).toBe(403)
            expect(response.body.message).toBe('You are not allowed to access this endpoint.')
        })
    })

    describe('GET /api/user/:userId', () => {
        it('Should get a single user', async () => {
            const user = new User({
                username: 'testuser',
                password: 'testpassword',
                email: 'test@example.com',
                name: 'Test User',
            })
            await user.save()
            const response = await request(app)
                .get(`/api/users/${user._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(200)
            expect(response.body.data._id).toBe(user._id.toString())
            await user.deleteOne()
        })

        it('Should return with status code 404', async () => {
            const response = await request(app)
                .get('/api/users/123456789012345678901234')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Not found.')
        })

        it('Should return with status code 400', async () => {
            const response = await request(app)
                .get('/api/users/invalidId')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Id invalid.')
        })
    })

    describe('POST /api/users/register', () => {
        it('Should register a new user', async () => {
            const userData = {
                username: 'newuser',
                password: await bcrypt.hash('NewUserPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
                email: 'newuser@example.com',
                name: 'New User',
            }
            const response = await request(app)
                .post('/api/users/register')
                .send(userData)
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('User registered.')
        })

        it('Should return validation error for invalid data', async () => {
            const userData = {
                username: 'newuser',
                password: await bcrypt.hash('NewUserPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
                // Missing email
            }
            const response = await request(app)
                .post('/api/users/register')
                .send(userData)
            expect(response.status).toBe(400)
        })

        it('Should return forbidden error for existing username', async () => {
            const existingUser = new User({
                username: 'existinguser',
                password: await bcrypt.hash('ExistingUserPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
                email: 'existing@example.com',
                name: 'Existing User',
            })
            await existingUser.save()

            const userData = {
                username: 'existinguser',
                password: await bcrypt.hash('NewUserPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
                email: 'newuser@example.com',
                name: 'New User',
            }
            const response = await request(app)
                .post('/api/users/register')
                .send(userData)
            expect(response.status).toBe(403)
            expect(response.body.message).toBe('User already exists.')
        })
    })

    describe('POST /api/users/login', () => {
        let user

        beforeAll(async () => {
            user = new User({
                username: 'loginuser',
                password: await bcrypt.hash('loginpassword', Number.parseInt(process.env.SALT_ROUNDS) || 10),
                email: 'login@example.com',
                name: 'Login User',
            })
            await user.save()
        })

        it('Should log in with correct credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    usernameOrEmail: 'loginuser',
                    password: 'loginpassword',
                })
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('Login successful.')
        })

        it('Should return forbidden error for incorrect password', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    usernameOrEmail: 'loginuser',
                    password: 'incorrectpassword',
                })
            expect(response.status).toBe(403)
            expect(response.body.message).toBe('Username or password incorrect.')
        })

        it('Should return not found error for non-existent user', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    usernameOrEmail: 'nonexistentuser',
                    password: 'password',
                })
            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Not found.')
        })
    })

    describe('POST /api/users/change-password', () => {
        let user
        let changepassworduserToken

        beforeAll(async () => {
            user = new User({
                username: 'changepassworduser',
                password: await bcrypt.hash('OldPassword123!', Number.parseInt(process.env.SALT_ROUNDS) || 10),
                email: 'changepassword@example.com',
                name: 'Change Password User',
            })
            await user.save()
            const payload = {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            }
            changepassworduserToken = await generateToken(payload)
        })

        it('Should change user password', async () => {
            const response = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${changepassworduserToken}`)
                .send({
                    oldPassword: 'OldPassword123!',
                    newPassword: 'NewPassword123!',
                })
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('Password changed.')
        })

        it('Should return unauthorized error for incorrect old password', async () => {
            const response = await request(app)
                .put('/api/users/change-password')
                .set('Authorization', `Bearer ${changepassworduserToken}`)
                .send({
                    oldPassword: 'IncorrectPassword123!',
                    newPassword: 'NewPassword123!',
                })
            expect(response.status).toBe(401)
            expect(response.body.message).toBe('Password incorrect.')
        })
    })

    describe('POST /api/users/update-info', () => {
        let updateinfouserToken

        beforeAll(async () => {
            let user = new User({
                username: 'updateinfouser',
                password: await bcrypt.hash('password', 10),
                email: 'updateinfo@example.com',
                name: 'Update Info User',
            })
            await user.save()
            const payload = {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            }
            updateinfouserToken = await generateToken(payload)
        })

        it('Should update user info', async () => {
            const response = await request(app)
                .put('/api/users/update-info')
                .set('Authorization', `Bearer ${updateinfouserToken}`)
                .send({
                    name: 'Updated Name',
                    avatar: 'http://example.com/updated_avatar.jpg',
                    bio: 'Updated Bio',
                    phone: '1234567890',
                })
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('User info updated.')
            expect(response.body.data.name).toBe('Updated Name')
            expect(response.body.data.avatar).toBe('http://example.com/updated_avatar.jpg')
            expect(response.body.data.bio).toBe('Updated Bio')
            expect(response.body.data.phone).toBe('1234567890')
        })

        it('Should return validation error for invalid data', async () => {
            const response = await request(app)
                .put('/api/users/update-info')
                .set('Authorization', `Bearer ${updateinfouserToken}`)
                .send({
                    name: '', // Empty name is invalid
                })
            expect(response.status).toBe(400)
        })
    })

    describe('PUT /api/users/:role/:userId', () => {
        let adminUser
        let adminToken

        beforeAll(async () => {
            adminUser = new User({
                username: 'adminuser',
                password: await bcrypt.hash('password', 10),
                email: 'admin@example2.com',
                name: 'Admin User',
                role: 'Admin',
            })
            await adminUser.save()
            const payload = {
                userId: adminUser._id,
                email: adminUser.email,
                username: adminUser.username,
                role: adminUser.role,
            }
            adminToken = await generateToken(payload)
        })

        it('Should update user role for Admin user', async () => {
            const userToUpdate = new User({
                username: 'usertoupdate',
                password: await bcrypt.hash('password', 10),
                email: 'usertoupdate@example.com',
                name: 'User To Update',
                role: 'Guest',
            })
            await userToUpdate.save()

            const response = await request(app)
                .put(`/api/users/Admin/${userToUpdate._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('User role updated.')
            expect(response.body.data.role).toBe('Admin')
        })

        it('Should return bad request error for invalid role', async () => {
            const userToUpdate = new User({
                username: 'usertoupdate2',
                password: await bcrypt.hash('password', 10),
                email: 'usertoupdate2@example.com',
                name: 'User To Update 2',
                role: 'Guest',
            })
            await userToUpdate.save()

            const response = await request(app)
                .put(`/api/users/InvalidRole/${userToUpdate._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Invalid role.')
        })

        it('Should return forbidden error for non-admin user', async () => {
            const staffUser = new User({
                username: 'staffuser',
                password: await bcrypt.hash('password', 10),
                email: 'staff@example.com',
                name: 'Staff User',
                role: 'Staff',
            })
            await staffUser.save()
            const payload = {
                userId: staffUser._id,
                email: staffUser.email,
                username: staffUser.username,
                role: staffUser.role,
            }
            const staffUserToken = await generateToken(payload)
            const response = await request(app)
                .put(`/api/users/Admin/${staffUser._id}`)
                .set('Authorization', `Bearer ${staffUserToken}`)
            expect(response.status).toBe(403)
            expect(response.body.message).toBe('You are not allowed to access this endpoint.')
        })
    })
})