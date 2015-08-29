var userInput = function() {

var userInput = 'ontouchstart' in document.documentElement ? "tilt" : "keyboard";
var tiltTolerance = 5;
var tiltSpeed = 0.2;

el("tiltTolerance").value = tiltTolerance;
el("tiltSpeed").value = tiltSpeed;



function tilt(y, x) {
  if (userInput == "keyboard") return;
  keysDown.left = (x < tiltTolerance ? -x : 0) * tiltSpeed;
  keysDown.right =( x > tiltTolerance ? x : 0) * tiltSpeed;
  keysDown.up = (y < tiltTolerance ? -y : 0) * tiltSpeed;
  keysDown.down =( y > tiltTolerance ? y : 0) * tiltSpeed;
};

function keyboard(e) {
  if (userInput == "tilt") return;
  var pressed = e.type === "keydown" ? 1 : 0;
  switch (e.which) {
    case 37 : case 100 : keysDown.left = pressed; break;
    case 38 : case 104 : keysDown.up = pressed; break;
    case 39 : case 102 : keysDown.right = pressed; break;
    case 40 : case 98 : keysDown.down = pressed; break;
  }
  // con.log(e.which, pressed);
};

function init() {

  listen(el("newgame"), ["click"], function(e) {
    sockets.newGame({players: 2});
  });
  listen(el("joingame"), ["click"], function(e) {
    view.overlay.show({
      choices: games,
      callback: function(index) {
        con.log('callback', games, index);
        sockets.joinGame(view.overlay.selection);
        view.overlay.hide();
      }
    });
  });



  listen(el("reset"), ["click"], function(e) { position.x = startPosition.x; position.y = startPosition.y; });
  listen(el("keyboard"), ["click"], function(e) { userInput = "keyboard"; });
  listen(el("tilt"), ["click"], function(e) { userInput = "tilt"; });

  listen(el("tiltTolerance"), ["change"], function(e) { tiltTolerance = Number(e.currentTarget.value); });
  listen(el("tiltSpeed"), ["change"], function(e) { tiltSpeed = Number(e.currentTarget.value); });

  listen(el("send"), ["click"], function(e) {
    sockets.chat(el("m").value);
    el("m").value = "";
  });

  listen(window, ["keydown", "keyup"], keyboard);

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

};

return {
  init: init

}


}