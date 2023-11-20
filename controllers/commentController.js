const expressAsyncHandler = require("express-async-handler")
const Comment = require("../models/Comment")
const handleResponse = require("../helpers/handleResponse")
const statusCodes = require("../constants")
const Post = require("../models/Post")
const getObjectOr404 = require("../helpers/getObjectOr404")
const getFilteredQuery = require("../helpers/getFilteredQuery")
const paginate = require('express-paginate')
const { validationResult, matchedData } = require("express-validator")
const getSortParam = require('../helpers/getSortParam')
const User = require("../models/User")



const findCommentById = expressAsyncHandler(async (req, res) => {
  const { commentId } = req.params
  const comment = await getObjectOr404(res, Comment, { _id: commentId })
  handleResponse(res, statusCodes.SUCCESS, 'Comment found.', comment)
})

const findAllCommentsOfPost = expressAsyncHandler(async (req, res) => {
  // const { postId } = req.params
  // const query = { post: postId }
  const query = getFilteredQuery(req, res, 'Comment')
  const sortParam = getSortParam(req, '-createdAt')
  const populateFields = [
    { path: 'author', select: 'name avatar' },
  ]
  const [results, itemCount] = await Promise.all([
    Comment.find(query).populate(populateFields).sort(sortParam).limit(req.query.limit).skip(req.skip).lean().exec(),
    Comment.count(query)
  ])
  const pageCount = Math.ceil(itemCount / req.query.limit)
  handleResponse(res, statusCodes.SUCCESS, 'Items found.', {
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    item_count: results.length,
    data: results
  })
})

const createComment = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    res.status(statusCodes.BAD_REQUEST)
    let errorMsg = ''
    result.array().forEach(i => {
      errorMsg += `{field: ${i.path}, message: ${i.msg}} | `
    })
    throw new Error(errorMsg)
  }
  const { postId, content, parentCommentId } = matchedData(req)
  const userId = req.user.userId
  const post = await getObjectOr404(res, Post, { _id: postId })
  const newComment = new Comment({
    post: postId, author: userId, content, parentCommentId
  })
  await newComment.save()

  // Increase post comment count
  post.comments++
  await post.save()

  handleResponse(res, statusCodes.SUCCESS, 'Comment created.', newComment)
})

const deleteComment = expressAsyncHandler(async (req, res) => {
  const { commentId } = req.params
  const comment = await getObjectOr404(res, Comment, { _id: commentId })

  // If has child comment, delete together
  await Comment.deleteMany({ parentCommentId: comment._id })
  await comment.deleteOne()

  // Decrease post comment count
  const post = await getObjectOr404(res, Post, { _id: comment.post })
  post.comments = Math.max(0, post.comments - 1)
  await post.save()

  handleResponse(res, statusCodes.SUCCESS, 'Comment deleted.')
})


const updateComment = expressAsyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { content } = req.body
  const comment = await getObjectOr404(res, Comment, { _id: commentId })
  comment.content = content || comment.content
  await comment.save()
  handleResponse(res, statusCodes.SUCCESS, 'Comment updated.', comment)
})

const likeComment = expressAsyncHandler(async (req, res) => {
  changeLikeCount(req, res, 'increment')
})

const unlikeComment = expressAsyncHandler(async (req, res) => {
  changeLikeCount(req, res, 'decrement')
})



// Helper functions

const changeLikeCount = expressAsyncHandler(async (req, res, operation) => {
  const { commentId } = req.params
  const comment = await getObjectOr404(res, Comment, { _id: commentId })
  if (operation === 'increment') {
    comment.likes++
  } else {
    comment.likes = Math.max(0, comment.likes - 1)
  }
  await comment.save()
  handleResponse(res, statusCodes.SUCCESS, `Likes changed.`, {
    commentId: comment._id,
    likes: comment.likes
  })
})

module.exports = {
  findCommentById,
  findAllCommentsOfPost,
  createComment,
  deleteComment,
  updateComment,
  likeComment,
  unlikeComment,
}