const mongoose = require('mongoose')
const expressAsyncHandler = require('express-async-handler')


const connectDb = expressAsyncHandler(async () => {
  const connection = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog')
  console.log('Database connected', connection.connection.host, connection.connection.name)
})

module.exports = connectDb