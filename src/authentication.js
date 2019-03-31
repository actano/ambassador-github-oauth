import { QUERY, ROUTE } from './constants'

function getOriginalUrl(req) {
  const isHttps = req.get('X-Forwarded-Proto') === 'https'
  const protocol = isHttps ? 'https' : 'http'
  const host = req.get('Host')

  return `${protocol}://${host}${req.url}`
}

export default function authentication() {
  return (req, res) => {
    if (req.isAuthenticated()) {
      res.sendStatus(200)
    } else {
      const url = getOriginalUrl(req)
      res.redirect(`${ROUTE.LOGIN}?${QUERY.REDIRECT_TO}=${encodeURIComponent(url)}`)
    }
  }
}
