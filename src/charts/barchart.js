var _v = require("../../vendor/visualist/src/visualist");
var nticks = require("../utils/nticks");
var dticks = require("../utils/dticks");
var ColumnChart = require('./columnchart');

function BarChart() {
  ColumnChart.apply(this, arguments);
}

BarChart.prototype = Object.create(ColumnChart.prototype);

_v.extend(ColumnChart.prototype, {
  defaults: _v.extend(true, {}, ColumnChart.prototype.defaults, {
  })
});

Object.defineProperties(BarChart.prototype, {
  flipAxes: {
    value: true
  }
});

module.exports = BarChart;