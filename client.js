var con = console;

var isInteracting = false;

var unit = 10;
var cols = constants.cols;
var rows = constants.rows;
var sw = unit * cols, sh = unit * rows;
var canvas = document.getElementById("c")
canvas.width = sw;
canvas.height = sh;
var ctx = canvas.getContext("2d");

function log(msg) {
  document.getElementById("output").innerHTML = msg;
}

function drawMaze(labyrinth) {
  ctx.clearRect(0, 0, sw, sh);
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      if (labyrinth[y][x] === "#") {
        var rgb = 240;
        ctx.fillStyle = "rgba(" + rgb + "," + rgb + "," + rgb + ",1)";
        ctx.fillRect(x * unit, y * unit, unit, unit);
      }
    }
  }
}

function listen(target, eventNames, callback) {
  for (var i = 0; i < eventNames.length; i++) {
    target.addEventListener(eventNames[i], callback);
  }
}

listen(canvas, ["mousedown", "touchstart"], function(e) {
  e.preventDefault();
  isInteracting = true;
});
listen(canvas, ["mousemove", "touchmove"], function(e) {
  e.preventDefault();
  if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
  draw(e);
});
listen(canvas, ["mouseup", "touchend"], function(e) {
  e.preventDefault();
  isInteracting = false;
});
listen(document.getElementById("send"), ["click"], function(e) {
  socket.emit('chat message', document.getElementById("m").value);
  document.getElementById("m").value = "";
});


function draw(e) {
  if (isInteracting) {
    var x = e.clientX, y = e.clientY;
    socket.emit('drawn', {x: x, y: y});
  }
}
function msg(msg) {
  document.getElementById("messages").innerHTML += msg + "<br>";
}

var socket = io();

socket.on('welcome', function(msg) {
  con.log("welcome", msg);
  drawMaze(msg.maze);
});
socket.on('chat message', msg);
socket.on('drawn', function(msg){
  var p = 10;
  ctx.fillStyle = msg.colour;
  ctx.fillRect(msg.x - p / 2, msg.y - p / 2, p, p);
});
