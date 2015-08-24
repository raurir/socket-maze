var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 8010;
var connections = {};

io.on('connection', function(socket){
  var id = socket.conn.id;
  var colour = "rgba(" + [col(), col(), col(), 1] + ")";
  function col() { return Math.round(Math.random() * 255); }

  connections[id] = {
    name: id,
    colour: colour
  }

  socket.emit('welcome', connections[id]);

  console.log('a user connected', id);

  // socket.broadcast.emit('hi');

  socket.on('disconnect', function(){
    console.log('user disconnected', id);
    connections[id] = null;
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('drawn', function(msg){
    // console.log('drawn:', id, colour);
    msg.colour = colour;
    io.emit('drawn', msg);
  });

});

app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
});

http.listen(port, function(){
  console.log('listening on port:', port);
});