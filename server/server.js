var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var maze = require('./maze');
var constants = require('../constants');

var port = 8050;
var connections = {};
var con = console;

var game = maze();

var players = 0;



game.init(function(labyrinth) {
  con.log("complete labyrinth", labyrinth.length);
  // drawMaze(labyrinth);

  io.on('connection', function(socket){
    var id = socket.conn.id;
    var colour = "rgba(" + [col(), col(), col(), 1] + ")";
    function col() { return Math.round(Math.random() * 255); }

    var playerIndex = players;

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

    // socket.on('drawn', function(msg){
    //   // console.log('drawn:', id, colour);
    //   msg.colour = colour;
    //   io.emit('drawn', msg);
    // });


    socket.on('moved', function(position){
      console.log('moved:', position);
      io.emit('moved', {
        position: position,
        colour: colour,
        id: id,
        playerIndex: playerIndex
      });
    });


    players++;

  });














}, constants.cols, constants.rows);

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