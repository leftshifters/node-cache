
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , nodeCache = require('../lib/main');

var app = express();

nodeCache.setup('google.com', 80, 3600000000, function(url, body) {
  var ret = { url: url, body: body };
  switch(url) {
    case '/events/Latest':
      ret.body.userid = '';
      ret.body.longitude = Math.round(ret.body.longitude);
      ret.body.latitude = Math.round(ret.body.latitude);
      break;
    default:
  }
  return ret;
});

app.configure(function(){
  app.set('port', process.env.PORT || 3010);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('*', nodeCache.process);
app.post('*', nodeCache.process);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
