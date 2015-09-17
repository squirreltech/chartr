(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./charts/chartwrapper":6}],2:[function(require,module,exports){
var
  _v = require("../../vendor/visualist/src/visualist"),
  nformat = require("../../vendor/nformat/src/nformat"),
  dformat = require("../../vendor/dformat/src/dformat"),
  nticks = require("../utils/nticks"),
  dticks = require("../utils/dticks"),
  VisualChart = require('./visualchart');

function trimSet(values, count) {
  // Trim array to count
  var
    m = Math.round(values.length / count),
    trimmed = [];
  if (m > 1) {
    var trimmed = [];
    for (var i = 0; i < values.length; i++) {
      if (i % m === 0) {
        trimmed.push(data[i]);
      }
    }
    return trimmed;
  }
  return values;
}


function CartesianChart() {
  VisualChart.apply(this, arguments);
}

CartesianChart.prototype = Object.create(VisualChart.prototype);

_v.extend(CartesianChart.prototype, {
  defaults: _v.extend(true, {}, VisualChart.prototype.defaults, {
  }),
  _construct: function() {
    VisualChart.prototype._construct.apply(this, arguments);
  },
  render: function() {
    VisualChart.prototype.render.apply(this, arguments);
    var
      options = this.options,
      elem = this.element,
      dataTable = this.dataTable,
      chartLayer = this.chartLayer,
      chartBox = this.chartBox,
      cw = chartBox.width,
      ch = chartBox.height,
      gridLayer = chartLayer.g({style: {fontSize: '90%'}}),
      categoryIndex = this.categoryIndex,
      categoryRange = this.categoryRange,
      categoryFormat = this.categoryFormat,
      categoryType = this.categoryType,
      categoryTicks = this.categoryTicks,
      categoryMin = Math.min(categoryRange.min, categoryTicks[0]),
      categoryMax = Math.max(categoryRange.max, categoryTicks[categoryTicks.length - 1]),
      categoryGridLines = this.categoryGridLines,
      valueFormat = this.valueFormat,
      valueType = this.valueType,
      valueTicks = this.valueTicks,
      valueRange = this.valueRange,
      valueMin = Math.min(valueRange.min, valueTicks[0]),
      valueMax = Math.max(valueRange.max, valueTicks[valueTicks.length - 1]),
      valueGridLines = this.valueGridLines,
      labelHorizontalSpacing = 13,
      labelVerticalSpacing = 13,
      flipAxes = this.flipAxes,
      clipCategoryGrid = this.clipCategoryGrid,
      clipValueGrid = this.clipValueGrid,
      textColor = chartLayer.css('color'), 
      mustRotate,
      texts;
      
    mustRotate = false;
    texts = [];
    
    var path = "";
    categoryTicks.forEach(function(tick, index) {
      var tickColor = categoryType === 'number' && tick === 0 ? 0.75 : 0.25;
      var tickWidth = (flipAxes ? ch : cw) / (categoryTicks.length);
      
      var normalizedCategoryValue = (tick - categoryMin) / (categoryMax - categoryMin);
      
      var x1;
      if (flipAxes) {
        x1 = 0;
      } else {
        if (clipCategoryGrid) {
          x1 = tickWidth / 2 + tickWidth * index;
        } else {
          x1 = normalizedCategoryValue * cw;
        }
      }
      
      var y1;
      if (flipAxes) {
        if (clipCategoryGrid) {
          y1 = ch - (tickWidth / 2 + tickWidth * index);
        } else {
          y1 = ch - normalizedCategoryValue * ch;
        }
      } else {
        y1 = 0;
      }
      
      var x2 = flipAxes ? cw : x1;
      var y2 = flipAxes ? y1 : ch;
      
      var line = {x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2)};
      
      if (categoryGridLines) {
        
        //gridLayer.line(line.x1, line.y1, line.x2, line.y2, {stroke: 'lightgray', strokeOpacity: tickColor});
        var linePath = "M " + line.x1 + " " + line.y1 + " L" + line.x2 + " " + line.y2;
        if (categoryType === 'number' && tick === 0) {
          gridLayer.path(linePath, {stroke: 'lightgray', strokeOpacity: 0.75});
        } else {
          path+= linePath;
        }
      }
      
      var label;
      if (categoryType === "number") {
        label = nformat(tick, categoryFormat.pattern, categoryFormat.locale);
      } else if (categoryType === "date") {
        label = dformat(tick, categoryFormat.pattern, categoryFormat.locale);
      } else {
        label = dataTable.getValue(tick, categoryIndex);
      }
      
      var labelX = flipAxes ? x1 - labelHorizontalSpacing : x1;
      var labelY = flipAxes ? ch - y1 : y2 + labelVerticalSpacing;
      
      var labelWidth = flipAxes ? chartBox.x - labelHorizontalSpacing : tickWidth;
      var textAnchor = flipAxes ? 'end' : 'middle'; 
      var text = gridLayer.create("text", {
        x: Math.round(labelX), 
        y: Math.round(labelY),
        dy: "0.4em",
        textAnchor: textAnchor
      }).append(document.createTextNode(label));
      
      texts.push(text);
      
      gridLayer.append(text);
      
      if (text.computedTextLength() > labelWidth) {
        mustRotate = true;
      }
      
    });
    
    
    if (mustRotate) {
      texts.forEach(function(text) {
        var x = text.attr('x');
        var y = text.attr('y');
        text.attr({
          textAnchor: 'end',
          transform: "rotate(-32 " + x + "," + y + ")"
        });
      });
    }
    
    mustRotate = false;
    texts = [];
    
    
    valueTicks.forEach(function(tick, index) {
      
      var tickWidth = (flipAxes ? chartBox.height : chartBox.width) / (valueTicks.length + 1);
      var tickColor = valueType === 'number' && tick === 0 ? 0.75 : 0.25;
      
      var normalizedValue = (tick - valueMin) / (valueMax - valueMin);
      var x1;
      
      if (flipAxes) {
        if (clipValueGrid) {
          x1 = tickWidth * 0.5 + tickWidth * index;
        } else {
          x1 = normalizedValue * chartBox.width;
        }
      } else {
        x1 = 0;
      }
      
      var y1;
      if (flipAxes) {
        y1 = 0;
      } else {
        if (clipValueGrid) {
          y1 = tickWidth * 0.5 + tickWidth * index;
        } else {
          y1 = chartBox.height - normalizedValue * chartBox.height;
        }
      }
      
      var x2 = flipAxes ? x1 : chartBox.width;
      var y2 = flipAxes ? chartBox.height : y1;
      
      var line = {x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2)};
      
      if (valueGridLines) {
        //gridLayer.line(line.x1, line.y1, line.x2, line.y2, {stroke: 'lightgray', strokeOpacity: tickColor});
        var linePath = "M " + line.x1 + " " + line.y1 + " L" + line.x2 + " " + line.y2;
        if (valueType === 'number' && tick === 0) {
          gridLayer.path(linePath, {stroke: 'lightgray', strokeOpacity: 0.75});
        } else {
          path+= linePath;
        }
      }
      
      if (valueType === "number") {
        label = nformat(tick, valueFormat.pattern, valueFormat.locale);
      } else if (valueType === "date") {
        label = dformat(tick, valueFormat.pattern, valueFormat.locale);
      }
      
      var labelX = flipAxes ? x1 : x1 - labelHorizontalSpacing;
      var labelY = flipAxes ? y2 + labelVerticalSpacing : y1;
      var labelWidth = flipAxes ? tickWidth : chartBox.x - labelHorizontalSpacing;
      var textAnchor = flipAxes ? 'middle' : 'end'; 
      
      var text = gridLayer.create("text", {
        x: Math.round(labelX), 
        y: Math.round(labelY),
        dy: "0.4em",
        textAnchor: textAnchor
      }).append(document.createTextNode(label));
      
      gridLayer.append(text);
      
    });
    
    gridLayer.path(path, {stroke: 'lightgray', strokeOpacity: 0.25});
    
    if (mustRotate) {
      texts.forEach(function(text) {
        var x = text.attr('x');
        var y = text.attr('y');
        text.attr({
          textAnchor: 'end',
          transform: "rotate(-32 " + x + "," + y + ")"
        });
      });
    }
    
  }
});

Object.defineProperties(CartesianChart.prototype, {
  categoryIndex: {
    enumerable: true,
    configurable: true,
    get: function() {
      return 0;
    }
  },
  categoryType: {
    enumerable: false,
    configurable: true,
    get: function() {
      return this.dataTable && this.dataTable.getColumnType(this.categoryIndex);
    }
  },
  categoryRange: {
    configurable: true, 
    get: function() {
      var dataTable = this.dataTable;
      if (dataTable) {
        if (dataTable.getColumnType(this.categoryIndex) === 'string') {
          return {
            min: 0,
            max: dataTable.getNumberOfRows() - 1
          };
        }
        return this.dataTable.getColumnRange(this.categoryIndex);
      }
      return null;
    }
  },
  categoryFormat: {
    configurable: true,
    get: function() {
      var
        dataTable = this.dataTable,
        categoryIndex = this.categoryIndex,
        columnPattern = dataTable.getColumnPattern(categoryIndex),
        columnLocale = dataTable.getColumnLocale(categoryIndex);
      if (dataTable) {
        if (columnPattern) {
          // Prefer short names on scale
          columnPattern.replace(/MMMM/, "MMM");
          columnPattern.replace(/dddd/, "ddd");
        }
        return {
          pattern: columnPattern,
          locale: columnLocale
        };
      }
      return null;
    }
  },
  categoryTicks: {
    configurable: true,
    get: function() {
      var
        range = this.categoryRange,
        type = this.categoryType,
        min = range.min,
        max = range.max,
        count = Math.min(10, this.dataTable.getNumberOfRows()),
        outer = false;
      if (type === 'number') {
        return nticks(min, max, count, outer);
      } else if (type === 'date') {
        return dticks(min, max, count, outer);
      } else if (type === 'string') {
        max = this.dataTable.getNumberOfRows() - 1;
        return (Array.apply(null, {length: this.dataTable.getNumberOfRows()}).map(Number.call, Number)).map(function(tick) {
          return Math.floor(tick);
        });
      }
    }
  },
  valueRange: {
    get: function() {
      if (!this.dataTable) {
        return;
      }
      var
        dataTable = this.dataTable,
        result = {},
        columnIndex,
        categoryIndex = this.categoryIndex,
        range;
      if (dataTable) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          if (columnIndex !== categoryIndex) {
            range = dataTable.getColumnRange(columnIndex);
            result.min = typeof result.min === 'undefined' ? range.min : Math.min(result.min, range.min);
            result.max = typeof result.max === 'undefined' ? range.max : Math.max(result.max, range.max);
          }
        };
      }
      return result;
    }
  },
  valueType: {
    get: function() {
      if (!this.dataTable) {
        return;
      }
      var
        dataTable = this.dataTable,
        categoryIndex = this.categoryIndex;
      if (dataTable) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          if (columnIndex !== categoryIndex) {
            return dataTable.getColumnType(columnIndex);
          }
        }
      }
      return null;
    }
  },
  valueFormat: {
    get: function() {
      var
        dataTable = this.dataTable,
        columnIndex,
        categoryIndex = this.categoryIndex,
        valueType = this.valueType;
        
      if (dataTable) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          if (columnIndex !== categoryIndex) {
            var columnPattern = dataTable.getColumnPattern(columnIndex);
            var columnLocale = dataTable.getColumnLocale(columnIndex);
            if (columnPattern) {
              // Prefer short names on scale
              columnPattern.replace(/MMMM/, "MMM");
              columnPattern.replace(/dddd/, "ddd");
            }
            return {
              pattern: columnPattern,
              locale: columnLocale
            };
          }
        };
      }
      return null;
    }
  },
  valueTicks: {
    get: function() {
      /*
      var
        range = this.valueRange,
        type = this.valueType,
        count = Math.min(10, this.dataTable.getNumberOfRows());
      return (type === 'number' ? nticks : type === 'date' ? dticks : sticks)(range.min, range.max, 6, true);*/
      var
        range = this.valueRange,
        type = this.valueType,
        min = range.min,
        max = range.max,
        count = 5,
        outer = true;
      if (type === 'number') {
        return nticks(min, max, count, outer);
      } else if (type === 'date') {
        return dticks(min, max, count, outer);
      } else if (type === 'string') {
        max = this.dataTable.getNumberOfRows() - 1;
        return nticks(0, max, Math.min(max + 1, count), outer).map(function(tick) {
          return Math.floor(tick);
        });
      }
    }
  },
  legendItems: {
    enumerable: true,
    configurable: true,
    get: function() {
      var
        dataTable = this.dataTable,
        colorIndex = 0,
        result = [],
        options = this.options,
        label;
      if (dataTable) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          if (this.categoryIndex !== columnIndex) {
            label = dataTable.getColumnLabel(columnIndex);
            if (label) {
              result.push({label: dataTable.getColumnLabel(columnIndex) || "ABCDEFGHIJKLMNOPQRSTUVXYZ".charAt(columnIndex % 21), bullet: { fill: options.colors[colorIndex % options.colors.length] } });
            }
            colorIndex++;
          }
        }
      }
      return result;
    }
  },
  flipAxes: {
    value: false,
    writeable: false,
    configurable: true
  },
  clipCategoryGrid: {
    value: false,
    writeable: false,
    configurable: true
  },
  categoryGridLines: {
    value: true,
    writeable: false,
    configurable: true
  },
  clipValueGrid: {
    value: false,
    writeable: false,
    configurable: true
  },
  valueGridLines: {
    value: true,
    writeable: false,
    configurable: true
  },
});

