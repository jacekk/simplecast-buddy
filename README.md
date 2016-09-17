# Simplecast Buddy

#### Requirements

* node >= 6.*

#### Usage

* `npm install`
* `node list-podcasts.js 20` **start** from 20
* `node list-podcasts.js 1 50` set the **amount** to 50
* `node list-podcasts.js` **1** and **10** are the defaults
* `node list-podcasts.js 1 100 --save-to-file`
* `node list-podcasts.js 1 100 --save-to-file --with-description`
* `node list-podcasts.js --show-errors`

#### Todo

* `node find-by-category.js laravel` - use "itunes:category" param
* handle "socket hang up" error
* add "-- concurrent" param
