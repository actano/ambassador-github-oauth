/* eslint-disable no-console */
import passport from 'passport'
import GithubStrategy from 'passport-github2'
import express from 'express'
import session from 'express-session'
import axios from 'axios'

import { parseConfig } from './config'

const config = parseConfig()

passport.use(
  new GithubStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackUrl,
    scope: ['read:org'],
  },
  async (accessToken, refreshToken, profile, done) => {
    const { data: orgsData } = await axios.get('https://api.github.com/user/orgs', {
      headers: {
        Accept: 'application/json',
        Authorization: `token ${accessToken}`,
      },
    })
    const orgNames = orgsData.map(org => org.login)
    if (config.githubOrg && !orgNames.includes(config.githubOrg)) {
      done(null, null, { message: `You are not a member of the '${config.githubOrg}' GitHub org` })
      return
    }
    done(null, profile.username)
  }),
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

const app = express()

app.use(session({
  secret: config.cookieSecret,
  cookie: {
    maxAge: config.cookieMaxAge,
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
  passport.authenticate('github'),
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

const server = app.listen(config.port, () => {
  console.log(`server listening on port ${config.port}`)
})

process.on('SIGINT', () => {
  console.log('shutdown')
  server.close()
})

process.on('SIGTERM', () => {
  console.log('shutdown')
  server.close()
})
