#!/bin/bash
docker run \
--init \
--rm \
--env-file .env \
-p 3000:3000 \
-v .:/app \
-it \
sonarr-sync