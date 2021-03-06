var con = console;


function el(id) {
  return document.getElementById(id);
}

var sw = constants.sw, sh = constants.sh, cursor = constants.cursor;;

var playerPositions = [];
var flagPosition = {};
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
  if (gameRunning) return;
  var mask = view.init(res.game, function(mask) {
    gameID = res.game.id;
    controller.init(res, mask);
    gameRunning = true;
  });
}

function gameLoop(t) {
  if (gameRunning) {
    view.render(t, playerPositions, flagPosition);
    controller.calc(gameID);
  }
  requestAnimationFrame(gameLoop);
  // setTimeout(gameLoop, 500);
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
    gameLoop(0);
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
  onMove: function(move){
    // con.log("onMove", move);
    flagPosition = move.flag.position;
    // con.log("moved", msg);
    // playerPositions[playerMove.playerIndex] = playerMove;
    playerPositions = move.players;
  },

  onPlayerPing: function(pingDetails){
    view.playerPing(pingDetails);
  },

});


