#!/bin/sh

#The script is designed to replace placeholders (defined as environment variables with the PORTAL_ prefix) in JavaScript and CSS files within /usr/share/nginx/html.
# This is typically used to dynamically inject environment-specific values into static assets of a web application.

for i in $(env | grep PORTAL_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value
    # sed JS and CSS only in the dist directory
    find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' -o -name 'runtime-config.js' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done