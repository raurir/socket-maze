var controller = function(view) {

var position = {x: 0, y: 0};
var startPosition = {};
var lastPosition;

var mask = null;

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

function calc(gameID) {
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
    sockets.move(gameID, position);
  }

  lastPosition.x = position.x;
  lastPosition.y = position.y;

}


function init(gameData, _mask) {
  var playerData = gameData.
  mask = _mask;
  view.msg("Welcome player: " + playerData.index);

  con.log("controller init - playerData:", playerData);

  return
  position = {x: startPosition.x, y: startPosition.y};
  lastPosition = {x: startPosition.x, y: startPosition.y};

  checkPosition(position);

  sockets.move(gameID, position);

  // playerPositions[playerData.index] = playerData;


}


return {
  calc: calc,
  init: init,

}


}