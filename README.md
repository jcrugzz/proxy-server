# proxy-server

Simple http/https server that runs a simple http-proxy based on
[`create-servers`][create-servers] and [`node-http-proxy`][http-proxy].

## Install

### Use as CLI
```sh
$ npm install -g proxy-server
```
### Use as module
```sh
$ npm install proxy-server
```

## Usage

```js
var Server = require('proxy-server');

var server = new Server({
  // create-servers options
  http: 80,
  https: {
    port: 443,
    root: '/path/to/cert/files',
    key: 'key.pem',
    cert: 'cert.pem',
    ca: 'ca.pem' //can be array
  },
  target: 'https://localhost:5984'
});

// Startup errors from `create-servers`
server.on('error', function (err) {
  console.error(err);
});

server.on('listening', function (servers) {
  console.log('listening!');
});
```

[http-proxy]: http://browsenpm.org/package/http-proxy
[create-servers]: http://browsenpm.org/package/create-servers
