#!/usr/bin/env bash

# Prepares zip for uploading to chrome web store

set -e

cd `dirname $0`/..

rm -rf temp-to-zip/
rm -f ororo-recent-subs.zip
mkdir temp-to-zip/
mkdir temp-to-zip/images/
mkdir temp-to-zip/scripts/
cp manifest.json temp-to-zip/
cp -r images/* temp-to-zip/images/
cp -r scripts/* temp-to-zip/scripts/
cd temp-to-zip
zip -r ororo-recent-subs.zip *
mv ororo-recent-subs.zip ./..
cd -
rm -rf temp-to-zip/
