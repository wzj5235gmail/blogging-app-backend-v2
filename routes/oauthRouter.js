const express = require('express')
const passport = require('passport')

const oauthRouter = express.Router()

oauthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
oauthRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/auth/profile',
    failureRedirect: '/auth/fail',
}))
oauthRouter.get('/profile', (req, res) => {
    res.json({ success: true, user: req.user })
})
oauthRouter.get('/fail', (req, res) => {
    res.send('fail')
})

module.exports = oauthRouter