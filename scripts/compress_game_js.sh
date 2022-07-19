#! /bin/bash

JS_PATH=/home/adguy/acapp/game/static/js/
JS_PATH_SRC=${JS_PATH}src/
JS_PATH_DIST=${JS_PATH}dist/

find $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}game.js

echo yes | python3 manage.py collectstatic
