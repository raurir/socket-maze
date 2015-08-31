var overlay = function() {
  var overlayDiv = el("overlay"), overlayConfirm = el("overlay_confirm");
  var o = {
    callback: function() {
      con.log("original callback - you should override this.");
    },
    selection: null,
    choices: [],
    show: function(options) {
      overlayDiv.style.display = "block";
      o.selection = null;
      o.callback = options.callback;

      function makeButton(i) {
        var b = document.createElement("button");
        b.innerHTML = "Option" + i;
        el("overlay_choices").appendChild(b);
        listen(b, ["click"], function(e) {
          o.selection = i;
          con.log("this", o.selection);
        });
        o.choices[i] = b;
      }

      for (var i = 0; i < options.choices.length; i++) {
        makeButton(i);
      };
      listen(overlayConfirm, ["click"], o.callback);
    },
    hide: function() {
      overlayDiv.style.display = "none";
      for (var i = 0; i < o.choices.length; i++) {
        remove(o.choices[i], ["click"], function(i) { o.selection = i; });
      };
      o.choices = [];
      remove(overlayConfirm, ["click"], o.callback);
    }
  }
  return o;
};
