var interface = function() {

el("tiltTolerance").value = tiltTolerance;
el("tiltSpeed").value = tiltSpeed;

function init() {
  // listen(canvas, ["mousedown", "touchstart"], function(e) {
  //   e.preventDefault();
  //   isInteracting = true;
  // });
  // listen(canvas, ["mousemove", "touchmove"], function(e) {
  //   e.preventDefault();
  //   if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
  //   draw(e);
  // });
  // listen(canvas, ["mouseup", "touchend"], function(e) {
  //   e.preventDefault();
  //   isInteracting = false;
  // });

  listen(el("reset"), ["click"], function(e) { position.x = startPosition.x; position.y = startPosition.y; });
  listen(el("keyboard"), ["click"], function(e) { userInput = "keyboard"; });
  listen(el("tilt"), ["click"], function(e) { userInput = "tilt"; });

  listen(el("tiltTolerance"), ["change"], function(e) { tiltTolerance = Number(e.currentTarget.value); });
  listen(el("tiltSpeed"), ["change"], function(e) { tiltSpeed = Number(e.currentTarget.value); });

  listen(el("send"), ["click"], function(e) {
    sockets.chat(el("m").value);
    el("m").value = "";
  });

  listen(window, ["keydown", "keyup"], function(e) {
    if (userInput == "tilt") return;
    var pressed = e.type === "keydown" ? 1 : 0;
    switch (e.which) {
      case 37 : case 100 : keysDown.left = pressed; break;
      case 38 : case 104 : keysDown.up = pressed; break;
      case 39 : case 102 : keysDown.right = pressed; break;
      case 40 : case 98 : keysDown.down = pressed; break;
    }
    // con.log(e.which, pressed);
  });

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