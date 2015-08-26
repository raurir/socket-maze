var con = console;

function el(id) {
  return document.getElementById(id);
}

function log(msg) {
  el("output").innerHTML = msg;
}

function listen(target, eventNames, callback) {
  for (var i = 0; i < eventNames.length; i++) {
    target.addEventListener(eventNames[i], callback);
  }
}

var userInput = "tilt";

var block = 20;
var cursor = block / 2;
var cols = constants.cols;
var rows = constants.rows;
var sw = block * cols, sh = block * rows;
var canvas = el("c")
canvas.width = sw;
canvas.height = sh;
// canvas.style.width = canvas.style.height = sw * 10 + "px";
var ctx = canvas.getContext("2d");

var startPosition = {};
var playerPositions = [];
var playerIndex = 0;
var isInteracting = false;
var keysDown = { up: false, down: false, left: false, right: false};
var position = {x: 0, y: 0};
var lastPosition;

var tiltTolerance = 5;
var tiltSpeed = 0.2;

var mask = [];


function tilt(y, x) {
  if (userInput == "keyboard") return;
  keysDown.left = (x < tiltTolerance ? -x : 0) * tiltSpeed;
  keysDown.right =( x > tiltTolerance ? x : 0) * tiltSpeed;
  keysDown.up = (y < tiltTolerance ? -y : 0) * tiltSpeed;
  keysDown.down =( y > tiltTolerance ? y : 0) * tiltSpeed;
};


function checkPosition(pos) {

  function error(y, x) { view.error("red", x, y, 1, 1); }
  function good(y, x) { view.error("yellow", x, y, 1, 1); }

  function checkRow(x, y) {
    var ok = true;
    for (var i = 0; i < cursor; i++) {
      if (mask[y][x + i]) { ok = false; error(y, x + i); } else { good(y, x + i); }
    };
    return ok;
  }

  function checkCol(x, y) {
    var ok = true;
    for (var i = 0; i < cursor; i++) {
      if (mask[y + i][x]) { ok = false; error(y + i, x); } else { good(y + i, x); }
    };
    return ok;
  }

  return {
    up: checkRow(pos.x, pos.y - 1),
    down: checkRow(pos.x, pos.y + cursor),
    left: checkCol(pos.x - 1, pos.y),
    right: checkCol(pos.x + cursor, pos.y),
  }
}

function render() {

  view.render();

  var directionsOk = checkPosition({x: Math.round(position.x), y: Math.round(position.y)});

  var newPosition = {
    x: position.x,
    y: position.y
  }

  // var keyMovement = 1;

  if (keysDown.left && directionsOk.left) newPosition.x -= keysDown.left;
  if (keysDown.right && directionsOk.right) newPosition.x += keysDown.right;
  if (keysDown.up && directionsOk.up) newPosition.y -= keysDown.up;
  if (keysDown.down && directionsOk.down) newPosition.y += keysDown.down;

  // output.innerHTML = [keysDown.left, directionsOk.left];

  position.x = Math.round(newPosition.x);
  position.y = Math.round(newPosition.y);

  if (position.x != lastPosition.x || position.y != lastPosition.y) {
    sockets.move(position);
  }

  lastPosition.x = position.x;
  lastPosition.y = position.y;



  requestAnimationFrame(render);
}


function draw(e) {
  if (isInteracting) {
    var x = e.clientX, y = e.clientY;
    socket.emit('drawn', {x: x, y: y});
  }
}
function msg(msg) {
  el("messages").innerHTML += msg + "<br>";
}

function setPlayer(playerData) {
  msg("Welcome player: " + playerData.playerIndex);
  var index = playerData.playerIndex % 4;
  switch(index) {
    // case 0 : position = {x: block * 1.5, y: block * 1.5}; break;
    // case 1 : position = {x: sw - block * 1.5 , y: block * 1.5}; break;
    // case 2 : position = {x: sw - block * 1.5 , y: sh - block * 1.5}; break;
    // case 3 : position = {x: block * 1.5 , y: sh - block * 1.5}; break;
    case 0 : startPosition = {x: block * 2, y: block * 2}; break;
    case 1 : startPosition = {x: sw - block * 2 , y: block * 2}; break;
    case 2 : startPosition = {x: sw - block * 2 , y: sh - block * 2}; break;
    case 3 : startPosition = {x: block * 2 , y: sh - block * 2}; break;

  }
  position = {x: startPosition.x, y: startPosition.y};
  lastPosition = {x: startPosition.x, y: startPosition.y};

  checkPosition(position);

  // playerPositions[playerData.playerIndex] = playerData;

  con.log("setPlayer", position, playerData);
}


interface = interface();
view = view(sw, sh, block, cursor);

sockets = sockets({
  onWelcome: function(welcomeMessage) {
    con.log("welcomeMessage", welcomeMessage);

    mask = view.init(welcomeMessage.maze);
    setPlayer(welcomeMessage);
    interface.init();
    render();
  },
  onMessage: msg,
  onMove: function(playerMove){
    // con.log("moved", msg);
    playerPositions[playerMove.playerIndex] = playerMove;
  }
});