module.exports = CartesianChart;
},{"../../vendor/dformat/src/dformat":17,"../../vendor/nformat/src/nformat":20,"../../vendor/visualist/src/visualist":21,"../utils/dticks":14,"../utils/nticks":15,"./visualchart":11}],3:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":21,"../utils/dticks":14,"../utils/nticks":15,"./columnchart":7}],4:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":21,"../utils/datatable":13}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"../../vendor/dformat/src/dformat":17,"../../vendor/nformat/src/nformat":20,"../../vendor/visualist/src/visualist":21,"../utils/dticks":14,"../utils/nticks":15,"./visualchart":11,"dup":2}],6:[function(require,module,exports){
var _v = require("../../vendor/visualist/src/visualist");
var DataTable = require("../utils/datatable");
var LineChart = require('./linechart');
var PieChart = require('./piechart');
var ColumnChart = require('./columnchart');
var BarChart = require('./barchart');
var TableChart = require('./tablechart');

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
},{"../../vendor/visualist/src/visualist":21,"../utils/datatable":13,"./barchart":3,"./columnchart":7,"./linechart":8,"./piechart":9,"./tablechart":10}],7:[function(require,module,exports){
var _v = require("../../vendor/visualist/src/visualist");
var nticks = require("../utils/nticks");
var dticks = require("../utils/dticks");
var CartesianChart = require('./cartesianchart');

function ColumnChart() {
  CartesianChart.apply(this, arguments);
}

ColumnChart.prototype = Object.create(CartesianChart.prototype);

_v.extend(ColumnChart.prototype, {
  defaults: _v.extend(true, {}, CartesianChart.prototype.defaults, {
  }),
  render: function() {
    CartesianChart.prototype.render.apply(this, arguments);
    
    var
      dataTable = this.dataTable,
      options = this.options,
      chartLayer = this.chartLayer,
      chartBox = this.chartBox,
      columnIndex = this.columnIndex,
      rowIndex = 0,
      valueIndex = 0,
      valueRange = this.valueRange,
      valueTicks = this.valueTicks,
      valueMin = Math.min(valueRange.min, valueTicks[0]),
      valueMax = Math.max(valueRange.max, valueTicks[valueTicks.length - 1]),
      categoryType = this.categoryType,
      categoryRange = this.categoryRange,
      categoryTicks = this.categoryTicks,
      categoryIndex = this.categoryIndex,
      categoryMin = Math.min(categoryRange.min, categoryTicks[0]),
      categoryMax = Math.max(categoryRange.max, categoryTicks[categoryTicks.length - 1]),
      flipAxes = this.flipAxes,
      graphLayer,
      points,
      value,
      normalizedValue,
      categoryValue,
      normalizedCategoryValue,
      x,
      y;
      
    var rows = dataTable.getSortedRows(categoryIndex);
    
    var rectWidth = chartBox.width / (dataTable.getNumberOfColumns() - 1);
    var tickWidth = (flipAxes ? chartBox.height : chartBox.width) / rows.length; 
    var columnWidth = Math.max(1, tickWidth / dataTable.getNumberOfColumns());
    var columnSpacing = columnWidth * 0.25;
    var m = 1;
   
    var sum = {};
    var count = 0;
    
    graphLayer = chartLayer.g({
      fill: options.colors[valueIndex % options.colors.length]
    });
    
    for (rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      count++;
      var step = rowIndex % m === 0;
      
      var valueIndex = 0;
      
      
      for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
        
        if (columnIndex !== categoryIndex) {
          
          categoryValue = categoryType === 'string' ? rowIndex : rows[rowIndex][categoryIndex];
          normalizedCategoryValue = (categoryValue - categoryMin) / ( categoryMax - categoryMin);
      
          //
          points = [];
          var value = rows[rowIndex][columnIndex];
          
          sum[columnIndex] = sum[columnIndex] || 0;
          sum[columnIndex]+= value;
          
          if (step) {
            
            normalizedValue = (value - valueMin) / (valueMax - valueMin);
            
            var normalizedValueZero = 0;
            if (valueMin < 0 && valueMax > 0) {
              normalizedValueZero = (0 - valueMin) / (valueMax - valueMin);
            }
            
            var normalizedCategoryZero = 0;
            if (categoryMin < 0 && categoryMax > 0) {
              normalizedCategoryZero = (0 - categoryMin) / (categoryMax - categoryMin);
            }
            
            var w = Math.max(1, columnWidth);
            
            /*var xv = flipAxes ? normalizedValue : normalizedCategoryValue;
            var yv = flipAxes ? normalizedCategoryValue : normalizedValue;
            
            var zv = flipAxes ? normalizedCategoryZero : normalizedValueZero;
            */
            
            var xv = normalizedCategoryValue;
            var yv = normalizedValue;
            var zv = normalizedValueZero;
            
            var cw = flipAxes ? chartBox.width : chartBox.width - tickWidth;
            var ch = flipAxes ? chartBox.height - tickWidth : chartBox.height;
            
            var o = columnWidth / 2 + valueIndex * columnWidth;
            
            var ox = flipAxes ? 0 : o;
            var oy = flipAxes ? o : 0;
            /*
            x = xv * cw + ox;
            y = yv * ch + oy;
            */
            var x = xv * cw + ox;
            var y = ch - yv * ch + oy;
           
            var h = yv * ch;
           
            //if (value < 0) {
              y = ch - zv * ch;
              h = (zv - yv) * ch;
            /*} else if (value >= 0) {
              h = h - zv * ch;
            }*/
           
            if (flipAxes) {
              h = w;
              w = (yv - zv) * cw;
              x = zv * cw;
              y = xv * ch + oy;
            }

            var 
              x1 = Math.round(x),
              y1 = Math.round(y),
              x2 = Math.round(x) + Math.round(w),
              y2 = Math.round(y) + Math.round(h);
            
            graphLayer.path('M' + x1 +',' + y1 + ' ' + x2 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x1 + ',' + y2);
            
            //graphLayer.circle(x1, y1, 10, {fill: 'red'});
            
          }
          
          valueIndex++;
          
        }
        /*
        graphLayer.graph(points, {
          stroke: options.colors[valueIndex % options.colors.length],
          strokeWidth: 1.5
        });
        */
       
        
      }
    }
    if (step) {
      count = 0;
      sum = {};
    }
  }
});

Object.defineProperties(ColumnChart.prototype, {
  clipCategoryGrid: {
    value: true
  },
  categoryGridLines: {
    value: false
  }
});


module.exports = ColumnChart;
},{"../../vendor/visualist/src/visualist":21,"../utils/dticks":14,"../utils/nticks":15,"./cartesianchart":5}],8:[function(require,module,exports){
var _v = require("../../vendor/visualist/src/visualist");

var CartesianChart = require('./CartesianChart');

function LineChart() {
  CartesianChart.apply(this, arguments);
}

LineChart.prototype = Object.create(CartesianChart.prototype);

_v.extend(LineChart.prototype, {
  defaults: _v.extend(true, {}, CartesianChart.prototype.defaults, {
  }),
  render: function() {
    
    CartesianChart.prototype.render.apply(this, arguments);
    
    var
      dataTable = this.dataTable,
      options = this.options,
      chartLayer = this.chartLayer,
      chartBox = this.chartBox,
      columnIndex = this.columnIndex,
      rowIndex = 0,
      valueIndex = 0,
      valueRange = this.valueRange,
      valueTicks = this.valueTicks,
      valueMin = Math.min(valueRange.min, valueTicks[0]),
      valueMax = Math.max(valueRange.max, valueTicks[valueTicks.length - 1]),
      categoryType = this.categoryType,
      categoryRange = this.categoryRange,
      categoryTicks = this.categoryTicks,
      categoryIndex = this.categoryIndex,
      categoryMin = Math.min(categoryRange.min, categoryTicks[0]),
      categoryMax = Math.max(categoryRange.max, categoryTicks[categoryTicks.length - 1]),
      flipAxes = this.flipAxes,
      graphLayer = chartLayer.g(),
      points,
      value,
      normalizedValue,
      categoryValue,
      normalizedCategoryValue,
      x,
      y;
      
    var rows = dataTable.getSortedRows(categoryIndex);
    
    for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
      if (columnIndex !== categoryIndex) {
        points = [];
        
        //for (rowIndex = 0; rowIndex < dataTable.getNumberOfRows(); rowIndex++) {
        for (rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          
          value = rows[rowIndex][columnIndex];
          //value = dataTable.getValue(rowIndex, columnIndex);
          categoryValue = categoryType === 'string' ? rowIndex : rows[rowIndex][categoryIndex];
          //categoryValue = categoryType === 'string' ? rowIndex : dataTable.getValue(rowIndex, categoryIndex);
          
          if (typeof value === 'number') {
            
            normalizedCategoryValue = (categoryValue - categoryMin) / ( categoryMax - categoryMin);
            normalizedValue = (value - valueMin) / (valueMax - valueMin);
            
            var xv = flipAxes ? normalizedValue : normalizedCategoryValue;
            var yv = flipAxes ? normalizedCategoryValue : normalizedValue;
            
            x = Math.round(xv * chartBox.width);
            y = Math.round(chartBox.height - yv * chartBox.height);
            
            points.push({x: x, y: y});
          }
        }
        
        graphLayer.graph(points, {
          smooth: options.smooth,
          stroke: options.colors[valueIndex % options.colors.length],
          strokeWidth: 1.5
        });
        
        valueIndex++;
      }
    }
  }
});

module.exports = LineChart;
},{"../../vendor/visualist/src/visualist":21,"./CartesianChart":2}],9:[function(require,module,exports){
var
  _v = require("../../vendor/visualist/src/visualist"),
  nformat = require("../../vendor/nformat/src/nformat"),
  dformat = require("../../vendor/dformat/src/dformat"),
  round = require('../utils/round'),
  VisualChart = require('./visualchart');

function PieChart() {
  VisualChart.apply(this, arguments);
}

PieChart.prototype = Object.create(VisualChart.prototype);

_v.extend(PieChart.prototype, {
  defaults: _v.extend(true, {}, VisualChart.prototype.defaults, {
  }),
  _construct: function() {
    VisualChart.prototype._construct.apply(this, arguments);
  },
  render: function() {
    VisualChart.prototype.render.apply(this, arguments);
  
    var
      labelFontSize = 11,
      labelDistance = labelFontSize + labelFontSize * 0.75,
      minPercent = 0.04,
      options = this.options,
      elem = this.element,
      dataTable = this.dataTable,
      chartLayer = this.chartLayer,
      gridLayer = chartLayer.g({
        style: {
          fontSize: labelFontSize + "px"
        }
      }),
      chartBox = this.chartBox,
      rowIndex,
      columnIndex,
      columnType,
      type = getTypeOfData(dataTable),
      pies = [],
      pie,
      total = 0,
      label,
      value,
      formattedValue,
      pattern,
      locale,
      index,
      padding = labelDistance * 0.75,
      //padding = 30,
      y = padding,
      r = (Math.min(chartBox.width, chartBox.height) - padding * 2 ) / 2,
      x = chartBox.width / 2 - r,
      p = 0,
      pv,
      g,
      a,
      ax,
      ay,
      sAngle,
      eAngle;
      
    if (type === 0) {
      // Column based values
      for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
        columnType = dataTable.getColumnType(columnIndex);
        if (columnType === 'number') {
          value = dataTable.getColumnAverage(columnIndex);
          pattern = dataTable.getColumnPattern(columnIndex);
          locale = dataTable.getColumnLocale(columnIndex);
          formattedValue = nformat(value, pattern, locale);
          pies.push({v: value, f: formattedValue});
        }
      }
    } else {
      // Row based values
      for (rowIndex = 0; rowIndex < dataTable.getNumberOfRows(); rowIndex++) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          columnType = dataTable.getColumnType(columnIndex);
          if (columnType === 'number') {
            // Numeric value
            value = dataTable.getValue(rowIndex, columnIndex);
            formattedValue = dataTable.getFormattedValue(rowIndex, columnIndex);
            pies.push({v: value, f: formattedValue});
          }
        }
      }
      
    }
    
    // Sum up total
    for (var i = 0; pie = pies[i]; i++) {
      total+= pie.v;
    };
    
    // Draw background
    chartLayer.circle(x + r, y + r, r, {
      fill: 'lightgray'
    });
    
    // Render pies and labels
    for (index = 0; pie = pies[index]; index++) {
      
      // Render pie
      sAngle = p * Math.PI * 2 - Math.PI / 2;
      
      pv = pie.v / total;
      p = pie.p = p + pv;
      
      eAngle = p * Math.PI * 2 - Math.PI / 2;
      
      chartLayer.g({fill: options.colors[index % options.colors.length]}).arc(x + r, y + r, r, sAngle, eAngle, 1);

      // Render label
      if (pv >= minPercent) {
        a = sAngle + (eAngle - sAngle) / 2;
        ax = r + Math.cos(a) * (r + labelDistance);
        ay = r + Math.sin(a) * (r + labelDistance);
        gridLayer.text(x + ax, y + ay, pie.f, {textAnchor: 'middle', dx: '0.1em', dy: '0.7em'});
      }
      
      
    }
    
  }
});

function getTypeOfData(dataTable) {
  // Detect type of data
  var columnType;
  for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
    columnType = dataTable.getColumnType(columnIndex);
    if (columnType === 'string') {
      return 1;
    }
  }
  return 0;
}

Object.defineProperties(PieChart.prototype, {
  
  legendItems: {
    get: function() {
      var
        dataTable = this.dataTable,
        result = [],
        rowIndex,
        columnIndex,
        valueIndex = 0,
        label,
        options = this.options;
        type = getTypeOfData(dataTable);
        
        
      if (dataTable) {
        if (type === 0) {
          // Column based values
          for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
            if (dataTable.getColumnType(columnIndex) === 'number') {
              result.push({label: dataTable.getColumnLabel(columnIndex), bullet: { fill: options.colors[valueIndex % options.colors.length] } });
              valueIndex++;
            }
          }
          return result;
        }
        
        // Row based values
        for (rowIndex = 0; rowIndex < dataTable.getNumberOfRows(); rowIndex++) {
          for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
            if (dataTable.getColumnType(columnIndex) === 'string') {
              // Label
              result.push({
                label: dataTable.getFormattedValue(rowIndex, columnIndex) || "ABCDEFGHIJKLMNOPQRSTUVXYZ".charAt(rowIndex % 21),
                bullet: {
                  fill: options.colors[valueIndex % options.colors.length]
                }
              });
              valueIndex++;
              break;
            }
          }
        }
      }
      
      return result;
      
    }
  }
  
});

