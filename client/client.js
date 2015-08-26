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

function gameLoop() {
  view.render(playerPositions);
  controller.calc();
  requestAnimationFrame(gameLoop);
}


interface = interface();
view = view(sw, sh, block, cursor);
controller = controller(view);

sockets = sockets({
  onWelcome: function(welcomeMessage) {
    // con.log("welcomeMessage", welcomeMessage);

    mask = view.init(welcomeMessage.maze);

    controller.init(welcomeMessage, mask);

    interface.init();

    gameLoop();
  },
  onMessage: view.msg,
  onMove: function(playerMove){
    // con.log("moved", msg);
    playerPositions[playerMove.playerIndex] = playerMove;
  }
});


