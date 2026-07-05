FROM eclipse-temurin:21-jdk-alpine

RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /code
RUN chown runner:runner /code

USER runner
