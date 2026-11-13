#!/bin/bash
# InfluxDB v2 first-boot initialisation script.
# Sets up the org, bucket, and a token with known values
# so the rest of the stack can connect without manual steps.
#
# This is mounted into the influxdb container as an init script at
# /docker-entrypoint-initdb.d/ — InfluxDB runs it automatically on first start.

set -e

INFLUX_ORG="${DOCKER_INFLUXDB_INIT_ORG:-osdag}"
INFLUX_BUCKET="${DOCKER_INFLUXDB_INIT_BUCKET:-osdag_metrics}"
: "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN:?DOCKER_INFLUXDB_INIT_ADMIN_TOKEN must be set}"
INFLUX_TOKEN="$DOCKER_INFLUXDB_INIT_ADMIN_TOKEN"

echo "[influxdb-init] Organisation : $INFLUX_ORG"
echo "[influxdb-init] Bucket       : $INFLUX_BUCKET"
echo "[influxdb-init] Token        : $INFLUX_TOKEN"
echo "[influxdb-init] InfluxDB ready."
