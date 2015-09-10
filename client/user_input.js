var userInput = function() {

var userInput = 'ontouchstart' in document.documentElement ? "tilt" : "keyboard";
var tiltTolerance = 4;
// var tiltMax = 3;
var tiltSpeed = 1;

el("tiltTolerance").value = tiltTolerance;
el("tiltSpeed").value = tiltSpeed;



function tilt(x, y) {

  function getTilt(val) {
    var clamped = val;
    // if (Math.abs(clamped) < tiltTolerance) {
    //   clamped = 0;
    // } else if (clamped > tiltMax) {
    //   clamped = tiltMax - tiltTolerance;;
    // } else if (clamped < -tiltMax) {
    //   clamped = -tiltMax + tiltTolerance;
    // } else if (clamped > 0) {
    //   clamped = clamped - tiltTolerance;
    // } else if (clamped < 0) {
    //   clamped = clamped + tiltTolerance;
    // }
    if (clamped > tiltTolerance) {
      clamped = tiltSpeed;
    } else {
      clamped = 0;
    }
    return clamped;
  }

  if (userInput == "tilt") {
    keysDown.left = getTilt(-y);
    keysDown.right = getTilt(y);
    keysDown.up = getTilt(-x);
    keysDown.down = getTilt(x);
    view.log([keysDown.up, keysDown.right, keysDown.down, keysDown.left]);
  }
};

function keyboard(e) {
  if (userInput == "keyboard") {
    var pressed = e.type === "keydown" ? 1 : 0;
    switch (e.which) {
      case 37 : case 100 : keysDown.left = pressed; break;
      case 38 : case 104 : keysDown.up = pressed; break;
      case 39 : case 102 : keysDown.right = pressed; break;
      case 40 : case 98 : keysDown.down = pressed; break;
    }
    // con.log(e.which, pressed);
    view.log(pressed);
  }
};

function touch(e, isOn) {
  // if (userInput !== "tilt") return;
  if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
  if (e.clientY > e.clientX) { // left down
      if (sh - e.clientY > e.clientX) {
        keysDown.left = isOn;
      } else {
        keysDown.down = isOn;
      }
    } else { // right up
      if (sh - e.clientY > e.clientX) {
        keysDown.up = isOn;
      } else {
        keysDown.right = isOn;
      }
    }
  // con.log(e.which, pressed);
};

function init() {

  listen(el("newgame"), ["click"], function(e) {
    sockets.newGame({players: 2});
  });
  listen(el("joingame"), ["click"], function(e) {
    overlay.show({
      choices: games,
      load: true,
      callback: function(index) {
        con.log('callback', games, index);
        sockets.joinGame(overlay.selection);
        overlay.hide();
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

  // listen(el("canvas"), ["click"], function(e) { position.x = startPosition.x; position.y = startPosition.y; });

  listen(el("c"), ["mousedown", "touchstart"], function(e) {
    e.preventDefault();
    touch(e, true);
    // isMouseDown = true;
    // con.log(e.clientY, e.y, e.clientX);
  });
  // listen(el("canvas"), ["mousemove", "touchmove"], function(e) {
  //   e.preventDefault();
  //   if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
  //   mouse.x = (e.clientX / sw) * 2 - 1;
  //   mouse.y = -(e.clientY / sh) * 2 + 1;
  // });
  listen(el("c"), ["mouseup", "touchend"], function(e) {
    e.preventDefault();
    touch(e, false);
    // isMouseDown = false;
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