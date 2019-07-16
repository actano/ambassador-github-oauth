import config from '@rplan/config'

export function parseConfig() {
  const port = config.get('server:port') || 3000
  const clientId = config.get('oauth:client_id')
  const clientSecret = config.get('oauth:client_secret')
  const callbackUrl = config.get('oauth:callback_url')
  const cookieSecret = config.get('session:cookie:secret')
  const cookieMaxAge = Number.parseInt(config.get('session:cookie:max_age'), 10)
  const cookieDomain = config.get('session:cookie:domain')
  const githubOrg = config.get('github:org')

  if (!clientId) {
    throw new Error('no client id given')
  }

  if (!clientSecret) {
    throw new Error('no client secret given')
  }

  if (!callbackUrl) {
    throw new Error('no callback URL given')
  }

  if (!cookieSecret) {
    throw new Error('no cookie secret given')
  }

  return {
    port,
    clientId,
    clientSecret,
    callbackUrl,
    cookieSecret,
    cookieMaxAge,
    cookieDomain,
    githubOrg,
  }
}
