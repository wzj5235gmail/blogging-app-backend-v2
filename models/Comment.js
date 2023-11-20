const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
  post: { type: mongoose.ObjectId, ref: 'Post' },
  author: { type: mongoose.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  parentCommentId: { type: mongoose.ObjectId, ref: 'Comment', default: null },
  likes: { type: Number, default: 0 },
}, { timestamps: true })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment