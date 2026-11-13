#!/bin/sh
# Render alertmanager.yml from the template using env vars, then start
# Alertmanager. The bot token goes into a file (never into the config text) so
# special characters in secrets can't break the YAML. Runs under busybox sh.
set -eu

CHAT_ID="${TELEGRAM_CHAT_ID:-}"
case "$CHAT_ID" in
  *[!0-9-]*) echo "TELEGRAM_CHAT_ID must be an integer (negative for groups)" >&2; exit 1 ;;
esac

if [ -n "$CHAT_ID" ] && [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  ROUTE=telegram
else
  ROUTE=blackhole
  CHAT_ID=1  # placeholder; the telegram receiver is unused in this mode
  echo "WARNING: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set; alerts will fire but not be delivered." >&2
fi

printf '%s' "${TELEGRAM_BOT_TOKEN:-unset}" > /tmp/telegram_bot_token
sed -e "s/__TELEGRAM_CHAT_ID__/${CHAT_ID}/" -e "s/__ROUTE_RECEIVER__/${ROUTE}/" \
  /etc/alertmanager/alertmanager.yml.tmpl > /tmp/alertmanager.yml

exec /bin/alertmanager \
  --config.file=/tmp/alertmanager.yml \
  --storage.path=/alertmanager \
  "$@"
