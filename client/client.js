var con = console;

var block = 10;
var cursor = block;/// 2;
var cols = constants.cols;
var rows = constants.rows;
var sw = block * cols, sh = block * rows;
var canvas = document.getElementById("c")
canvas.width = sw;
canvas.height = sh;
var ctx = canvas.getContext("2d");
var labyrinth = null;
var labyrinthCanvas = null;

var playerPositions = [];
var playerIndex = 0;
var isInteracting = false;
var keysDown = { up: false, down: false, left: false, right: false};
var position = {x: 0, y: 0};
var lastPosition;


function log(msg) {
  document.getElementById("output").innerHTML = msg;
}

function listen(target, eventNames, callback) {
  for (var i = 0; i < eventNames.length; i++) {
    target.addEventListener(eventNames[i], callback);
  }
}

function initListeners() {
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

  listen(window, ["keydown", "keyup"], function(e) {
    var pressed = e.type === "keydown";
    switch (e.which) {
      case 37 : case 100 : keysDown.left = pressed; break;
      case 38 : case 104 : keysDown.up = pressed; break;
      case 39 : case 102 : keysDown.right = pressed; break;
      case 40 : case 98 : keysDown.down = pressed; break;
    }
    // con.log(e.which, pressed);
  });
  /*
  if (window.DeviceOrientationEvent) {
    listen(window, ["deviceorientation"], function () {
      tilt(event.beta, event.gamma);
    }, true);
  } else if (window.DeviceMotionEvent) {
    listen(window, ['devicemotion'], function () {
      tilt(event.acceleration.x * 2, event.acceleration.y * 2);
    }, true);
  } else {
    listen(window, ["MozOrientation"], function () {
      tilt(orientation.x * 50, orientation.y * 50);
    }, true);
  }
  */
};




function drawMaze() {
  var canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  var ctx = canvas.getContext("2d");
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      if (labyrinth[y][x] === "#") {
        var rgb = 240;
        ctx.fillStyle = "rgba(" + rgb + "," + rgb + "," + rgb + ",1)";
        ctx.fillRect(x * block, y * block, block, block);
      }
    }
  }
  return canvas;
}


function tilt(y, x) {
  position.x += x;
  position.y += y;
};

function render() {

  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(labyrinthCanvas, 0, 0);

  var keyMovement = 1;

  var newPosition = {
    x: position.x,
    y: position.y
  }

  var positionIndexMin = {
    x: Math.round((newPosition.x) / block),
    y: Math.round((newPosition.y) / block)
  }

  ctx.fillStyle = "red"
  ctx.fillRect(positionIndexMin.x * block, positionIndexMin.y * block, block, block);


  var directionsOk = {up: true, right: true, down: true, left: true};

  if (labyrinth[ positionIndexMin.y - 1 ][ positionIndexMin.x ] === "#") {
    directionsOk.up = false; // upper is full
  }
  if (labyrinth[ positionIndexMin.y + 1 ][ positionIndexMin.x ] === "#") {
    directionsOk.down = false; // lower is full
  }
  if (labyrinth[ positionIndexMin.y ][ positionIndexMin.x - 1] === "#") {
    directionsOk.left = false; // left is full
  }
  if (labyrinth[ positionIndexMin.y ][ positionIndexMin.x + 1] === "#") {
    directionsOk.right = false; // right is full
  }


  if (keysDown.left && directionsOk.left) newPosition.x -= keyMovement;
  if (keysDown.right && directionsOk.right) newPosition.x += keyMovement;
  if (keysDown.up && directionsOk.up) newPosition.y -= keyMovement;
  if (keysDown.down && directionsOk.down) newPosition.y += keyMovement;

  position.x = newPosition.x;
  position.y = newPosition.y;

  if (position.x != lastPosition.x || position.y != lastPosition.y) {
    sockets.move(position);
  }

  lastPosition.x = position.x;
  lastPosition.y = position.y;

  // output.innerHTML = ['tilt', Math.round(x * 100), Math.round(y * 100)];

  for (var i = 0; i < playerPositions.length; i++) {
    var player = playerPositions[i];
    if (player) {
      // con.log("playerPositions[i];", playerPositions[i] )

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(player.position.x, player.position.y, cursor, cursor);
      ctx.fillStyle = player.colour;
      ctx.fillRect(player.position.x, player.position.y, 1, 1);
    }
  };

  requestAnimationFrame(render);
}


function draw(e) {
  if (isInteracting) {
    var x = e.clientX, y = e.clientY;
    socket.emit('drawn', {x: x, y: y});
  }
}
function msg(msg) {
  document.getElementById("messages").innerHTML += msg + "<br>";
}

function setPlayer(playerData) {
  msg("Welcome player: " + playerData.playerIndex);
  var index = playerData.playerIndex % 4;
  switch(index) {
    case 0 : position = {x: block * 1.5, y: block * 1.5}; break;
    case 1 : position = {x: sw - block * 1.5 , y: block * 1.5}; break;
    case 2 : position = {x: sw - block * 1.5 , y: sh - block * 1.5}; break;
    case 3 : position = {x: block * 1.5 , y: sh - block * 1.5}; break;
  }
  lastPosition = {x: position.x, y: position.y};

  // playerPositions[playerData.playerIndex] = playerData;

  con.log("setPlayer", position, playerData);
}


sockets = sockets({
  onWelcome: function(welcomeMessage) {
    con.log("welcomeMessage", welcomeMessage);
    labyrinth = welcomeMessage.maze;
    labyrinthCanvas = drawMaze();
    setPlayer(welcomeMessage);
    initListeners();
    render();
  },
  onMessage: msg,
  onMove: function(playerMove){
    // con.log("moved", msg);
    playerPositions[playerMove.playerIndex] = playerMove;
  }
});