module.exports = PieChart;
},{"../../vendor/dformat/src/dformat":17,"../../vendor/nformat/src/nformat":20,"../../vendor/visualist/src/visualist":21,"../utils/round":16,"./visualchart":11}],10:[function(require,module,exports){
var _v = require("../../vendor/visualist/src/visualist");

var BaseChart = require('./basechart');

function TableChart() {
  BaseChart.apply(this, arguments);
}

TableChart.prototype = Object.create(BaseChart.prototype);

_v.extend(TableChart.prototype, {
  
  defaults: _v.extend(true, {}, BaseChart.prototype.defaults, {
  }),
  
  _construct: function() {
    BaseChart.prototype._construct.apply(this, arguments);
  },
  render: function() {
    // Render layer
    BaseChart.prototype.render.apply(this, arguments);
    var
      element = this.element,
      layer = _v(),
      options = this.options,
      dataTable = this.dataTable,
      columnIndex,
      rowIndex,
      doc = element.ownerDocument,
      table = doc.createElement('table'),
      caption = doc.createElement('caption'),
      thead = doc.createElement('thead'),
      tbody = doc.createElement('tbody'),
      tr, th, td,
      even;
      
      // Render html
      
    _v.css(table, {
      fontSize: '12px',
      borderCollapse: "collapse",
      border: "1px solid #efefef",
      marginBottom: '1.5em',
      width: '600px',
      maxWidth: '100%',
      display: 'table',
      tableLayout: 'fixed'
    });
    
    caption.innerHTML = options.title || "TableChart";
    
    _v.css(caption, {
      fontSize: "120%",
      color: 'inherit',
      textAlign: 'left'
    });
    
    table.appendChild(caption);
    /*_v.css(thead, {
      width: '100%'
    });
    _v.css(tbody, {
      width: '100%'
    });*/
    
    
    table.appendChild(thead);
    
    // Column titles
    var hasColumnLabels = false; 
    tr = doc.createElement('tr');
    for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
      th = doc.createElement('th');
      var label = dataTable.getColumnLabel(columnIndex);
      if (label) {
        hasColumnLabels = true;
      }
      th.innerHTML = label;
      _v.css(th, {
        //width: 100 / dataTable.getNumberOfColumns() + "%",
        border: "1px solid #dfdfdf",
        textAlign: "center",
        backgroundColor: '#efefef',
        wordWrap: 'break-word',
        padding: '5px'
      });
      tr.appendChild(th);
    }
    if (hasColumnLabels) {
      thead.appendChild(tr);
    }
    
    // Rows
    table.appendChild(tbody);
    for (rowIndex = 0; rowIndex < dataTable.getNumberOfRows(); rowIndex++) {
      even = rowIndex % 2;
      tr = doc.createElement('tr');
      for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
        td = doc.createElement('td');
        td.innerHTML = dataTable.getFormattedValue(rowIndex, columnIndex);
        _v.css(td, {
          //width: 100 / dataTable.getNumberOfColumns() + "%",
          border: "1px solid #efefef",
          textAlign: "center",
          backgroundColor: even ? '#fafafa' : '',
          wordWrap: 'break-word',
          padding: '5px'
        });
        
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    
    element.appendChild(table);
    
    
    // Render SVG Layer using a foreign object
    /*
    layer
      .clear()
      .attr({
        fontSize: 12,
        fontFamily: 'Arial',
        preserveAspectRatio: "xMidYMid meet",
        width: 600,
        height: 400
      });

    var foreign = layer
      .create('foreignObject', {
        width: 600,
        height: 400
      });
      
    var body = element.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'body');
    foreign.attr('required-extensions', "http://www.w3.org/1999/xhtml");
    layer.append(foreign);
    foreign.append(body);
    
    body.appendChild(table);
    
    element.innerHTML = "";
    
    element.appendChild(layer[0]);
    */
  }
});

Object.defineProperties(TableChart.prototype, {
});

module.exports = TableChart;
},{"../../vendor/visualist/src/visualist":21,"./basechart":4}],11:[function(require,module,exports){
var _v = require("../../vendor/visualist/src/visualist");

var
  BaseChart = require('./basechart'),
  round = require('../utils/round');

function VisualChart() {
  BaseChart.apply(this, arguments);
}

VisualChart.prototype = Object.create(BaseChart.prototype);

_v.extend(VisualChart.prototype, {
  
  defaults: _v.extend(true, {}, BaseChart.prototype.defaults, {
    //colors: ['navy', 'maroon', 'olive', 'teal', 'brown', 'green', 'blue', 'purple', 'orange', 'violet', 'cyan', 'fuchsia', 'yellow', 'lime', 'aqua', 'red'],
    //colors: "#287CCE,#963A74,#48E387,#E5A069,#50F2F7,#F55A44,#737373".split(/[\s,]+/),
    colors: "#2362c5,#ff7518,#12c0a3,#c7daf8,#ffd118,#f51731,#8Af46c,#C5138B".split(/[\s,]+/),
    legend: 'top'
  }),
  
  _construct: function() {
  
    BaseChart.prototype._construct.apply(this, arguments);
    var
      layer = _v(),
      chartLayer = layer.create('g');
        
    Object.defineProperties(this, {
      layer: {
        enumerable: true,
        configurable: true,
        get: function () {
          return layer;
        }
      },
      chartLayer: {
        enumerable: true,
        configurable: true,
        get: function () {
          return chartLayer;
        }
      }
    });
    
  },
  render: function() {
    // Render layer
    BaseChart.prototype.render.apply(this, arguments);
    var
      width = 600,
      height = 400,
      spacing = 7,
      
      elem = this.element,
      options = this.options,
      dataTable = this.dataTable,
      layer = this.layer,
      chartLayer = this.chartLayer,

      chartBox,
      
      titleLayer,
      title = options.title || "",
      
      legendItems = this.legendItems,
      legendLayer,
      legendBox = {};
      /*
      _v.css(elem, {
        display: 'inline-block',
        maxWidth: width + "px",
        maxHeight: height + "px",
        //paddingTop: ((width / height) + 100) + "%",
        position: 'relative'
      });*/

      // Render layer
      elem.appendChild(layer[0]);
      layer
        .clear()
        .attr({
          width: 600,
          height: 400,
          fontSize: 12,
          fontFamily: 'Arial',
          /*width: "100%",
          height: "100%",*/
          //height: "auto",
          //width: width + "px",
          //height: height + "px",
          //height: height + "px",
          
          //height: height + "px",
          /*
          width: "100%",
          height: "auto",
          */
          //height: "auto",
          style: {
            fill: _v.css(elem, 'color'), 
            /*position: 'absolute',
            top: 0,
            left: 0,*/
            //width: "100%",
            //height: "auto",
            //maxHeight: height + "px",
            maxWidth: "100%",
            maxHeight: height + "px",
            height: "auto"
          },
          viewBox: "0 0 " + 600 + " " + 400,
          preserveAspectRatio: "xMidYMid meet"
          //preserveAspectRatio: "none"
          //preserveAspectRatio: "xMinYMin meet"
        });
      
      //max-width: 100%; max-height: 400px; height: auto;
      //layer.attr('style', layer[0].style.cssText + ' height:' + height + 'px\\');
      
      /*
      console.log(layer.attr('width'), layer.attr('height'));
      console.log(layer.attr('style'));
      console.log(layer.attr('viewBox'));
      console.log(layer.attr('preserveAspectRatio'));
      */
     
      chartBox = this.chartBox;
      var layerRect = this.layer[0].getBoundingClientRect();
      
      
      var textColor = layer.css('color');
      // Render title
      titleLayer = layer.g();
      titleLayer
        .text(0, -2, title, {style: {fontSize: '120%'}, textAnchor: 'start'})
        .attr('transform', "translate(" + Math.floor(chartBox.x) + "," + Math.floor(chartBox.y - spacing) + ")");
      
      if (this.legendItems.length) {
        legendLayer = layer.g();
        // Render legend
        switch (options.legend) {
          case 'top': 
            legendLayer
              .listbox(0, 0, chartBox.width, 0, legendItems, {horizontal: true, fill: textColor})
              .attr('transform', 'translate(' + Math.floor(chartBox.x) + ',' + Math.floor(chartBox.y - spacing * 2 - legendLayer.bbox().height) + ')');
            titleLayer
              .attr('transform', "translate(" + Math.floor(chartBox.x) + "," + Math.floor(chartBox.y - spacing * 3 - legendLayer.bbox().height) + ")");
            break;
          case 'bottom': 
            legendLayer
              .listbox(0, 0, chartBox.width, 0, legendItems, {horizontal: true, fill: textColor})
              .attr('transform', 'translate(' + Math.floor(chartBox.x + spacing) + ',' + Math.floor(chartBox.y + chartBox.height + spacing) + ')');
            break;
          case 'left': 
            legendLayer
              .listbox(0, 0, chartBox.width, 0, legendItems, {fill: textColor})
              .attr('transform', 'translate(' + Math.floor(chartBox.x + spacing) + ',' + Math.floor(chartBox.y + spacing) + ')');
            break;
          case 'right':
            legendLayer
              .listbox(0, 0, layerRect.width - (chartBox.x + chartBox.width) - spacing * 2, 0, legendItems, {fill: textColor})
              .attr('transform', 'translate(' + Math.floor(chartBox.x + chartBox.width + spacing) + ',' + Math.floor(chartBox.y) + ')');
            break;
        }
      }
      
      
    // Add chart layer
    chartLayer.clear();
    layer.append(chartLayer);
  
    //layer.rect(chartBox.x, chartBox.y, chartBox.width, chartBox.height, {style: "fill:transparent;stroke:black;stroke-width:1;opacity:0.5"});
    chartLayer.attr('transform', 'translate(' + chartBox.x + ',' + chartBox.y + ')');
  }
});

Object.defineProperties(VisualChart.prototype, {
  chartBox: {
    writeable: false,
    enumerable: true,
    configurable: true,
    get: function() {
      if (!this.layer) {
        return {x: 0, y: 0, width: 0, height: 0};
      }
      var
        s = 0.6,
        //rect = this.layer && this.layer[0].getBoundingClientRect();
        viewBox = this.layer.attr('viewBox').split(" "),
        w = round(viewBox[2]),
        h = round(viewBox[3]);
      return {
        x: round(w * (1 - s) / 2),
        y: round(h * (1 - s) / 2),
        width: w * s,
        height: h * s
      };
    }
  },
  legendItems: {
    enumerable: true,
    configurable: true,
    get: function() {
      var
        dataTable = this.dataTable,
        colorIndex = 0,
        result = [],
        options = this.options,
        label;
      if (dataTable) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          label = dataTable.getColumnLabel(columnIndex);
          if (label) {
            result.push({label: label, bullet: { fill: options.colors[colorIndex % options.colors.length] } });
          }
          colorIndex++;
        }
      }
      return result;
    }
  }
});

