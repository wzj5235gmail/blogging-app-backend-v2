const expressAsyncHandler = require('express-async-handler')
const paginate = require('express-paginate')
const statusCodes = require("../constants")
const Post = require("../models/Post")
const Category = require('../models/Category')
const Tag = require('../models/Tag')
const handleResponse = require("../helpers/handleResponse")
const getObjectOr404 = require('../helpers/getObjectOr404')
const getFilteredQuery = require('../helpers/getFilteredQuery')
const getSortParam = require('../helpers/getSortParam')
const { validationResult, matchedData } = require('express-validator')
const User = require('../models/User')


const findPostById = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params
  const populateFields = [
    { path: 'author', select: 'username name avatar bio likes savedPosts' },
    { path: 'tags', select: 'name' },
    { path: 'category', select: 'name' },
  ]
  const post = await getObjectOr404(res, Post, { _id: postId }, populateFields)
  post.views++
  await post.save()
  handleResponse(res, statusCodes.SUCCESS, 'Post found.', post)
})

const findAllPosts = expressAsyncHandler(async (req, res) => {
  const query = getFilteredQuery(req, res, 'Post')
  const sortParam = getSortParam(req, '-publishDate')
  const populateFields = [
    { path: 'author', select: 'username name avatar bio likes savedPosts' },
    { path: 'tags', select: 'name' },
    { path: 'category', select: 'name' },
  ]
  const [results, itemCount] = await Promise.all([
    Post.find(query).populate(populateFields).sort(sortParam).limit(req.query.limit).skip(req.skip).lean().exec(),
    Post.count(query)
  ])
  const pageCount = Math.ceil(itemCount / req.query.limit)
  handleResponse(res, statusCodes.SUCCESS, 'Items found.', {
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    item_count: results.length,
    pageCount,
    data: results,
  })
})

const createPost = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    res.status(statusCodes.BAD_REQUEST)
    let errorMsg = ''
    result.array().forEach(i => {
      errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
    })
    throw new Error(errorMsg)
  }
  const { title, content, tags, category, status, coverImage, summary } = matchedData(req)
  const authorId = req.user.userId

  // Increment post count of category and tags
  changePostCount(res, category, tags, 'increment')
  const post = new Post({ title, content, author: authorId, category, tags, status, coverImage, summary })
  await post.save()
  const user = await User.findById(authorId)
  user.posts = [...user.posts, post._id]
  await user.save()
  handleResponse(res, statusCodes.SUCCESS, 'Post created.', post)
})

const deletePost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params

  const post = await getObjectOr404(res, Post, { _id: postId })
  changePostCount(res, post.category, post.tags, 'decrement')
  const user = await User.findById(post.author.toString())
  user.posts = user.posts.filter(i => i._id !== post._id)
  await user.save()
  await post.deleteOne()
  handleResponse(res, statusCodes.SUCCESS, 'Post deleted.')
})

const updatePost = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    res.status(statusCodes.BAD_REQUEST)
    let errorMsg = ''
    result.array().forEach(i => {
      errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
    })
    throw new Error(errorMsg)
  }
  const { title, content, tagIds, categoryId, status, coverImage, summary, featured } = matchedData(req)
  const { postId } = req.params

  const post = await getObjectOr404(res, Post, { _id: postId })

  post.title = title ?? post.title
  post.content = content ?? post.content
  post.tagIds = tagIds ?? post.tags
  post.category = categoryId ?? post.category
  post.status = status ?? post.status
  post.coverImage = coverImage ?? post.coverImage
  post.summary = summary ?? post.summary
  post.featured = featured ?? post.featured
  post.lastUpdateDate = Date.now()
  await post.save()
  handleResponse(res, statusCodes.SUCCESS, 'Post updated.', post)
})

const likePost = expressAsyncHandler(async (req, res) => {
  await changeLikeCount(req, res, 'increment')
})

const unlikePost = expressAsyncHandler(async (req, res) => {
  await changeLikeCount(req, res, 'decrement')
})


// Helper funcitons

const changePostCount = expressAsyncHandler(async (res, categoryId, tagIds, operation) => {
  if (categoryId) {
    const category = await getObjectOr404(res, Category, { _id: categoryId })
    if (operation === 'increment') {
      category.postCount++
    } else {
      category.postCount = Math.max(category.postCount - 1, 0)
    }
    await category.save()
  }
  if (tagIds) {
    tagIds.forEach(expressAsyncHandler(async (tagId) => {
      let tag = await getObjectOr404(res, Tag, { _id: tagId })
      if (operation === 'increment') {
        tag.postCount++
      } else {
        tag.postCount = Math.max(tag.postCount - 1, 0)
      }
      await tag.save()
    }))
  }
})

const changeLikeCount = expressAsyncHandler(async (req, res, operation) => {
  const { postId } = req.params

  const post = await getObjectOr404(res, Post, { _id: postId })

  if (operation === 'increment') {
    post.likes++
  } else {
    post.likes = Math.max(0, post.likes - 1)
  }
  await post.save()
  handleResponse(res, statusCodes.SUCCESS, `Likes changed successfully.`, {
    postId: post._id,
    likes: post.likes
  })
})


module.exports = {
  findPostById,
  findAllPosts,
  createPost,
  deletePost,
  updatePost,
  likePost,
  unlikePost,
}