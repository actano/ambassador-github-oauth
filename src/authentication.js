import { QUERY, ROUTE } from './constants'

export default function authentication() {
  return (req, res) => {
    if (req.isAuthenticated()) {
      res.sendStatus(200)
    } else {
      res.redirect(`${ROUTE.LOGIN}?${QUERY.REDIRECT_TO}=${encodeURIComponent(req.path)}`)
    }
  }
}