module.exports = VisualChart;
},{"../../vendor/visualist/src/visualist":21,"../utils/round":16,"./basechart":4}],12:[function(require,module,exports){
var
  lovechart = require('./chartr'),
  plugin = 'chartr';
  
module.exports = jQuery.fn[plugin] = function(options) {
  return this.each(function() {
    var instance = $(this).data(plugin);
    if (!instance) {
      instance = $(this).data(plugin, lovechart(this, options));
    } else {
      instance.options = options;
    }
    return $(this);
  });
};
},{"./chartr":1}],13:[function(require,module,exports){
var
  nformat = require("../../vendor/nformat/src/nformat"),
  dformat = require("../../vendor/dformat/src/dformat");

function DataTable(data) {
  
  if (data instanceof DataTable) {
    return data;
  }
  
  var 
    cols = data && data.cols || [],
    rows = data && data.rows || [];
  
  this.getColumnId = function(columnIndex) {
    return cols[columnIndex] && cols[columnIndex].id;
  };
  
  this.getColumnLabel = function(columnIndex) {
    return cols[columnIndex] && cols[columnIndex].label || "";
    //return cols[columnIndex] && (cols[columnIndex].label || "ABCDEFGHIJKLMNOPQRSTUVXYZ".charAt(columnIndex % 21));
  };
  
  this.getColumnType = function(columnIndex) {
    return cols[columnIndex] && cols[columnIndex].type;
  };
  
  this.getColumnPattern = function(columnIndex) {
    return cols[columnIndex] && cols[columnIndex].pattern;
  };
  
  this.getColumnLocale = function(columnIndex) {
    return cols[columnIndex] && cols[columnIndex].locale;
  };
  
  this.getColumnRange = function(columnIndex, rowIndexStart, rowIndexEnd) {
    if (this.getColumnType(columnIndex) === 'string') {
      return {min: this.getValue(0, columnIndex), max: this.getValue(this.getNumberOfRows() - 1, columnIndex)};
    }
    rowIndexStart = rowIndexStart ? rowIndexStart : 0;
    rowIndexEnd = rowIndexEnd ? rowIndexEnd : this.getNumberOfRows() - 1;
    var value, min = null, max = null;
    for (rowIndex = rowIndexStart; rowIndex <= rowIndexEnd; rowIndex++) {
      value = this.getValue(rowIndex, columnIndex);
      if (typeof value !== 'undefined' && value !== null && value.valueOf && (typeof value !== 'string' || value)) {
        min = min === null || value.valueOf() < min.valueOf() ? value : min;
        max = max === null || value.valueOf() > max.valueOf() ? value : max;
      }
    }
    return {min: min, max: max};
  };
  
  this.getColumnAverage = function(columnIndex, rowIndexStart, rowIndexEnd) {
    rowIndexStart = rowIndexStart ? rowIndexStart : 0;
    rowIndexEnd = rowIndexEnd ? rowIndexEnd : this.getNumberOfRows() - 1;
    var count = rowIndexEnd + 1 - rowIndexStart, sum = 0;
    for (rowIndex = rowIndexStart; rowIndex <= rowIndexEnd; rowIndex++) {
      value = this.getValue(rowIndex, columnIndex);
      if (typeof value.valueOf() === "string" && !value) {
        continue;
      }
      sum+= value.valueOf();
    }
    var avg = sum / count;
    if (this.getColumnType(columnIndex) === 'date') {
      avg = new Date(avg);
    }
    return avg;
  };
  
  this.getDistinctValues = function(columnIndex) {
    var
      rowIndex;
      values = [];
    for (rowIndex = 0; rowIndex < this.getNumberOfRows(); rowIndex++) {
      var value = this.getValue(rowIndex, columnIndex);
      values.push(value);
    }
    return values;
  };
  
  this.getSortedRows = function(columnIndex, desc) {
    var
      result = rows.slice();
    if (this.getColumnType(columnIndex) === 'string') {
      result = desc ? result.reverse() : result;
    } else {
      result.sort(function(a, b) {
        var av = (typeof a[columnIndex] === 'object' ? a[columnIndex].v : a[columnIndex]);
        var bv = (typeof b[columnIndex] === 'object' ? b[columnIndex].v : b[columnIndex]);
        var s = av < bv ? -1 : av > bv ? 1 : 0;
        return desc ? s * -1 : s;
      });
    }
    return result.map(function(row) {
      return row.map(function(cell) {
        return typeof cell === 'object' ? cell.v : cell;
      });
    });
  };
  
  this.getValue = function(rowIndex, columnIndex) {
    var cell = rows[rowIndex] && rows[rowIndex][columnIndex];
    return typeof cell === 'object' ? cell.v : cell;
  };
  
  this.getFormattedValue = function(rowIndex, columnIndex) {
    var cell = rows[rowIndex][columnIndex];
    return typeof cell === 'object' ? typeof cell.f !== 'undefined' ? cell.f : cell.v : cell;
  };
  
  this.getNumberOfColumns = function() {
    return cols.length;
  };
  
  this.getNumberOfRows = function() {
    return rows.length;
  };
  
  this.toJSON = function() {
    return {
      cols: cols, 
      rows: rows
    };
  };
}

DataTable.fromJSON = function(json) {
  /*
  var result = new DataTable();
  (data.cols || []).forEach(function(column, columnIndex) {
    result.addColumn(column.type, column.label, column.pattern);
    (data.rows || []).forEach(function(row, rowIndex) {
      var cell = row[columnIndex];
      result.setCell(rowIndex, columnIndex, cell.v, cell.f);
    });
  });
  return result;*/
  return new DataTable(json); 
};


function detectColumnType(string) {
  var dateValue = dformat.parse(string);
  var numValue = nformat.parse(string);
  if (!isNaN(nformat.parse(string))) {
    // Number
    return "number";
  } else if (dformat.parse(string)) {
    return "date";
  }
  return "string";
}

DataTable.fromArray = function(data, options) {
  
  if (data instanceof DataTable) {
    return data;
  }
  
  if (data.rows || data.cols) {
    return new DataTable(data);
  }
  var columnData = [];
  var rowIndex, columnIndex;
  var firstRowAsLabels = false;
  data = data.slice();
  var len = Math.min(2, data.length);
  
  
  // Trim empty rows
  var trimmed = [];
  for (var rowIndex = 0; rowIndex < data.length; rowIndex++ ) {
    var row = data[rowIndex];
    var isEmpty = true;
    for (var columnIndex = 0; columnIndex < row.length; columnIndex++ ) {
      var cell = data[rowIndex][columnIndex];
      if (!(typeof cell === 'undefined' || typeof cell === null || cell.length === 0)) {
        isEmpty = false;
      }
    }
    if (!isEmpty) {
      trimmed.push(row);
    }
  }
  data = trimmed;
  
  for (var rowIndex = 0; rowIndex < len; rowIndex++ ) {
    var row = data[rowIndex];
    for (var columnIndex = 0; columnIndex < row.length; columnIndex++ ) {
      var col = columnData[columnIndex] = columnData[columnIndex] || {}; 
      var formattedValue = row[columnIndex];
      var value;
      var columnType = detectColumnType(formattedValue);
      if (columnType === "string" && rowIndex === 0 && formattedValue) {
        col.label = formattedValue;
      }
    }
  }
  
  var firstRowAsLabels = true;
  for (var columnIndex = 0; columnIndex < columnData.length; columnIndex++ ) {
    var cell1 = data[0][columnIndex];
    var cell2 = data[1][columnIndex];
    var columnType1 = detectColumnType(cell1);
    var columnType2 = detectColumnType(cell2);
    if (columnType1 !== "string") {
      firstRowAsLabels = false;
    }
  }
  
  if (firstRowAsLabels) {
    var labelRow = data[0];
    data.splice(0, 1);
    for (var columnIndex = 0; columnIndex < columnData.length; columnIndex++ ) {
       col.label = labelRow[columnIndex];
    }
  } else {
    for (var columnIndex = 0; columnIndex < columnData.length; columnIndex++ ) {
       var col = columnData[columnIndex];
       col.label = "";
    }
  }
  
  // Trim array to 100 rows
  if (data.length > 100) {
    var m = Math.round((data.length - 2) / 100);
    if (m > 1) {
      var trimmed = [data[0]];
      for (var i = 1; i < (data.length - 2); i++) {
        if (i % m === 0) {
          trimmed.push(data[i]);
        }
      }
      trimmed.push(data[data.length - 1]);
      data = trimmed;
    }
  }
  
  
  for (var rowIndex = 0; rowIndex < data.length; rowIndex++ ) {
    for (var columnIndex = 0; columnIndex < columnData.length; columnIndex++ ) {
      var cell = data[rowIndex][columnIndex];
      var col = columnData[columnIndex];
      col.value = col.value || 0;
      var length = cell.toString().length;
      if (!col.value || length > col.value.toString().length) {
        col.value = cell;
      }
    }
  }
  
  // Detect
  for (var columnIndex = 0; columnIndex < columnData.length; columnIndex++ ) {
    var col = columnData[columnIndex];
    var columnType = detectColumnType(col.value);
    var format = null, value = null;
    var tool = columnType === "date" ? dformat : columnType === "number" ? nformat : null;
    if (tool) {
      value = tool.parse(col.value);
      format = tool.detect(value, col.value);
    }
    delete col.value;
    col.type = columnType;
    col.pattern = format && format.pattern || null;
    col.locale = format && format.locale || null;
  }

  // Parse
  var rows = [];
  for (var rowIndex = 0; rowIndex < data.length; rowIndex++ ) {
    var row = [];
    for (var columnIndex = 0; columnIndex < columnData.length; columnIndex++ ) {
      var col = columnData[columnIndex];
      var cell = data[rowIndex][columnIndex];
      var columnType = col.type;
      
      if (columnType === 'number' || columnType === 'date') {
        var tool = columnType === "date" ? dformat : columnType === "number" ? nformat : null;
        cell = {
          v: tool.parse(cell, col.pattern, col.locale),
          f: cell
        };
      }
      
      col.type = columnType;
      row[columnIndex] = cell;
    }
    rows.push(row);
  }
  return new DataTable({cols: columnData, rows: rows});
};
  
module.exports = DataTable;
},{"../../vendor/dformat/src/dformat":17,"../../vendor/nformat/src/nformat":20}],14:[function(require,module,exports){
var nticks = require('./nticks');

var
  
  daysInMonth = function(date) {
    return new Date(date.getYear(), date.getMonth() + 1, 0).getDate();
  },    
  
  dateDiff = (function() {
    
    var
      monthDiff = function(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth() + 1;
        return months <= 0 ? 0 : months;
      };
    
    return function(date1, date2, flags) {
      result = {};
      
      flags = typeof flags !== 'undefined' ? flags : 1 | 2 | 4 | 8 | 16 | 32;
      
      date1 = new Date(date1);
      date2 = new Date(date2);
      
      var
        t1 = date1.getTime(),
        t2 = date2.getTime(),
        tz1 = date2.getTimezoneOffset(),
        tz2 = date2.getTimezoneOffset(),
        years,
        months,
        days,
        hours,
        minutes;

      if (flags & 1 || flags & 2 || flags & 4) {
        months = monthDiff(date1, date2);
      }
      
      if (flags & 1) {
        years = Math.floor(months / 12);
        months = months - years * 12;
        result.years = years;
      }
      
      if (flags & 4) {
        if (flags & 2) {
          if (date2.getUTCDate() >= date1.getUTCDate()) {
            days = date2.getUTCDate() - date1.getUTCDate();
          } else {
            months--;
            days = date1.getUTCDate() - date2.getUTCDate() + daysInMonth(date1);
          }
        } else {
          days = (t2 - t1) / 1000 / 60 / 60 / 24;
        }
      }
      
      if (flags & 2) {
        result.months = months;
      }
      
      if (flags & 4) {
        result.days = Math.abs(Math.round(days));
      }
      
      if (flags & 8) {
        // Hours
        hours = (t2 - t1) / 1000 / 60 / 60;
        if (flags & 4) {
          hours = Math.round((t2 - t1) / 1000 / 60 / 60 / 24) * 24 - hours;
        }
        result.hours = Math.round(hours);
      }
      
      if (flags & 16) {
        // Minutes
        minutes = (t2 - t1) / 1000 / 60;
        if (flags & 8) {
          minutes = Math.round((t2 - t1) / 1000 / 60 / 60) * 60 - minutes;
        }
        result.minutes = Math.round(minutes);
      }
      
      if (flags & 32) {
        // Minutes
        seconds = (t2 - t1) / 1000;
        if (flags & 16) {
          seconds = Math.round((t2 - t1) / 1000 / 60) * 60 - seconds;
        }
        result.seconds = Math.round(seconds);
      }
      
      return result;
    };
  })(),
  
  dateTicks = function(min, max, count, outer) {

    // Defaults
    min = typeof min === "undefined" || isNaN(min) ? 0 : min;
    max = typeof max === "undefined" || isNaN(max)? 1 : max;
    count = typeof count !== "number" ? 10 : count;
    outer = typeof outer === "undefined" ? false : outer,
    ticks = [];
    
    min = new Date(min);
    max = new Date(max);
    
    if (min.getTime() === max.getTime()) {
      return [min, max];
    }
    
    var tickUnit = null;
    var o, v, f = 1, sf, sv;
    while(f <= 32 && (o = dateDiff(min, max, f))) {
      v = o[Object.keys(o)[0]];
      if (v < count || f === 1) {
        sf = f;
        sv = v;
        f*=2;
      } else {
        break;
      }
    }
    
    var diff = dateDiff(min, max);
    
    if (sf === 1) {
      // Year scale
      
      var yearMinDate = new Date("1/1/" + min.getFullYear());
      var yearMaxDate = new Date("1/1/" + max.getFullYear());
      
      var yearMinDiff = dateDiff(yearMinDate, min, 0 | 2).months / 12;
      var yearMaxDiff = dateDiff(yearMaxDate, max, 0 | 2).months / 12;
      
      var yearTicks = nticks(min.getFullYear() + yearMinDiff, max.getFullYear() + yearMaxDiff, count, outer);
      
      for (var i = 0; tick = yearTicks[i]; i++) {
        var decYear = tick;
        var intYear = Math.floor(decYear);
        var decMonth = (decYear - intYear) * 12;
        var intMonth = Math.floor(decMonth);
        var intDate = new Date(intYear, intMonth, 0);
        
        var decDay = (decMonth - intMonth) * daysInMonth(intDate);
        var intDay = Math.floor(decDay);
        var date = new Date("1/1/1970");
        date.setFullYear(intYear);
        date.setMonth(intMonth);
        date.setDate(intDay + 1);
        
        ticks[i] = date;
      }
      
      return ticks;
    } else {
      // Scale not supported currently
      console.warn("SCALE NOT SUPPORTED");
      return [];
    }
  };
  
module.exports = dateTicks;
},{"./nticks":15}],15:[function(require,module,exports){
var ln10 = Math.log(10);
var calcStepSize = function(range, targetSteps)
{
  
  // calculate an initial guess at step size
  var tempStep = range / targetSteps;

  // get the magnitude of the step size
  var mag = Math.floor(Math.log(tempStep) / ln10);
  var magPow = Math.pow(10, mag);

  // calculate most significant digit of the new step size
  var magMsd = Math.round(tempStep / magPow + 0.5);

  // promote the MSD to either 1, 2, or 5
  if (magMsd > 5.0)
    magMsd = 10.0;
  else if (magMsd > 2.0)
    magMsd = 5.0;
  else if (magMsd > 1.0)
    magMsd = 2.0;

  return magMsd * magPow;
};


var 
  niceFraction = function(number, round) {
    
    var
      log10 = Math.log(number) / Math.log(10),
      exponent = Math.floor(log10),
      fraction = number / Math.pow(10, exponent),
      result;

    if (round) {
      if (fraction < 1.5) {
        result = 1;
      } else if (fraction < 3) {
        result = 2;
      } else if (fraction < 7) {
        result = 5;
      } else {
        result = 10;
      }
    } else {
      if (fraction <= 1) {
        result = 1;
      } else if (fraction <= 2) {
        result = 2;
      } else if (fraction <= 5) {
        result = 5;
      } else {
        result = 10;
      }
    }
    
    return result * Math.pow(10, exponent);
  },
  
  numTicks = function(min, max, count, outer) {

    if (min === max) {
      return [max];
    }
          
    // Defaults
    min = typeof min === "undefined" || isNaN(min) ? 0 : min;
    max = typeof max === "undefined" || isNaN(max) ? 1 : max;
    count = typeof count !== "number" ? 10 : count;
    outer = typeof outer === "undefined" ? false : outer;
    
    var
      diff = max - min,
      //range = niceFraction(diff),
      //interval = niceFraction(range / count),
      interval = calcStepSize(diff, count),
      nmin = min - min % interval,
      nmax = max - max % interval,
      size,
      tickItems = [],
      tickValue,
      i;
  
   if (outer) {
        
      if (nmin > min) {
        nmin-= interval;
      }
      
      if (nmax < max) {
        nmax+= interval;
      }
        
    } else {
      
      if (nmin < min) {
        nmin+= interval;
      }
      
      if (nmax > max) {
        nmax-= interval;
      }
      
    }
    
    for (i = nmin; i <= nmax; i+=interval) {
      tickItems.push(i);
    }
    
    return tickItems;
  };
  
module.exports = numTicks;
},{}],16:[function(require,module,exports){
module.exports = function round(num, digits) {
  digits = typeof digits === 'number' ? digits : 1;
  var value = parseFloat(num);
  if (!isNaN(value) && new String(value).length === new String(num).length) {
    value = parseFloat(value.toFixed(digits));
    return value;
  }
  return num;
};
},{}],17:[function(require,module,exports){
var i18n = require("./locales/all");

function cartesianProductOf(array, unique) {
  return Array.prototype.reduce.call(array, function(a, b) {
    var ret = [];
    a.forEach(function(a) {
      b.forEach(function(b) {
        if (!unique || a.indexOf(b) < 0) {
          ret.push(a.concat([b]));
        }
      });
    });
    return ret;
  }, [[]]);
}

function sortByRelevance(a, b) {
  return a.relevance > b.relevance ? -1 : a.relevance < b.relevance ? 1 : 0;
}

function escapeRegExp(str) {
  str = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  str = str.replace(/\s/g, "\\s");
  return str;
}

function pad( a, b ) {
  return (1e15 + a + "").slice(-b);
}

function getLocaleData(locale) {
  if (i18n[locale]) {
    return i18n[locale];
  }
  for (var key in i18n) {
    if (i18n[key].equals && i18n[key].equals.split(",").indexOf(locale) >= 0) {
      return i18n[key];
    }
  };
}

function getLocales(locale) {
  var locales = [];
  Object.keys(i18n).forEach(function(locale) {
    locales.push(locale);
    locales = locales.concat(i18n[locale].equals && i18n[locale].equals.split(/\s*,\s*/) || []);
  });
  return locales;
}

function getReplacements(localeData, date) {
  var
    result = {},
    d2 = "\\d{2}",
    d4 = "\\d{4}",
    weekdayNames = localeData.weekday,
    monthNames = localeData.month,
    day = date ? (date.getDay() - 1 + 7) % 7 : -1;
    keys = ["yyyy", "yy", "y", "MMMM", "MMM", "MM", "M", "dddd", "ddd", "dd", "d", "HH", "H", "hh", "h", "mm", "m", "ss", "s", "tt", "t"],
    values = date ? 
      [
        // Year
        date.getFullYear(), 
        pad(date.getYear(), 2), 
        date.getYear(),
        
        // Month
        monthNames.long[date.getMonth()], 
        monthNames.short[date.getMonth()], 
        pad(date.getMonth() + 1, 2),
        date.getMonth() + 1,
        
        // Day
        weekdayNames.long[day],
        weekdayNames.short[day],
        pad(date.getDate(), 2),
        date.getDate(),
        
        // Hour
        date.getHours(),
        pad(date.getHours(), 2),
        
        // Hour12
        pad(date.getHours() % 12, 2),
        date.getHours() % 12,
        
        // Minute
        pad(date.getMinutes(), 2),
        date.getMinutes(),
        
        // Second
        pad(date.getSeconds(), 2),
        date.getSeconds(),
        
        // Hour12 Designator
        date.getHours() >= 12 ? "PM" : "AM",
        (date.getHours() >= 12 ? "PM" : "AM").substring(0, 1)
      ] : 
      [
        // Year
        d4,
        d2,
        d2,
        
        // Month
        monthNames.long.map(escapeRegExp).join("|"),
        monthNames.short.map(escapeRegExp).join("|"),
        d2,
        d2,
        
        // Day
        weekdayNames.long.map(escapeRegExp).join("|"),
        weekdayNames.short.map(escapeRegExp).join("|"),
        d2,
        d2,
        
        // Hour
        d2,
        d2,
        
        // Hour12
        d2,
        d2,
        
        // Minute
        d2,
        d2,
        
        // Second
        d2,
        d2,
        
        // Hour12 Designator
        "AM|PM",
        "A|P"
        
      ];
    
    
    keys.forEach(function(key, index) {
      var value = values[index];
      result[key] = value;
    });
    
    return result;
}

function format(date, pattern, locale) {
   
  var
    localeData = getLocaleData(locale || 'en'),
    pattern = pattern || localeData.patterns[0] || "yyyy/MM/dd hh:ss tt",
    replacements = getReplacements(localeData, date),
    regex = new RegExp("\\b(?:" + Object.keys(replacements).join("|") + ")\\b", "g"),
    match, 
    index = 0,
    result = "";
  
  while (match = regex.exec(pattern)) {
    result+= pattern.substring(index, match.index);
    result+= replacements[match];
    index = match.index + match[0].length;
  }
  result+= pattern.substring(index);
  return result;
}

function parse(string, pattern, locale) {
  var locales = locale instanceof Array ? locale : locale ? [locale] : Object.keys(i18n);
  var date = null;
  
  locales.forEach(function(locale) {
    
    if (date) {
      return;
    }
    
    var
      localeData = getLocaleData(locale),
      parts = getReplacements(localeData),
      patternRegex = new RegExp("\\b(" + Object.keys(parts).join("|") + ")" + "\\b", "g"),
      patterns = pattern instanceof Array ? pattern : pattern ? [pattern] : localeData.patterns;
      
    patterns.forEach(function(pattern) {
      
      if (date) {
        return;
      }
    
      var
        captures = [],
        match,
        matches,
        hour12pm,
        index = 0,
        dateRegex = "";
      
      while( match = patternRegex.exec(pattern) ) {
        captures.push(match[1]);
        dateRegex+= escapeRegExp(pattern.substring(index, match.index));
        dateRegex+= "(" + parts[Object.keys(parts).filter(function(part) {
          return match[0] === part;
        })[0]] + ")";
        index = match.index + match[0].length;
      }
      dateRegex+= escapeRegExp(pattern.substring(index));
      
      match = (new RegExp(dateRegex)).exec(string);
      
      if (match) {
        date = new Date("0");
        matches = match.slice(1);
        
        hour12pm = (matches.filter(function(value, index) {
          return (captures[index] === "tt" || captures[index] === "t") && value.substring(0, 1).toUpperCase() === "P";
        }).length > 0);
        
        var year, month, monthDay, hours, minutes, seconds;
        
        matches.forEach(function(value, index) {
          var numericValue = parseInt(value);
          switch (captures[index]) {
            case 'yyyy': 
              year = numericValue;
              break;
            case 'MMMM':
              month = localeData.month.long.indexOf(value);
              break;
            case 'MMM':
              month = localeData.month.short.indexOf(value);
              break;
            case 'MM':
            case 'M':
              month = numericValue - 1;
              break;
            case 'dddd':
            case 'ddd':
              // Cannot determine date from weekday
              break;
            case 'dd':
            case 'd':
              monthDay = numericValue;
              break;
            case 'HH':
            case 'H':
              hours = numericValue;
              break;
            case 'hh':
            case 'h':
              hours = hour12pm ? numericValue + 12 : numericValue;
              break;
            case 'mm':
            case 'm':
              minutes = numericValue;
              break;
            case 'ss':
            case 's':
              seconds = numericValue;
              break;
          }
        });
        
        if (year !== undefined) {
          date.setFullYear(year);
        }
        
        if (month !== undefined) {
          date.setMonth(month);
        }
        
        if (monthDay !== undefined) {
          date.setDate(monthDay);
        }
        
        if (hours !== undefined) {
          date.setHours(hours);
        }
        
        if (minutes !== undefined) {
          date.setMinutes(minutes);
        }
        
        if (seconds !== undefined) {
          date.setSeconds(seconds);
        }
        
        if ( isNaN( date.getTime() ) ) {
          date = null;
        } else {
          // Valid
        }
        
      }
      
    });
  });
  
  if (date) {
    return date;
  }
  
  return date;
}

function detect(date, string) {
  var
    locales = Object.keys(i18n),
    resultLocalePatterns = [];

  locales.forEach(function(locale) {
    
    var 
      localeData = getLocaleData(locale),
      replacements = getReplacements(localeData, date),
      values = Object.keys(replacements).map(function(part){
          return replacements[part].toString();
        }).filter(function(part, index, self) {
          return self.indexOf(part) === index;
        }).map(escapeRegExp).map(function(value) {
          return !isNaN(parseFloat(value)) ? "\\b" + value + "\\b" : value;
        }),
      regex = new RegExp(values.join("|"), "g"),
      match, substring, index = 0,
      patternParts = [],
      patternPartsIndex = [],
      matchRank = 0,
      matches = [],
      hour12 = false,
      rest = "";
      
      while (match = regex.exec(string)) {
        if (match[0] === replacements["tt"].toString()) {
          hour12 = true;
        }
        matches.push(match);
      }
      
      for (var m = 0; m < matches.length; m++) {
        match = matches[m];
        substring = string.substring(index, match.index);
        if (substring) {
          rest+= substring;
          patternParts.push([patternPartsIndex.length]);
          patternPartsIndex.push(substring);
        }
        var matchingParts = [];
        for (var part in replacements) {
          if (match[0] === replacements[part].toString()) {
            if ((part === "HH" || part === "H") && hour12) {
              continue;
            }
            var i = patternPartsIndex.indexOf(part);
            if (i < 0) {
              i = patternPartsIndex.length;
              patternPartsIndex.push(part);
            }
            matchingParts.push(i);
          }
        }
        matchRank+= 1 / matchingParts.length;
        patternParts.push(matchingParts);
        index = match.index + match[0].length;
      }
      substring = string.substring(index);
      rest+= substring;
      
      if (substring) {
        patternParts.push([patternPartsIndex.length]);
        patternPartsIndex.push(substring);
      }
      
      resultLocalePatterns.push({
        locale: locale, 
        localeData: localeData,
        relevance: matchRank + (1 - rest.length / string.length),
        pattern: {
          parts: patternParts,
          index: patternPartsIndex
        }
      });
    
  });
  
  if (!resultLocalePatterns.length) {
    return null;
  }
  
  resultLocalePatterns.sort(sortByRelevance);
  
  if (!resultLocalePatterns.length) {
    return null;
  }
  
  var relevance = resultLocalePatterns[0].relevance;
  
  var results = resultLocalePatterns.filter(function(resultData) {
    return resultData.relevance === relevance; 
  }).map(function(resultData) {
    
    var
      patternData = resultData.pattern,
      combinations = cartesianProductOf(patternData.parts, true),
      patterns = combinations.map(function(combination) {
        var string = combination.map(function(partIndex) {
          return patternData.index[partIndex];
        }).join("");
        var relevance = resultData.localeData.patterns.filter(function(localePattern) {
          return string.indexOf(localePattern) >= 0;
        }).length;
        return {
          rest: resultData.rest,
          string: string,
          relevance: relevance
        };
      });
    
    if (!patterns.length) {
      return null;
    }
    
    patterns.sort(sortByRelevance);
    
    return {
      rest: patterns[0].rest,
      relevance: patterns[0].relevance,
      pattern: patterns[0].string, 
      locale: resultData.locale
    };
  });
  
  results.sort(sortByRelevance);
  
  if (results[0]) {
    return {
      pattern: results[0].pattern,
      locale: results[0].locale
    };
  }
}


function dformat(date, pattern, locale) {
  return format.apply(this, arguments);
}

dformat.parse = function(string, pattern, locale) {
  return parse.apply(this, arguments);
};

dformat.detect = function(date, string) {
  return detect.apply(this, arguments);
};


module.exports = dformat;
},{"./locales/all":18}],18:[function(require,module,exports){
module.exports = {
  "en": {
    "month": {
      "long": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      "short": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
    },
    "weekday": {
      "long": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "short": [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ]
    },
    "patterns": [
      "dddd, MMMM dd, yyyy, hh:mm:ss tt",
      "MMMM dd, yyyy, hh:mm:ss tt",
      "MMM dd, yyyy, hh:mm:ss tt",
      "MM/dd/yyyy, hh:mm tt",
      "dddd, MMMM dd, yyyy",
      "MMMM dd, yyyy",
      "MMM dd, yyyy",
      "MM/dd/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "hh:mm:ss tt",
      "hh:mm tt"
    ]
  },
  "de": {
    "month": {
      "long": [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
      ],
      "short": [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez"
      ]
    },
    "weekday": {
      "long": [
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
        "Sonntag"
      ],
      "short": [
        "Mo.",
        "Di.",
        "Mi.",
        "Do.",
        "Fr.",
        "Sa.",
        "So."
      ]
    },
    "patterns": [
      "dddd, dd. MMMM yyyy HH:mm:ss",
      "dd. MMMM yyyy HH:mm:ss",
      "dd. MMM yyyy HH:mm:ss",
      "dd.MM.yyyy HH:mm",
      "dddd, dd. MMMM yyyy",
      "dd. MMMM yyyy",
      "dd. MMM yyyy",
      "dd.MM.yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "fr": {
    "month": {
      "long": [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
      ],
      "short": [
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juil.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc."
      ]
    },
    "weekday": {
      "long": [
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi",
        "dimanche"
      ],
      "short": [
        "lun.",
        "mar.",
        "mer.",
        "jeu.",
        "ven.",
        "sam.",
        "dim."
      ]
    },
    "patterns": [
      "dddd dd MMMM yyyy HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd MMM yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd/MM/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "es": {
    "month": {
      "long": [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ],
      "short": [
        "Ene.",
        "Feb.",
        "Mar.",
        "Abr.",
        "May.",
        "Jun.",
        "Jul.",
        "Ago.",
        "Sept.",
        "Oct.",
        "Nov.",
        "Dic."
      ]
    },
    "weekday": {
      "long": [
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
        "domingo"
      ],
      "short": [
        "lun.",
        "mar.",
        "mié.",
        "jue.",
        "vie.",
        "sáb.",
        "dom."
      ]
    },
    "patterns": [
      "dddd, dd de MMMM de yyyy HH:mm:ss",
      "dd de MMMM de yyyy HH:mm:ss",
      "dd de MMM de yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd, dd de MMMM de yyyy",
      "dd de MMMM de yyyy",
      "dd de MMM de yyyy",
      "dd/MM/yyyy",
      "MMMM de yyyy",
      "MMM de yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "it": {
    "month": {
      "long": [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre"
      ],
      "short": [
        "gen",
        "feb",
        "mar",
        "apr",
        "mag",
        "giu",
        "lug",
        "ago",
        "set",
        "ott",
        "nov",
        "dic"
      ]
    },
    "weekday": {
      "long": [
        "lunedì",
        "martedì",
        "mercoledì",
        "giovedì",
        "venerdì",
        "sabato",
        "domenica"
      ],
      "short": [
        "lun",
        "mar",
        "mer",
        "gio",
        "ven",
        "sab",
        "dom"
      ]
    },
    "patterns": [
      "dddd dd MMMM yyyy HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd/MMM/yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd/MMM/yyyy",
      "dd/MM/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "nl": {
    "month": {
      "long": [
        "januari",
        "februari",
        "maart",
        "april",
        "mei",
        "juni",
        "juli",
        "augustus",
        "september",
        "oktober",
        "november",
        "december"
      ],
      "short": [
        "jan",
        "feb",
        "mrt",
        "apr",
        "mei",
        "jun",
        "jul",
        "aug",
        "sep",
        "okt",
        "nov",
        "dec"
      ]
    },
    "weekday": {
      "long": [
        "maandag",
        "dinsdag",
        "woensdag",
        "donderdag",
        "vrijdag",
        "zaterdag",
        "zondag"
      ],
      "short": [
        "ma",
        "di",
        "wo",
        "do",
        "vr",
        "za",
        "zo"
      ]
    },
    "patterns": [
      "dddd dd MMMM yyyy HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd MMM yyyy HH:mm:ss",
      "dd-MM-yyyy HH:mm",
      "dddd dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd-MM-yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "tr": {
    "month": {
      "long": [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık"
      ],
      "short": [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara"
      ]
    },
    "weekday": {
      "long": [
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
        "Pazar"
      ],
      "short": [
        "Pzt",
        "Sal",
        "Çar",
        "Per",
        "Cum",
        "Cmt",
        "Paz"
      ]
    },
    "patterns": [
      "dd MMMM yyyy dddd HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd MMM yyyy HH:mm:ss",
      "dd.MM.yyyy HH:mm",
      "dd MMMM yyyy dddd",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd.MM.yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "br": {
    "month": {
      "long": [
        "Genver",
        "Cʼhwevrer",
        "Meurzh",
        "Ebrel",
        "Mae",
        "Mezheven",
        "Gouere",
        "Eost",
        "Gwengolo",
        "Here",
        "Du",
        "Kerzu"
      ],
      "short": [
        "Gen",
        "Cʼhwe",
        "Meur",
        "Ebr",
        "Mae",
        "Mezh",
        "Goue",
        "Eost",
        "Gwen",
        "Here",
        "Du",
        "Ker"
      ]
    },
    "weekday": {
      "long": [
        "Lun",
        "Meurzh",
        "Mercʼher",
        "Yaou",
        "Gwener",
        "Sadorn",
        "Sul"
      ],
      "short": [
        "lun",
        "meu.",
        "mer.",
        "yaou",
        "gwe.",
        "sad.",
        "sul"
      ]
    },
    "patterns": [
      "yyyy MMMM dd, dddd HH:mm:ss",
      "yyyy MMMM dd HH:mm:ss",
      "yyyy MMM dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
      "yyyy MMMM dd, dddd",
      "yyyy MMMM dd",
      "yyyy MMM dd",
      "yyyy-MM-dd",
      "yyyy MMMM",
      "yyyy MMM",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "pt": {
    "month": {
      "long": [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
      ],
      "short": [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez"
      ]
    },
    "weekday": {
      "long": [
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado",
        "domingo"
      ],
      "short": [
        "seg",
        "ter",
        "qua",
        "qui",
        "sex",
        "sáb",
        "dom"
      ]
    },
    "patterns": [
      "dddd, dd de MMMM de yyyy HH:mm:ss",
      "dd de MMMM de yyyy HH:mm:ss",
      "dd de MMM de yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd, dd de MMMM de yyyy",
      "dd de MMMM de yyyy",
      "dd de MMM de yyyy",
      "dd/MM/yyyy",
      "MMMM de yyyy",
      "MMM de yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "bg": {
    "month": {
      "long": [
        "януари",
        "февруари",
        "март",
        "април",
        "май",
        "юни",
        "юли",
        "август",
        "септември",
        "октомври",
        "ноември",
        "декември"
      ],
      "short": [
        "ян.",
        "февр.",
        "март",
        "апр.",
        "май",
        "юни",
        "юли",
        "авг.",
        "септ.",
        "окт.",
        "ноем.",
        "дек."
      ]
    },
    "weekday": {
      "long": [
        "понеделник",
        "вторник",
        "сряда",
        "четвъртък",
        "петък",
        "събота",
        "неделя"
      ],
      "short": [
        "пн",
        "вт",
        "ср",
        "чт",
        "пт",
        "сб",
        "нд"
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy г., HH:mm:ss",
      "dd MMMM yyyy г., HH:mm:ss",
      "dd MMM yyyy г., HH:mm:ss",
      "dd.MM.yyyy г., HH:mm",
      "dddd, dd MMMM yyyy г.",
      "dd MMMM yyyy г.",
      "dd MMM yyyy г.",
      "dd.MM.yyyy г.",
      "MMMM yyyy г.",
      "MMM yyyy г.",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "in": {
    "month": {
      "long": [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
      ],
      "short": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agt",
        "Sep",
        "Okt",
        "Nov",
        "Des"
      ]
    },
    "weekday": {
      "long": [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu"
      ],
      "short": [
        "Sen",
        "Sel",
        "Rab",
        "Kam",
        "Jum",
        "Sab",
        "Min"
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy HH.mm.ss",
      "dd MMMM yyyy HH.mm.ss",
      "dd MMM yyyy HH.mm.ss",
      "dd/MM/yyyy HH.mm",
      "dddd, dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd/MM/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH.mm.ss",
      "HH.mm"
    ]
  },
  "ro": {
    "month": {
      "long": [
        "ianuarie",
        "februarie",
        "martie",
        "aprilie",
        "mai",
        "iunie",
        "iulie",
        "august",
        "septembrie",
        "octombrie",
        "noiembrie",
        "decembrie"
      ],
      "short": [
        "ian.",
        "feb.",
        "mar.",
        "apr.",
        "mai",
        "iun.",
        "iul.",
        "aug.",
        "sept.",
        "oct.",
        "nov.",
        "dec."
      ]
    },
    "weekday": {
      "long": [
        "luni",
        "marți",
        "miercuri",
        "joi",
        "vineri",
        "sâmbătă",
        "duminică"
      ],
      "short": [
        "Lun",
        "Mar",
        "Mie",
        "Joi",
        "Vin",
        "Sâm",
        "Dum"
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy, HH:mm:ss",
      "dd MMMM yyyy, HH:mm:ss",
      "dd MMM yyyy, HH:mm:ss",
      "dd.MM.yyyy, HH:mm",
      "dddd, dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd.MM.yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "mk": {
    "month": {
      "long": [
        "јануари",
        "февруари",
        "март",
        "април",
        "мај",
        "јуни",
        "јули",
        "август",
        "септември",
        "октомври",
        "ноември",
        "декември"
      ],
      "short": [
        "јан.",
        "фев.",
        "мар.",
        "апр.",
        "мај",
        "јун.",
        "јул.",
        "авг.",
        "септ.",
        "окт.",
        "ноем.",
        "дек."
      ]
    },
    "weekday": {
      "long": [
        "понеделник",
        "вторник",
        "среда",
        "четврток",
        "петок",
        "сабота",
        "недела"
      ],
      "short": [
        "пон.",
        "вт.",
        "сре.",
        "чет.",
        "пет.",
        "саб.",
        "нед."
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy г. HH:mm:ss",
      "dd MMMM yyyy г. HH:mm:ss",
      "dd MMM yyyy г. HH:mm:ss",
      "dd.MM.yyyy HH:mm",
      "dddd, dd MMMM yyyy г.",
      "dd MMMM yyyy г.",
      "dd MMM yyyy г.",
      "dd.MM.yyyy",
      "MMMM yyyy г.",
      "MMM yyyy г.",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "th": {
    "month": {
      "long": [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม"
      ],
      "short": [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค."
      ]
    },
    "weekday": {
      "long": [
        "วันจันทร์",
        "วันอังคาร",
        "วันพุธ",
        "วันพฤหัสบดี",
        "วันศุกร์",
        "วันเสาร์",
        "วันอาทิตย์"
      ],
      "short": [
        "จ.",
        "อ.",
        "พ.",
        "พฤ.",
        "ศ.",
        "ส.",
        "อา."
      ]
    },
    "patterns": [
      "dddd dd MMMM 2543 HH:mm:ss",
      "dd MMMM 2543 HH:mm:ss",
      "dd MMM 2543 HH:mm:ss",
      "dd/MM/2543 HH:mm",
      "dddd dd MMMM 2543",
      "dd MMMM 2543",
      "dd MMM 2543",
      "dd/MM/2543",
      "MMMM 2543",
      "MMM 2543",
      "HH:mm:ss",
      "HH:mm"
    ]
  }
};
},{}],19:[function(require,module,exports){
module.exports = {
  "en": {
    "args": [
      ",",
      ".",
      0,
      ""
    ],
    "equals": "th"
  },
  "de": {
    "args": [
      ".",
      ",",
      0,
      " "
    ],
    "equals": "ro"
  },
  "fr": {
    "args": [
      " ",
      ",",
      0,
      " "
    ]
  },
  "es": {
    "args": [
      " ",
      ",",
      0,
      ""
    ],
    "equals": "br,bg"
  },
  "it": {
    "args": [
      ".",
      ",",
      0,
      ""
    ],
    "equals": "nl,pt,in,mk"
  },
  "tr": {
    "args": [
      ".",
      ",",
      1,
      ""
    ]
  }
};
},{}],20:[function(require,module,exports){
var i18n = require("./locales/all");


// Pad Right
function padRight( string, length, character ) {
  if (string.length < length) {
    return string + Array(length - string.length + 1).join(character || "0");
  }
  return string;
}
  
// Pad Left
function padLeft( string, length, character ) {
  if (string.length < length) {
    return Array(length - string.length + 1).join(character || "0") + string;
  }
  return strngi;
}
  
  
function toPrecision(n, sig) {
  if (n !== 0) {
    var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
  }
  return n;
}
  
function getLocaleData(locale) {
  if (i18n[locale]) {
    return i18n[locale];
  }
  for (var key in i18n) {
    if (i18n[key].equals && i18n[key].equals.split(",").indexOf(locale) >= 0) {
      return i18n[key];
    }
  };
}
  
  
var patternRegex = new RegExp(/^\s*(%|\w*)?([#0]*(?:(,)[#0]+)*)(?:(\.)([#0]+))?(%|\w*)?\s*$/);
  
  
function format(number, pattern, locale) {
  var localeData;
   
  for (var i = 1; i < arguments.length; i++) {
    if (typeof arguments[i] === "string" && arguments[i].match(/[a-z]{2}/)) {
      localeData = getLocaleData(arguments[i]);
      arguments[i] = undefined;
    } else {
      pattern = arguments[i];
    }
  }
    
  if (!localeData) {
    localeData = getLocaleData('en');
  } 
   
  pattern = pattern || "#,###.#";
   
  var
    args = localeData.args,
    style = "decimal",
    useGrouping = false,
    groupingWhitespace = " " || "\u00A0",
    groupingSeparator = args[0],
    radix = args[1],
    leadingUnit = args[2],
    unitSpace = args[3] ? "\u00A0" : "",
    length = number.toString().length,
    significantDigits = -1;
     
     var patternMatch = patternRegex.exec(pattern);
     
     var intPatternString = patternMatch && patternMatch[2].replace(/,/g, "") || "";
     var intPadMatch = intPatternString ? intPatternString.match(/^0*/) : null;
     
     var intPadLength = intPadMatch ? intPadMatch[0].length : 0;
     
     var decPatternString = patternMatch[5] || "";
     
     var decPadMatch = decPatternString ? decPatternString.match(/0*$/) : null;
     var decPadLength = decPadMatch ? decPadMatch[0].length : 0;
     
     var fractionDigits = decPatternString.length || 0;
     
     var significantFractionDigits = decPatternString.length - decPadLength;
     var significantDigits = (intPatternString.length - intPadLength) + fractionDigits;
     
     var isNegative = number < 0 ? true : 0;
     
     number = Math.abs(number);
     
     style = patternMatch[1] || patternMatch[patternMatch.length - 1] ? "percent" : style;
     useGrouping = patternMatch[3] ? true : useGrouping;
     
     unit = style === "percent" ? "%" : style === "currency" ? currency : "";
     
     significantDigits = Math.floor(number).toString().length + fractionDigits;
     if (fractionDigits > 0 && significantDigits > 0) {
       number = parseFloat(toPrecision(number, significantDigits).toString());
     }
     
     if (style === 'percent') {
       number = number * 100;
     }
     
   var
     intValue = parseInt(number),
     decValue = parseFloat((number - intValue).toPrecision(12));
   
   var decString = decValue.toString();
   
   decString = decValue.toFixed(fractionDigits);
   decString = decString.replace(/^0\./, "");
   decString = decString.replace(/0*$/, "");
   decString = decString ? decString : fractionDigits > 0 ? "0" : "";
   
   if (decPadLength) {
     decString = padRight(decString, fractionDigits, "0");
   }
   
   if ((decPadLength || decValue > 0) && fractionDigits > 0) {
     decString = radix + decString;
   } else {
     decString = "";
     intValue = Math.round(number);
   }
   
   var intString = intValue.toString();
   
   if (intPadLength > 0) {
     intString = padLeft(intString, intPatternString.length, "0");
   }
   
   if (useGrouping) {
     intString = intString.replace(/\B(?=(\d{3})+(?!\d))/g, groupingSeparator.replace(/\s/g, groupingWhitespace) || ",");
   }

   var numString = (isNegative ? "-" : "") + intString + decString;
     
   return unit ? leadingUnit ? unit + unitSpace + numString : numString + unitSpace + unit : numString;
 }

function isLocale(locale) {
  return (typeof locale === "string" && locale.match(/[a-z]{2}/));
}

function detect(string, pattern, locale) {

  var inputPattern = null;
  for (var a = 1; a < arguments.length; a++) {
    var arg = arguments[a];
    if (arg instanceof Array || isLocale(arg)) {
      locale = arg;
    } else if (!inputPattern) {
      inputPattern = arg;
    }
  }
  pattern = inputPattern;
  
  var locales = locale instanceof Array ? locale : locale ? [locale] : Object.keys(i18n);
  
  var patternMatch;
  var patternUnit;
   
  if (pattern) {
    patternMatch = patternRegex.exec(pattern);
    patternUnit = patternMatch ? patternMatch[1] || patternMatch[patternMatch.length - 1] : null;
  }
  
  var results = locales.map(function(locale) {
    
     var localeData = getLocaleData(locale);
     
     var result = {locale: locale, pattern: pattern, relevance: 0};
     var value = NaN;
     
     if (localeData) {
       var args = localeData.args;
       
       if (args) {
         
         var numberRegexPart = "([\+-]?\\d*(?:" + args[0].replace(/\./, "\\.").replace(/\s/, "\\s") + "\\d{3})*)(?:" + args[1].replace(/\./g, "\\.") + "(\\d*))?";
         var leadingUnit = args[2];
         var unitSpace = args[3];
         var unitSpaceRegexPart = "" + unitSpace.replace(/\s/, "\\s") + "";
         var unitRegexPart = "(%|[\w*])";
         var numberRegex = numberRegexPart, matchNumIndex = 1, matchUnitIndex = 3;
         
         var detectedPattern;
         
         if (leadingUnit) {
           numberRegex = "(?:" + unitRegexPart + unitSpaceRegexPart + ")?" + numberRegexPart;
           matchNumIndex = 2;
           matchUnitIndex = 1;
         } else {
           numberRegex = numberRegexPart + "(?:" + unitSpaceRegexPart + unitRegexPart + ")?";
         }
         
         var regex = new RegExp("^\\s*" + numberRegex + "\\s*$");
         var match = regex.exec(string);
         
         if (match) {
           
           var intString = match[matchNumIndex];
           var normalizedIntString = intString.replace(new RegExp(args[0].replace(/\./, "\\.").replace(/\s/, "\\s"), "g"), "");
           
           var decString = match[matchNumIndex + 1] || "";
           var unitMatch = match[matchUnitIndex];
           
           if (pattern && (!patternUnit && unitMatch)) {
             // Invalid because of unit
             return result;
           }
           
           value = parseFloat(normalizedIntString + (decString ? "." + decString : ""));
           
           if (unitMatch && unitMatch === "%") {
             value = parseFloat((value / 100).toPrecision(12));
           }
           
           result.relevance = match.filter(function(match) {
             return match;
           }).length * 10 + value.toString().length;
           
           
           var detectedPattern = "";
           if (!pattern) {
             detectedPattern = "#";
             
             if (value >= 1000 && intString.indexOf(args[0]) >= 0) {
               detectedPattern = "#,###";
             }
             
             if (decString.length) {
               detectedPattern+= "." + (new Array(decString.length + 1)).join( "#" );
             }
             
             if (unitMatch && unitMatch === "%") {
               detectedPattern+= "%";
             }
             result.pattern = detectedPattern;
             
           }
           
         }
         
       }
     }
     result.value = value;
     return result;
   }).filter(function(result) {
     return !isNaN(result.value);
   });
   
   // Unique values
   var filteredValues = [];
   results = results.filter(function(result) {
     if (filteredValues.indexOf(result.value) < 0) {
       filteredValues.push(result.value);
       return result;
     }
   });
   results.sort(function(a, b) {
     return a.relevance < b.relevance;
   });

  return results;
}



/* Interface */
function nformat(number, pattern, locale) {
  return format.apply(this, arguments);
}
 
nformat.parse = function(string, pattern, locale) {
  return detect.call(this, string, pattern, locale).map(function(result) {
    return result.value;
  })[0];
};

nformat.detect = function(number, string, pattern, locale) {
  if (typeof number === 'undefined') {
    // Cannot accurately determine pattern and locale
    return null;
  }
  return detect.call(this, string, pattern, locale).filter(function(result) {
    return typeof number !== 'number' || result.value === number;
  }).map(function(result) {
    return {
      locale: result.locale,
      pattern: result.pattern
    };
  })[0];
};


module.exports = nformat;
},{"./locales/all":19}],21:[function(require,module,exports){
var _v = (function() {
  
  
  var 
    SVG_NAMESPACE_URI = "http://www.w3.org/2000/svg",
    MATH = Math,
    PI = MATH.PI,
    cos = MATH.cos,
    sin = MATH.sin,
    sqrt = MATH.sqrt,
    pow = MATH.pow,
    floor = MATH.floor,
  
    /**
     * Rounds a number to precision
     */ 
    round = function(num, digits) {
      digits = typeof digits === 'number' ? digits : 1;
      if (typeof num === 'object') {
        for (var x in num) {
          num[x] = round(num[x]);
        }
      } else {
        // Actually round number
        var value = parseFloat(num);
        if (!isNaN(value) && new String(value).length === new String(num).length) {
          value = parseFloat(value.toFixed(digits));
          return value;
        }
      }
      return num;
    },
  
    /**
     * Camelize a string
     * @param {String} string
     */ 
    camelize = (function() {
      var cache = {};
      return function(string) {
        return cache[string] = cache[string] || (function() {
          return string.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
        })();
      };
    })(),
  
    /**
     * Hyphenate a string
     * @param {String} string
     */
    hyphenate = (function() {
      var cache = {};
      return function(string) {
        return cache[string] = cache[string] || (function() {
          return string.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
        })();
      };
    })(),
  
    /**
     * Extends an object
     * @param {Boolean} true
     * @param {Object} destination
     * @param {Object} source
     */
    extend = function(deep, destination, source) {
      var args = arguments, i = typeof deep === 'boolean' ? 2 : 1, dest = arguments[i - 1], src, prop, value;
      for (; i < args.length; i++) {
        src = args[i];
        for (prop in src) {
          value = src[prop];
          if (typeof value !== 'undefined' && value !== null) {
            if (typeof value === 'object' && value.constructor === Object) {
              dest[prop] = dest[prop] || {};
              if (deep) {
                extend(true, dest[prop], value);
              }
            } else {
              dest[prop] = value;
            }
          }
        }
      }
      return dest;
    },
    
    /**
     * Converts to Array
     * @param {Boolean} true
     * @param {Object} destination
     * @param {Object} source
     */
    toArray = function(obj) {
      
      //return obj && (obj.length && [].slice.call(obj) || [obj]);
      
      if (typeof obj === "undefined") {
        return [];
      }
      
      var l = obj && obj.length || 0, i, result = [];
      for (i = 0; i < l; i++) {
        if (obj[i]) {
          result.push(obj[i]);
        }
      }
      
      return result.length && result || [obj];
    },
    
    // DOM Manipulation
    
    parent = function(elem) {
      return elem.parentNode;
    },
    
    append = function( parent, child ) {
      parent = parent && parent[0] || parent;
      if (parent && parent.appendChild) {
        toArray(child).forEach(function(child) {
          if (child) {
            parent.appendChild(child);
          }
        });
      }
    },
    
    prepend = function( parent, child ) {
      parent = parent[0] || parent;
      toArray(child).forEach(function(child) {
        parent.insertBefore(child, parent.firstChild);
      });
    },
    
    remove = function( elem, child ) {
      if (child) {
        toArray(child).forEach(function(child) {
          elem.removeChild(child);
        });
      } else if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    },
    
    html = function(elem, string) {
      if (string) {
        elem.innerHTML = string;
      }
      return elem.innerHTML;
    },
    
    text = function(elem) {
      return elem.textContent;
    },
    
    attr = function (elem, name, value) {
      var result = null, obj = {}, prop, px = ['x', 'y', 'dx', 'dy', 'cx', 'cy'];
      if (typeof name === 'object') {
        obj = name;
      } else if (typeof name !== 'undefined'){
        obj[name] = value;
      }
      function mapStyles(name) {
        return hyphenate(name) + ": " + value[name];
      }
      if (Object.keys(obj).length) {
        for (name in obj) {
          prop = typeof elem[camelize(name)] !== 'undefined' ? camelize(name) : hyphenate(name);
          value = obj[name];
          if (typeof value !== 'undefined') {
            // Set
            if (name === 'style' && typeof value === 'object') {
              value = Object.keys(value).map(mapStyles).join("; ");
            }
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              value = px.indexOf(prop) >= 0 ? round(value) : value;
              elem.setAttribute(prop, value);
            }
          } else if (!result) {
            // Get
            result = elem.getAttribute(prop);
          }
        }
      }
      return result;
    },
  
    css = function(elem, name, value) {
      var map = {}, cssText = null;
      if (typeof name === 'object') {
        map = name;
      } else if (typeof value !== "undefined") {
        map[name] = value;
      }
      cssText = Object.keys(map).map(function(name) {
        return hyphenate(name) + ": " + map[name];
      }).join("; ");
      if (cssText && cssText.length) {
        elem.style.cssText = elem.style.cssText + cssText;
        return null;
      }
      return elem.style[name] || window.getComputedStyle(elem, null).getPropertyValue(name);
    },
    
    addClass = function(elem, className) {
      elem.classList.add(className);
    },
    
    hasClass = function(elem, className) {
      return elem.classList.contains(className);
    },
    
    removeClass = function(elem, className) {
      elem.classList.remove(className);
    },
    
    toggleClass = function(elem, className) {
      elem.classList.toggle(className);
    },
    
    /**
     * Gets a pair of bezier control points
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Number} t
     */
    getControlPoints = function( x0, y0, x1, y1, x2, y2, t ) {
      t = typeof t === 'number' ? t : 0.5;
      var
        d01 = sqrt( pow( x1 - x0, 2 ) + pow( y1 - y0, 2 ) ),
        d12 = sqrt( pow( x2 - x1, 2 ) + pow( y2 - y1, 2 ) ),
        fa = t * d01 / ( d01 + d12 ),   // scaling factor for triangle Ta
        fb = t * d12 / ( d01 + d12 ),   // ditto for Tb, simplifies to fb=t-fa
        p1x = x1 - fa * ( x2 - x0 ),    // x2-x0 is the width of triangle T
        p1y = y1 - fa * ( y2 - y0 ),    // y2-y0 is the height of T
        p2x = x1 + fb * ( x2 - x0 ),
        p2y = y1 + fb * ( y2 - y0 );
      return {
        p1: {x: p1x, y: p1y}, 
        p2: {x: p2x, y: p2y}
      };
    },
  
    /**
     * Serializes points as svg path definition
     * @param {Array} points
     */
    getPath = function( points ) {
      return points.map(function(point) {
        return point.x + "," + point.y;
      }).join(" ");
    },
  
  
    /**
     * Visualist query constructor
     */
    _v = function(selector, width, height, attrs) {
      var arg, i, s, w, h, a, set;
      for (i = 0, arg; arg = arguments[i]; i++) {
        if (typeof arg === 'number' || typeof arg === 'string' && !isNaN(parseFloat(arg))) {
          // Numeric
          arg = typeof arg === 'number' ? parseFloat(arg) + "px" : arg;
          if (typeof w !== 'undefined') {
            h = arg;
          } else {
            w = arg;
          }
        } else if (typeof arg === 'object' && arg.constructor === Object) {
          // Plain object
          a = arg;
        } else {
          // Everything else may be a selector
          s = arg;
        }
      }
      set = s instanceof Visualist ? s : new Visualist(s);
      set.attr(extend(true, a || {}, {
        width: w, 
        height: h
      }));
      return set;
    };

  /**
   * Visualist Class
   * @param {String} selector
   */

  function Visualist(selector) {
    var set = null, elem, result, i, svg;
    // Collect constructor args
    if (typeof selector === 'object' && selector.namespaceURI === SVG_NAMESPACE_URI) {
      // Existing Element
      set = [selector];
    } else if (typeof selector === 'string') {
      // Selector
      result = document.querySelectorAll(selector);
      for (i = 0, elem; elem = result[i]; i++) {
        if (elem.namespaceURI === SVG_NAMESPACE_URI ) {
          set = set || [];
          set.push(elem);
        }
      }
    }
    if (!set) {
      svg = document.createElementNS(SVG_NAMESPACE_URI, 'svg');
      svg.setAttribute("xmlns", SVG_NAMESPACE_URI);
      set = [svg];
    }
    this.push.apply(this, set || []);
  }
  
  Visualist.prototype = [];
  
  // Static methods
  _v.extend = extend;
  _v.attr = attr;
  _v.css = css;
  
  // Plugin API
  _v.fn = Visualist.prototype;
  
  /**
   * Extends visualist prototype
   * @param {Array} methods
   */
  _v.fn.extend = function( methods ) {
    for (var x in methods) {
      Visualist.prototype[x] = methods[x];
    }
  };
  
  // Private Components
  
  /**
   * Draw basic shapes
   * @param {String} tagName
   * @param {Object} params
   * @param {Object} attrs
   * @param {Array} children 
   */
  function shape(tagName, params, attrs, children) {
    var self = this;
    this.forEach(function(elem) {
      _v(elem).append(self.create(tagName, extend(true, {}, attrs, round(params))).append(children));
    });
    return this;
  }
  
  // Public Components
  
  _v.fn.extend({
    
    size: function() {
      return this.length;
    },
    
    toArray: function() {
      return toArray(this);
    },
    
    get: function( index ) {
      return typeof index !== 'undefined' ? index < 0 ? this[this.length - index] : this[index] : this.toArray();
    },
    
    index: function() {
      return this[0] && toArray(this[0].parentNode.children).indexOf(this[0]) || -1;
    },
    
    /**
     * Appends the specified child to the first element in the set.
     * @param {Object} child
     */
    append: function( child ) {
      if (this[0]) {
        append(this[0], child);
      }
      return this;
    },
    /**
     * Appends the current set of elements to the specified parent
     * @param {Object} child
     */
    appendTo: function( parent ) {
      this.forEach(function(elem) {
        if (parent) {
          append(parent, elem);
        }
      });
      return this;
    },
    /**
     * Prepends the specified child to the first element in the set.
     * @param {Object} child
     */
    prepend: function( child ) {
      if (this[0]) {
        prepend(this[0], child);
      }
      return this;
    },
    /**
     * Prepends the current set of elements to the specified parent
     * @param {Object} child
     */
    prependTo: function( parent ) {
      this.forEach(function(elem) {
        prepend(parent, elem);
      });
      return this;
    },
    /**
     * Removes all elements in the set or removes the specified child from the set of matched elements.
     * @param {Object} child
     */
    remove: function( child ) {
      this.forEach(function(elem) {
        remove(elem, child);
      });
      return this;
    },
    /**
     * Removes children from elements in the set
     */
    clear: function() {
      this.forEach(function(elem) {
        for (var i = 0; i < elem.childNodes.length; i++) {
          elem.removeChild(elem.childNodes[i]);
          i--;
        }
      });
      return this;
    },
    /**
     * Returns the parent node of the first element in the set.
     */
    parent: function() {
      return this[0] && parent(this[0]);
    },
    /**
     * Get the value of an attribute for the first element in the set of matched elements or set one or more attributes for every matched element.
     * @param {String} name
     * @param {Object} value
     */
    attr: function( name, value ) {
      var result = this;
      this.forEach(function(elem) {
        var ret = attr(elem, name, value);
        if (ret !== null) {
          result = ret;
        }
      });
      return result;
    },
    /**
     * Get the value of a computed style property for the first element in the set of matched elements or set one or more CSS properties for every matched element.
     * @param {String} name
     * @param {Object} value
     */
    css: function( name, value ) {
      var result = this;
      this.forEach(function(elem) {
        var ret = css(elem, name, value);
        if (ret !== null) {
          result = ret;
        }
      });
      return result;
    },
    /**
     * Creates a new element with the specifed tagname.
     * @param {String} tagName
     * @param {Object} attrs
     */
    create: function( tagName, attrs ) {
      return _v((this[0] && this[0].ownerDocument || document).createElementNS(this[0] && this[0].namespaceURI || SVG_NAMESPACE_URI, tagName)).attr(attrs);
    },
    /**
     * Gets or sets the width on the first element in the set
     * @param {Number} width
     */
    width: function( width ) {
      //console.warn("deprecated");
      if (typeof width === 'undefined' && this[0]) {
        return this[0].getBoundingClientRect().width;
      }
      this.attr('width', width);
      return this;
    },
    /**
     * Gets or sets the height on the first element in the set
     * @param {Number} height
     */
    height: function( height ) {
      //console.warn("deprecated");
      if (typeof height === 'undefined' && this[0]) {
        return this[0].getBoundingClientRect().height;
      }
      this.attr('height', height);
      return this;
    },
    /**
     * Retrieves the bounding box of the first element in the set.
     */
    bbox: function() {
      try {
        var b = this[0] && this[0].getBBox();
        b = {
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height
        };
        return b;
      } catch (e) {
        return {x: 0, y: 0, width: 0, height: 0};
      } 
    },
    /**
     * Retrieves the computed text length of the first element in the set if applicable.
     */
    computedTextLength: function() {
      return this[0] && this[0].getComputedTextLength();
    },
    /**
     * Creates and returns a group layer on the first element in the set
     * @param {Object} attrs
     */
    g: function( attrs ) {
      var g = this.create('g', attrs);
      _v(this[0]).append(g);
      return g;
    },
    /**
     * Draws a circle on every element in the set.
     * @param {Number} cx
     * @param {Number} cy
     * @param {Number} r
     * @param {Object} attrs
     */
    circle: function( cx, cy, r, attrs ) {
      return shape.call(this, "circle", {
        cx: cx, 
        cy: cy, 
        r: r
      }, attrs);
    },
    /**
     * Draws an ellipse on every element in the set.
     * @param {Number} cx
     * @param {Number} cy
     * @param {Number} rx
     * @param {Number} ry
     * @param {Object} attrs
     */
    ellipse: function( cx, cy, rx, ry, attrs ) {
      return shape.call(this, "ellipse", {
        cx: cx, 
        cy: cy, 
        rx: rx,
        ry: ry
      }, attrs);
    },
    /**
     * Draws a rectangle on every element in the set.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @param {Object} attrs
     */
    rect: function( x, y, width, height, attrs ) {
      return shape.call(this, "rect", {
        x: x, 
        y: y, 
        width: width,
        height: height
      }, attrs);
    },
    /**
     * Draws a line on every element in the set.
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Object} attrs
     */
    line: function( x1, y1, x2, y2, attrs ) {
      return shape.call(this, "line", {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      }, attrs);
    },
    /**
     * Draws a polygon on every element in the set.
     * @param {Object} points
     * @param {Object} attrs
     */
    polygon: function( points, attrs ) {
      return shape.call(this, 'polygon', {
        points: getPath(points)
      }, attrs);
    },
    /**
     * Draws a polygon on every element in the set.
     * @param {Object} points
     * @param {Object} attrs
     */
    polyline: function( points, attrs ) {
      return shape.call(this, 'polyline', {
        points: getPath(points)
      }, attrs);
    },
    /**
     * Draws a path on every element in the set.
     * @param {String} d
     * @param {Object} attrs
     */
    path: function( d, attrs ) {
      return shape.call(this, 'path', {d: d}, attrs);
    },
    /**
     * Renders text on every element in the set.
     * @param {Number} x
     * @param {Number} y
     * @param {String} string
     * @param {Object} attrs
     */
    text: function( x, y, string, attrs ) {
      return shape.call(this, 'text', {
        x: x, 
        y: y
      }, attrs, [(this[0] && this[0].ownerDocument || document).createTextNode(string)]);
    },
    /**
     * Renders a smooth graph on every element in the set.
     * @param {Object} points
     * @param {Object} options
     */
    graph: function( points, options ) {
      
      this.forEach(function(elem) {
        
        var
          opts = extend({
            smooth: false, 
            tension: 0.4,
            approximate: true
          }, options),
          t = !isNaN( opts.tension ) ? opts.tension : 0.5,
          el = _v(elem), 
          p,
          i,
          c,
          d,
          p1,
          p2,
          cps,
          path = el.create('path'),
          pathStr = "";
          
        el.append(path);
        
        if (!opts.smooth) {
          for (i = 0; i < points.length; i++ ) {
            p = points[i];
            pathStr+= i > 0 ? "L" : "M";
            pathStr+= round(p.x) + " " + round(p.y) + " ";
          } 
        } else {
          // Smooth
          if (opts.approximate) {
            p = points[0];
            pathStr+= "M" + round(p.x) + " " + round(p.y) + " ";
            for (i = 1; i < points.length - 1; i++) {
                c = (points[i].x + points[i + 1].x) / 2;
                d = (points[i].y + points[i + 1].y) / 2;
                pathStr+= "Q" + round(points[i].x) + " " + round(points[i].y) + " " + c + " " + d + " ";
            }
            pathStr+= "T" + round(points[i].x) + " " + round(points[i].y) + " ";
          } else {
            p = points[0];
            pathStr+= "M" + p.x + " " + p.y + " ";
            for (i = 1; i < points.length - 1; i+=1) {
              p = points[i - 1];
              p1 = points[i];
              p2 = points[i + 1];
              cps = getControlPoints(p.x, p.y, p1.x, p1.y, p2.x, p2.y, t);
              pathStr+= "C" + round(cps.p1.x) + " " + round(cps.p1.y) + " " + round(cps.p2.x) + " " + round(cps.p2.y) + " " + round(p2.x) + " " + round(p2.y) + " ";
            }
            pathStr+= "T" + round(points[points.length - 1].x) + " " + round(points[points.length - 1].y) + " ";
          }
        }
        
        delete opts.smooth;
        delete opts.tension;
        delete opts.approximate;
        
        path.attr(extend({
          fill: 'none'
        }, opts, {
          d: pathStr
        }));
        
      });
    },
    /**
     * The arc() method creates an arc/curve (used to create circles, or parts of circles). 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} r
     * @param {Number} sAngle
     * @param {Number} eAngle
     * @param {Boolean} counterclockwise
     * @param {Object} attrs
     */
    arc: function(cx, cy, r, sAngle, eAngle, counterclockwise, attrs) {
      counterclockwise = typeof counterclockwise === 'boolean' ? counterclockwise : false;
      var
        d = 'M ' + round(cx) + ', ' + round(cy),
        cxs,
        cys,
        cxe,
        cye;
      if (eAngle - sAngle === Math.PI * 2) {
        // Circle
        d+= ' m -' + r + ', 0 a ' + r + ',' + r + ' 0 1,0 ' + (r * 2) + ',0 a ' + r + ',' + r + ' 0 1,0 -' + (r * 2) + ',0';
      } else {
        cxs = round(cx + cos(sAngle) * r);
        cys = round(cy + sin(sAngle) * r);
        cxe = round(cx + cos(eAngle) * r);
        cye = round(cy + sin(eAngle) * r);
        d+= " L" + cxs + "," + cys +
          " A" + r + "," + r + " 0 " + (eAngle - sAngle > PI ? 1 : 0) + "," + (counterclockwise ? 0 : 1) +
          " " + cxe + "," + cye + " Z";
      }
      return shape.call(this, "path", {
        d: d
      }, attrs);
    },
    /**
     * Renders text into a bounding box by wrapping lines at spaces.
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     * @param {Object} string
     * @param {Object} attrs
     */
    textbox: function( x, y, width, height, string, attrs ) {
      
      var 
        self = this;
      
      this.forEach(function(elem) {
        
        var
          _velem = _v(elem),
          lines = width ? [] : [string], 
          line = [],
          length = 0,
          words = width ? string.split(/\s+/) : [],
          text = self.create('text', extend(true, {}, attrs, {
            x: x,
            y: y
          })),
          textNode,
          lineHeight = parseFloat(_velem.css('line-height')),
          fontSize = parseFloat(_velem.css('font-size')),
          textAlign = text.css('text-align'),
          ty = 0;
        
        _velem.append(text);
        
        
        if (width) {
          // Break lines
          textNode = elem.ownerDocument.createTextNode("");
          text.append(textNode);
          words.forEach(function(word, index) {
            textNode.data = line.join(' ') + ' ' + word;
            length = text.computedTextLength();
            if (length > width) {
              lines.push(line.join(' '));
              line = [word];
            } else {
              line.push(word);
            }
            if (index === words.length - 1) {
              lines.push(line.join(' '));
            }
          });
          text.remove(textNode);
        }
        
        // Render lines
        lines.forEach(function(line, index) {
          var tspan, dy;
          if (!height || ty + parseFloat(lineHeight) < height) {
            dy = index > 0 ? lineHeight : fontSize - 2;
            ty+= dy;
            tspan = self.create('tspan', {dy: dy});
            text.append(tspan);
            tspan
              .append(elem.ownerDocument.createTextNode(line))
              .attr('x', parseInt(text.attr('x'), undefined) + (width - tspan.computedTextLength()) * (textAlign === 'end' || textAlign === 'right' ? 1 : textAlign === 'center' || textAlign === 'middle' ? 0.5 : 0));
          }
        });
      });
      return this;
    },
    /**
     * Renders an unordered list.
     * @param {Number} x
     * @param {Number} y
     * @param {Array} items
     * @param {Object} options
     */
    list: function( x, y, items, options ) {
      return this.listbox(x, y, 0, 0, items, options);
    },
    /**
     * Renders an unordered list into the specified bounds.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @param {Array} items
     * @param {Object} options
     */
    listbox: function( x, y, width, height, items, options ) {
      items = toArray(items).map(function(item) {
        return typeof item === 'string' ? {label: item} : item;
      });
      
      options = options || {};
      
      options = extend({}, {
        horizontal: false,
        bullet: {
          shape: 'circle'
        }
      }, options);
      
      this.forEach(function(elem) {
        
        var top = y;
        
        items.forEach(function(item, index) {
          
          var
            _velem = _v(elem),
            itemOpts = extend(true, {}, options, item),
            horizontal = itemOpts.horizontal,
            shape = itemOpts.bullet.shape,
            label = itemOpts.label,
            bulletAttrs,
            itemLayer = _velem.g(),
            lineHeight = parseFloat(_velem.css('line-height')),
            fontSize = parseFloat(_velem.css('font-size')),
            bulletSize = round(fontSize * 0.65),
            spacing = lineHeight * 0.2,
            itemWidth,
            itemHeight;
          
          delete itemOpts.bullet.shape;
          delete itemOpts.horizontal;
          delete itemOpts.label;
          
          bulletAttrs = extend(true, {}, itemOpts, itemOpts.bullet); 
          
          delete itemOpts.bullet;
          
          if (height && y + fontSize > top + height) {
            return;
          }
          
          // Render bullet
          if (shape === 'circle') {
            itemLayer.circle(x + bulletSize / 2, y + (fontSize - bulletSize) / 2 + bulletSize / 2, bulletSize / 2, bulletAttrs);
          } else {
            itemLayer.rect(x, round(y) + (fontSize - bulletSize) / 2, bulletSize, bulletSize, bulletAttrs);
          }
          
          // Render label
          itemLayer.textbox(x + bulletSize + spacing, y, width ? width - bulletSize - spacing : 0, height ? top + height - y : 0, label, itemOpts);
          
          itemWidth = Math.ceil(itemLayer.bbox().width + fontSize);
          itemHeight = Math.round(itemLayer.bbox().height + (lineHeight - fontSize));
          
          if (horizontal) {
            x+= itemWidth;
            if (width && x > width) {
              y+= itemHeight;
              x = 0;
            }
          } else {
            y+= itemHeight;
          }
          
        });
    
      });
      
      return this;
    }
  });
  
  return _v;
  
}());

module.exports = _v;
},{}]},{},[12]);
