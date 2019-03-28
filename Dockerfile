FROM node:10-alpine

WORKDIR /auth

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

COPY .rplan-config.yml .rplan-config.yml
COPY lib lib

EXPOSE 3000

CMD ["yarn", "start"]
