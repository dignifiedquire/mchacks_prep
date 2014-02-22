var Hapi = require('hapi');
var handlebars = require('handlebars');

var port = 3000;

// Create a server with a host and port
var server = Hapi.createServer(3000);


// Setup templating engine
server.views({
  engines: { html: 'handlebars' },
        path: __dirname + '/templates'
})


var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
  if(err) throw err;
  
  var collection = db.collection('mchacks');
  
  function getUser(req, reply) {
    var user = req.params.user;
    collection.find({name: user}, function (err, data) {
      if (err) {
        var error = Hapi.error.badRequest(err);
        return reply(error);
      }
    
      data.toArray(function (err, list) {
        if (list.length === 0) {
          var error = Hapi.error.badRequest(user + ' doesn\t exist.')
          return reply.view('404', error);
        }
        return reply.view('user', list[0]);
      });
    });
  }
  
  function addUser(req, reply) {
    var user = req.payload.name;
    collection.insert({name: user}, function (err) {
      if (err) {
        var error = Hapi.error.badRequest(err);
        return reply.view('404', error);
      }
      return reply().redirect('/users/' + user);
    });
  }
  function listUsers(req, reply) {
    collection.find(function (err, users) {
      if (err) {
        var error = Hapi.error.badRequest(err);
        return reply.view('404', error);
      }      
      users.toArray(function (err, list) {
        reply.view('index', {users: list});  
      })
    });
  }
  server.route({
      method: 'GET',
      path: '/users/{user}',
      handler: getUser
  });
  server.route({
      method: 'POST',
      path: '/users',
      handler: addUser
  });
  server.route({
    method: 'GET',  
    path: '/',
    handler: listUsers
})
  server.start();
  console.log('Started server on localhost:%d', port);
});


