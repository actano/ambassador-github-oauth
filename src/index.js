import createLogger from '@rplan/logger'
import { parseConfig } from './config'
import initServer from './server'

const logger = createLogger('ambassador-github-oauth')

const config = parseConfig()
const app = initServer(config)

function shutdownServer(server) {
  logger.info('shutting down server')
  server.close(() => {
    logger.info('server was shut down')
  })
}

const server = app.listen(config.port, () => {
  logger.info(`server listening on port ${config.port}`)
})

process.on('SIGINT', () => {
  shutdownServer(server)
})

process.on('SIGTERM', () => {
  shutdownServer(server)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason)
  process.exit(1)
})
