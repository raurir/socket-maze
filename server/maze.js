var maze = function () {

var branchrate, carve, check, con, generate, e, field, frontier,
getMaze, harden, soften, init, iterations, interativeGenerate,
ran, random, row, xwide, yhigh;

con = console;

xwide = 30;

yhigh = 30;

ran = Math.random();

random = {
  randint: function(min, max) {
    return parseInt(min + Math.random() * (max - min));
  },
  shuffle: function(array) {
    var i, m, t;
    m = array.length;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }
};

field = [];
frontier = [];

carve = function(y, x) {
  var extra, i, _k, _len, _results;
  extra = [];
  field[y][x] = '.';
  if (x > 0) {
    if (field[y][x - 1] === '?') {
      field[y][x - 1] = ',';
      extra.push([y, x - 1]);
    }
  }
  if (x < xwide - 1) {
    if (field[y][x + 1] === '?') {
      field[y][x + 1] = ',';
      extra.push([y, x + 1]);
    }
  }
  if (y > 0) {
    if (field[y - 1][x] === '?') {
      field[y - 1][x] = ',';
      extra.push([y - 1, x]);
    }
  }
  if (y < yhigh - 1) {
    if (field[y + 1][x] === '?') {
      field[y + 1][x] = ',';
      extra.push([y + 1, x]);
    }
  }
  extra = random.shuffle(extra);
  _results = [];
  for (_k = 0, _len = extra.length; _k < _len; _k++) {
    i = extra[_k];
    _results.push(frontier.push(i));
  }
  // con.log("carve")
  return _results;
};

harden = function(y, x) {
  return field[y][x] = '#';
};
soften = function(y, x) {
  return field[y][x] = ',';
};

check = function(y, x, nodiagonals) {
  var edgestate;
  if (nodiagonals == null) {
    nodiagonals = true;
  }

  /*
  Test the cell at y,x: can this cell become a space?
  true indicates it should become a space,
  false indicates it should become a wall.
   */
  edgestate = 0;
  if (x > 0) {
    if (field[y][x - 1] === '.') {
      edgestate += 1;
    }
  }
  if (x < xwide - 1) {
    if (field[y][x + 1] === '.') {
      edgestate += 2;
    }
  }
  if (y > 0) {
    if (field[y - 1][x] === '.') {
      edgestate += 4;
    }
  }
  if (y < yhigh - 1) {
    if (field[y + 1][x] === '.') {
      edgestate += 8;
    }
  }
  if (nodiagonals) {
    if (edgestate === 1) {
      if (x < xwide - 1) {
        if (y > 0) {
          if (field[y - 1][x + 1] === '.') {
            return false;
          }
        }
        if (y < yhigh - 1) {
          if (field[y + 1][x + 1] === '.') {
            return false;
          }
        }
      }
      return true;
    } else if (edgestate === 2) {
      if (x > 0) {
        if (y > 0) {
          if (field[y - 1][x - 1] === '.') {
            return false;
          }
        }
        if (y < yhigh - 1) {
          if (field[y + 1][x - 1] === '.') {
            return false;
          }
        }
      }
      return true;
    } else if (edgestate === 4) {
      if (y < yhigh - 1) {
        if (x > 0) {
          if (field[y + 1][x - 1] === '.') {
            return false;
          }
        }
        if (x < xwide - 1) {
          if (field[y + 1][x + 1] === '.') {
            return false;
          }
        }
      }
      return true;
    } else if (edgestate === 8) {
      if (y > 0) {
        if (x > 0) {
          if (field[y - 1][x - 1] === '.') {
            return false;
          }
        }
        if (x < xwide - 1) {
          if (field[y - 1][x + 1] === '.') {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  } else {
    if ([1, 2, 4, 8].indexOf(edgestate) !== -1) {
      return true;
    }
    return false;
  }
};

e = Math.E;

branchrate = 20;

iterations = 0;

interativeGenerate = function() {
  var choice, index, pos;
  if (frontier.length && iterations < 1e10) {
    pos = Math.random();
    pos = Math.pow(pos, Math.pow(e, -branchrate));
    if (pos >= 1 || pos < 0) {
      con.log(pos);
    }
    index = Math.floor(pos * frontier.length);
    choice = frontier[index];
    if (check(choice[0], choice[1])) {
      carve(choice[0], choice[1]);
    } else {
      harden(choice[0], choice[1]);
    }
    frontier.splice(index, 1);
  }
  return iterations++;
};

generate = function(cb) {
  con.log("generate");
  var rgb, _k, _l, _m;
  for (d = _k = 0; _k < 1000; d = ++_k) {
    interativeGenerate();
  }
  if (frontier.length) {
    generate(cb);
  } else {
    con.log("done");
    cb(field);
  }
};

init = function(cb, w, h) {
  xwide = w;
  yhigh = h;

  for (var y = 0; y < yhigh; y++) {
    var row = [];
    for (var x = 0; x < xwide; x++) {
      row.push('?');
    }
    field.push(row);
  }


  var xchoice = random.randint(0, xwide - 1);
  var ychoice = random.randint(0, yhigh - 1);
  con.log("init", xwide, yhigh, xchoice, ychoice);

  // carve(0, 1);
  // carve(1, 0);
  // carve(1, 1);
  // harden(0,0);

  function clear(x, y, size) {
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        soften(x + i, y + j);
      };
    };
  }
  // make player corners
  clear(0, 0, 2);
  clear(xwide - 2, 0, 2);
  clear(0, yhigh - 2, 2);
  clear(xwide - 2, yhigh - 2, 2);
  // make central corner
  clear(xwide / 2 - 3, yhigh / 2 - 3, 5);

  // make edges
  for (var i = 0; i < xwide; i++) {
    for (var j = 0; j < yhigh; j++) {
      if (i == 0 || j == 0 || i == xwide - 1 || j == yhigh - 1) harden(i, j);
    };
  };

  carve(xchoice, ychoice);

  return generate(cb);
};


return {
  init: init
}

};

// define("maze", maze);
module.exports = maze;
