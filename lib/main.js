// Node packages which are used
var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');

// External dependencies
var microtime = require('microtime');
var _ = require('underscore');

// Settings
var settings = {
  host: 'google.com',
  port: 80,
  time: 3600000000
  //time: 0
};

// DataSet Object
var _dataSet = function() {
  this.key = '';
  this.data = '';
  this.created = '';
  this.keyHandlerFunction = null;
};

var _cache = {
  _data: {},
  get: function(key, cachedTime) {
    if( _.isEmpty(_cache._data[key]) ) { return false; }
    var dataSet = _cache._data[key];
    if( (microtime.now() - dataSet.created) > cachedTime ) {
      return false;
    }
    return dataSet.data;
  },
  set: function(key, value) {
    var dataSet = new _dataSet();
    dataSet.key = key;
    dataSet.data = value;
    dataSet.created = microtime.now();

    _cache._data[key] = dataSet;
    return true;
  },
  key: function(url, method, params) {
    var paramList = '';
    if( _.isObject(params) ) {
      paramList = querystring.stringify(params);
    } else paramList = params;
    return crypto.createHash('md5').update(url + method + paramList).digest('hex');
  }
}

// Handle Routes
var nodecache = {
  setup: function(host, port, time, keyHandlerFunction) {
    settings.host = host;
    settings.port = port;
    settings.time = time;
    settings.keyHandlerFunction = keyHandlerFunction;
  },
  process: function(req, res) {
    if(req.method == 'POST') {

      var key;
      if( settings.keyHandlerFunction ) {
        var details = settings.keyHandlerFunction(req.originalUrl, req.body);
        key = _cache.key(details.url, req.method, details.body);
      } else {
        key = _cache.key(req.originalUrl, req.method, req.body);
      }
      
      var cachedData = _cache.get(key, settings.time);

      if(cachedData === false) {

        var postData = querystring.stringify(req.body);

        var _options = {
          host: settings.host,
          port: settings.port,
          path: req.originalUrl,
          method: req.method,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
          }
        };
        var _call = http.request(_options, function(_res) {
          _res.setEncoding('utf8');
          var chunks = '';
          _res.on('data', function(chunk) { chunks += chunk; });
          _res.on('end', function() {
            _cache.set(key, chunks);
            res.send(chunks);
          });
        });

        _call.write( postData );
        _call.on('error', function(e) { res.send({ error: e.message }); });

        _call.end();
      } else {
        res.send(cachedData);
      }

    } else {

      var key;
      if( settings.keyHandlerFunction ) {
        var details = settings.keyHandlerFunction(req.originalUrl);
        key = _cache.key(details.url, req.method);
      } else {
        key = _cache.key(req.originalUrl, req.method);
      }
      var cachedData = _cache.get(key, settings.time);

      if(cachedData === false) {
        var _call = http.request({ host: settings.host, port: settings.port, path: req.originalUrl, method: req.method }, function(_res) {
          _res.setEncoding('utf8');
          var chunks = '';
          _res.on('data', function(chunk) { chunks += chunk; });
          _res.on('end', function() {
            _cache.set(key, chunks);
            res.send(chunks);
          });
        });

        _call.on('error', function(e) { res.send({ error: e.message }); });
        _call.end();
      } else {
        res.send(cachedData);
      }

    }
  }
};

module.exports = nodecache;