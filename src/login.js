import { Router } from 'express'
import passport from 'passport'

import { QUERY, ROUTE } from './constants'

function encodeOAuthState(redirectTo) {
  const state = redirectTo
    ? Buffer.from(JSON.stringify({ redirectTo })).toString('base64')
    : undefined
  return state
}

function decodeOAuthState(state) {
  return JSON.parse(Buffer.from(state, 'base64').toString())
}

export default function login() {
  const router = new Router()

  router.get(
    ROUTE.LOGIN,
    (req, res, next) => {
      const state = encodeOAuthState(req.query[QUERY.REDIRECT_TO])
      const authenticator = passport.authenticate('github', { state })
      authenticator(req, res, next)
    },
  )

  router.get(
    ROUTE.LOGIN_CALLBACK,
    passport.authenticate('github'),
    (req, res) => {
      try {
        const { state } = req.query
        const { redirectTo } = decodeOAuthState(state)
        const redirectPath = decodeURIComponent(redirectTo)
        if (typeof redirectPath === 'string') {
          res.redirect(redirectPath)
          return
        }
      } catch (err) {
        // ignore parsing errors and redirect to '/' instead
      }
      res.redirect('/')
    },
  )

  return router
}
