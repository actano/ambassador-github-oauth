# ambassador-github-oauth [![Build Status](https://travis-ci.org/actano/ambassador-github-oauth.svg?branch=master)](https://travis-ci.org/actano/ambassador-github-oauth)
Ambassador authentication service which uses Github OAuth

## Config

The service can be configured by adjusting values in the `.rplan-config.yml` or by setting values
via environment variables by separating the YAML keys with `__`, e.g. `session__cookie__max_age=432000000`.

```yaml
server:
  # Listening port of the server (default: 3000)
  port: 3000
oauth:
  # OAuth client id (required)
  client_id: ''
  # OAuth client secret (required)
  client_secret: ''
  # OAuth callback URL which should point to the path '/auth/login/callback' on this server and has
  # to be publicly reachable by the clients (required)
  callback_url: ''
session:
  cookie:
    # Secret for encrypting the session cookie (required)
    secret: ''
    # Max age of the session cookie in ms (default: 5 days)
    max_age: 432000000 # 5 days
github:
  # Name of the Github org the user has to be a member of or empty to allow all users (default: empty)
  org: ''
```
