#!/bin/bash

# Date: 5/23/2020
# Author(s): Spicer Matthews (spicer@skyclerk.com)
# Copyright: 2020 Cloudmanic Labs, LLC. All rights reserved.
#
# Deploy the entire app (frontend and backend). We do some compiling locally and then deploy.

# Run local server
pushd ../

# Build tailwind
export NODE_ENV=production
npx tailwindcss build assets/css/style.css -o assets/css/build.css

# Build HTML
hugo --minify

# Commit to Git
git add -A .
git commit -m "New deploy of site from deploy.sh"
git push origin master

# Back to root dir
popd
