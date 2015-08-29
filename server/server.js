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
  var playerIndex = connections.length;

  con.log('a user connected', playerIndex, connectionID);

  var colour = "rgba(" + [col(), col(), col(), 1] + ")";
  function col() { return Math.round(Math.random() * 255); }

  connections[playerIndex] = {
    id: connectionID,
    index: playerIndex
  }

  socket.emit('welcome', {
    id: connectionID,
    index: playerIndex,
    games: games
  });


  socket.on('new_game', function(params){

    var gameID = games.length;
    var room = "game_" + gameID;

    con.log("new_game creating", gameID);

    game.init(function(labyrinth) {

      con.log("new_game created", room, gameID, labyrinth.length);

      games[gameID] = {
        id: gameID,
        maze: labyrinth,
        room: room,
        players: params.players,
      };

      socket.join(room);

      io.to(room).emit('game_created', {
        games: games,
        game: games[gameID],
        player: {colour: colour, index: playerIndex},
      });

    });

  });

  socket.on('join_game', function(gameID){
    con.log("join_game", gameID);

    var room = "game_" + gameID;

    socket.join(room);

    io.to(room).emit('game_joined', {
      games: games,
      game: games[gameID],
      player: {colour: colour, index: playerIndex},
    });

    // socket.emit('game_joined', {
    //   games: games,
    //   game: games[gameID],
    //   player: { colour: colour, index: playerIndex },
    // });

  });


  socket.on('disconnect', function(){
    console.log('user disconnected', playerIndex);
    connections[playerIndex] = null;
  });

  socket.on('chat_message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat_message', msg);
  });


  socket.on('moved', function(move){
    var gameID = move.gameID;
    var position = move.position;
    var room = "game_" + gameID;
    console.log('moved:', move, room);
    io.to(room).emit('moved', {
      position: position,
      colour: colour,
      id: connectionID,
      playerIndex: playerIndex
    });
  });
    // socket.broadcast.to(id).emit('my message', msg);



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
  res.end(JSON.stringify(response));
});

http.listen(port, function(){ console.log('listening on port:', port); });

