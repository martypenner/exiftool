# syntax=docker/dockerfile:1.4

FROM node:18-bullseye

ENV DEBIAN_FRONTEND=noninteractive
ENV TAILSCALED_TUN=userspace-networking

RUN apt-get update -y && \
	apt-get install -y exiftool \
	&& apt-get install -y netcat \
	&& curl -fsSL https://tailscale.com/install.sh | sh \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
	CMD nc -vz 127.0.0.1 3000 \
	|| exit 1

CMD ["/app/run.sh"]
