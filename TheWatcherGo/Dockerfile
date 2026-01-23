FROM golang:alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN go build -o watcher .
FROM alpine:latest  
WORKDIR /root/
COPY --from=builder /app/watcher .
CMD ["./watcher"]