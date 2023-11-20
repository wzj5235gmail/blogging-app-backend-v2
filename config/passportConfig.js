const passport = require('passport')
const User = require('../models/User')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const bcrypt = require('bcrypt')
const expressAsyncHandler = require('express-async-handler')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
},
    expressAsyncHandler(async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value
        let user = await User.findOne({ email })
        if (!user) {
            user = new User({
                username: profile.displayName,
                name: profile.displayName,
                password: await bcrypt.hash(process.env.DEFAULT_PASSWORD, Number.parseInt(process.env.SALT_ROUNDS)),
                email,
            })
        }
        user.lastLogin = new Date()
        await user.save()
        user.password = null
        return done(null, user)
    })))

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, user)
    })
})

passport.deserializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, user)
    })
})

module.exports = passport