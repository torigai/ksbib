# ksbib
ksbib is a simple library software for personal purposes. You can handle books, articles, 
journals, incollections, link them to pdf-files and url's, search for media, import and export
csv-files etc. The software does not include rental options and user management. If you are 
interested in that, feel invited to contribute.

ksbib is a pure desktop application, everything is local on your computer.

## Installation

Download all files and enter the source folder `YourPathTo/ksbib/`. If you have `nw-gyp`
not yet installed, do

`npm install -g nw-gyp`

Then

`npm install nw --nwjs_build_type=normal --save` \
`npm install nwjs-builder-phoenix --save-dev` \
`npm install sqlite3 --build-from-source --runtime=node-webkit --target-arch=x64  --target="0.46.4" --save`

(`target = "0.46.4"` is the nwjs version. The version is also documented in package.json for the build process.
To find out the actual version visit https://nwjs.io/)

## Try out

`npm run dev`

## Database

After download, an empty database is located here:

`src/db/ksbib.db`

### Create an empty database

If you want to create a fresh database delete the old `ksbib.db` file
and uncomment the line

`<script src="../db/db_setup.js"></script>`

in `index.html`. Then run your program, close it and uncomment
the line again. This will create a new `ksbib.db` file.

### Backup database

To make a backup of your database create a dump file as follows:

`echo '.dump' | sqlite3 ksbib.db > old-ksbib.dump`

To create a database from your dump file run:

`cat old-ksbib.dump | sqlite3 ksbib.db`


## Build a desktop app

`npm run dist`

You will find the app in `ksbib/dist/`
