#!/bin/bash

set -euo pipefail

tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --outbound-http-proxy-listen=localhost:1055 &
tailscale up --authkey=${TAILSCALE_AUTHKEY} --hostname=exiftool

exec node build
