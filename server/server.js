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

var players = 0;

var connections = {};
var games = [];

io.on('connection', function(socket){
  var connectionID = socket.conn.id;

  con.log('a user connected', connectionID);

  var colour = "rgba(" + [col(), col(), col(), 1] + ")";
  function col() { return Math.round(Math.random() * 255); }

  var playerIndex = players;

  connections[connectionID] = {
    id: connectionID,
    playerIndex: playerIndex
  }


/*
  connections[id] = {
    name: id,
    colour: colour,
    playerIndex: playerIndex
  }


  socket.emit('welcome', {
    name: connections[id].name,
    colour: colour,
    maze: labyrinth,
    playerIndex: playerIndex
  });
*/

  socket.emit('welcome', {
    id: connectionID,
    games: games
  });


  // socket.broadcast.emit('hi');

  var labyrinth = null;

  socket.on('new_game', function(params){

    var gameID = games.length;

    games[gameID] = {
      id: gameID,
      players: params.players,
    };

    if (labyrinth) {
      con.log("new_game returning existing game", gameID);
      socket.emit('game_created', {
        maze: labyrinth
      });
    } else {
      con.log("initialising game");
      game.init(function(_labyrinth) {
        labyrinth = _labyrinth;
        con.log("new_game created", gameID, labyrinth.length);

        games[gameID].maze = labyrinth;

        socket.emit('game_created', {
          games: games,
          gameID: gameID,
          game: games[gameID],
          maze: labyrinth,
          colour: colour,
          playerIndex: playerIndex,
          players: params.players
        });
      });
    }
  });

  socket.on('join_game', function(gameID){
    con.log("join_game", gameID);

    socket.emit('game_joined', {
      gameID: gameID,
      game: games[gameID]
    });


  });


  socket.on('disconnect', function(){
    console.log('user disconnected', connectionID);
    connections[connectionID] = null;
  });

  socket.on('chat_message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat_message', msg);
  });

  socket.on('moved', function(position){
    // console.log('moved:', position);
    io.emit('moved', {
      position: position,
      colour: colour,
      id: connectionID,
      playerIndex: playerIndex
    });
  });


  players++;

});

















// con.log("constants", constants);

app.use(express.static(__dirname + '/../client'));

app.get('/', function(req, res){
  res.sendFile(req.path, {root: "../client/"});
});
app.get('/constants.js', function(req, res){
  res.sendFile(req.path, {root: __dirname + "/../"});
});
app.get('*.js', function(req, res){
  res.sendFile(req.path, {root: "../client/"});
});

http.listen(port, function(){
  console.log('listening on port:', port);
});