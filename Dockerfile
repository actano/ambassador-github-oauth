FROM node:10-alpine

WORKDIR /auth

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

COPY src src
COPY babel.config.js babel.config.js
RUN yarn build && rm -r src babel.config.js

COPY .rplan-config.yml .rplan-config.yml

EXPOSE 3000

# We can't use yarn here because of https://github.com/yarnpkg/yarn/issues/4667
CMD ["node", "./lib/index.js"]
