const mongoose = require('mongoose')

const userRoleEnum = ['Admin', 'Staff', 'Guest']

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: 'https://placehold.co/400x400' },
  bio: { type: String, default: 'This guy has no biography.' },
  phone: { type: String, default: '1234567890' },
  lastLogin: { type: Date, default: Date.now },
  interests: [{ type: mongoose.ObjectId, ref: 'Tag' }],
  follows: [{ type: mongoose.ObjectId, ref: 'User' }],
  savedPosts: [{ type: mongoose.ObjectId, ref: 'Post' }],
  likes: [{ type: mongoose.ObjectId, ref: 'Post' }],
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: userRoleEnum, default: 'Guest' },
  featured: { type: Boolean, default: false },
  posts: [{ type: mongoose.ObjectId, ref: 'Post' }],
  likedComments: [{ type: mongoose.ObjectId, ref: 'Comment' }],
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User