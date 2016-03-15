var _v = require("../../vendor/visualist/src/visualist");
var nticks = require("../utils/nticks");
var dticks = require("../utils/dticks");
var ColumnChart = require('./columnchart');

function StackedColumnChart() {
  ColumnChart.apply(this, arguments);
}

StackedColumnChart.prototype = Object.create(ColumnChart.prototype);

_v.extend(ColumnChart.prototype, {
  defaults: _v.extend(true, {}, ColumnChart.prototype.defaults, {
  })
});

Object.defineProperties(StackedColumnChart.prototype, {
  flipAxes: {
    value: true
  },
  stacked: {
    value: true
  }
});

module.exports = StackedColumnChart;