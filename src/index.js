/* eslint-disable no-console */
import { parseConfig } from './config'
import initServer from './server'

const config = parseConfig()
const app = initServer(config)

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

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})
