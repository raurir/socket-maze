function el(id) {
  return document.getElementById(id);
}

var con = console;

var cursor = constants.block / 2;
var sw = constants.sw, sh = constants.sh;

var playerPositions = [];
var keysDown = { up: false, down: false, left: false, right: false};

var games = [];
var gameID = null;
var gameRunning = false;

function listen(target, eventNames, callback) {
  for (var i = 0; i < eventNames.length; i++) {
    target.addEventListener(eventNames[i], callback);
  }
}

function remove(target, eventNames, callback) {
  for (var i = 0; i < eventNames.length; i++) {
    target.removeEventListener(eventNames[i], callback);
  }
}

function gameReady(res) {
  var mask = view.init(res.game);
  gameID = res.game.id;
  controller.init(res, mask);
  gameRunning = true;
}

function gameLoop() {
  if (gameRunning) {
    view.render(playerPositions);
    controller.calc(gameID);
  }
  requestAnimationFrame(gameLoop);
}

view = view();
overlay = overlay();
userInput = userInput();
userInput.init();
controller = controller(view);

sockets = sockets({
  onWelcome: function(res) {
    con.log("onWelcome", res);
    games = res.games;
    gameLoop();
  },

  onGameCreated: function(res) {
    con.log("onGameCreated", res);
    gameReady(res);
  },

  onGameJoined: function(res) {
    con.log('onGameJoined', res);
    gameReady(res);
  },

  onGameChanged: function(res) {
    con.log('onGameChanged', res);
    gameReady(res);
  },

  onMessage: view.msg,
  onMove: function(playerMove){
    // con.log("onMove", playerMove);
    // con.log("moved", msg);
    // playerPositions[playerMove.playerIndex] = playerMove;
    playerPositions = playerMove.positions;
  }
});


