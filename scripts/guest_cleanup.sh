#!/bin/bash

SCRIPT_DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
PROJECT_DIR=$(cd $SCRIPT_DIR/.. && pwd)

echo $PROJECT_DIR

if [ -f $PROJECT_DIR/.env ]; then
    source $PROJECT_DIR/.env
else
    echo ".env file not found at $PROJECT_DIR/.env"
fi

psql "$DB_URL" -c "DELETE FROM users WHERE is_guest = true AND created_at < NOW() - INTERVAL '1 hour'"