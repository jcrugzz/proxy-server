var EE = require('events').EventEmitter;
var util = require('util');
var HttpProxy = require('http-proxy');
var createServers = require('create-servers');
var forwarded = require('forwarded-for');

module.exports = Server;

util.inherits(Server, EE);

function Server (options) {
  if (!(this instanceof Server)) return new Server(options);
  options = options || {};
  options.http = options.http || 80;
  options.https = options.https || null;

  if(!options.target)
    throw new Error('Must specify target to proxy');

  this.target = options.target;
  // TODO: This should be better configurable
  this.proxy = new HttpProxy({
    secure: options.secure || false,
    target: this.target
  });

  this.proxy.on('error', this.onError.bind(this));
  this.proxy.on('start', this.emit.bind(this, 'start'));
  this.proxy.on('end', this.emit.bind(this, 'end'));
  console.dir(options);
  // Create all the servers!
  createServers({
    http: options.http,
    https: options.https,
    handler: this.handler.bind(this)
  }, this.onListen.bind(this));
}

Server.prototype.handler = function (req, res) {
  var address = forwarded(req, req.headers);

  this.emit('log', util.format('[proxy request] %s | %s %s', address.ip, req.method, req.url));

  this.proxy.web(req, res);
};

Server.prototype.handleUpgrade = function (req, socket, head) {
  this.proxy.ws(req, socket, head);
};

Server.prototype.onError = function (err, req, res) {
  var address = forwarded(req, req.headers),
      json;

  this.emit('log', util.format('[proxy error] %s | %s %s %s', address.ip, req.method, req.url, err.message));

  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }

  json = { error: 'proxy_error', reason: err.message };
  res.end(JSON.stringify(json));
};

Server.prototype.onListen = function (errs, servers) {
  if (errs) {
    return Object.keys(errs).forEach(function (key) {
      if (errs[key]) this.emit('error', new Error('Error ' + key + ': ' + errs[key]));
      if (servers[key]) servers[key].close();
    }, this);
  }
  this.servers = servers;

  Object.keys(servers).forEach(function (key) {
    if (servers[key]) servers[key].on('upgrade', this.handleUpgrade.bind(this));
  }, this);

  this.emit('listening', servers);
};

//
// TODO: make this accept a callback
//
Server.prototype.close = function () {
  return Object.keys(this.servers)
    .forEach(function (key) {
      this.servers[key].close();
    }, this);
}
