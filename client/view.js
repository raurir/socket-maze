var view = function() {

var canvas = el("c")
canvas.width = sw;
canvas.height = sh;
// canvas.style.width = canvas.style.height = sw * 10 + "px";
var ctx = canvas.getContext("2d");
var labyrinth = null;
var labyrinthCanvas = null;

var mask = [];

function log(msg) {
  el("output").innerHTML = msg;
}
function msg(msg) {
  el("messages").innerHTML += msg + "<br>";
}

function init(_labyrinth) {
  labyrinth = _labyrinth;
  pixelMask();
  drawMaze();
  return mask;
}

function pixelMask() {
  con.log(labyrinth);
  for (var y = 0; y < sh; y++) {
    mask[y] = [];
    for (var x = 0; x < sw; x++) {
      var xi = Math.floor(x / block);
      var yi = Math.floor(y / block);
      mask[y][x] = labyrinth[yi][xi] === "#";
    }
  }
}


function drawMaze() {
  labyrinthCanvas = document.createElement("canvas");
  labyrinthCanvas.width = sw;
  labyrinthCanvas.height = sh;
  var ctx = labyrinthCanvas.getContext("2d");

  for (var y = 0; y < sh; y++) {
    for (var x = 0; x < sw; x++) {
      // mask.push( labyrinth[yi][xi] === "#" );
      var rgb = Math.round(Math.random() * 30 + (mask[y][x] ? 30 : 100));
      ctx.fillStyle = "rgba(" + rgb + "," + rgb + "," + rgb + ",1)";
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function error(colour, x, y, w, h) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}


function render(playerPositions) {

  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(labyrinthCanvas, 0, 0);


  // output.innerHTML = ['tilt', Math.round(x * 100), Math.round(y * 100)];

  for (var i = 0; i < playerPositions.length; i++) {
    var player = playerPositions[i];
    if (player) {
      // con.log("playerPositions[i];", playerPositions[i] )
      // ctx.fillStyle = "rgba(0,0,0,0.5)";
      // ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
      ctx.fillStyle = player.colour;
      ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
    }
  };

}


return {
  render: render,
  init: init,
  error: error,
  log: log,
  msg: msg
}


};