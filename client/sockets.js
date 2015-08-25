var sockets = function(callbacks) {
  var socket = io();

  socket.on('welcome', callbacks.onWelcome);

  socket.on('chat message', callbacks.onMessage);

  // socket.on('drawn', function(msg){
  //   var p = 10;
  //   ctx.fillStyle = msg.colour;
  //   ctx.fillRect(msg.x - p / 2, msg.y - p / 2, p, p);
  // });

  socket.on('moved', callbacks.onMove);

  return {
    move: function(position) {
      socket.emit('moved', position);
    }
  }

}