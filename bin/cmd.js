#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var Server = require('..');

var argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    config: 'c',
    'change-origin': 'o',
    'rewrite-host': 'r',
    target: 't',
    port: 'p',
    ssl: 's',
    root: 'r',
    key: 'k',
    cert: 'e',
    ca: 'a',
    ws: 'w'
  },
  boolean: [ 'help', 'ws', 'change-origin'],
  string: [ 'config', 'target', 'root', 'key', 'cert', 'ca', 'rewrite-host' ]
});

if (argv.help) {
  return fs.createReadStream(path.join(__dirname, 'usage.txt'))
    .pipe(process.stdout)
    .on('close', function () { process.exit(1) })
}

var config = argv.config ? require(path.resolve(process.cwd(), argv.config)) : {};

config.target = argv.target || config.target;
config.ws = argv.ws || config.ws || false;
config.http = argv.http || config.http;
config.changeOrigin = argv['change-origin'] || config.changeOrigin;
config.rewriteHost = argv['rewrite-host'] || config.rewriteHost;
config.https = argv.ssl && argv.root && argv.key && argv.cert && argv.ca
  ? { port: argv.ssl, root: argv.root, key: argv.key, cert: argv.cert, ca: argv.ca }
  : config.https;

var server = new Server(config);

server.on('error', function (err) {
  console.error(err);
});

server.on('log', console.log.bind(console));



