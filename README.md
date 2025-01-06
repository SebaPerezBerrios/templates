<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
Template project to maintain useful code snippets, these include:

- Multitenant environment using [default injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes) instead of request based injection, these allow for querying domain aggregates in different tenants (for example a user having access to multiple tenants).
- smart cache validation using Zod, allowing data validation and transformation into domain values instead of relying on plain JSON.
- Sum types (Tagged unions) using Zod and ts-pattern which allow expressive and functional data based logic flows.
- Hierarchical role based ACL (```resource.action```)
- Config module allowing for easy module initialization
- Request query to db query transformation
- Reactive pattern functions to make use of database cursors to handle large volume of data, also channel resources (useful for websocket use cases).

next steps

- Helper modules to use bulk consumption of Kafka topics using [KafkaJS](https://kafka.js.org/) ```eachBatch``` feature
 

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Local Kubernetes deployment

Key resources are found on ```kubernetes-config``` folder, using [kind](https://kind.sigs.k8s.io/) to create a local K8s environment, using a [Load Balancer](https://github.com/kubernetes-sigs/cloud-provider-kind) with NGINX Ingress to allow external use as defined by ```cluster_config.yaml``` file, also using path rewrite to allow transparent API routes inside a prefix ```nest-api```

## Build and publish to local registry

- Build application ```docker build -t nestjs-app .```
- Tag image ```docker tag nestjs-app:latest localhost:5001/nestjs-app:latest```
- Publish to [local registry](https://kind.sigs.k8s.io/docs/user/local-registry/) ```docker push localhost:5001/nestjs-app:latest```

## Secrets
Run ```kubectl create secret generic secrets-store``` to create the secret container that provides the environment variables at runtime.

Add these data fields, all field values should be base 64 encoded.
```
data:
  DB_NAME: <mongodb main database name>
  DB_URI: <mongodb uri>
  TENANT_PREFIX: <mongodb multitenant name prefix>
  REDIS_URI: <redis service url>
  REDIS_USERNAME: <redis username>
  REDIS_PASSWORD: <redis service password>
  TENANT_PREFIX: <tenant prefix>
  USER_JWT_EXPIRATION: <token expiration in minutes>
  USER_JWT_PRIVATE:<private RSA>
  USER_JWT_PUBLIC: <public RSA>
```