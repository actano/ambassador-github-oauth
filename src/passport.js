import passport from 'passport'
import GithubStrategy from 'passport-github2'
import axios from 'axios'

async function checkOrgMembership(accessToken, allowedOrg) {
  const { data: orgsData } = await axios.get('https://api.github.com/user/orgs', {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${accessToken}`,
    },
  })

  const orgNames = orgsData.map(org => org.login)
  return orgNames.includes(allowedOrg)
}

export function setupPassport(config, app) {
  const oauthScopes = []

  if (config.githubOrg) {
    oauthScopes.push('read:org')
  }

  passport.use(
    new GithubStrategy(
      {
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackUrl,
        scope: oauthScopes,
      },
      async (accessToken, refreshToken, profile, done) => {
        if (config.githubOrg) {
          const isOrgMember = await checkOrgMembership(accessToken, config.githubOrg)
          if (!isOrgMember) {
            done(
              null,
              null,
              { message: `You are not a member of the '${config.githubOrg}' GitHub org` },
            )
            return
          }
        }

        done(null, profile.username)
      },
    ),
  )

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })

  app.use(passport.initialize())
  app.use(passport.session())
}
