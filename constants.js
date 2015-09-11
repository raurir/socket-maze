var constants = {
  block: 16,
  cols: 16,
  rows: 16
}
constants.sw = constants.block * constants.cols;
constants.sh = constants.block * constants.rows;
constants.cursor = constants.block / 2;

if (typeof module != "undefined") {
  module.exports = constants;
}