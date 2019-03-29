#!/bin/bash

IMAGE=rplan/ambassador-github-oauth:${TRAVIS_TAG}

docker build -t ${IMAGE} .

echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
docker push ${IMAGE}
