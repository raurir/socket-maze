var controller = function(view) {

var position, lastPosition;

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

    if (Math.random() > 0.99) {
      sockets.ping(gameID, {type: "flash"});
    }
  }

  
  // view.renderPlayers([{position: position, id: 3, colour: {r: 30, g: 30, b: 200}}]);
  

  lastPosition.x = position.x;
  lastPosition.y = position.y;

}

var currentGameID = null;

function init(gameData, _mask) {

  if (currentGameID === gameData.game.id) {
    return con.log("controller.init - already joined");
  };

  mask = _mask;

  var playerIndex = gameData.player.index;
  view.msg("Welcome player: " + playerIndex);

  con.log("controller.init - gameData:", gameData);

  var pos = gameData.game.players[playerIndex].position;

  position = {x: pos.x, y: pos.y};
  lastPosition = {x: pos.x, y: pos.y};

  checkPosition(position);

  sockets.move(gameID, position);

  // playerPositions[playerData.index] = playerData;

  currentGameID = gameData.game.id;
}


return {
  calc: calc,
  init: init,
}


}