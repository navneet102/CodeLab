FROM gcc:13-bookworm

RUN groupadd runner && useradd -g runner runner

WORKDIR /code
RUN chown runner:runner /code

USER runner
