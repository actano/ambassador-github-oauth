/* eslint-disable no-console */
import passport from 'passport'
import GithubStrategy from 'passport-github2'
import express from 'express'
import session from 'express-session'
import config from '@rplan/config'
import axios from 'axios'

const port = config.get('server:port') || 3000
const clientID = config.get('oauth:client_id')
const clientSecret = config.get('oauth:client_secret')
const callbackURL = config.get('oauth:callback_url')
const cookieSecret = config.get('session:cookie_secret')
const cookieMaxAge = Number.parseInt(config.get('session:cookie_max_age'), 10)
const githubOrg = config.get('github:org')

if (!clientID) {
  console.error('no client id given')
  process.exit(1)
}

if (!clientSecret) {
  console.error('no client secret given')
  process.exit(1)
}

if (!callbackURL) {
  console.error('no callback URL given')
  process.exit(1)
}

if (!cookieSecret) {
  console.error('no cookie secret given')
  process.exit(1)
}

passport.use(
  new GithubStrategy({
    clientID,
    clientSecret,
    callbackURL,
    scope: ['read:org'],
  },
  (async (accessToken, refreshToken, profile, done) => {
    const { data: orgsData } = await axios.get('https://api.github.com/user/orgs', {
      headers: {
        Accept: 'application/json',
        Authorization: `token ${accessToken}`,
      },
    })
    const orgNames = orgsData.map(org => org.login)
    if (!orgNames.includes(githubOrg)) {
      done(null, false, { message: 'You are not a member of the specified GitHub org' })
      return
    }
    done(null, profile.username)
  })),
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

const app = express()

app.use(session({
  secret: cookieSecret,
  cookie: {
    maxAge: cookieMaxAge,
  },
  resave: false,
  saveUninitialized: false,
}))
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
    const authenticator = passport.authenticate('github', { state })
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

const server = app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})

process.on('SIGINT', () => {
  console.log('shutdown')
  server.close()
})

process.on('SIGTERM', () => {
  console.log('shutdown')
  server.close()
})
