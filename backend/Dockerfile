FROM golang:1.23-alpine AS build

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/pvp-api ./cmd/api

FROM alpine:3.21

RUN adduser -D -H appuser
USER appuser
COPY --from=build /bin/pvp-api /bin/pvp-api
EXPOSE 8080
ENTRYPOINT ["/bin/pvp-api"]
