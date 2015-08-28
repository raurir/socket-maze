function el(id) {
  return document.getElementById(id);
}

var con = console;

var block = 20;
var cursor = block / 2;
var cols = constants.cols;
var rows = constants.rows;
var sw = block * cols, sh = block * rows;

var playerPositions = [];
var keysDown = { up: false, down: false, left: false, right: false};

var games = [];

function gameLoop() {
  view.render(playerPositions);
  controller.calc();
  requestAnimationFrame(gameLoop);
}

userInput = userInput();
userInput.init();
view = view();
controller = controller(view);

sockets = sockets({
  onWelcome: function(res) {
    con.log("onWelcome", res);
    games = res.games;
  },

  onGameCreated: function(res) {
    con.log("onGameCreated", res);
    mask = view.init(res.game.maze);
    controller.init(res.player, mask);
    gameLoop();
  },

  onGameJoined: function(res) {
    con.log('onGameJoined', res);
    mask = view.init(res.game.maze);
    controller.init(res.player, mask);
    gameLoop();
  },

  onMessage: view.msg,
  onMove: function(playerMove){
    // con.log("moved", msg);
    playerPositions[playerMove.playerIndex] = playerMove;
  }
});


