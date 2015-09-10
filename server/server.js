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
var gameEmitTimes = [];

var maxEmits = 1000 / 2;

var colour = function() {
  function col() { return Math.round(100 + Math.random() * 155); };
  return {r: col(), g: col(), b: col()};
}


function getRoom(id) {
  return "game_" + id;
}


function removePlayer(gameID, connectionID) {
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
        gameEmitTimes.splice(gameID, 1);
      }

    }
  } else {
    con.log("removePlayer no game defined - gameID:", gameID);
  }
}

function getPlayerStart(playerIndex) {
  var pos = {};
  var offset = constants.cursor / 2;
  switch(playerIndex % 4) {
    case 0 : pos = {x: -offset + constants.block * 2, y: -offset + constants.block * 2}; break;
    case 1 : pos = {x: -offset + constants.sw - constants.block * 2 , y: -offset + constants.block * 2}; break;
    case 2 : pos = {x: -offset + constants.sw - constants.block * 2 , y: -offset + constants.sh - constants.block * 2}; break;
    case 3 : pos = {x: -offset + constants.block * 2 , y: -offset + constants.sh - constants.block * 2}; break;
  }
  con.log("getPlayerStart", playerIndex, pos);
  return pos;
}




function checkIntervals() {
  var now = new Date().getTime();
  for (var i = 0, il = gameEmitTimes.length; i < il; i++) {
    var emitTime = now - gameEmitTimes[i];
    if (emitTime > maxEmits) {
      con.log("should ping this game", emitTime, maxEmits, i);
      var room = getRoom(i);
      io.to(room).emit('moved', {
        players: games[i].players
      });
      gameEmitTimes[i] = now;
    }
  };
    // con.log("ok!", emitTime);
}

setInterval(checkIntervals, 500);


io.on('connection', function(socket){
  var connectionID = socket.conn.id;
  var playerIndex = -1;
  var gameID = null;

  con.log('a user connected', connectionID);

  var playerColour = colour();


  con.log('a user connected', connectionID);
  var address = socket.handshake.address;
  console.log("New connection from " + address);

  // con.log("----------");
  // con.log(socket.handshake);
  // con.log("----------");

  function addPlayer(gameID, connectionID) {
    if (games[gameID]) {
      if (games[gameID].playerIndexes.indexOf(connectionID) == -1) {
        games[gameID].playerIndexes.push(connectionID);
        playerIndex = games[gameID].playerIndexes.indexOf(connectionID);

        games[gameID].players[playerIndex] = {
          id: connectionID,
          position: getPlayerStart(playerIndex),
          colour: colour()
        }

      } else {
        con.log("addPlayer player already in game", gameID);
      }
    } else {
      con.log("addPlayer no game defined - gameID:", gameID);
    }

  }











  function getGame() {
    return {
      games: games,
      game: games[gameID],
      player: {colour: playerColour, index: playerIndex},
    };
  };

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
        colour: colour(),
        maze: labyrinth,
        room: room,
        maxPlayers: params.players,
        players: [],
        playerIndexes: []
      };
      addPlayer(gameID, connectionID);

      gameEmitTimes[gameID] = new Date().getTime();

      socket.join(room);
      io.to(room).emit('game_created', getGame());
    });
  });

  socket.on('join_game', function(id){
    gameID = id;
    con.log("join_game", gameID);
    var room = getRoom(gameID);
    addPlayer(gameID, connectionID);
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
      colour: playerColour
    };
    games[gameID].playerIndexes[playerIndex] = connectionID;

    var now = new Date().getTime();
    var maxEmits = 1000 / 2;
    var emitTime = now - gameEmitTimes[gameID];
    if (emitTime > maxEmits) {
      io.to(room).emit('moved', {
        players: games[move.gameID].players
      });
      gameEmitTimes[gameID] = now;
      con.log("ok!", emitTime);
    } else {
      con.log("too soon!", emitTime);

    }


  });

  socket.on('player_ping', function(pingDetails){
    var room = getRoom(gameID);
    io.to(room).emit('player_pinged', pingDetails);
  });




  socket.on('disconnect', function(){
    console.log('user disconnected', connectionID);
    removePlayer(gameID, connectionID);
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

