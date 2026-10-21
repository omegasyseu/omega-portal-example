#!/bin/sh
# Runs Strapi and nginx in one container. When either stops, the other is stopped too and
# the container exits, so Docker's restart policy brings both back; there's no supervisor.
# docker stop's SIGTERM is passed to both.
set -u

# Set first, so a SIGTERM during start-up isn't ignored (PID 1 has no default handler)
strapi=
nginx=
is_stopping=false
trap 'is_stopping=true; kill -TERM $strapi $nginx 2>/dev/null' TERM INT

# Refuse strapi/.env.example's placeholder secrets passed in the environment: with them anyone
# could forge an admin session. Only the names are printed, never the values.
placeholders=
for name in $(env | sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p'); do
    eval "value=\${$name-}"
    case "$value" in
        *tobemodified*) placeholders="$placeholders $name" ;;
    esac
done
if [ -n "$placeholders" ]; then
    echo "entrypoint: replace the placeholder 'tobemodified' in$placeholders with new random values, or leave them unset so the container makes its own; not starting" >&2
    exit 1
fi

# Strapi's secrets: the first start makes each one the environment doesn't set and saves it
# in the data volume ($ENV_PATH), beside the database it protects. Strapi, and a seed run with
# `docker compose exec`, read that file; a value set in the environment still wins.
random() { head -c 16 /dev/urandom | base64; }
for name in APP_KEYS API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET ENCRYPTION_KEY; do
    eval "is_set=\${$name+x} value=\${$name-}"
    # An empty value would win over the file and leave Strapi with no secret
    if [ -n "$is_set" ] && [ -z "$value" ]; then
        echo "entrypoint: $name is set but empty; remove it so the container makes its own; not starting" >&2
        exit 1
    fi
    if [ -z "$value" ] && ! grep -qs "^$name=." "$ENV_PATH"; then
        mkdir -p "$(dirname "$ENV_PATH")" && (umask 077 && touch "$ENV_PATH") || exit 1
        if [ "$name" = APP_KEYS ]; then value="$(random),$(random)"; else value=$(random); fi
        echo "$name=$value" >> "$ENV_PATH" || exit 1
        echo "entrypoint: made a new $name in $ENV_PATH"
    fi
done
# A restored backup keeps its own file mode
[ ! -f "$ENV_PATH" ] || chmod 600 "$ENV_PATH" || exit 1

# The portal's runtime settings (PORTAL_*)
/usr/local/bin/env.sh || exit 1

mkdir -p /srv/strapi/data/public/uploads
cd /srv/strapi
node_modules/.bin/strapi start &
strapi=$!
nginx -g 'daemon off;' &
nginx=$!

# Busybox's `wait -n` misses a child killed from outside, so poll. Waiting on the sleep
# reaps an exited child (so kill -0 fails) and lets a trapped signal in at once.
while [ "$is_stopping" = false ] && kill -0 "$strapi" 2>/dev/null && kill -0 "$nginx" 2>/dev/null; do
    sleep 1 &
    wait $!
done
kill -TERM "$strapi" "$nginx" 2>/dev/null
wait

if [ "$is_stopping" = true ]; then
    exit 0
fi
echo "entrypoint: Strapi or nginx stopped, so the container stops" >&2
exit 1
