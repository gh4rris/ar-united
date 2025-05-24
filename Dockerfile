FROM debian:bullseye-slim

WORKDIR /app

COPY ar-united /bin/ar-united
COPY ./app ./app
COPY ./sql/schema ./migrations

CMD ["/bin/ar-united"]