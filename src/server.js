import express from 'express'
import session from 'express-session'
import createMemoryStore from 'memorystore'

import { setupPassport } from './passport'
import login from './login'
import authentication from './authentication'
import health from './health'

const MemoryStore = createMemoryStore(session)

export default function initServer(config) {
  const app = express()

  app.use(session({
    secret: config.cookieSecret,
    cookie: {
      maxAge: config.cookieMaxAge,
    },
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: config.cookieMaxAge,
    }),
  }))

  setupPassport(config, app)

  app.use(health())
  app.use(login())
  app.use(authentication())

  return app
}
