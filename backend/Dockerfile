FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Makassar

WORKDIR /app

COPY server_linux ./server
RUN chmod +x ./server && mkdir -p uploads

EXPOSE 8080

CMD ["./server"]
