var DataTable = require("../utils/datatable");
var _v = require("../../vendor/visualist/src/visualist");

function BaseChart(element, options) {
  
  // Construct BaseChart
  var
    elem = typeof element === 'string' && document.querySelector ? document.querySelector(element) : element,
    opts = _v.extend(true, this.constructor.prototype.defaults, options),
    dataTable = DataTable.fromArray(options.data);
  
  Object.defineProperties(this, {
    element: {
      set: function (element) {
        elem = element;
        this.render();
      },
      get: function () {
        return elem;
      }
    },
    options: {
      set: function (options) {
        opts = _v.extend(true, opts, options);
        dataTable = DataTable.fromArray(opts.data);
        this.render();
      },
      get: function () {
        return opts;
      }
    },
    dataTable: {
      enumerable: true,
      configurable: true,
      get: function () {
        return dataTable;
      }
    }
  });
  
  // call construct
  this._construct.apply(this, arguments);
  
  // Set options and render chart
  this.render();
}


_v.extend(BaseChart.prototype, {
  defaults: {
    /*
    style: {
      fontFamily: 'Arial',
      fontSize: '12px',
      position: 'relative',
      color: '#818386'
    }*/
  },
  _construct: function() {},
  render: function() {
    // Clear
    this.element.innerHTML = "";
    // Apply styles
    _v.css(this.element, this.options.style);
  }
});

  
module.exports = BaseChart;