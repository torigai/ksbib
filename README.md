# ksbib
library software

# Installation

npm install -g nw-gyp \
npm install nw --nwjs_build_type=normal --save \
npm install nwjs-builder-phoenix --save-dev \
npm install sqlite3 --build-from-source --runtime=node-webkit --target-arch=x64  --target="0.46.4" --save 

(target = "0.46.4" denotes the nwjs version. You can change this to the actual version but then take
that change into account in package.json as well)

# Try out

npm run dev

# Build a desktop app

npm run dist

