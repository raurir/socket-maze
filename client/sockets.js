var sockets = function(callbacks) {
  var socket = io();

  socket.on('welcome', callbacks.onWelcome);
  socket.on('chat_message', callbacks.onMessage);
  socket.on('moved', callbacks.onMove);
  socket.on('game_created', callbacks.onGameCreated);
  socket.on('game_joined', callbacks.onGameJoined);
  socket.on('game_changed', callbacks.onGameChanged);
  socket.on('player_pinged', callbacks.onPlayerPing);

  return {
    move: function(gameID, position) {
      var p = {gameID: gameID, position: position};
      // con.log(p);
      socket.emit('moved', p);
    },
    chat: function(msg) {
      socket.emit('chat_message', msg);
    },
    newGame: function() {
      socket.emit('new_game', {});
    },
    joinGame: function(gameID) {
      // con.log("sockets.joinGame", gameID);
      socket.emit('join_game', gameID);
    },
    ping: function(pingDetails) {
      con.log("emitting... ");
      socket.emit('player_ping', pingDetails);
    }
  }

}