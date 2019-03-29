import { Router } from 'express'

export default function health() {
  const router = new Router()

  router.get('/health', (req, res) => {
    res.sendStatus(200)
  })

  return router
}
