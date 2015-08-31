var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var maze = require('./maze');
var constants = require('../constants');

var port = 8010;
var con = console;

var game = maze();

var connections = [];
var games = [];

io.on('connection', function(socket){
  var connectionID = socket.conn.id;
  var playerIndex = -1;
  var gameID = null;

  con.log('a user connected', connectionID);

  var colour = {r: col(), g: col(), b: col()};
  function col() {
    return Math.round(Math.random() * 255);
  }
  function getGame() {
    return {
      games: games,
      game: games[gameID],
      player: {colour: colour, index: playerIndex},
    };
  };
  function getRoom(id) {
    return "game_" + id;
  }



  function getPlayerStart() {
    var startPosition = {};
    switch(playerIndex) {
      case 0 : startPosition = {x: constants.block * 2, y: constants.block * 2}; break;
      case 1 : startPosition = {x: constants.sw - constants.block * 2 , y: constants.block * 2}; break;
      case 2 : startPosition = {x: constants.sw - constants.block * 2 , y: constants.sh - constants.block * 2}; break;
      case 3 : startPosition = {x: constants.block * 2 , y: constants.sh - constants.block * 2}; break;
    }
    return startPosition;
  }










  function addPlayer() {
    if (games[gameID]) {
      if (games[gameID].players.indexOf(connectionID) == -1) {
        games[gameID].players.push(connectionID);
        playerIndex = games[gameID].players.indexOf(connectionID);
        games[gameID].positions[playerIndex] = getPlayerStart();

      } else {
        con.log("addPlayer player already in game", gameID);
      }
    } else {
      con.log("addPlayer no game defined - gameID:", gameID);
    }

  }

  function removePlayer() {
    if (games[gameID]) {
      var index = games[gameID].players.indexOf(connectionID);
      if (index == -1) {
        con.log("removePlayer player not in game", gameID);
      } else {
        games[gameID].players.splice(index, 1);

        if (games[gameID].players.length == 0) {
          con.log("everyone has left the game")
          games.splice(gameID, 1);
        }

      }
    } else {
      con.log("removePlayer no game defined - gameID:", gameID);
    }
  }


  connections.push(connectionID);

  socket.emit('welcome', {
    id: connectionID,
    games: games
  });


  socket.on('new_game', function(params){
    gameID = games.length;
    var room = getRoom(gameID);
    con.log("new_game creating", gameID);
    game.init(function(labyrinth) {
      con.log("new_game created", room, labyrinth.length);
      games[gameID] = {
        id: gameID,
        colour: {r: col(), g: col(), b: col()},
        maze: labyrinth,
        room: room,
        maxPlayers: params.players,
        players: [],
        positions: []
      };
      addPlayer();

      socket.join(room);
      io.to(room).emit('game_created', getGame());
    });
  });

  socket.on('join_game', function(id){
    gameID = id;
    con.log("join_game", gameID);
    var room = getRoom(gameID);
    addPlayer();
    socket.join(room);
    io.to(room).emit('game_joined', getGame());
  });

  socket.on('chat_message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat_message', msg);
    // socket.broadcast.to(id).emit('my message', msg);
  });

  socket.on('moved', function(move){
    con.log("moved", move, playerIndex);
    // var room = getRoom(move.gameID);
    var room = getRoom(gameID);

    games[gameID].positions[playerIndex] = {
      playerID: connectionID,
      position: move.position,
      colour: colour
    }

    io.to(room).emit('moved', {
      positions: games[move.gameID].positions
      // position: move.position,
      // colour: colour,
      // id: connectionID,
      // playerIndex: playerIndex
    });
  });

  socket.on('disconnect', function(){
    console.log('user disconnected', connectionID);
    removePlayer();
    connections.splice(connections.indexOf(connectionID), 1);
    connectionID = null;

    var room = getRoom(gameID);

    io.to(room).emit('game_changed', getGame());

  });

});








// con.log("constants", constants);

app.use(express.static(__dirname + '/../client'));
app.get('/', function(req, res){
  res.sendFile(req.path, {root: "../client/"});
}).get('/constants.js', function(req, res){
  res.sendFile(req.path, {root: __dirname + "/../"});
}).get('*.js', function(req, res){
  res.sendFile(req.path, {root: "../client/"});
}).get('/status/:type?', function(req, res){
  con.log("type", req.params);
  var response = {};
  switch (req.params.type) {
    case "connections" : response.connections = connections; break;
    case "games" : response.games = games; break;
    default : response = {connections: connections, games: games}; break;
  }
  if (response.games) { var i = 0; while(response.games[i]) { response.games[i++].maze = "maze-blanked"; }; }
  res.end(JSON.stringify(response));
});

http.listen(port, function(){ console.log('listening on port:', port); });

