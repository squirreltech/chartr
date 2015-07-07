/*module.exports = {
  PieChart: require('./charts/piechart'),
  LineChart: require('./charts/linechart'),
  ColumnChart: require('./charts/columnchart'),
  VisualChart: require('./charts/visualchart'),
  CartesianChart: require('./charts/cartesianchart'),
  ChartWrapper: require('./charts/chartwrapper')
};*/

var ChartWrapper = require('./charts/chartwrapper');
module.exports = function(element, options) {
  return new ChartWrapper(element, options);
};
