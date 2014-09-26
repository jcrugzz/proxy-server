#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var Server = require('..');

var argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    config: 'c',
    target: 't',
    port: 'p',
    ssl: 's',
    root: 'r',
    key: 'k',
    cert: 'e',
    ca: 'a'
  },
  boolean: [ 'help' ],
  string: [ 'config', 'target', 'root', 'key', 'cert', 'ca' ]
});

if (argv.help) {
  return fs.createReadStream(path.join(__dirname, 'usage.txt'))
    .pipe(process.stdout)
    .on('close', function () { process.exit(1) })
}

var config = argv.config? require(path.resolve(process.cwd(), argv.config)) : {};

config.target = argv.target || config.target;
config.http = argv.http || config.http;
config.https = argv.ssl && argv.root && argv.key && argv.cert && argv.ca
  ? { port: argv.ssl, root: argv.root, key: argv.key, cert: argv.cert, ca: argv.ca }
  : config.https;

var server = new Server(config);

server.on('error', function (err) {
  console.error(err);
});

server.on('log', console.log.bind(console));



