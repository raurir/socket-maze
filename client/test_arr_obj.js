var con = console;
var lim = 1e6;
var obj = {};
var arr = [];
for (var i = 0; i < lim; i++) {
  var key = (Math.random() * 1e10).toString(16);
  arr.push(key);
  obj[key] = key;
};

function test(type, src) {
  var timeS = new Date().getTime();
  var iter = 1e3;
  if(type == "arrNative") {
    for (var k = 0, kl = src.length; k < kl; k++) {
      var g = src[k];
    };
  } else {
    for (var k in src) {
      var g = src[k];
    };
  }
  var timeE = new Date().getTime();
  var time = timeE - timeS;
  con.log("proc", type, time);
  results[type] += time;
}

var results = {
  arr: 0,
  obj: 0,
  arrNative: 0
}
var tests = 0, totalTests = 4;
function runTest() {
  con.log('running test');
  test("arrNative", arr);
  test("arr", arr);
  test("obj", obj);


  tests++;
  if (tests < totalTests) {
    setTimeout(runTest, 200);
  } else {
    con.log("arr", results.arr / totalTests, "obj", results.obj / totalTests, "arrNative", results.arrNative / totalTests);
  }
}



runTest();