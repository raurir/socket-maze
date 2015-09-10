var constants = {
  block: 16,
  cols: 32,
  rows: 32
}
constants.sw = constants.block * constants.cols;
constants.sh = constants.block * constants.rows;
constants.cursor = constants.block / 2;

if (typeof module != "undefined") {
  module.exports = constants;
}