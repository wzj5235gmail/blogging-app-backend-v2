const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const paginate = require('express-paginate')
const expressAsyncHandler = require('express-async-handler')
const statusCodes = require("../constants")
const User = require("../models/User")
const handleResponse = require("../helpers/handleResponse")
const getObjectOr404 = require('../helpers/getObjectOr404')
const getFilteredQuery = require('../helpers/getFilteredQuery')
const { matchedData, validationResult } = require('express-validator')
const generateToken = require('../helpers/generateToken')


const findUserById = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params
  const populateFields = ['interests', 'likes', 'follows', 'posts', 'likedComments', 'savedPosts']
  const user = await getObjectOr404(res, User, { _id: userId }, populateFields)
  user.password = null
  handleResponse(res, statusCodes.SUCCESS, 'User info retrieved.', user)
})

const findAllUsers = expressAsyncHandler(async (req, res) => {
  const query = getFilteredQuery(req, res, 'User')
  const sortParam = getSortParam(req, 'username')
  const [results, itemCount] = await Promise.all([
    User.find(query).sort(sortParam).limit(req.query.limit).skip(req.skip).lean().exec(),
    User.count(query)
  ])
  const pageCount = Math.ceil(itemCount / req.query.limit)
  handleResponse(res, statusCodes.SUCCESS, 'Items found.', {
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    item_count: results.length,
    data: results
  })
})

const findFeaturedUsers = expressAsyncHandler(async (req, res) => {
  const query = { featured: true }
  const [results, itemCount] = await Promise.all([
    User.find(query).limit(req.query.limit).skip(req.skip).lean().exec(),
    User.count(query)
  ])
  const cleanedResults = results.map(i => { return { _id: i._id, name: i.name, avatar: i.avatar, bio: i.bio } })
  const pageCount = Math.ceil(itemCount / req.query.limit)
  handleResponse(res, statusCodes.SUCCESS, 'Items found.', {
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    item_count: results.length,
    data: cleanedResults
  })
})

const register = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    res.status(statusCodes.BAD_REQUEST)
    let errorMsg = ''
    result.array().forEach(i => {
      errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
    })
    throw new Error(errorMsg)
  }
  const { username, password, email, name } = matchedData(req)

  // Check if user already exists
  const user = await User.findOne({ username })
  if (user) {
    res.status(statusCodes.FORBIDDEN)
    throw new Error('User already exists.')
  }

  // Hash user password
  const hashedPassword = await bcrypt.hash(password, Number.parseInt(process.env.SALT_ROUNDS || 10))

  // Save to database
  const newUser = new User({
    username,
    password: hashedPassword,
    email,
    name
  })

  await newUser.save()

  // Respond
  handleResponse(res, statusCodes.SUCCESS, 'User registered.', {
    username: newUser.username,
    email: newUser.email,
    name: newUser.name
  })
})


const login = expressAsyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body

  // Check if username or email exists
  const populateFields = ['interests',
    'follows',
    'likedComments',
    { path: 'posts', populate: 'author tags' },
    { path: 'likes', populate: 'author tags' },
    { path: 'savedPosts', populate: 'author tags' },
  ]
  const user = await getObjectOr404(res, User, { $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] }, populateFields)

  // Verify password
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    handleResponse(res, statusCodes.FORBIDDEN, 'Username or password incorrect.')
    return
  }

  // Generate token
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role,
  }
  const token = await generateToken(payload)

  // Update last login time
  user.lastLogin = Date.now()
  await user.save()

  // Respond
  handleResponse(res, statusCodes.SUCCESS, 'Login successful.', {
    ...user._doc,
    password: null,
    token
  })
})

const changePassword = expressAsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user.userId)

  // Check old password
  const match = await bcrypt.compare(oldPassword, user.password)
  if (!match) {
    res.status(statusCodes.UNAUTHORIZED)
    throw new Error('Password incorrect.')
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, Number.parseInt(process.env.SALT_ROUNDS || 10))

  // Update password
  user.password = hashedPassword
  await user.save()

  // Respond
  handleResponse(res, statusCodes.SUCCESS, 'Password changed.')
})

const update = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    res.status(statusCodes.BAD_REQUEST)
    let errorMsg = ''
    result.array().forEach(i => {
      errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
    })
    throw new Error(errorMsg)
  }
  const { name, avatar, bio, phone } = matchedData(req)
  const user = await User.findById(req.user.userId)
  user.name = name ?? user.name
  user.avatar = avatar ?? user.avatar
  user.bio = bio ?? user.bio
  user.phone = phone ?? user.phone

  await user.save()

  // Respond
  handleResponse(res, statusCodes.SUCCESS, 'User info updated.', user)
})


const updateListFields = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    res.status(statusCodes.BAD_REQUEST)
    let errorMsg = ''
    result.array().forEach(i => {
      errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
    })
    throw new Error(errorMsg)
  }
  const { fieldName, operationType, itemIds } = matchedData(req)
  const populateFields = ['interests',
    'follows',
    'likedComments',
    { path: 'posts', populate: 'author tags' },
    { path: 'likes', populate: 'author tags' },
    { path: 'savedPosts', populate: 'author tags' },
  ]
  let user = await User.findById(req.user.userId)

  if (operationType === 'add') {
    user[fieldName] = user[fieldName].concat(itemIds)
    await user.save()
    user = await User.findById(req.user.userId).populate(populateFields)
    handleResponse(res, statusCodes.SUCCESS, `New ${fieldName} added.`, { ...user._doc, password: null })
  } else if (operationType === 'remove') {
    user[fieldName] = user[fieldName].filter(item => !itemIds.includes(item.toString()))
    await user.save()
    user = await User.findById(req.user.userId).populate(populateFields)
    handleResponse(res, statusCodes.SUCCESS, `${fieldName} removed.`, { ...user._doc, password: null })
  } else {
    handleResponse(res, statusCodes.BAD_REQUEST, `Unknown operation type: ${operationType}.`, { ...user._doc, password: null })
  }
})

const updateRole = expressAsyncHandler(async (req, res) => {
  const { role, userId } = req.params
  const validRoles = ['Admin', 'Staff', 'Guest']
  if (!validRoles.includes(role)) {
    res.status(statusCodes.BAD_REQUEST)
    throw new Error('Invalid role.')
  }
  const user = await getObjectOr404(res, User, { _id: userId })
  user.role = role
  await user.save()
  handleResponse(res, statusCodes.SUCCESS, 'User role updated.', user)
})

const getUserPosts = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params
  const user = await getObjectOr404(res, User, { _id: userId }, 'posts')
  handleResponse(res, statusCodes.SUCCESS, 'User posts retrieved.', user.posts)
})

module.exports = {
  register,
  login,
  changePassword,
  update,
  updateListFields,
  findUserById,
  findAllUsers,
  updateRole,
  findFeaturedUsers,
  getUserPosts,
}