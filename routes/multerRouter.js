const multer = require('multer')
const path = require('path')
const express = require('express')
const handleResponse = require('../helpers/handleResponse')
const statusCodes = require('../constants')

const multerRouter = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG and PNG files are allowed.'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single('file')

multerRouter.post('/upload', (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      res.status(500).json({ success: false, message: 'Multer Error.' })
    }
    else if (err) {
      console.log(err)
      res.status(500).json({ success: false, message: 'Upload Error.' })
    } else {
      handleResponse(res, statusCodes.SUCCESS, 'File Uploaded.')
    }
  })
})

module.exports = multerRouter