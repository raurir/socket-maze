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


function init(playerData, _mask) {
  mask = _mask;
  view.msg("Welcome player: " + playerData.index);

  var index = playerData.index % 4;
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

  // playerPositions[playerData.index] = playerData;

  con.log("setPlayer", position, playerData);
}


return {
  calc: calc,
  init: init,

}


}