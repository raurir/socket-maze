var sockets = function(callbacks) {
  var socket = io();

  socket.on('welcome', callbacks.onWelcome);

  socket.on('chat message', callbacks.onMessage);

  socket.on('moved', callbacks.onMove);

  return {
    move: function(position) {
      socket.emit('moved', position);
    },
    chat: function(msg) {
      socket.emit('chat message', msg);
    }
  }

}