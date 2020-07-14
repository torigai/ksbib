# ksbib
ksbib is a simple library software that you can use for personal purposes or 
even for small archives. You can handle books, 
articles, journals, incollections, link them to pdf-files and url's search for 
media etc, just as you would expect of any library software. The software does 
not include rental options and user management. If you are interested in that, 
feel invited to send me a note or to contribute.

ksbib is meant as a desktop programm for your local computer. For that
purpose sqlite seemed to be the perfect choice. The security measures 
(like for instance user roles) that would be appropriate for a public web application 
are therefore not implemented.


## Installation

Download all files and go to the source folder `ksbib`. If you have `nw-gyp`
not yet installed, do

`npm install -g nw-gyp`

Then

`npm install nw --nwjs_build_type=normal --save` \
`npm install nwjs-builder-phoenix --save-dev` \
`npm install sqlite3 --build-from-source --runtime=node-webkit --target-arch=x64  --target="0.46.4" --save`

(`target = "0.46.4"` is the nwjs version. The version is also documented in package.json for the build process.
To find out the actual version visit https://nwjs.io/)

## Try out

npm run dev

## Build a desktop app

npm run dist

