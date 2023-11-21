const express = require('express')
const dotenv = require('dotenv').config()
const path = require('path')
const session = require('express-session')
const paginate = require('express-paginate')
const fs = require('fs')
const helmet = require('helmet')
const swaggerUi = require("swagger-ui-express")
const morgan = require('morgan')
const throttle = require('express-throttle')
const connectDb = require('./config/connectDb')
const specs = require('./config/swaggerConfig')
const passport = require('./config/passportConfig')
const throttleOptions = require('./config/throttleOptions')
const userRouter = require('./routes/userRouter')
const postRouter = require('./routes/postRouter')
const commentRouter = require('./routes/commentRouter')
const oauthRouter = require('./routes/oauthRouter')
const tagAndCategoryRouter = require('./routes/tagAndCategoryRouter')
const errorHandler = require('./middlewares/errorHandler')
const sessionOptions = require('./config/sessionOptions')
const multerRouter = require('./routes/multerRouter')
const cors = require('cors')


const app = express()

// Connect to MongoDB
connectDb()

// External Libraries
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(morgan(process.env.LOG_FORMAT, { stream: fs.createWriteStream('logs/access.log', { flags: 'a' }) }))
// app.use(throttle(throttleOptions))
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(paginate.middleware(5, 50))
// Quick fix for express-paginate to disable retrieving all results
app.use((req, res, next) => {
  if (req.query.limit == 0) { req.query.limit = 5 }
  next()
})

// Routes
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/api', tagAndCategoryRouter)
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/comments', commentRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.use("/auth", oauthRouter)
app.use('/api', multerRouter)

// Error handler
app.use(errorHandler)

const port = process.env.PORT || 5000


let server = app.listen(port, () => {
  console.log(`Server running on port ${port}.`)
})


module.exports = { app, server }