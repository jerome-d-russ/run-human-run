var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('node_modules'));
app.use(express.static('public'));
app.use(express.static('bower_components/vjoy'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var server;
io.on('connection', function(socket){
  console.log('a user connected: ' + socket.id);
  if(server){
    server.emit('new user', socket.id);
  }
  socket.on('disconnect', function(){
    console.log('disconnect');
    if(server && socket.id == server.id){
      console.log('server disconnect');
      server = null;
    } else {
      if(server){
        server.emit('remove', socket.id);
      }
    }
  });
  socket.on('server', function(msg){
    if(!server){
      console.log('not server!');
      server = socket;
      server.emit('server acknowledge', {});
    } else {
      console.log('else');
    }
  });
  socket.on('move', function(msg){
    if(server){
      msg.id = socket.id;
      server.emit('move', msg);
    }
  });
  socket.on('invalid', function(sId){
    if (io.sockets.sockets[sId]) {
      console.log('disconnecting: ' + sId);
      io.sockets.sockets[sId].disconnect();
    }
  });
});

var port = process.env.sort || 3000;
http.listen(port, function(){
  console.log('listening on port: ' + port);
});
