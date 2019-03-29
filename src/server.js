import express from 'express'
import session from 'express-session'

import { setupPassport } from './passport'
import login from './login'
import authentication from './authentication'

export default function initServer(config) {
  const app = express()

  app.use(session({
    secret: config.cookieSecret,
    cookie: {
      maxAge: config.cookieMaxAge,
    },
    resave: false,
    saveUninitialized: false,
  }))

  setupPassport(config, app)

  app.use(login())
  app.use(authentication())

  return app
}
