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
  pixelMask(game.maze);
  drawMaze(game.colour);
  return mask;
}

function pixelMask(labyrinth) {
  con.log("pixelMask", labyrinth);
  for (var y = 0; y < sh; y++) {
    mask[y] = [];
    for (var x = 0; x < sw; x++) {
      var xi = Math.floor(x / block);
      var yi = Math.floor(y / block);
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
    var player = playerPositions[i];
    if (player) {
      
      // ctx.fillStyle = "rgba(0,0,0,0.5)";
      // ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
      ctx.fillStyle = "rgba(" + [player.colour.r, player.colour.g, player.colour.b, 1] + ")";
      ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
    }
  };

}



var overlay = (function() {
  var overlayDiv = el("overlay"), overlayConfirm = el("overlay_confirm");
  var o = {
    callback: function() {
      con.log("original callback - you should override this.");
    },
    selection: null,
    choices: [],
    show: function(options) {
      overlayDiv.style.display = "block";
      o.selection = null;
      o.callback = options.callback;

      function makeButton(i) {
        var b = document.createElement("button");
        b.innerHTML = "Option" + i;
        el("overlay_choices").appendChild(b);
        listen(b, ["click"], function(e) { 
          o.selection = i;
          con.log("this", o.selection);
        });
        o.choices[i] = b;
      }

      for (var i = 0; i < options.choices.length; i++) {
        makeButton(i);
      };
      listen(overlayConfirm, ["click"], o.callback);
    },
    hide: function() { 
      overlayDiv.style.display = "none";
      for (var i = 0; i < o.choices.length; i++) {
        remove(o.choices[i], ["click"], function(i) { o.selection = i; });
      };
      o.choices = [];
      remove(overlayConfirm, ["click"], o.callback);
    }
  }
  return o;
})();


return {
  render: render,
  init: init,
  error: error,
  log: log,
  msg: msg,
  overlay: overlay
}


};