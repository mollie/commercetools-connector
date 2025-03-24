#!/usr/bin/env bash
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" || exit ; pwd -P )

# GET AUTH TOKEN FROM ENV.
CONNECTOR_EXTENSION_TOKEN=$(grep '^CONNECTOR_EXTENSION_TOKEN=' ${PARENT_PATH}/../.env | head -n 1 | cut -d '=' -f2 | tr -d '[:space:]')
if test -z "${CONNECTOR_EXTENSION_TOKEN}"
then
  echo "❌ ERROR: I haven't been able to recover CONNECTOR_EXTENSION_TOKEN from your local .env variables file."
  exit 1
fi

# Start NGROK in background
echo "⚡️ Starting ngrok"
ngrok authtoken ${CONNECTOR_EXTENSION_TOKEN} &
ngrok http 8080 > /dev/null &

# Wait for ngrok to be available
while ! nc -z localhost 4040; do
  sleep 0.2 # wait Ngrok to be available
done
sleep 1

NGROK_REMOTE_URL="$(curl http://localhost:4040/api/tunnels | sed 's#.*"public_url":"\([^"]*\)".*#\1#g')"
if ! [[ "${NGROK_REMOTE_URL}" = http* ]]
then
  echo "❌ ERROR: ngrok doesn't seem to return a valid URL (${NGROK_REMOTE_URL})."
  exit 1
fi
printf = "variable here ${NGROK_REMOTE_URL}"


bold=$(tput bold)
normal=$(tput sgr0)
echo ${NGROK_REMOTE_URL} | tr -d '\n' | pbcopy
printf "\n\n🌍 Your ngrok remote URL is 👉 ${bold}${NGROK_REMOTE_URL} 👈\n📋 ${normal}I've just copied it to your clipboard 😉\n\n"