var ChartWrapper = require('./charts/chartwrapper');
module.exports = function(element, options) {
  return new ChartWrapper(element, options);
};
