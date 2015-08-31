var constants = {
  block: 20,
  cols: 12,
  rows: 12
}
constants.sw = constants.block * constants.cols;
constants.sh = constants.block * constants.rows;

if (typeof module != "undefined") {
  module.exports = constants;
}