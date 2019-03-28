const passport = require('passport')
const GithubStrategy = require('passport-github2')
const express = require('express')
const session = require('express-session')

passport.use(
  new GithubStrategy({
    clientID: 'NYI',
    clientSecret: 'NYI',
    callbackURL: 'NYI',
  },
  ((accessToken, refreshToken, profile, done) => {
    done(null, profile)
  })),
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

const app = express()

app.use(session({ secret: 'foobar', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.get('/auth/login',
  (req, res, next) => {
    // eslint-disable-next-line camelcase
    const { redirect_to } = req.query
    // eslint-disable-next-line camelcase
    const state = redirect_to
      ? Buffer.from(JSON.stringify({ redirectTo: redirect_to })).toString('base64')
      : undefined
    const authenticator = passport.authenticate('github', { scope: ['user:email'], state })
    authenticator(req, res, next)
  })

app.get('/auth/login/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    try {
      const { state } = req.query
      const { redirectTo } = JSON.parse(Buffer.from(state, 'base64').toString())
      const redirectPath = decodeURIComponent(redirectTo)
      if (typeof redirectPath === 'string' && redirectPath.startsWith('/')) {
        res.redirect(redirectPath)
        return
      }
    } catch (err) {
      //
    }
    res.redirect('/')
  })

app.use((req, res) => {
  if (req.isAuthenticated()) {
    res.sendStatus(200)
  } else {
    res.redirect(`/auth/login?redirect_to=${encodeURIComponent(req.path)}`)
  }
})

const server = app.listen(80, () => {
  console.log('server listening on port 80')
})

process.on('SIGINT', () => {
  console.log('shutdown')
  server.close()
})

process.on('SIGTERM', () => {
  console.log('shutdown')
  server.close()
})
