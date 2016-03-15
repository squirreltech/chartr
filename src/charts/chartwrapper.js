var
  _v = require("../../vendor/visualist/src/visualist"),
  DataTable = require("../utils/datatable"),
  LineChart = require('./linechart'),
  PieChart = require('./piechart'),
  ColumnChart = require('./columnchart'),
  StackedColumnChart = require('./stackedcolumnchart'),
  BarChart = require('./barchart'),
  TableChart = require('./tablechart');

function getChartType(dataTable) {
  
  if (dataTable.getNumberOfRows() > 20) {
    return "line";
  }
  
  return 'pie';
}

function getChartClass(type) {
  var clazz;
  switch (type) {
    case 'line':
      clazz = LineChart;
      break;
    case 'pie':
      clazz = PieChart;
      break;
    case 'column':
      clazz = ColumnChart;
      break;
    case 'bar':
      clazz = BarChart;
      break;
    case 'stackedcolumn':
      clazz = StackedColumnChart;
      break;
    default:
      clazz = TableChart;
      
  }
  return clazz;
}

function ChartWrapper(element, options) {
  
  var
    chart,
    opts = _v.extend(true, this.constructor.prototype.defaults);
    
  Object.defineProperties(this, {
    chart: {
      get: function () {
        return chart;
      }
    },
    options: {
      set: function (options) {
        opts = _v.extend(true, opts, options);
        var dataTable = DataTable.fromArray(opts.data);
        var chartType = opts.type || getChartType(dataTable);
        var chartClass = getChartClass(chartType);
        opts.data = dataTable;
        if (chart && chart.constructor === chartClass) {
          chart.options = opts;
        } else {
          chart = new chartClass(chart && chart.element || element, opts);
        }
      },
      get: function () {
        return opts;
      }
    }
  });
  
  this._construct.apply(this, arguments);
  this.options = options;
}

_v.extend(ChartWrapper.prototype, {
  defaults: {
  },
  _construct: function() {},
  render: function() {
    this.chart.render();
  }
});

Object.defineProperties(ChartWrapper.prototype, {
  element: {
    set: function(element) {
      this.chart.element = element;
    },
    get: function() {
      return this.chart.element;
    }
  }
});

module.exports = ChartWrapper;