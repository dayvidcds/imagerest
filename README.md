<p align="center" style="display: flex;  align-items: center; justify-content: center; flex-wrap: wrap; gap: 16px">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="80" alt="Nest Logo" /></a>
  <a href="https://www.mongodb.com/" target="blank"><img src="https://webassets.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png" width="120" alt="MongoDB Logo" /></a>
  <a href="https://aws.amazon.com/s3/" target="blank"><img src="https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png" width="100" alt="Amazon S3 Logo" /></a>
  <a href="https://www.docker.com/" target="blank"><img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" width="80" alt="Docker Logo" /></a>
  <a href="https://docs.docker.com/compose/" target="blank"><img src="https://media.wiki-power.com/img/20210117130925.jpg" width="140" alt="Docker Compose Logo" /></a>
  <a href="https://www.heroku.com/" target="blank"><img src="https://www.vectorlogo.zone/logos/heroku/heroku-icon.svg" width="60" alt="Heroku Logo" /></a>
</p>

<p align="center">Some of the technologies and services used in this project.</p>

## Description

Image management system that uses [Nest Js](https://github.com/nestjs/nest) in the backend to create a modular and easily scalable system. User information and photo data are stored in [MongoDB](https://www.mongodb.com/), while photos are saved in the cloud via [Amazon S3](https://aws.amazon.com/pt/s3/). The system implements a caching mechanism to avoid unnecessary calls to the storage service, reducing costs and significantly improving performance in delivering requested images. The deployment and orchestration are handled using [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/), making it easy to set up the development environment and manage containers. For deployment, [Heroku](https://www.heroku.com/) is used to provide a reliable and scalable cloud platform.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# Important - Configure the .env file

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run build
$ yarn run start:prod
```

## Running the app in Docker

```bash
# Important - Configure the .env file

# development opening bash from docker container
$ yarn run docker:local

Inside docker >> $ yarn run start:dev

# development using docker compose
$ docker compose up

# production mode
$ docker compose up app
```

## Test

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

## Future improvements

- Added redis to persist the cache
- Addition of a messaging service to control the entry of images for upload.
- Study of automatic deployment on Amazon EC2
- Development of more backend features (Image deletion, thumbnail image, multiple upload...)
- Development of a frontend for the project
- Distribution of the service/modules following the architecture proposed in the future architecture document that is attached to the project.

## Stay in touch

- Author - [Dayvid Silva](https://github.com/dayvidcds)

## License

Nest is [MIT licensed](LICENSE).
