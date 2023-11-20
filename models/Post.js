const mongoose = require('mongoose')

const postStatusEnum = ['draft', 'published', 'archived']

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.ObjectId, ref: 'Category' },
  tags: [{ type: mongoose.ObjectId, ref: 'Tag' }],
  publishDate: { type: Date, default: Date.now },
  lastUpdateDate: { type: Date, default: Date.now },
  status: { type: String, enum: postStatusEnum, default: 'published' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  coverImage: { type: String, default: 'https://placehold.co/600x400' },
  summary: { type: String, default: '' },
  featured: {type: Boolean, default: false},
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)

module.exports = Post