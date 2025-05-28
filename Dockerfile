FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ar-united /bin/ar-united
COPY ./app ./app
COPY ./sql/schema ./migrations

CMD ["/bin/ar-united"]