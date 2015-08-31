var view = function() {

var canvas = el("c")
canvas.width = sw;
canvas.height = sh;
// canvas.style.width = canvas.style.height = sw * 10 + "px";
var ctx = canvas.getContext("2d");
var labyrinthCanvas = null;

var mask = [];

function log(msg) {
  el("output").innerHTML = msg;
}
function msg(msg) {
  el("messages").innerHTML += msg + "<br>";
}

function init(game) {
  con.log("init", game);
  drawStatus(game);
  pixelMask(game.maze);
  drawMaze(game.colour);
  return mask;
}

function drawStatus(game) {
  var msg = [];
  for (var i = 0; i < game.players.length; i++) {
    msg.push(i + ":" + game.players[i]);
  };
  el("game-status").innerHTML = msg.join("<br>");
}

function pixelMask(labyrinth) {
  con.log("pixelMask", labyrinth);
  for (var y = 0; y < sh; y++) {
    mask[y] = [];
    for (var x = 0; x < sw; x++) {
      var xi = Math.floor(x / constants.block);
      var yi = Math.floor(y / constants.block);
      mask[y][x] = labyrinth[yi][xi] === "#";
    }
  }
}


function drawMaze(colour) {
  labyrinthCanvas = document.createElement("canvas");
  labyrinthCanvas.width = sw;
  labyrinthCanvas.height = sh;
  var ctx = labyrinthCanvas.getContext("2d");

  for (var y = 0; y < sh; y++) {
    for (var x = 0; x < sw; x++) {
      // mask.push( labyrinth[yi][xi] === "#" );
      var a = Math.random() * 0.5 + (mask[y][x] ? 0.1 : 0.5);
      ctx.fillStyle = "rgba(" + [colour.r, colour.g, colour.b, a] + ")";
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

  // con.log("playerPositions[i];", playerPositions);

  for (var i = 0; i < playerPositions.length; i++) {
    var position = playerPositions[i];
    if (position) {

      // con.log("view render", position);
      // ctx.fillStyle = "rgba(0,0,0,0.5)";
      // ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
      // var r = player.colour.r, g = player.colour.g, b = player.colour.b;
      var r = g = b = 100;
      ctx.fillStyle = "rgba(" + [r, g, b, 1] + ")";
      ctx.fillRect(position.x, position.y, cursor, cursor);
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