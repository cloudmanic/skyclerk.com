#!/bin/bash

# Date: 5/23/2020
# Author(s): Spicer Matthews (spicer@skyclerk.com)
# Copyright: 2020 Cloudmanic Labs, LLC. All rights reserved.
#
# Run a local testing server

# Run local server
pushd ../

# Build tailwind
npx tailwindcss build assets/css/style.css -o assets/css/build.css

# Run local server
#hugo server -D --bind 0.0.0.0 --baseUrl http://stowe.local:1313
hugo server -D


# Back to root dir
popd
