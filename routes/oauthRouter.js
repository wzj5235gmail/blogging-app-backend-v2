const express = require('express')
const passport = require('passport')
const statusCodes = require('../constants')
const handleResponse = require('../helpers/handleResponse')

const oauthRouter = express.Router()

oauthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
oauthRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/fail',
}))
oauthRouter.get('/success', async (req, res) => {
    const params = new URLSearchParams(req.user).toString()
    res.redirect('/oauth?' + params)
})
oauthRouter.get('/fail', (req, res) => {
    handleResponse(res, statusCodes.BAD_REQUEST, 'Oauth login failed.', req.user)
})

module.exports = oauthRouter