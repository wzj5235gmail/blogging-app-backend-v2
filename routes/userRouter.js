const express = require('express')
const jwtAuthentication = require('../middlewares/jwtAuthentication')
const {
  register,
  login,
  changePassword,
  update,
  findUserById,
  findAllUsers,
  updateRole,
  findFeaturedUsers,
  updateListFields
} = require('../controllers/userController')
const roleAuthorization = require('../middlewares/roleAuthorization')
const { cacheMiddleware } = require('../config/cacheConfig')
const { body } = require('express-validator')
const User = require('../models/User')


const userRouter = express.Router()

// Auth not required
// userRouter.get('/:userId', cacheMiddleware, findUserById)
// userRouter.get('/all/featured', cacheMiddleware, findFeaturedUsers)
userRouter.get('/:userId', findUserById)
userRouter.get('/all/featured', findFeaturedUsers)
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 255 }).withMessage('Should be 3-255 characters long.').escape(),
  body('password').trim().isStrongPassword().withMessage('Should be at least 8 characters and contain lowercase letter, uppercase letter, number and special character.'),
  body('email').trim().isEmail().withMessage('Should be 3-255 characters long.'),
  body('name').trim().isLength({ min: 3, max: 255 }).withMessage('Should be 3-255 characters long.').escape(),
]
userRouter.post('/register', registerValidation, register)
userRouter.post('/login', login)

// Require auth
userRouter.put('/change-password', [jwtAuthentication, body('password').trim().notEmpty().isStrongPassword()], changePassword)
const updateValidation = [
  body('name').optional().trim().isLength({ min: 3, max: 255 }).withMessage('Should be 3-255 characters long.').escape(),
  body('avatar').optional().trim().isURL().withMessage('Should be URL.'),
  body('bio').optional().trim().isLength({ min: 3, max: 255 }).withMessage('Should be 3-255 characters long.').escape(),
  body('phone').optional().trim().notEmpty().withMessage('Should not be empty.'),
]
userRouter.put('/update-info', [jwtAuthentication, updateValidation], update)
const updateListFieldsValidation = [
  body('fieldName').trim().isIn(['interests', 'follows', 'savedPosts', 'likes', 'posts', 'likedComments']).withMessage("Should be one of: 'interests', 'follows', 'savedPosts', 'likes', 'posts', 'likedComments'"),
  body('operationType').trim().isIn(['add', 'remove']).withMessage("Should be either 'add' or 'remove'."),
  body('itemIds').isArray().withMessage('Should be an array.'),
]
userRouter.put('/update-list-fields', [jwtAuthentication, updateListFieldsValidation], updateListFields)


// Require admin auth
userRouter.get('/', [jwtAuthentication, roleAuthorization(['Admin', 'Staff']), cacheMiddleware], findAllUsers)
userRouter.put('/:role/:userId', [jwtAuthentication, roleAuthorization(['Admin'])], updateRole)
userRouter.post('/registerAll', [jwtAuthentication, roleAuthorization(['Admin'])], async (req, res) => {
  const data = req.body
  data.forEach(async i => {
    const user = new User(i)
    await user.save()
  })
  res.send('ok')
})

module.exports = userRouter

