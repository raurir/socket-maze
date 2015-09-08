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
    var pos = {};
    con.log("getPlayerStart", playerIndex);
    var offset = constants.cursor / 2;
    switch(playerIndex) {
      case 0 : pos = {x: -offset + constants.block * 2, y: -offset + constants.block * 2}; break;
      case 1 : pos = {x: -offset + constants.sw - constants.block * 2 , y: -offset + constants.block * 2}; break;
      case 2 : pos = {x: -offset + constants.sw - constants.block * 2 , y: -offset + constants.sh - constants.block * 2}; break;
      case 3 : pos = {x: -offset + constants.block * 2 , y: -offset + constants.sh - constants.block * 2}; break;
    }
    return pos;
  }










  function addPlayer() {
    if (games[gameID]) {
      if (games[gameID].playerIndexes.indexOf(connectionID) == -1) {
        games[gameID].playerIndexes.push(connectionID);
        playerIndex = games[gameID].playerIndexes.indexOf(connectionID);

        games[gameID].players[playerIndex] = {
          id: connectionID,
          position: getPlayerStart(),
          colour: colour
        }

      } else {
        con.log("addPlayer player already in game", gameID);
      }
    } else {
      con.log("addPlayer no game defined - gameID:", gameID);
    }

  }

  function removePlayer() {
    if (games[gameID]) {
      var index = games[gameID].playerIndexes.indexOf(connectionID);
      if (index == -1) {
        con.log("removePlayer player not in game", gameID);
      } else {
        games[gameID].playerIndexes.splice(index, 1);
        games[gameID].players.splice(index, 1);
        con.log("removePlayer", index);
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
        playerIndexes: []
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
    // con.log("moved", move, playerIndex);
    // var room = getRoom(move.gameID);
    var room = getRoom(gameID);

    games[gameID].players[playerIndex] = {
      id: connectionID,
      position: move.position,
      colour: colour
    };
    games[gameID].playerIndexes[playerIndex] = connectionID;

    io.to(room).emit('moved', {
      players: games[move.gameID].players
      // position: move.position,
      // colour: colour,
      // id: connectionID,
      // playerIndex: playerIndex
    });
  });

  socket.on('player_ping', function(pingDetails){
    var room = getRoom(gameID);
    io.to(room).emit('player_pinged', pingDetails);
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
}).get('*.css', function(req, res){
  res.sendFile(req.path, {root: "../client/"});
}).get('/status/:type?', function(req, res){

  function clone(a) { return JSON.parse(JSON.stringify(a));}

  var response = {};
  switch (req.params.type) {
    case "connections" : response.connections = clone(connections); break;
    case "games" : response.games = games; break;
    default : response = {connections: clone(connections), games: clone(games)}; break;
  }
  // if (response.games) { var i = 0; while(response.games[i]) { response.games[i++].maze = "maze-blanked"; }; }
  res.end(JSON.stringify(response));
});

http.listen(port, function(){ console.log('listening on port:', port); });

