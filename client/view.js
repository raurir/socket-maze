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

function init(game, callback) {
  con.log("init", game);
  drawStatus(game);
  pixelMask(game.maze);
  drawMaze(game.colour, callback);
}

function drawStatus(game) {
  var msg = [];
  for (var i = 0; i < game.players.length; i++) {
    msg.push(i + ": " + game.players[i].id);
  };
  el("game-status").innerHTML = msg.join("<br>");
}

function pixelMask(labyrinth) {
  // con.log("pixelMask", labyrinth);
  for (var y = 0; y < sh; y++) {
    mask[y] = [];
    for (var x = 0; x < sw; x++) {
      var xi = Math.floor(x / constants.block);
      var yi = Math.floor(y / constants.block);
      mask[y][x] = labyrinth[yi][xi] === "#";
    }
  }
}


function drawMaze(colour, callback) {
  var st = new Date().getTime();

  labyrinthCanvas = document.createElement("canvas");
  labyrinthCanvas.width = sw;
  labyrinthCanvas.height = sh;
  var labCtx = labyrinthCanvas.getContext("2d");

  var rows = sh, row = 0;

  function drawRow(y) {
    // con.log("drawRow", y);
    for (var x = 0; x < sw; x++) {
      drawBlock(x, y);
    }
    row++;
    if (row < rows) {
      setTimeout(function() {
        drawRow(row);
        ctx.drawImage(labyrinthCanvas, 0, 0);
      }, 10);
    } else {
      var et = new Date().getTime();
      view.msg("proc time: " + (et - st) + " calculations: " + (sw * sh));
      callback(mask);
    }
  }

  function drawBlock(x, y) {
    var a = Math.random() * 0.3 + (mask[y][x] ? 0.6 : 0.2);
    labCtx.fillStyle = "rgb(" + [Math.round(colour.r * a), Math.round(colour.g * a), Math.round(colour.b * a)] + ")";
    labCtx.fillRect(x, y, 1, 1);
  }

  drawRow(row);

}

function error(colour, x, y, w, h) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}


function render(time, playerPositions) {
  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(labyrinthCanvas, 0, 0);
  renderPlayers(time, playerPositions);
}

function renderPlayers(time, playerPositions) {
  for (var i = 0, il = playerPositions.length; i < il; i++) {
    var player = playerPositions[i];
    // con.log("view render", position);
    // ctx.fillStyle = "rgba(0,0,0,0.5)";
    // ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
    var r = player.colour.r, g = player.colour.g, b = player.colour.b;
    // var r = g = b = 100;
    ctx.fillStyle = "rgba(" + [r, g, b, 1] + ")";
    ctx.fillRect(player.position.x, player.position.y, cursor, cursor);

    var circleRads = Math.PI * 2;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(player.position.x + cursor / 2, player.position.y + cursor / 2, pingSize, 0, circleRads, false);
    ctx.closePath();
    ctx.stroke();

  };
  // ping is no longer a ping :)
  if (time - pingTriggerTime > 1000) {
    pingSize = 5;
    pingTriggerTime = time;
  }
  pingSize += 2;
  // pingSize -= pingSize * 0.1;
  // pingSize = ((Math.sin(time * 0.001) + 1) * sw / 2) + 1;
}

var pingSize = 0;
var pingTriggerTime = 0;
function playerPing(pingDetails) {
  con.log('ping');
  // pingSize = 100;
}

return {
  error: error,
  init: init,
  log: log,
  msg: msg,
  playerPing: playerPing,
  render: render,
  renderPlayers: renderPlayers,
}


};