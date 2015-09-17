(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.chartr = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../../vendor/dformat/src/dformat":16,"../../vendor/nformat/src/nformat":19,"../../vendor/visualist/src/visualist":20,"../utils/dticks":13,"../utils/nticks":14,"./visualchart":11}],3:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":20,"../utils/dticks":13,"../utils/nticks":14,"./columnchart":7}],4:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":20,"../utils/datatable":12}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"../../vendor/dformat/src/dformat":16,"../../vendor/nformat/src/nformat":19,"../../vendor/visualist/src/visualist":20,"../utils/dticks":13,"../utils/nticks":14,"./visualchart":11,"dup":2}],6:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":20,"../utils/datatable":12,"./barchart":3,"./columnchart":7,"./linechart":8,"./piechart":9,"./tablechart":10}],7:[function(require,module,exports){
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
    var colorIndex = 0;
    
    graphLayer = chartLayer.g({
      fill: options.colors[valueIndex % options.colors.length]
    });
    
    for (rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      count++;
      var step = rowIndex % m === 0;
      
      var valueIndex = 0;
      
      
      for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
        
        if (columnIndex !== categoryIndex) {
          colorIndex++;
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
            graphLayer.path('M' + x1 +',' + y1 + ' ' + x2 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x1 + ',' + y2, {fill: options.colors[colorIndex % options.colors.length]});
            
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
},{"../../vendor/visualist/src/visualist":20,"../utils/dticks":13,"../utils/nticks":14,"./cartesianchart":5}],8:[function(require,module,exports){
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
            
            if (x >= 0 && x <= chartBox.width && y >= 0 && y <= chartBox.height) {
              points.push({x: x, y: y});
            }
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
},{"../../vendor/visualist/src/visualist":20,"./CartesianChart":2}],9:[function(require,module,exports){
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
},{"../../vendor/dformat/src/dformat":16,"../../vendor/nformat/src/nformat":19,"../../vendor/visualist/src/visualist":20,"../utils/round":15,"./visualchart":11}],10:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":20,"./basechart":4}],11:[function(require,module,exports){
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
},{"../../vendor/visualist/src/visualist":20,"../utils/round":15,"./basechart":4}],12:[function(require,module,exports){
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
},{"../../vendor/dformat/src/dformat":16,"../../vendor/nformat/src/nformat":19}],13:[function(require,module,exports){
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
},{"./nticks":14}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
module.exports = function round(num, digits) {
  digits = typeof digits === 'number' ? digits : 1;
  var value = parseFloat(num);
  if (!isNaN(value) && new String(value).length === new String(num).length) {
    value = parseFloat(value.toFixed(digits));
    return value;
  }
  return num;
};
},{}],16:[function(require,module,exports){
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
},{"./locales/all":17}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"./locales/all":18}],20:[function(require,module,exports){
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
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2hhcnRyLmpzIiwic3JjL2NoYXJ0cy9DYXJ0ZXNpYW5DaGFydC5qcyIsInNyYy9jaGFydHMvYmFyY2hhcnQuanMiLCJzcmMvY2hhcnRzL2Jhc2VjaGFydC5qcyIsInNyYy9jaGFydHMvY2hhcnR3cmFwcGVyLmpzIiwic3JjL2NoYXJ0cy9jb2x1bW5jaGFydC5qcyIsInNyYy9jaGFydHMvbGluZWNoYXJ0LmpzIiwic3JjL2NoYXJ0cy9waWVjaGFydC5qcyIsInNyYy9jaGFydHMvdGFibGVjaGFydC5qcyIsInNyYy9jaGFydHMvdmlzdWFsY2hhcnQuanMiLCJzcmMvdXRpbHMvZGF0YXRhYmxlLmpzIiwic3JjL3V0aWxzL2R0aWNrcy5qcyIsInNyYy91dGlscy9udGlja3MuanMiLCJzcmMvdXRpbHMvcm91bmQuanMiLCJ2ZW5kb3IvZGZvcm1hdC9zcmMvZGZvcm1hdC5qcyIsInZlbmRvci9kZm9ybWF0L3NyYy9sb2NhbGVzL2FsbC5qcyIsInZlbmRvci9uZm9ybWF0L3NyYy9sb2NhbGVzL2FsbC5qcyIsInZlbmRvci9uZm9ybWF0L3NyYy9uZm9ybWF0LmpzIiwidmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyptb2R1bGUuZXhwb3J0cyA9IHtcbiAgUGllQ2hhcnQ6IHJlcXVpcmUoJy4vY2hhcnRzL3BpZWNoYXJ0JyksXG4gIExpbmVDaGFydDogcmVxdWlyZSgnLi9jaGFydHMvbGluZWNoYXJ0JyksXG4gIENvbHVtbkNoYXJ0OiByZXF1aXJlKCcuL2NoYXJ0cy9jb2x1bW5jaGFydCcpLFxuICBWaXN1YWxDaGFydDogcmVxdWlyZSgnLi9jaGFydHMvdmlzdWFsY2hhcnQnKSxcbiAgQ2FydGVzaWFuQ2hhcnQ6IHJlcXVpcmUoJy4vY2hhcnRzL2NhcnRlc2lhbmNoYXJ0JyksXG4gIENoYXJ0V3JhcHBlcjogcmVxdWlyZSgnLi9jaGFydHMvY2hhcnR3cmFwcGVyJylcbn07Ki9cblxudmFyIENoYXJ0V3JhcHBlciA9IHJlcXVpcmUoJy4vY2hhcnRzL2NoYXJ0d3JhcHBlcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgQ2hhcnRXcmFwcGVyKGVsZW1lbnQsIG9wdGlvbnMpO1xufTtcbiIsInZhclxuICBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIiksXG4gIG5mb3JtYXQgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL25mb3JtYXQvc3JjL25mb3JtYXRcIiksXG4gIGRmb3JtYXQgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL2Rmb3JtYXQvc3JjL2Rmb3JtYXRcIiksXG4gIG50aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9udGlja3NcIiksXG4gIGR0aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9kdGlja3NcIiksXG4gIFZpc3VhbENoYXJ0ID0gcmVxdWlyZSgnLi92aXN1YWxjaGFydCcpO1xuXG5mdW5jdGlvbiB0cmltU2V0KHZhbHVlcywgY291bnQpIHtcbiAgLy8gVHJpbSBhcnJheSB0byBjb3VudFxuICB2YXJcbiAgICBtID0gTWF0aC5yb3VuZCh2YWx1ZXMubGVuZ3RoIC8gY291bnQpLFxuICAgIHRyaW1tZWQgPSBbXTtcbiAgaWYgKG0gPiAxKSB7XG4gICAgdmFyIHRyaW1tZWQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgJSBtID09PSAwKSB7XG4gICAgICAgIHRyaW1tZWQucHVzaChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyaW1tZWQ7XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuXG5mdW5jdGlvbiBDYXJ0ZXNpYW5DaGFydCgpIHtcbiAgVmlzdWFsQ2hhcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaXN1YWxDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLCB7XG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIFZpc3VhbENoYXJ0LnByb3RvdHlwZS5kZWZhdWx0cywge1xuICB9KSxcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7XG4gICAgVmlzdWFsQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBWaXN1YWxDaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgZWxlbSA9IHRoaXMuZWxlbWVudCxcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveCxcbiAgICAgIGN3ID0gY2hhcnRCb3gud2lkdGgsXG4gICAgICBjaCA9IGNoYXJ0Qm94LmhlaWdodCxcbiAgICAgIGdyaWRMYXllciA9IGNoYXJ0TGF5ZXIuZyh7c3R5bGU6IHtmb250U2l6ZTogJzkwJSd9fSksXG4gICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgY2F0ZWdvcnlSYW5nZSA9IHRoaXMuY2F0ZWdvcnlSYW5nZSxcbiAgICAgIGNhdGVnb3J5Rm9ybWF0ID0gdGhpcy5jYXRlZ29yeUZvcm1hdCxcbiAgICAgIGNhdGVnb3J5VHlwZSA9IHRoaXMuY2F0ZWdvcnlUeXBlLFxuICAgICAgY2F0ZWdvcnlUaWNrcyA9IHRoaXMuY2F0ZWdvcnlUaWNrcyxcbiAgICAgIGNhdGVnb3J5TWluID0gTWF0aC5taW4oY2F0ZWdvcnlSYW5nZS5taW4sIGNhdGVnb3J5VGlja3NbMF0pLFxuICAgICAgY2F0ZWdvcnlNYXggPSBNYXRoLm1heChjYXRlZ29yeVJhbmdlLm1heCwgY2F0ZWdvcnlUaWNrc1tjYXRlZ29yeVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIGNhdGVnb3J5R3JpZExpbmVzID0gdGhpcy5jYXRlZ29yeUdyaWRMaW5lcyxcbiAgICAgIHZhbHVlRm9ybWF0ID0gdGhpcy52YWx1ZUZvcm1hdCxcbiAgICAgIHZhbHVlVHlwZSA9IHRoaXMudmFsdWVUeXBlLFxuICAgICAgdmFsdWVUaWNrcyA9IHRoaXMudmFsdWVUaWNrcyxcbiAgICAgIHZhbHVlUmFuZ2UgPSB0aGlzLnZhbHVlUmFuZ2UsXG4gICAgICB2YWx1ZU1pbiA9IE1hdGgubWluKHZhbHVlUmFuZ2UubWluLCB2YWx1ZVRpY2tzWzBdKSxcbiAgICAgIHZhbHVlTWF4ID0gTWF0aC5tYXgodmFsdWVSYW5nZS5tYXgsIHZhbHVlVGlja3NbdmFsdWVUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICB2YWx1ZUdyaWRMaW5lcyA9IHRoaXMudmFsdWVHcmlkTGluZXMsXG4gICAgICBsYWJlbEhvcml6b250YWxTcGFjaW5nID0gMTMsXG4gICAgICBsYWJlbFZlcnRpY2FsU3BhY2luZyA9IDEzLFxuICAgICAgZmxpcEF4ZXMgPSB0aGlzLmZsaXBBeGVzLFxuICAgICAgY2xpcENhdGVnb3J5R3JpZCA9IHRoaXMuY2xpcENhdGVnb3J5R3JpZCxcbiAgICAgIGNsaXBWYWx1ZUdyaWQgPSB0aGlzLmNsaXBWYWx1ZUdyaWQsXG4gICAgICB0ZXh0Q29sb3IgPSBjaGFydExheWVyLmNzcygnY29sb3InKSwgXG4gICAgICBtdXN0Um90YXRlLFxuICAgICAgdGV4dHM7XG4gICAgICBcbiAgICBtdXN0Um90YXRlID0gZmFsc2U7XG4gICAgdGV4dHMgPSBbXTtcbiAgICBcbiAgICB2YXIgcGF0aCA9IFwiXCI7XG4gICAgY2F0ZWdvcnlUaWNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRpY2ssIGluZGV4KSB7XG4gICAgICB2YXIgdGlja0NvbG9yID0gY2F0ZWdvcnlUeXBlID09PSAnbnVtYmVyJyAmJiB0aWNrID09PSAwID8gMC43NSA6IDAuMjU7XG4gICAgICB2YXIgdGlja1dpZHRoID0gKGZsaXBBeGVzID8gY2ggOiBjdykgLyAoY2F0ZWdvcnlUaWNrcy5sZW5ndGgpO1xuICAgICAgXG4gICAgICB2YXIgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgPSAodGljayAtIGNhdGVnb3J5TWluKSAvIChjYXRlZ29yeU1heCAtIGNhdGVnb3J5TWluKTtcbiAgICAgIFxuICAgICAgdmFyIHgxO1xuICAgICAgaWYgKGZsaXBBeGVzKSB7XG4gICAgICAgIHgxID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjbGlwQ2F0ZWdvcnlHcmlkKSB7XG4gICAgICAgICAgeDEgPSB0aWNrV2lkdGggLyAyICsgdGlja1dpZHRoICogaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeDEgPSBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSAqIGN3O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciB5MTtcbiAgICAgIGlmIChmbGlwQXhlcykge1xuICAgICAgICBpZiAoY2xpcENhdGVnb3J5R3JpZCkge1xuICAgICAgICAgIHkxID0gY2ggLSAodGlja1dpZHRoIC8gMiArIHRpY2tXaWR0aCAqIGluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB5MSA9IGNoIC0gbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgKiBjaDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgeDIgPSBmbGlwQXhlcyA/IGN3IDogeDE7XG4gICAgICB2YXIgeTIgPSBmbGlwQXhlcyA/IHkxIDogY2g7XG4gICAgICBcbiAgICAgIHZhciBsaW5lID0ge3gxOiBNYXRoLnJvdW5kKHgxKSwgeTE6IE1hdGgucm91bmQoeTEpLCB4MjogTWF0aC5yb3VuZCh4MiksIHkyOiBNYXRoLnJvdW5kKHkyKX07XG4gICAgICBcbiAgICAgIGlmIChjYXRlZ29yeUdyaWRMaW5lcykge1xuICAgICAgICBcbiAgICAgICAgLy9ncmlkTGF5ZXIubGluZShsaW5lLngxLCBsaW5lLnkxLCBsaW5lLngyLCBsaW5lLnkyLCB7c3Ryb2tlOiAnbGlnaHRncmF5Jywgc3Ryb2tlT3BhY2l0eTogdGlja0NvbG9yfSk7XG4gICAgICAgIHZhciBsaW5lUGF0aCA9IFwiTSBcIiArIGxpbmUueDEgKyBcIiBcIiArIGxpbmUueTEgKyBcIiBMXCIgKyBsaW5lLngyICsgXCIgXCIgKyBsaW5lLnkyO1xuICAgICAgICBpZiAoY2F0ZWdvcnlUeXBlID09PSAnbnVtYmVyJyAmJiB0aWNrID09PSAwKSB7XG4gICAgICAgICAgZ3JpZExheWVyLnBhdGgobGluZVBhdGgsIHtzdHJva2U6ICdsaWdodGdyYXknLCBzdHJva2VPcGFjaXR5OiAwLjc1fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aCs9IGxpbmVQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBsYWJlbDtcbiAgICAgIGlmIChjYXRlZ29yeVR5cGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgbGFiZWwgPSBuZm9ybWF0KHRpY2ssIGNhdGVnb3J5Rm9ybWF0LnBhdHRlcm4sIGNhdGVnb3J5Rm9ybWF0LmxvY2FsZSk7XG4gICAgICB9IGVsc2UgaWYgKGNhdGVnb3J5VHlwZSA9PT0gXCJkYXRlXCIpIHtcbiAgICAgICAgbGFiZWwgPSBkZm9ybWF0KHRpY2ssIGNhdGVnb3J5Rm9ybWF0LnBhdHRlcm4sIGNhdGVnb3J5Rm9ybWF0LmxvY2FsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbCA9IGRhdGFUYWJsZS5nZXRWYWx1ZSh0aWNrLCBjYXRlZ29yeUluZGV4KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGxhYmVsWCA9IGZsaXBBeGVzID8geDEgLSBsYWJlbEhvcml6b250YWxTcGFjaW5nIDogeDE7XG4gICAgICB2YXIgbGFiZWxZID0gZmxpcEF4ZXMgPyBjaCAtIHkxIDogeTIgKyBsYWJlbFZlcnRpY2FsU3BhY2luZztcbiAgICAgIFxuICAgICAgdmFyIGxhYmVsV2lkdGggPSBmbGlwQXhlcyA/IGNoYXJ0Qm94LnggLSBsYWJlbEhvcml6b250YWxTcGFjaW5nIDogdGlja1dpZHRoO1xuICAgICAgdmFyIHRleHRBbmNob3IgPSBmbGlwQXhlcyA/ICdlbmQnIDogJ21pZGRsZSc7IFxuICAgICAgdmFyIHRleHQgPSBncmlkTGF5ZXIuY3JlYXRlKFwidGV4dFwiLCB7XG4gICAgICAgIHg6IE1hdGgucm91bmQobGFiZWxYKSwgXG4gICAgICAgIHk6IE1hdGgucm91bmQobGFiZWxZKSxcbiAgICAgICAgZHk6IFwiMC40ZW1cIixcbiAgICAgICAgdGV4dEFuY2hvcjogdGV4dEFuY2hvclxuICAgICAgfSkuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxhYmVsKSk7XG4gICAgICBcbiAgICAgIHRleHRzLnB1c2godGV4dCk7XG4gICAgICBcbiAgICAgIGdyaWRMYXllci5hcHBlbmQodGV4dCk7XG4gICAgICBcbiAgICAgIGlmICh0ZXh0LmNvbXB1dGVkVGV4dExlbmd0aCgpID4gbGFiZWxXaWR0aCkge1xuICAgICAgICBtdXN0Um90YXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH0pO1xuICAgIFxuICAgIFxuICAgIGlmIChtdXN0Um90YXRlKSB7XG4gICAgICB0ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHggPSB0ZXh0LmF0dHIoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0ZXh0LmF0dHIoJ3knKTtcbiAgICAgICAgdGV4dC5hdHRyKHtcbiAgICAgICAgICB0ZXh0QW5jaG9yOiAnZW5kJyxcbiAgICAgICAgICB0cmFuc2Zvcm06IFwicm90YXRlKC0zMiBcIiArIHggKyBcIixcIiArIHkgKyBcIilcIlxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBtdXN0Um90YXRlID0gZmFsc2U7XG4gICAgdGV4dHMgPSBbXTtcbiAgICBcbiAgICBcbiAgICB2YWx1ZVRpY2tzLmZvckVhY2goZnVuY3Rpb24odGljaywgaW5kZXgpIHtcbiAgICAgIFxuICAgICAgdmFyIHRpY2tXaWR0aCA9IChmbGlwQXhlcyA/IGNoYXJ0Qm94LmhlaWdodCA6IGNoYXJ0Qm94LndpZHRoKSAvICh2YWx1ZVRpY2tzLmxlbmd0aCArIDEpO1xuICAgICAgdmFyIHRpY2tDb2xvciA9IHZhbHVlVHlwZSA9PT0gJ251bWJlcicgJiYgdGljayA9PT0gMCA/IDAuNzUgOiAwLjI1O1xuICAgICAgXG4gICAgICB2YXIgbm9ybWFsaXplZFZhbHVlID0gKHRpY2sgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICB2YXIgeDE7XG4gICAgICBcbiAgICAgIGlmIChmbGlwQXhlcykge1xuICAgICAgICBpZiAoY2xpcFZhbHVlR3JpZCkge1xuICAgICAgICAgIHgxID0gdGlja1dpZHRoICogMC41ICsgdGlja1dpZHRoICogaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeDEgPSBub3JtYWxpemVkVmFsdWUgKiBjaGFydEJveC53aWR0aDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeDEgPSAwO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgeTE7XG4gICAgICBpZiAoZmxpcEF4ZXMpIHtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNsaXBWYWx1ZUdyaWQpIHtcbiAgICAgICAgICB5MSA9IHRpY2tXaWR0aCAqIDAuNSArIHRpY2tXaWR0aCAqIGluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHkxID0gY2hhcnRCb3guaGVpZ2h0IC0gbm9ybWFsaXplZFZhbHVlICogY2hhcnRCb3guaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciB4MiA9IGZsaXBBeGVzID8geDEgOiBjaGFydEJveC53aWR0aDtcbiAgICAgIHZhciB5MiA9IGZsaXBBeGVzID8gY2hhcnRCb3guaGVpZ2h0IDogeTE7XG4gICAgICBcbiAgICAgIHZhciBsaW5lID0ge3gxOiBNYXRoLnJvdW5kKHgxKSwgeTE6IE1hdGgucm91bmQoeTEpLCB4MjogTWF0aC5yb3VuZCh4MiksIHkyOiBNYXRoLnJvdW5kKHkyKX07XG4gICAgICBcbiAgICAgIGlmICh2YWx1ZUdyaWRMaW5lcykge1xuICAgICAgICAvL2dyaWRMYXllci5saW5lKGxpbmUueDEsIGxpbmUueTEsIGxpbmUueDIsIGxpbmUueTIsIHtzdHJva2U6ICdsaWdodGdyYXknLCBzdHJva2VPcGFjaXR5OiB0aWNrQ29sb3J9KTtcbiAgICAgICAgdmFyIGxpbmVQYXRoID0gXCJNIFwiICsgbGluZS54MSArIFwiIFwiICsgbGluZS55MSArIFwiIExcIiArIGxpbmUueDIgKyBcIiBcIiArIGxpbmUueTI7XG4gICAgICAgIGlmICh2YWx1ZVR5cGUgPT09ICdudW1iZXInICYmIHRpY2sgPT09IDApIHtcbiAgICAgICAgICBncmlkTGF5ZXIucGF0aChsaW5lUGF0aCwge3N0cm9rZTogJ2xpZ2h0Z3JheScsIHN0cm9rZU9wYWNpdHk6IDAuNzV9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoKz0gbGluZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHZhbHVlVHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBsYWJlbCA9IG5mb3JtYXQodGljaywgdmFsdWVGb3JtYXQucGF0dGVybiwgdmFsdWVGb3JtYXQubG9jYWxlKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSBcImRhdGVcIikge1xuICAgICAgICBsYWJlbCA9IGRmb3JtYXQodGljaywgdmFsdWVGb3JtYXQucGF0dGVybiwgdmFsdWVGb3JtYXQubG9jYWxlKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGxhYmVsWCA9IGZsaXBBeGVzID8geDEgOiB4MSAtIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmc7XG4gICAgICB2YXIgbGFiZWxZID0gZmxpcEF4ZXMgPyB5MiArIGxhYmVsVmVydGljYWxTcGFjaW5nIDogeTE7XG4gICAgICB2YXIgbGFiZWxXaWR0aCA9IGZsaXBBeGVzID8gdGlja1dpZHRoIDogY2hhcnRCb3gueCAtIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmc7XG4gICAgICB2YXIgdGV4dEFuY2hvciA9IGZsaXBBeGVzID8gJ21pZGRsZScgOiAnZW5kJzsgXG4gICAgICBcbiAgICAgIHZhciB0ZXh0ID0gZ3JpZExheWVyLmNyZWF0ZShcInRleHRcIiwge1xuICAgICAgICB4OiBNYXRoLnJvdW5kKGxhYmVsWCksIFxuICAgICAgICB5OiBNYXRoLnJvdW5kKGxhYmVsWSksXG4gICAgICAgIGR5OiBcIjAuNGVtXCIsXG4gICAgICAgIHRleHRBbmNob3I6IHRleHRBbmNob3JcbiAgICAgIH0pLmFwcGVuZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsYWJlbCkpO1xuICAgICAgXG4gICAgICBncmlkTGF5ZXIuYXBwZW5kKHRleHQpO1xuICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgZ3JpZExheWVyLnBhdGgocGF0aCwge3N0cm9rZTogJ2xpZ2h0Z3JheScsIHN0cm9rZU9wYWNpdHk6IDAuMjV9KTtcbiAgICBcbiAgICBpZiAobXVzdFJvdGF0ZSkge1xuICAgICAgdGV4dHMuZm9yRWFjaChmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciB4ID0gdGV4dC5hdHRyKCd4Jyk7XG4gICAgICAgIHZhciB5ID0gdGV4dC5hdHRyKCd5Jyk7XG4gICAgICAgIHRleHQuYXR0cih7XG4gICAgICAgICAgdGV4dEFuY2hvcjogJ2VuZCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBcInJvdGF0ZSgtMzIgXCIgKyB4ICsgXCIsXCIgKyB5ICsgXCIpXCJcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUsIHtcbiAgY2F0ZWdvcnlJbmRleDoge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5VHlwZToge1xuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVRhYmxlICYmIHRoaXMuZGF0YVRhYmxlLmdldENvbHVtblR5cGUodGhpcy5jYXRlZ29yeUluZGV4KTtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5UmFuZ2U6IHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsIFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGU7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGlmIChkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZSh0aGlzLmNhdGVnb3J5SW5kZXgpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IGRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSAtIDFcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFUYWJsZS5nZXRDb2x1bW5SYW5nZSh0aGlzLmNhdGVnb3J5SW5kZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICBjYXRlZ29yeUZvcm1hdDoge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgICBjb2x1bW5QYXR0ZXJuID0gZGF0YVRhYmxlLmdldENvbHVtblBhdHRlcm4oY2F0ZWdvcnlJbmRleCksXG4gICAgICAgIGNvbHVtbkxvY2FsZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5Mb2NhbGUoY2F0ZWdvcnlJbmRleCk7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGlmIChjb2x1bW5QYXR0ZXJuKSB7XG4gICAgICAgICAgLy8gUHJlZmVyIHNob3J0IG5hbWVzIG9uIHNjYWxlXG4gICAgICAgICAgY29sdW1uUGF0dGVybi5yZXBsYWNlKC9NTU1NLywgXCJNTU1cIik7XG4gICAgICAgICAgY29sdW1uUGF0dGVybi5yZXBsYWNlKC9kZGRkLywgXCJkZGRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwYXR0ZXJuOiBjb2x1bW5QYXR0ZXJuLFxuICAgICAgICAgIGxvY2FsZTogY29sdW1uTG9jYWxlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5VGlja3M6IHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhclxuICAgICAgICByYW5nZSA9IHRoaXMuY2F0ZWdvcnlSYW5nZSxcbiAgICAgICAgdHlwZSA9IHRoaXMuY2F0ZWdvcnlUeXBlLFxuICAgICAgICBtaW4gPSByYW5nZS5taW4sXG4gICAgICAgIG1heCA9IHJhbmdlLm1heCxcbiAgICAgICAgY291bnQgPSBNYXRoLm1pbigxMCwgdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkpLFxuICAgICAgICBvdXRlciA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBudGlja3MobWluLCBtYXgsIGNvdW50LCBvdXRlcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICByZXR1cm4gZHRpY2tzKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBtYXggPSB0aGlzLmRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSAtIDE7XG4gICAgICAgIHJldHVybiAoQXJyYXkuYXBwbHkobnVsbCwge2xlbmd0aDogdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCl9KS5tYXAoTnVtYmVyLmNhbGwsIE51bWJlcikpLm1hcChmdW5jdGlvbih0aWNrKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGljayk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdmFsdWVSYW5nZToge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuZGF0YVRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhclxuICAgICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgICAgcmVzdWx0ID0ge30sXG4gICAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgICByYW5nZTtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgaWYgKGNvbHVtbkluZGV4ICE9PSBjYXRlZ29yeUluZGV4KSB7XG4gICAgICAgICAgICByYW5nZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5SYW5nZShjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICByZXN1bHQubWluID0gdHlwZW9mIHJlc3VsdC5taW4gPT09ICd1bmRlZmluZWQnID8gcmFuZ2UubWluIDogTWF0aC5taW4ocmVzdWx0Lm1pbiwgcmFuZ2UubWluKTtcbiAgICAgICAgICAgIHJlc3VsdC5tYXggPSB0eXBlb2YgcmVzdWx0Lm1heCA9PT0gJ3VuZGVmaW5lZCcgPyByYW5nZS5tYXggOiBNYXRoLm1heChyZXN1bHQubWF4LCByYW5nZS5tYXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LFxuICB2YWx1ZVR5cGU6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmRhdGFUYWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXg7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICAgIGlmIChjb2x1bW5JbmRleCAhPT0gY2F0ZWdvcnlJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgdmFsdWVGb3JtYXQ6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICBjb2x1bW5JbmRleCxcbiAgICAgICAgY2F0ZWdvcnlJbmRleCA9IHRoaXMuY2F0ZWdvcnlJbmRleCxcbiAgICAgICAgdmFsdWVUeXBlID0gdGhpcy52YWx1ZVR5cGU7XG4gICAgICAgIFxuICAgICAgaWYgKGRhdGFUYWJsZSkge1xuICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICBpZiAoY29sdW1uSW5kZXggIT09IGNhdGVnb3J5SW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2x1bW5QYXR0ZXJuID0gZGF0YVRhYmxlLmdldENvbHVtblBhdHRlcm4oY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgdmFyIGNvbHVtbkxvY2FsZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5Mb2NhbGUoY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgaWYgKGNvbHVtblBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgLy8gUHJlZmVyIHNob3J0IG5hbWVzIG9uIHNjYWxlXG4gICAgICAgICAgICAgIGNvbHVtblBhdHRlcm4ucmVwbGFjZSgvTU1NTS8sIFwiTU1NXCIpO1xuICAgICAgICAgICAgICBjb2x1bW5QYXR0ZXJuLnJlcGxhY2UoL2RkZGQvLCBcImRkZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHBhdHRlcm46IGNvbHVtblBhdHRlcm4sXG4gICAgICAgICAgICAgIGxvY2FsZTogY29sdW1uTG9jYWxlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgdmFsdWVUaWNrczoge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAvKlxuICAgICAgdmFyXG4gICAgICAgIHJhbmdlID0gdGhpcy52YWx1ZVJhbmdlLFxuICAgICAgICB0eXBlID0gdGhpcy52YWx1ZVR5cGUsXG4gICAgICAgIGNvdW50ID0gTWF0aC5taW4oMTAsIHRoaXMuZGF0YVRhYmxlLmdldE51bWJlck9mUm93cygpKTtcbiAgICAgIHJldHVybiAodHlwZSA9PT0gJ251bWJlcicgPyBudGlja3MgOiB0eXBlID09PSAnZGF0ZScgPyBkdGlja3MgOiBzdGlja3MpKHJhbmdlLm1pbiwgcmFuZ2UubWF4LCA2LCB0cnVlKTsqL1xuICAgICAgdmFyXG4gICAgICAgIHJhbmdlID0gdGhpcy52YWx1ZVJhbmdlLFxuICAgICAgICB0eXBlID0gdGhpcy52YWx1ZVR5cGUsXG4gICAgICAgIG1pbiA9IHJhbmdlLm1pbixcbiAgICAgICAgbWF4ID0gcmFuZ2UubWF4LFxuICAgICAgICBjb3VudCA9IDUsXG4gICAgICAgIG91dGVyID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gbnRpY2tzKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZGF0ZScpIHtcbiAgICAgICAgcmV0dXJuIGR0aWNrcyhtaW4sIG1heCwgY291bnQsIG91dGVyKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWF4ID0gdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkgLSAxO1xuICAgICAgICByZXR1cm4gbnRpY2tzKDAsIG1heCwgTWF0aC5taW4obWF4ICsgMSwgY291bnQpLCBvdXRlcikubWFwKGZ1bmN0aW9uKHRpY2spIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0aWNrKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBsZWdlbmRJdGVtczoge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNvbG9ySW5kZXggPSAwLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgbGFiZWw7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICAgIGlmICh0aGlzLmNhdGVnb3J5SW5kZXggIT09IGNvbHVtbkluZGV4KSB7XG4gICAgICAgICAgICBsYWJlbCA9IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2xhYmVsOiBkYXRhVGFibGUuZ2V0Q29sdW1uTGFiZWwoY29sdW1uSW5kZXgpIHx8IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVlhZWlwiLmNoYXJBdChjb2x1bW5JbmRleCAlIDIxKSwgYnVsbGV0OiB7IGZpbGw6IG9wdGlvbnMuY29sb3JzW2NvbG9ySW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdIH0gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2xvckluZGV4Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSxcbiAgZmxpcEF4ZXM6IHtcbiAgICB2YWx1ZTogZmFsc2UsXG4gICAgd3JpdGVhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSxcbiAgY2xpcENhdGVnb3J5R3JpZDoge1xuICAgIHZhbHVlOiBmYWxzZSxcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9LFxuICBjYXRlZ29yeUdyaWRMaW5lczoge1xuICAgIHZhbHVlOiB0cnVlLFxuICAgIHdyaXRlYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0sXG4gIGNsaXBWYWx1ZUdyaWQ6IHtcbiAgICB2YWx1ZTogZmFsc2UsXG4gICAgd3JpdGVhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSxcbiAgdmFsdWVHcmlkTGluZXM6IHtcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FydGVzaWFuQ2hhcnQ7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcbnZhciBudGlja3MgPSByZXF1aXJlKFwiLi4vdXRpbHMvbnRpY2tzXCIpO1xudmFyIGR0aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9kdGlja3NcIik7XG52YXIgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbmNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIEJhckNoYXJ0KCkge1xuICBDb2x1bW5DaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5CYXJDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbHVtbkNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChDb2x1bW5DaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IF92LmV4dGVuZCh0cnVlLCB7fSwgQ29sdW1uQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gIH0pXG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQmFyQ2hhcnQucHJvdG90eXBlLCB7XG4gIGZsaXBBeGVzOiB7XG4gICAgdmFsdWU6IHRydWVcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnQ7IiwidmFyIERhdGFUYWJsZSA9IHJlcXVpcmUoXCIuLi91dGlscy9kYXRhdGFibGVcIik7XG52YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xuXG5mdW5jdGlvbiBCYXNlQ2hhcnQoZWxlbWVudCwgb3B0aW9ucykge1xuICBcbiAgLy8gQ29uc3RydWN0IEJhc2VDaGFydFxuICB2YXJcbiAgICBlbGVtID0gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpIDogZWxlbWVudCxcbiAgICBvcHRzID0gX3YuZXh0ZW5kKHRydWUsIHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlLmRlZmF1bHRzLCBvcHRpb25zKSxcbiAgICBkYXRhVGFibGUgPSBEYXRhVGFibGUuZnJvbUFycmF5KG9wdGlvbnMuZGF0YSk7XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgZWxlbWVudDoge1xuICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICB9XG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIG9wdHMgPSBfdi5leHRlbmQodHJ1ZSwgb3B0cywgb3B0aW9ucyk7XG4gICAgICAgIGRhdGFUYWJsZSA9IERhdGFUYWJsZS5mcm9tQXJyYXkob3B0cy5kYXRhKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9XG4gICAgfSxcbiAgICBkYXRhVGFibGU6IHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFUYWJsZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBcbiAgLy8gY2FsbCBjb25zdHJ1Y3RcbiAgdGhpcy5fY29uc3RydWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIFxuICAvLyBTZXQgb3B0aW9ucyBhbmQgcmVuZGVyIGNoYXJ0XG4gIHRoaXMucmVuZGVyKCk7XG59XG5cblxuX3YuZXh0ZW5kKEJhc2VDaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IHtcbiAgICAvKlxuICAgIHN0eWxlOiB7XG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgZm9udFNpemU6ICcxMnB4JyxcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgY29sb3I6ICcjODE4Mzg2J1xuICAgIH0qL1xuICB9LFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHt9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vIENsZWFyXG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgLy8gQXBwbHkgc3R5bGVzXG4gICAgX3YuY3NzKHRoaXMuZWxlbWVudCwgdGhpcy5vcHRpb25zLnN0eWxlKTtcbiAgfVxufSk7XG5cbiAgXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VDaGFydDsiLCJ2YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xudmFyIERhdGFUYWJsZSA9IHJlcXVpcmUoXCIuLi91dGlscy9kYXRhdGFibGVcIik7XG52YXIgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lY2hhcnQnKTtcbnZhciBQaWVDaGFydCA9IHJlcXVpcmUoJy4vcGllY2hhcnQnKTtcbnZhciBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY29sdW1uY2hhcnQnKTtcbnZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vYmFyY2hhcnQnKTtcbnZhciBUYWJsZUNoYXJ0ID0gcmVxdWlyZSgnLi90YWJsZWNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIGdldENoYXJ0VHlwZShkYXRhVGFibGUpIHtcbiAgXG4gIGlmIChkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkgPiAyMCkge1xuICAgIHJldHVybiBcImxpbmVcIjtcbiAgfVxuICBcbiAgcmV0dXJuICdwaWUnO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFydENsYXNzKHR5cGUpIHtcbiAgdmFyIGNsYXp6O1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGNsYXp6ID0gTGluZUNoYXJ0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGllJzpcbiAgICAgIGNsYXp6ID0gUGllQ2hhcnQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjb2x1bW4nOlxuICAgICAgY2xhenogPSBDb2x1bW5DaGFydDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jhcic6XG4gICAgICBjbGF6eiA9IEJhckNoYXJ0O1xuICAgICAgYnJlYWs7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY2xhenogPSBUYWJsZUNoYXJ0O1xuICAgICAgXG4gIH1cbiAgcmV0dXJuIGNsYXp6O1xufVxuXG5mdW5jdGlvbiBDaGFydFdyYXBwZXIoZWxlbWVudCwgb3B0aW9ucykge1xuICBcbiAgdmFyXG4gICAgY2hhcnQsXG4gICAgb3B0cyA9IF92LmV4dGVuZCh0cnVlLCB0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5kZWZhdWx0cyk7XG4gICAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICBjaGFydDoge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHNldDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0cyA9IF92LmV4dGVuZCh0cnVlLCBvcHRzLCBvcHRpb25zKTtcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IERhdGFUYWJsZS5mcm9tQXJyYXkob3B0cy5kYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IG9wdHMudHlwZSB8fCBnZXRDaGFydFR5cGUoZGF0YVRhYmxlKTtcbiAgICAgICAgdmFyIGNoYXJ0Q2xhc3MgPSBnZXRDaGFydENsYXNzKGNoYXJ0VHlwZSk7XG4gICAgICAgIG9wdHMuZGF0YSA9IGRhdGFUYWJsZTtcbiAgICAgICAgaWYgKGNoYXJ0ICYmIGNoYXJ0LmNvbnN0cnVjdG9yID09PSBjaGFydENsYXNzKSB7XG4gICAgICAgICAgY2hhcnQub3B0aW9ucyA9IG9wdHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhcnQgPSBuZXcgY2hhcnRDbGFzcyhjaGFydCAmJiBjaGFydC5lbGVtZW50IHx8IGVsZW1lbnQsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIFxuICB0aGlzLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbn1cblxuX3YuZXh0ZW5kKENoYXJ0V3JhcHBlci5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IHtcbiAgfSxcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7fSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNoYXJ0LnJlbmRlcigpO1xuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2hhcnRXcmFwcGVyLnByb3RvdHlwZSwge1xuICBlbGVtZW50OiB7XG4gICAgc2V0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB0aGlzLmNoYXJ0LmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJ0LmVsZW1lbnQ7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFydFdyYXBwZXI7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcbnZhciBudGlja3MgPSByZXF1aXJlKFwiLi4vdXRpbHMvbnRpY2tzXCIpO1xudmFyIGR0aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9kdGlja3NcIik7XG52YXIgQ2FydGVzaWFuQ2hhcnQgPSByZXF1aXJlKCcuL2NhcnRlc2lhbmNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIENvbHVtbkNoYXJ0KCkge1xuICBDYXJ0ZXNpYW5DaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5Db2x1bW5DaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChDb2x1bW5DaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IF92LmV4dGVuZCh0cnVlLCB7fSwgQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gIH0pLFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBcbiAgICB2YXJcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgIGNoYXJ0TGF5ZXIgPSB0aGlzLmNoYXJ0TGF5ZXIsXG4gICAgICBjaGFydEJveCA9IHRoaXMuY2hhcnRCb3gsXG4gICAgICBjb2x1bW5JbmRleCA9IHRoaXMuY29sdW1uSW5kZXgsXG4gICAgICByb3dJbmRleCA9IDAsXG4gICAgICB2YWx1ZUluZGV4ID0gMCxcbiAgICAgIHZhbHVlUmFuZ2UgPSB0aGlzLnZhbHVlUmFuZ2UsXG4gICAgICB2YWx1ZVRpY2tzID0gdGhpcy52YWx1ZVRpY2tzLFxuICAgICAgdmFsdWVNaW4gPSBNYXRoLm1pbih2YWx1ZVJhbmdlLm1pbiwgdmFsdWVUaWNrc1swXSksXG4gICAgICB2YWx1ZU1heCA9IE1hdGgubWF4KHZhbHVlUmFuZ2UubWF4LCB2YWx1ZVRpY2tzW3ZhbHVlVGlja3MubGVuZ3RoIC0gMV0pLFxuICAgICAgY2F0ZWdvcnlUeXBlID0gdGhpcy5jYXRlZ29yeVR5cGUsXG4gICAgICBjYXRlZ29yeVJhbmdlID0gdGhpcy5jYXRlZ29yeVJhbmdlLFxuICAgICAgY2F0ZWdvcnlUaWNrcyA9IHRoaXMuY2F0ZWdvcnlUaWNrcyxcbiAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXgsXG4gICAgICBjYXRlZ29yeU1pbiA9IE1hdGgubWluKGNhdGVnb3J5UmFuZ2UubWluLCBjYXRlZ29yeVRpY2tzWzBdKSxcbiAgICAgIGNhdGVnb3J5TWF4ID0gTWF0aC5tYXgoY2F0ZWdvcnlSYW5nZS5tYXgsIGNhdGVnb3J5VGlja3NbY2F0ZWdvcnlUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICBmbGlwQXhlcyA9IHRoaXMuZmxpcEF4ZXMsXG4gICAgICBncmFwaExheWVyLFxuICAgICAgcG9pbnRzLFxuICAgICAgdmFsdWUsXG4gICAgICBub3JtYWxpemVkVmFsdWUsXG4gICAgICBjYXRlZ29yeVZhbHVlLFxuICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUsXG4gICAgICB4LFxuICAgICAgeTtcbiAgICAgIFxuICAgIHZhciByb3dzID0gZGF0YVRhYmxlLmdldFNvcnRlZFJvd3MoY2F0ZWdvcnlJbmRleCk7XG4gICAgXG4gICAgdmFyIHJlY3RXaWR0aCA9IGNoYXJ0Qm94LndpZHRoIC8gKGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKSAtIDEpO1xuICAgIHZhciB0aWNrV2lkdGggPSAoZmxpcEF4ZXMgPyBjaGFydEJveC5oZWlnaHQgOiBjaGFydEJveC53aWR0aCkgLyByb3dzLmxlbmd0aDsgXG4gICAgdmFyIGNvbHVtbldpZHRoID0gTWF0aC5tYXgoMSwgdGlja1dpZHRoIC8gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpKTtcbiAgICB2YXIgY29sdW1uU3BhY2luZyA9IGNvbHVtbldpZHRoICogMC4yNTtcbiAgICB2YXIgbSA9IDE7XG4gICBcbiAgICB2YXIgc3VtID0ge307XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgY29sb3JJbmRleCA9IDA7XG4gICAgXG4gICAgZ3JhcGhMYXllciA9IGNoYXJ0TGF5ZXIuZyh7XG4gICAgICBmaWxsOiBvcHRpb25zLmNvbG9yc1t2YWx1ZUluZGV4ICUgb3B0aW9ucy5jb2xvcnMubGVuZ3RoXVxuICAgIH0pO1xuICAgIFxuICAgIGZvciAocm93SW5kZXggPSAwOyByb3dJbmRleCA8IHJvd3MubGVuZ3RoOyByb3dJbmRleCsrKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgdmFyIHN0ZXAgPSByb3dJbmRleCAlIG0gPT09IDA7XG4gICAgICBcbiAgICAgIHZhciB2YWx1ZUluZGV4ID0gMDtcbiAgICAgIFxuICAgICAgXG4gICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb2x1bW5JbmRleCAhPT0gY2F0ZWdvcnlJbmRleCkge1xuICAgICAgICAgIGNvbG9ySW5kZXgrKztcbiAgICAgICAgICBjYXRlZ29yeVZhbHVlID0gY2F0ZWdvcnlUeXBlID09PSAnc3RyaW5nJyA/IHJvd0luZGV4IDogcm93c1tyb3dJbmRleF1bY2F0ZWdvcnlJbmRleF07XG4gICAgICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgPSAoY2F0ZWdvcnlWYWx1ZSAtIGNhdGVnb3J5TWluKSAvICggY2F0ZWdvcnlNYXggLSBjYXRlZ29yeU1pbik7XG4gICAgICBcbiAgICAgICAgICAvL1xuICAgICAgICAgIHBvaW50cyA9IFtdO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHJvd3Nbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgICAgICBcbiAgICAgICAgICBzdW1bY29sdW1uSW5kZXhdID0gc3VtW2NvbHVtbkluZGV4XSB8fCAwO1xuICAgICAgICAgIHN1bVtjb2x1bW5JbmRleF0rPSB2YWx1ZTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSAodmFsdWUgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBub3JtYWxpemVkVmFsdWVaZXJvID0gMDtcbiAgICAgICAgICAgIGlmICh2YWx1ZU1pbiA8IDAgJiYgdmFsdWVNYXggPiAwKSB7XG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZVplcm8gPSAoMCAtIHZhbHVlTWluKSAvICh2YWx1ZU1heCAtIHZhbHVlTWluKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWRDYXRlZ29yeVplcm8gPSAwO1xuICAgICAgICAgICAgaWYgKGNhdGVnb3J5TWluIDwgMCAmJiBjYXRlZ29yeU1heCA+IDApIHtcbiAgICAgICAgICAgICAgbm9ybWFsaXplZENhdGVnb3J5WmVybyA9ICgwIC0gY2F0ZWdvcnlNaW4pIC8gKGNhdGVnb3J5TWF4IC0gY2F0ZWdvcnlNaW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgdyA9IE1hdGgubWF4KDEsIGNvbHVtbldpZHRoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyp2YXIgeHYgPSBmbGlwQXhlcyA/IG5vcm1hbGl6ZWRWYWx1ZSA6IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlO1xuICAgICAgICAgICAgdmFyIHl2ID0gZmxpcEF4ZXMgPyBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSA6IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHp2ID0gZmxpcEF4ZXMgPyBub3JtYWxpemVkQ2F0ZWdvcnlaZXJvIDogbm9ybWFsaXplZFZhbHVlWmVybztcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4diA9IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlO1xuICAgICAgICAgICAgdmFyIHl2ID0gbm9ybWFsaXplZFZhbHVlO1xuICAgICAgICAgICAgdmFyIHp2ID0gbm9ybWFsaXplZFZhbHVlWmVybztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGN3ID0gZmxpcEF4ZXMgPyBjaGFydEJveC53aWR0aCA6IGNoYXJ0Qm94LndpZHRoIC0gdGlja1dpZHRoO1xuICAgICAgICAgICAgdmFyIGNoID0gZmxpcEF4ZXMgPyBjaGFydEJveC5oZWlnaHQgLSB0aWNrV2lkdGggOiBjaGFydEJveC5oZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBvID0gY29sdW1uV2lkdGggLyAyICsgdmFsdWVJbmRleCAqIGNvbHVtbldpZHRoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgb3ggPSBmbGlwQXhlcyA/IDAgOiBvO1xuICAgICAgICAgICAgdmFyIG95ID0gZmxpcEF4ZXMgPyBvIDogMDtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0geHYgKiBjdyArIG94O1xuICAgICAgICAgICAgeSA9IHl2ICogY2ggKyBveTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgeCA9IHh2ICogY3cgKyBveDtcbiAgICAgICAgICAgIHZhciB5ID0gY2ggLSB5diAqIGNoICsgb3k7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGggPSB5diAqIGNoO1xuICAgICAgICAgICBcbiAgICAgICAgICAgIC8vaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICB5ID0gY2ggLSB6diAqIGNoO1xuICAgICAgICAgICAgICBoID0gKHp2IC0geXYpICogY2g7XG4gICAgICAgICAgICAvKn0gZWxzZSBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICBoID0gaCAtIHp2ICogY2g7XG4gICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZmxpcEF4ZXMpIHtcbiAgICAgICAgICAgICAgaCA9IHc7XG4gICAgICAgICAgICAgIHcgPSAoeXYgLSB6dikgKiBjdztcbiAgICAgICAgICAgICAgeCA9IHp2ICogY3c7XG4gICAgICAgICAgICAgIHkgPSB4diAqIGNoICsgb3k7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBcbiAgICAgICAgICAgICAgeDEgPSBNYXRoLnJvdW5kKHgpLFxuICAgICAgICAgICAgICB5MSA9IE1hdGgucm91bmQoeSksXG4gICAgICAgICAgICAgIHgyID0gTWF0aC5yb3VuZCh4KSArIE1hdGgucm91bmQodyksXG4gICAgICAgICAgICAgIHkyID0gTWF0aC5yb3VuZCh5KSArIE1hdGgucm91bmQoaCk7XG4gICAgICAgICAgICBncmFwaExheWVyLnBhdGgoJ00nICsgeDEgKycsJyArIHkxICsgJyAnICsgeDIgKyAnLCcgKyB5MSArICcgJyArIHgyICsgJywnICsgeTIgKyAnICcgKyB4MSArICcsJyArIHkyLCB7ZmlsbDogb3B0aW9ucy5jb2xvcnNbY29sb3JJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF19KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9ncmFwaExheWVyLmNpcmNsZSh4MSwgeTEsIDEwLCB7ZmlsbDogJ3JlZCd9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICB2YWx1ZUluZGV4Kys7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgZ3JhcGhMYXllci5ncmFwaChwb2ludHMsIHtcbiAgICAgICAgICBzdHJva2U6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAxLjVcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgXG4gICAgICAgIFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RlcCkge1xuICAgICAgY291bnQgPSAwO1xuICAgICAgc3VtID0ge307XG4gICAgfVxuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ29sdW1uQ2hhcnQucHJvdG90eXBlLCB7XG4gIGNsaXBDYXRlZ29yeUdyaWQ6IHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9LFxuICBjYXRlZ29yeUdyaWRMaW5lczoge1xuICAgIHZhbHVlOiBmYWxzZVxuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0OyIsInZhciBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIik7XG5cbnZhciBDYXJ0ZXNpYW5DaGFydCA9IHJlcXVpcmUoJy4vQ2FydGVzaWFuQ2hhcnQnKTtcblxuZnVuY3Rpb24gTGluZUNoYXJ0KCkge1xuICBDYXJ0ZXNpYW5DaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5MaW5lQ2hhcnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoTGluZUNoYXJ0LnByb3RvdHlwZSwge1xuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSksXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIFxuICAgIHZhclxuICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveCxcbiAgICAgIGNvbHVtbkluZGV4ID0gdGhpcy5jb2x1bW5JbmRleCxcbiAgICAgIHJvd0luZGV4ID0gMCxcbiAgICAgIHZhbHVlSW5kZXggPSAwLFxuICAgICAgdmFsdWVSYW5nZSA9IHRoaXMudmFsdWVSYW5nZSxcbiAgICAgIHZhbHVlVGlja3MgPSB0aGlzLnZhbHVlVGlja3MsXG4gICAgICB2YWx1ZU1pbiA9IE1hdGgubWluKHZhbHVlUmFuZ2UubWluLCB2YWx1ZVRpY2tzWzBdKSxcbiAgICAgIHZhbHVlTWF4ID0gTWF0aC5tYXgodmFsdWVSYW5nZS5tYXgsIHZhbHVlVGlja3NbdmFsdWVUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICBjYXRlZ29yeVR5cGUgPSB0aGlzLmNhdGVnb3J5VHlwZSxcbiAgICAgIGNhdGVnb3J5UmFuZ2UgPSB0aGlzLmNhdGVnb3J5UmFuZ2UsXG4gICAgICBjYXRlZ29yeVRpY2tzID0gdGhpcy5jYXRlZ29yeVRpY2tzLFxuICAgICAgY2F0ZWdvcnlJbmRleCA9IHRoaXMuY2F0ZWdvcnlJbmRleCxcbiAgICAgIGNhdGVnb3J5TWluID0gTWF0aC5taW4oY2F0ZWdvcnlSYW5nZS5taW4sIGNhdGVnb3J5VGlja3NbMF0pLFxuICAgICAgY2F0ZWdvcnlNYXggPSBNYXRoLm1heChjYXRlZ29yeVJhbmdlLm1heCwgY2F0ZWdvcnlUaWNrc1tjYXRlZ29yeVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIGZsaXBBeGVzID0gdGhpcy5mbGlwQXhlcyxcbiAgICAgIGdyYXBoTGF5ZXIgPSBjaGFydExheWVyLmcoKSxcbiAgICAgIHBvaW50cyxcbiAgICAgIHZhbHVlLFxuICAgICAgbm9ybWFsaXplZFZhbHVlLFxuICAgICAgY2F0ZWdvcnlWYWx1ZSxcbiAgICAgIG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlLFxuICAgICAgeCxcbiAgICAgIHk7XG4gICAgICBcbiAgICB2YXIgcm93cyA9IGRhdGFUYWJsZS5nZXRTb3J0ZWRSb3dzKGNhdGVnb3J5SW5kZXgpO1xuICAgIFxuICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgaWYgKGNvbHVtbkluZGV4ICE9PSBjYXRlZ29yeUluZGV4KSB7XG4gICAgICAgIHBvaW50cyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy9mb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgICAgZm9yIChyb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgcm93cy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICBcbiAgICAgICAgICB2YWx1ZSA9IHJvd3Nbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgICAgICAvL3ZhbHVlID0gZGF0YVRhYmxlLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgY2F0ZWdvcnlWYWx1ZSA9IGNhdGVnb3J5VHlwZSA9PT0gJ3N0cmluZycgPyByb3dJbmRleCA6IHJvd3Nbcm93SW5kZXhdW2NhdGVnb3J5SW5kZXhdO1xuICAgICAgICAgIC8vY2F0ZWdvcnlWYWx1ZSA9IGNhdGVnb3J5VHlwZSA9PT0gJ3N0cmluZycgPyByb3dJbmRleCA6IGRhdGFUYWJsZS5nZXRWYWx1ZShyb3dJbmRleCwgY2F0ZWdvcnlJbmRleCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgPSAoY2F0ZWdvcnlWYWx1ZSAtIGNhdGVnb3J5TWluKSAvICggY2F0ZWdvcnlNYXggLSBjYXRlZ29yeU1pbik7XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSAodmFsdWUgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4diA9IGZsaXBBeGVzID8gbm9ybWFsaXplZFZhbHVlIDogbm9ybWFsaXplZENhdGVnb3J5VmFsdWU7XG4gICAgICAgICAgICB2YXIgeXYgPSBmbGlwQXhlcyA/IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlIDogbm9ybWFsaXplZFZhbHVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4ID0gTWF0aC5yb3VuZCh4diAqIGNoYXJ0Qm94LndpZHRoKTtcbiAgICAgICAgICAgIHkgPSBNYXRoLnJvdW5kKGNoYXJ0Qm94LmhlaWdodCAtIHl2ICogY2hhcnRCb3guaGVpZ2h0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHggPj0gMCAmJiB4IDw9IGNoYXJ0Qm94LndpZHRoICYmIHkgPj0gMCAmJiB5IDw9IGNoYXJ0Qm94LmhlaWdodCkge1xuICAgICAgICAgICAgICBwb2ludHMucHVzaCh7eDogeCwgeTogeX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZ3JhcGhMYXllci5ncmFwaChwb2ludHMsIHtcbiAgICAgICAgICBzbW9vdGg6IG9wdGlvbnMuc21vb3RoLFxuICAgICAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcnNbdmFsdWVJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF0sXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDEuNVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydDsiLCJ2YXJcbiAgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpLFxuICBuZm9ybWF0ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci9uZm9ybWF0L3NyYy9uZm9ybWF0XCIpLFxuICBkZm9ybWF0ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci9kZm9ybWF0L3NyYy9kZm9ybWF0XCIpLFxuICByb3VuZCA9IHJlcXVpcmUoJy4uL3V0aWxzL3JvdW5kJyksXG4gIFZpc3VhbENoYXJ0ID0gcmVxdWlyZSgnLi92aXN1YWxjaGFydCcpO1xuXG5mdW5jdGlvbiBQaWVDaGFydCgpIHtcbiAgVmlzdWFsQ2hhcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuUGllQ2hhcnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaXN1YWxDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoUGllQ2hhcnQucHJvdG90eXBlLCB7XG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIFZpc3VhbENoYXJ0LnByb3RvdHlwZS5kZWZhdWx0cywge1xuICB9KSxcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7XG4gICAgVmlzdWFsQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBWaXN1YWxDaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIFxuICAgIHZhclxuICAgICAgbGFiZWxGb250U2l6ZSA9IDExLFxuICAgICAgbGFiZWxEaXN0YW5jZSA9IGxhYmVsRm9udFNpemUgKyBsYWJlbEZvbnRTaXplICogMC43NSxcbiAgICAgIG1pblBlcmNlbnQgPSAwLjA0LFxuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgIGVsZW0gPSB0aGlzLmVsZW1lbnQsXG4gICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgIGNoYXJ0TGF5ZXIgPSB0aGlzLmNoYXJ0TGF5ZXIsXG4gICAgICBncmlkTGF5ZXIgPSBjaGFydExheWVyLmcoe1xuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGZvbnRTaXplOiBsYWJlbEZvbnRTaXplICsgXCJweFwiXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgY2hhcnRCb3ggPSB0aGlzLmNoYXJ0Qm94LFxuICAgICAgcm93SW5kZXgsXG4gICAgICBjb2x1bW5JbmRleCxcbiAgICAgIGNvbHVtblR5cGUsXG4gICAgICB0eXBlID0gZ2V0VHlwZU9mRGF0YShkYXRhVGFibGUpLFxuICAgICAgcGllcyA9IFtdLFxuICAgICAgcGllLFxuICAgICAgdG90YWwgPSAwLFxuICAgICAgbGFiZWwsXG4gICAgICB2YWx1ZSxcbiAgICAgIGZvcm1hdHRlZFZhbHVlLFxuICAgICAgcGF0dGVybixcbiAgICAgIGxvY2FsZSxcbiAgICAgIGluZGV4LFxuICAgICAgcGFkZGluZyA9IGxhYmVsRGlzdGFuY2UgKiAwLjc1LFxuICAgICAgLy9wYWRkaW5nID0gMzAsXG4gICAgICB5ID0gcGFkZGluZyxcbiAgICAgIHIgPSAoTWF0aC5taW4oY2hhcnRCb3gud2lkdGgsIGNoYXJ0Qm94LmhlaWdodCkgLSBwYWRkaW5nICogMiApIC8gMixcbiAgICAgIHggPSBjaGFydEJveC53aWR0aCAvIDIgLSByLFxuICAgICAgcCA9IDAsXG4gICAgICBwdixcbiAgICAgIGcsXG4gICAgICBhLFxuICAgICAgYXgsXG4gICAgICBheSxcbiAgICAgIHNBbmdsZSxcbiAgICAgIGVBbmdsZTtcbiAgICAgIFxuICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAvLyBDb2x1bW4gYmFzZWQgdmFsdWVzXG4gICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgY29sdW1uVHlwZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgaWYgKGNvbHVtblR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdmFsdWUgPSBkYXRhVGFibGUuZ2V0Q29sdW1uQXZlcmFnZShjb2x1bW5JbmRleCk7XG4gICAgICAgICAgcGF0dGVybiA9IGRhdGFUYWJsZS5nZXRDb2x1bW5QYXR0ZXJuKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBsb2NhbGUgPSBkYXRhVGFibGUuZ2V0Q29sdW1uTG9jYWxlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IG5mb3JtYXQodmFsdWUsIHBhdHRlcm4sIGxvY2FsZSk7XG4gICAgICAgICAgcGllcy5wdXNoKHt2OiB2YWx1ZSwgZjogZm9ybWF0dGVkVmFsdWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSb3cgYmFzZWQgdmFsdWVzXG4gICAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgY29sdW1uVHlwZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBpZiAoY29sdW1uVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIC8vIE51bWVyaWMgdmFsdWVcbiAgICAgICAgICAgIHZhbHVlID0gZGF0YVRhYmxlLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGRhdGFUYWJsZS5nZXRGb3JtYXR0ZWRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgcGllcy5wdXNoKHt2OiB2YWx1ZSwgZjogZm9ybWF0dGVkVmFsdWV9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvLyBTdW0gdXAgdG90YWxcbiAgICBmb3IgKHZhciBpID0gMDsgcGllID0gcGllc1tpXTsgaSsrKSB7XG4gICAgICB0b3RhbCs9IHBpZS52O1xuICAgIH07XG4gICAgXG4gICAgLy8gRHJhdyBiYWNrZ3JvdW5kXG4gICAgY2hhcnRMYXllci5jaXJjbGUoeCArIHIsIHkgKyByLCByLCB7XG4gICAgICBmaWxsOiAnbGlnaHRncmF5J1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFJlbmRlciBwaWVzIGFuZCBsYWJlbHNcbiAgICBmb3IgKGluZGV4ID0gMDsgcGllID0gcGllc1tpbmRleF07IGluZGV4KyspIHtcbiAgICAgIFxuICAgICAgLy8gUmVuZGVyIHBpZVxuICAgICAgc0FuZ2xlID0gcCAqIE1hdGguUEkgKiAyIC0gTWF0aC5QSSAvIDI7XG4gICAgICBcbiAgICAgIHB2ID0gcGllLnYgLyB0b3RhbDtcbiAgICAgIHAgPSBwaWUucCA9IHAgKyBwdjtcbiAgICAgIFxuICAgICAgZUFuZ2xlID0gcCAqIE1hdGguUEkgKiAyIC0gTWF0aC5QSSAvIDI7XG4gICAgICBcbiAgICAgIGNoYXJ0TGF5ZXIuZyh7ZmlsbDogb3B0aW9ucy5jb2xvcnNbaW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdfSkuYXJjKHggKyByLCB5ICsgciwgciwgc0FuZ2xlLCBlQW5nbGUsIDEpO1xuXG4gICAgICAvLyBSZW5kZXIgbGFiZWxcbiAgICAgIGlmIChwdiA+PSBtaW5QZXJjZW50KSB7XG4gICAgICAgIGEgPSBzQW5nbGUgKyAoZUFuZ2xlIC0gc0FuZ2xlKSAvIDI7XG4gICAgICAgIGF4ID0gciArIE1hdGguY29zKGEpICogKHIgKyBsYWJlbERpc3RhbmNlKTtcbiAgICAgICAgYXkgPSByICsgTWF0aC5zaW4oYSkgKiAociArIGxhYmVsRGlzdGFuY2UpO1xuICAgICAgICBncmlkTGF5ZXIudGV4dCh4ICsgYXgsIHkgKyBheSwgcGllLmYsIHt0ZXh0QW5jaG9yOiAnbWlkZGxlJywgZHg6ICcwLjFlbScsIGR5OiAnMC43ZW0nfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIFxuICAgIH1cbiAgICBcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGdldFR5cGVPZkRhdGEoZGF0YVRhYmxlKSB7XG4gIC8vIERldGVjdCB0eXBlIG9mIGRhdGFcbiAgdmFyIGNvbHVtblR5cGU7XG4gIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgIGNvbHVtblR5cGUgPSBkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCk7XG4gICAgaWYgKGNvbHVtblR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDA7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBpZUNoYXJ0LnByb3RvdHlwZSwge1xuICBcbiAgbGVnZW5kSXRlbXM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgcm93SW5kZXgsXG4gICAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgICB2YWx1ZUluZGV4ID0gMCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHR5cGUgPSBnZXRUeXBlT2ZEYXRhKGRhdGFUYWJsZSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgICAvLyBDb2x1bW4gYmFzZWQgdmFsdWVzXG4gICAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCh7bGFiZWw6IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCksIGJ1bGxldDogeyBmaWxsOiBvcHRpb25zLmNvbG9yc1t2YWx1ZUluZGV4ICUgb3B0aW9ucy5jb2xvcnMubGVuZ3RoXSB9IH0pO1xuICAgICAgICAgICAgICB2YWx1ZUluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFJvdyBiYXNlZCB2YWx1ZXNcbiAgICAgICAgZm9yIChyb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mUm93cygpOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAvLyBMYWJlbFxuICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGRhdGFUYWJsZS5nZXRGb3JtYXR0ZWRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpIHx8IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVlhZWlwiLmNoYXJBdChyb3dJbmRleCAlIDIxKSxcbiAgICAgICAgICAgICAgICBidWxsZXQ6IHtcbiAgICAgICAgICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdmFsdWVJbmRleCsrO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIFxuICAgIH1cbiAgfVxuICBcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0OyIsInZhciBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIik7XG5cbnZhciBCYXNlQ2hhcnQgPSByZXF1aXJlKCcuL2Jhc2VjaGFydCcpO1xuXG5mdW5jdGlvbiBUYWJsZUNoYXJ0KCkge1xuICBCYXNlQ2hhcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuVGFibGVDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoVGFibGVDaGFydC5wcm90b3R5cGUsIHtcbiAgXG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIEJhc2VDaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSksXG4gIFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHtcbiAgICBCYXNlQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZW5kZXIgbGF5ZXJcbiAgICBCYXNlQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHZhclxuICAgICAgZWxlbWVudCA9IHRoaXMuZWxlbWVudCxcbiAgICAgIGxheWVyID0gX3YoKSxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgcm93SW5kZXgsXG4gICAgICBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQsXG4gICAgICB0YWJsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCd0YWJsZScpLFxuICAgICAgY2FwdGlvbiA9IGRvYy5jcmVhdGVFbGVtZW50KCdjYXB0aW9uJyksXG4gICAgICB0aGVhZCA9IGRvYy5jcmVhdGVFbGVtZW50KCd0aGVhZCcpLFxuICAgICAgdGJvZHkgPSBkb2MuY3JlYXRlRWxlbWVudCgndGJvZHknKSxcbiAgICAgIHRyLCB0aCwgdGQsXG4gICAgICBldmVuO1xuICAgICAgXG4gICAgICAvLyBSZW5kZXIgaHRtbFxuICAgICAgXG4gICAgX3YuY3NzKHRhYmxlLCB7XG4gICAgICBmb250U2l6ZTogJzEycHgnLFxuICAgICAgYm9yZGVyQ29sbGFwc2U6IFwiY29sbGFwc2VcIixcbiAgICAgIGJvcmRlcjogXCIxcHggc29saWQgI2VmZWZlZlwiLFxuICAgICAgbWFyZ2luQm90dG9tOiAnMS41ZW0nLFxuICAgICAgd2lkdGg6ICc2MDBweCcsXG4gICAgICBtYXhXaWR0aDogJzEwMCUnLFxuICAgICAgZGlzcGxheTogJ3RhYmxlJyxcbiAgICAgIHRhYmxlTGF5b3V0OiAnZml4ZWQnXG4gICAgfSk7XG4gICAgXG4gICAgY2FwdGlvbi5pbm5lckhUTUwgPSBvcHRpb25zLnRpdGxlIHx8IFwiVGFibGVDaGFydFwiO1xuICAgIFxuICAgIF92LmNzcyhjYXB0aW9uLCB7XG4gICAgICBmb250U2l6ZTogXCIxMjAlXCIsXG4gICAgICBjb2xvcjogJ2luaGVyaXQnLFxuICAgICAgdGV4dEFsaWduOiAnbGVmdCdcbiAgICB9KTtcbiAgICBcbiAgICB0YWJsZS5hcHBlbmRDaGlsZChjYXB0aW9uKTtcbiAgICAvKl92LmNzcyh0aGVhZCwge1xuICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgIH0pO1xuICAgIF92LmNzcyh0Ym9keSwge1xuICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgIH0pOyovXG4gICAgXG4gICAgXG4gICAgdGFibGUuYXBwZW5kQ2hpbGQodGhlYWQpO1xuICAgIFxuICAgIC8vIENvbHVtbiB0aXRsZXNcbiAgICB2YXIgaGFzQ29sdW1uTGFiZWxzID0gZmFsc2U7IFxuICAgIHRyID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG4gICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICB0aCA9IGRvYy5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgICAgdmFyIGxhYmVsID0gZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KTtcbiAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICBoYXNDb2x1bW5MYWJlbHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGguaW5uZXJIVE1MID0gbGFiZWw7XG4gICAgICBfdi5jc3ModGgsIHtcbiAgICAgICAgLy93aWR0aDogMTAwIC8gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpICsgXCIlXCIsXG4gICAgICAgIGJvcmRlcjogXCIxcHggc29saWQgI2RmZGZkZlwiLFxuICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlZmVmZWYnLFxuICAgICAgICB3b3JkV3JhcDogJ2JyZWFrLXdvcmQnLFxuICAgICAgICBwYWRkaW5nOiAnNXB4J1xuICAgICAgfSk7XG4gICAgICB0ci5hcHBlbmRDaGlsZCh0aCk7XG4gICAgfVxuICAgIGlmIChoYXNDb2x1bW5MYWJlbHMpIHtcbiAgICAgIHRoZWFkLmFwcGVuZENoaWxkKHRyKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUm93c1xuICAgIHRhYmxlLmFwcGVuZENoaWxkKHRib2R5KTtcbiAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgIGV2ZW4gPSByb3dJbmRleCAlIDI7XG4gICAgICB0ciA9IGRvYy5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgIHRkID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIHRkLmlubmVySFRNTCA9IGRhdGFUYWJsZS5nZXRGb3JtYXR0ZWRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgICBfdi5jc3ModGQsIHtcbiAgICAgICAgICAvL3dpZHRoOiAxMDAgLyBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCkgKyBcIiVcIixcbiAgICAgICAgICBib3JkZXI6IFwiMXB4IHNvbGlkICNlZmVmZWZcIixcbiAgICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBldmVuID8gJyNmYWZhZmEnIDogJycsXG4gICAgICAgICAgd29yZFdyYXA6ICdicmVhay13b3JkJyxcbiAgICAgICAgICBwYWRkaW5nOiAnNXB4J1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgIH1cbiAgICAgIHRib2R5LmFwcGVuZENoaWxkKHRyKTtcbiAgICB9XG4gICAgXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgXG4gICAgXG4gICAgLy8gUmVuZGVyIFNWRyBMYXllciB1c2luZyBhIGZvcmVpZ24gb2JqZWN0XG4gICAgLypcbiAgICBsYXllclxuICAgICAgLmNsZWFyKClcbiAgICAgIC5hdHRyKHtcbiAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcInhNaWRZTWlkIG1lZXRcIixcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDBcbiAgICAgIH0pO1xuXG4gICAgdmFyIGZvcmVpZ24gPSBsYXllclxuICAgICAgLmNyZWF0ZSgnZm9yZWlnbk9iamVjdCcsIHtcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDBcbiAgICAgIH0pO1xuICAgICAgXG4gICAgdmFyIGJvZHkgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgJ2JvZHknKTtcbiAgICBmb3JlaWduLmF0dHIoJ3JlcXVpcmVkLWV4dGVuc2lvbnMnLCBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIik7XG4gICAgbGF5ZXIuYXBwZW5kKGZvcmVpZ24pO1xuICAgIGZvcmVpZ24uYXBwZW5kKGJvZHkpO1xuICAgIFxuICAgIGJvZHkuYXBwZW5kQ2hpbGQodGFibGUpO1xuICAgIFxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGxheWVyWzBdKTtcbiAgICAqL1xuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGFibGVDaGFydC5wcm90b3R5cGUsIHtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlQ2hhcnQ7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcblxudmFyXG4gIEJhc2VDaGFydCA9IHJlcXVpcmUoJy4vYmFzZWNoYXJ0JyksXG4gIHJvdW5kID0gcmVxdWlyZSgnLi4vdXRpbHMvcm91bmQnKTtcblxuZnVuY3Rpb24gVmlzdWFsQ2hhcnQoKSB7XG4gIEJhc2VDaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5WaXN1YWxDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoVmlzdWFsQ2hhcnQucHJvdG90eXBlLCB7XG4gIFxuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBCYXNlQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgLy9jb2xvcnM6IFsnbmF2eScsICdtYXJvb24nLCAnb2xpdmUnLCAndGVhbCcsICdicm93bicsICdncmVlbicsICdibHVlJywgJ3B1cnBsZScsICdvcmFuZ2UnLCAndmlvbGV0JywgJ2N5YW4nLCAnZnVjaHNpYScsICd5ZWxsb3cnLCAnbGltZScsICdhcXVhJywgJ3JlZCddLFxuICAgIC8vY29sb3JzOiBcIiMyODdDQ0UsIzk2M0E3NCwjNDhFMzg3LCNFNUEwNjksIzUwRjJGNywjRjU1QTQ0LCM3MzczNzNcIi5zcGxpdCgvW1xccyxdKy8pLFxuICAgIGNvbG9yczogXCIjMjM2MmM1LCNmZjc1MTgsIzEyYzBhMywjYzdkYWY4LCNmZmQxMTgsI2Y1MTczMSwjOEFmNDZjLCNDNTEzOEJcIi5zcGxpdCgvW1xccyxdKy8pLFxuICAgIGxlZ2VuZDogJ3RvcCdcbiAgfSksXG4gIFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHtcbiAgXG4gICAgQmFzZUNoYXJ0LnByb3RvdHlwZS5fY29uc3RydWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyXG4gICAgICBsYXllciA9IF92KCksXG4gICAgICBjaGFydExheWVyID0gbGF5ZXIuY3JlYXRlKCdnJyk7XG4gICAgICAgIFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIGxheWVyOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGxheWVyO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2hhcnRMYXllcjoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBjaGFydExheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gUmVuZGVyIGxheWVyXG4gICAgQmFzZUNoYXJ0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB2YXJcbiAgICAgIHdpZHRoID0gNjAwLFxuICAgICAgaGVpZ2h0ID0gNDAwLFxuICAgICAgc3BhY2luZyA9IDcsXG4gICAgICBcbiAgICAgIGVsZW0gPSB0aGlzLmVsZW1lbnQsXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICBsYXllciA9IHRoaXMubGF5ZXIsXG4gICAgICBjaGFydExheWVyID0gdGhpcy5jaGFydExheWVyLFxuXG4gICAgICBjaGFydEJveCxcbiAgICAgIFxuICAgICAgdGl0bGVMYXllcixcbiAgICAgIHRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCBcIlwiLFxuICAgICAgXG4gICAgICBsZWdlbmRJdGVtcyA9IHRoaXMubGVnZW5kSXRlbXMsXG4gICAgICBsZWdlbmRMYXllcixcbiAgICAgIGxlZ2VuZEJveCA9IHt9O1xuICAgICAgLypcbiAgICAgIF92LmNzcyhlbGVtLCB7XG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICBtYXhXaWR0aDogd2lkdGggKyBcInB4XCIsXG4gICAgICAgIG1heEhlaWdodDogaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICAvL3BhZGRpbmdUb3A6ICgod2lkdGggLyBoZWlnaHQpICsgMTAwKSArIFwiJVwiLFxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICAgICAgfSk7Ki9cblxuICAgICAgLy8gUmVuZGVyIGxheWVyXG4gICAgICBlbGVtLmFwcGVuZENoaWxkKGxheWVyWzBdKTtcbiAgICAgIGxheWVyXG4gICAgICAgIC5jbGVhcigpXG4gICAgICAgIC5hdHRyKHtcbiAgICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICAgIGhlaWdodDogNDAwLFxuICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICAgIC8qd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsKi9cbiAgICAgICAgICAvL2hlaWdodDogXCJhdXRvXCIsXG4gICAgICAgICAgLy93aWR0aDogd2lkdGggKyBcInB4XCIsXG4gICAgICAgICAgLy9oZWlnaHQ6IGhlaWdodCArIFwicHhcIixcbiAgICAgICAgICAvL2hlaWdodDogaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICAgIFxuICAgICAgICAgIC8vaGVpZ2h0OiBoZWlnaHQgKyBcInB4XCIsXG4gICAgICAgICAgLypcbiAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgaGVpZ2h0OiBcImF1dG9cIixcbiAgICAgICAgICAqL1xuICAgICAgICAgIC8vaGVpZ2h0OiBcImF1dG9cIixcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgZmlsbDogX3YuY3NzKGVsZW0sICdjb2xvcicpLCBcbiAgICAgICAgICAgIC8qcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwLCovXG4gICAgICAgICAgICAvL3dpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIC8vaGVpZ2h0OiBcImF1dG9cIixcbiAgICAgICAgICAgIC8vbWF4SGVpZ2h0OiBoZWlnaHQgKyBcInB4XCIsXG4gICAgICAgICAgICBtYXhXaWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodCArIFwicHhcIixcbiAgICAgICAgICAgIGhlaWdodDogXCJhdXRvXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpZXdCb3g6IFwiMCAwIFwiICsgNjAwICsgXCIgXCIgKyA0MDAsXG4gICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbzogXCJ4TWlkWU1pZCBtZWV0XCJcbiAgICAgICAgICAvL3ByZXNlcnZlQXNwZWN0UmF0aW86IFwibm9uZVwiXG4gICAgICAgICAgLy9wcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcInhNaW5ZTWluIG1lZXRcIlxuICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgLy9tYXgtd2lkdGg6IDEwMCU7IG1heC1oZWlnaHQ6IDQwMHB4OyBoZWlnaHQ6IGF1dG87XG4gICAgICAvL2xheWVyLmF0dHIoJ3N0eWxlJywgbGF5ZXJbMF0uc3R5bGUuY3NzVGV4dCArICcgaGVpZ2h0OicgKyBoZWlnaHQgKyAncHhcXFxcJyk7XG4gICAgICBcbiAgICAgIC8qXG4gICAgICBjb25zb2xlLmxvZyhsYXllci5hdHRyKCd3aWR0aCcpLCBsYXllci5hdHRyKCdoZWlnaHQnKSk7XG4gICAgICBjb25zb2xlLmxvZyhsYXllci5hdHRyKCdzdHlsZScpKTtcbiAgICAgIGNvbnNvbGUubG9nKGxheWVyLmF0dHIoJ3ZpZXdCb3gnKSk7XG4gICAgICBjb25zb2xlLmxvZyhsYXllci5hdHRyKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJykpO1xuICAgICAgKi9cbiAgICAgXG4gICAgICBjaGFydEJveCA9IHRoaXMuY2hhcnRCb3g7XG4gICAgICB2YXIgbGF5ZXJSZWN0ID0gdGhpcy5sYXllclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIFxuICAgICAgXG4gICAgICB2YXIgdGV4dENvbG9yID0gbGF5ZXIuY3NzKCdjb2xvcicpO1xuICAgICAgLy8gUmVuZGVyIHRpdGxlXG4gICAgICB0aXRsZUxheWVyID0gbGF5ZXIuZygpO1xuICAgICAgdGl0bGVMYXllclxuICAgICAgICAudGV4dCgwLCAtMiwgdGl0bGUsIHtzdHlsZToge2ZvbnRTaXplOiAnMTIwJSd9LCB0ZXh0QW5jaG9yOiAnc3RhcnQnfSlcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIFwidHJhbnNsYXRlKFwiICsgTWF0aC5mbG9vcihjaGFydEJveC54KSArIFwiLFwiICsgTWF0aC5mbG9vcihjaGFydEJveC55IC0gc3BhY2luZykgKyBcIilcIik7XG4gICAgICBcbiAgICAgIGlmICh0aGlzLmxlZ2VuZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICBsZWdlbmRMYXllciA9IGxheWVyLmcoKTtcbiAgICAgICAgLy8gUmVuZGVyIGxlZ2VuZFxuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMubGVnZW5kKSB7XG4gICAgICAgICAgY2FzZSAndG9wJzogXG4gICAgICAgICAgICBsZWdlbmRMYXllclxuICAgICAgICAgICAgICAubGlzdGJveCgwLCAwLCBjaGFydEJveC53aWR0aCwgMCwgbGVnZW5kSXRlbXMsIHtob3Jpem9udGFsOiB0cnVlLCBmaWxsOiB0ZXh0Q29sb3J9KVxuICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTWF0aC5mbG9vcihjaGFydEJveC54KSArICcsJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueSAtIHNwYWNpbmcgKiAyIC0gbGVnZW5kTGF5ZXIuYmJveCgpLmhlaWdodCkgKyAnKScpO1xuICAgICAgICAgICAgdGl0bGVMYXllclxuICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgXCJ0cmFuc2xhdGUoXCIgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LngpICsgXCIsXCIgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnkgLSBzcGFjaW5nICogMyAtIGxlZ2VuZExheWVyLmJib3goKS5oZWlnaHQpICsgXCIpXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYm90dG9tJzogXG4gICAgICAgICAgICBsZWdlbmRMYXllclxuICAgICAgICAgICAgICAubGlzdGJveCgwLCAwLCBjaGFydEJveC53aWR0aCwgMCwgbGVnZW5kSXRlbXMsIHtob3Jpem9udGFsOiB0cnVlLCBmaWxsOiB0ZXh0Q29sb3J9KVxuICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTWF0aC5mbG9vcihjaGFydEJveC54ICsgc3BhY2luZykgKyAnLCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnkgKyBjaGFydEJveC5oZWlnaHQgKyBzcGFjaW5nKSArICcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsZWZ0JzogXG4gICAgICAgICAgICBsZWdlbmRMYXllclxuICAgICAgICAgICAgICAubGlzdGJveCgwLCAwLCBjaGFydEJveC53aWR0aCwgMCwgbGVnZW5kSXRlbXMsIHtmaWxsOiB0ZXh0Q29sb3J9KVxuICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTWF0aC5mbG9vcihjaGFydEJveC54ICsgc3BhY2luZykgKyAnLCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnkgKyBzcGFjaW5nKSArICcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICBsZWdlbmRMYXllclxuICAgICAgICAgICAgICAubGlzdGJveCgwLCAwLCBsYXllclJlY3Qud2lkdGggLSAoY2hhcnRCb3gueCArIGNoYXJ0Qm94LndpZHRoKSAtIHNwYWNpbmcgKiAyLCAwLCBsZWdlbmRJdGVtcywge2ZpbGw6IHRleHRDb2xvcn0pXG4gICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnggKyBjaGFydEJveC53aWR0aCArIHNwYWNpbmcpICsgJywnICsgTWF0aC5mbG9vcihjaGFydEJveC55KSArICcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBcbiAgICAvLyBBZGQgY2hhcnQgbGF5ZXJcbiAgICBjaGFydExheWVyLmNsZWFyKCk7XG4gICAgbGF5ZXIuYXBwZW5kKGNoYXJ0TGF5ZXIpO1xuICBcbiAgICAvL2xheWVyLnJlY3QoY2hhcnRCb3gueCwgY2hhcnRCb3gueSwgY2hhcnRCb3gud2lkdGgsIGNoYXJ0Qm94LmhlaWdodCwge3N0eWxlOiBcImZpbGw6dHJhbnNwYXJlbnQ7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDoxO29wYWNpdHk6MC41XCJ9KTtcbiAgICBjaGFydExheWVyLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNoYXJ0Qm94LnggKyAnLCcgKyBjaGFydEJveC55ICsgJyknKTtcbiAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFZpc3VhbENoYXJ0LnByb3RvdHlwZSwge1xuICBjaGFydEJveDoge1xuICAgIHdyaXRlYWJsZTogZmFsc2UsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5sYXllcikge1xuICAgICAgICByZXR1cm4ge3g6IDAsIHk6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDB9O1xuICAgICAgfVxuICAgICAgdmFyXG4gICAgICAgIHMgPSAwLjYsXG4gICAgICAgIC8vcmVjdCA9IHRoaXMubGF5ZXIgJiYgdGhpcy5sYXllclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmlld0JveCA9IHRoaXMubGF5ZXIuYXR0cigndmlld0JveCcpLnNwbGl0KFwiIFwiKSxcbiAgICAgICAgdyA9IHJvdW5kKHZpZXdCb3hbMl0pLFxuICAgICAgICBoID0gcm91bmQodmlld0JveFszXSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiByb3VuZCh3ICogKDEgLSBzKSAvIDIpLFxuICAgICAgICB5OiByb3VuZChoICogKDEgLSBzKSAvIDIpLFxuICAgICAgICB3aWR0aDogdyAqIHMsXG4gICAgICAgIGhlaWdodDogaCAqIHNcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICBsZWdlbmRJdGVtczoge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNvbG9ySW5kZXggPSAwLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgbGFiZWw7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICAgIGxhYmVsID0gZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtsYWJlbDogbGFiZWwsIGJ1bGxldDogeyBmaWxsOiBvcHRpb25zLmNvbG9yc1tjb2xvckluZGV4ICUgb3B0aW9ucy5jb2xvcnMubGVuZ3RoXSB9IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb2xvckluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaXN1YWxDaGFydDsiLCJ2YXJcbiAgbmZvcm1hdCA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvbmZvcm1hdC9zcmMvbmZvcm1hdFwiKSxcbiAgZGZvcm1hdCA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvZGZvcm1hdC9zcmMvZGZvcm1hdFwiKTtcblxuZnVuY3Rpb24gRGF0YVRhYmxlKGRhdGEpIHtcbiAgXG4gIGlmIChkYXRhIGluc3RhbmNlb2YgRGF0YVRhYmxlKSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbiAgXG4gIHZhciBcbiAgICBjb2xzID0gZGF0YSAmJiBkYXRhLmNvbHMgfHwgW10sXG4gICAgcm93cyA9IGRhdGEgJiYgZGF0YS5yb3dzIHx8IFtdO1xuICBcbiAgdGhpcy5nZXRDb2x1bW5JZCA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4KSB7XG4gICAgcmV0dXJuIGNvbHNbY29sdW1uSW5kZXhdICYmIGNvbHNbY29sdW1uSW5kZXhdLmlkO1xuICB9O1xuICBcbiAgdGhpcy5nZXRDb2x1bW5MYWJlbCA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4KSB7XG4gICAgcmV0dXJuIGNvbHNbY29sdW1uSW5kZXhdICYmIGNvbHNbY29sdW1uSW5kZXhdLmxhYmVsIHx8IFwiXCI7XG4gICAgLy9yZXR1cm4gY29sc1tjb2x1bW5JbmRleF0gJiYgKGNvbHNbY29sdW1uSW5kZXhdLmxhYmVsIHx8IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVlhZWlwiLmNoYXJBdChjb2x1bW5JbmRleCAlIDIxKSk7XG4gIH07XG4gIFxuICB0aGlzLmdldENvbHVtblR5cGUgPSBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgIHJldHVybiBjb2xzW2NvbHVtbkluZGV4XSAmJiBjb2xzW2NvbHVtbkluZGV4XS50eXBlO1xuICB9O1xuICBcbiAgdGhpcy5nZXRDb2x1bW5QYXR0ZXJuID0gZnVuY3Rpb24oY29sdW1uSW5kZXgpIHtcbiAgICByZXR1cm4gY29sc1tjb2x1bW5JbmRleF0gJiYgY29sc1tjb2x1bW5JbmRleF0ucGF0dGVybjtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uTG9jYWxlID0gZnVuY3Rpb24oY29sdW1uSW5kZXgpIHtcbiAgICByZXR1cm4gY29sc1tjb2x1bW5JbmRleF0gJiYgY29sc1tjb2x1bW5JbmRleF0ubG9jYWxlO1xuICB9O1xuICBcbiAgdGhpcy5nZXRDb2x1bW5SYW5nZSA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4LCByb3dJbmRleFN0YXJ0LCByb3dJbmRleEVuZCkge1xuICAgIGlmICh0aGlzLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHttaW46IHRoaXMuZ2V0VmFsdWUoMCwgY29sdW1uSW5kZXgpLCBtYXg6IHRoaXMuZ2V0VmFsdWUodGhpcy5nZXROdW1iZXJPZlJvd3MoKSAtIDEsIGNvbHVtbkluZGV4KX07XG4gICAgfVxuICAgIHJvd0luZGV4U3RhcnQgPSByb3dJbmRleFN0YXJ0ID8gcm93SW5kZXhTdGFydCA6IDA7XG4gICAgcm93SW5kZXhFbmQgPSByb3dJbmRleEVuZCA/IHJvd0luZGV4RW5kIDogdGhpcy5nZXROdW1iZXJPZlJvd3MoKSAtIDE7XG4gICAgdmFyIHZhbHVlLCBtaW4gPSBudWxsLCBtYXggPSBudWxsO1xuICAgIGZvciAocm93SW5kZXggPSByb3dJbmRleFN0YXJ0OyByb3dJbmRleCA8PSByb3dJbmRleEVuZDsgcm93SW5kZXgrKykge1xuICAgICAgdmFsdWUgPSB0aGlzLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS52YWx1ZU9mICYmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnIHx8IHZhbHVlKSkge1xuICAgICAgICBtaW4gPSBtaW4gPT09IG51bGwgfHwgdmFsdWUudmFsdWVPZigpIDwgbWluLnZhbHVlT2YoKSA/IHZhbHVlIDogbWluO1xuICAgICAgICBtYXggPSBtYXggPT09IG51bGwgfHwgdmFsdWUudmFsdWVPZigpID4gbWF4LnZhbHVlT2YoKSA/IHZhbHVlIDogbWF4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge21pbjogbWluLCBtYXg6IG1heH07XG4gIH07XG4gIFxuICB0aGlzLmdldENvbHVtbkF2ZXJhZ2UgPSBmdW5jdGlvbihjb2x1bW5JbmRleCwgcm93SW5kZXhTdGFydCwgcm93SW5kZXhFbmQpIHtcbiAgICByb3dJbmRleFN0YXJ0ID0gcm93SW5kZXhTdGFydCA/IHJvd0luZGV4U3RhcnQgOiAwO1xuICAgIHJvd0luZGV4RW5kID0gcm93SW5kZXhFbmQgPyByb3dJbmRleEVuZCA6IHRoaXMuZ2V0TnVtYmVyT2ZSb3dzKCkgLSAxO1xuICAgIHZhciBjb3VudCA9IHJvd0luZGV4RW5kICsgMSAtIHJvd0luZGV4U3RhcnQsIHN1bSA9IDA7XG4gICAgZm9yIChyb3dJbmRleCA9IHJvd0luZGV4U3RhcnQ7IHJvd0luZGV4IDw9IHJvd0luZGV4RW5kOyByb3dJbmRleCsrKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUocm93SW5kZXgsIGNvbHVtbkluZGV4KTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUudmFsdWVPZigpID09PSBcInN0cmluZ1wiICYmICF2YWx1ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHN1bSs9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgdmFyIGF2ZyA9IHN1bSAvIGNvdW50O1xuICAgIGlmICh0aGlzLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnZGF0ZScpIHtcbiAgICAgIGF2ZyA9IG5ldyBEYXRlKGF2Zyk7XG4gICAgfVxuICAgIHJldHVybiBhdmc7XG4gIH07XG4gIFxuICB0aGlzLmdldERpc3RpbmN0VmFsdWVzID0gZnVuY3Rpb24oY29sdW1uSW5kZXgpIHtcbiAgICB2YXJcbiAgICAgIHJvd0luZGV4O1xuICAgICAgdmFsdWVzID0gW107XG4gICAgZm9yIChyb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgdGhpcy5nZXROdW1iZXJPZlJvd3MoKTsgcm93SW5kZXgrKykge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuICBcbiAgdGhpcy5nZXRTb3J0ZWRSb3dzID0gZnVuY3Rpb24oY29sdW1uSW5kZXgsIGRlc2MpIHtcbiAgICB2YXJcbiAgICAgIHJlc3VsdCA9IHJvd3Muc2xpY2UoKTtcbiAgICBpZiAodGhpcy5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlc3VsdCA9IGRlc2MgPyByZXN1bHQucmV2ZXJzZSgpIDogcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHZhciBhdiA9ICh0eXBlb2YgYVtjb2x1bW5JbmRleF0gPT09ICdvYmplY3QnID8gYVtjb2x1bW5JbmRleF0udiA6IGFbY29sdW1uSW5kZXhdKTtcbiAgICAgICAgdmFyIGJ2ID0gKHR5cGVvZiBiW2NvbHVtbkluZGV4XSA9PT0gJ29iamVjdCcgPyBiW2NvbHVtbkluZGV4XS52IDogYltjb2x1bW5JbmRleF0pO1xuICAgICAgICB2YXIgcyA9IGF2IDwgYnYgPyAtMSA6IGF2ID4gYnYgPyAxIDogMDtcbiAgICAgICAgcmV0dXJuIGRlc2MgPyBzICogLTEgOiBzO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIHJvdy5tYXAoZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGNlbGwgPT09ICdvYmplY3QnID8gY2VsbC52IDogY2VsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuICBcbiAgdGhpcy5nZXRWYWx1ZSA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2x1bW5JbmRleCkge1xuICAgIHZhciBjZWxsID0gcm93c1tyb3dJbmRleF0gJiYgcm93c1tyb3dJbmRleF1bY29sdW1uSW5kZXhdO1xuICAgIHJldHVybiB0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcgPyBjZWxsLnYgOiBjZWxsO1xuICB9O1xuICBcbiAgdGhpcy5nZXRGb3JtYXR0ZWRWYWx1ZSA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2x1bW5JbmRleCkge1xuICAgIHZhciBjZWxsID0gcm93c1tyb3dJbmRleF1bY29sdW1uSW5kZXhdO1xuICAgIHJldHVybiB0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcgPyB0eXBlb2YgY2VsbC5mICE9PSAndW5kZWZpbmVkJyA/IGNlbGwuZiA6IGNlbGwudiA6IGNlbGw7XG4gIH07XG4gIFxuICB0aGlzLmdldE51bWJlck9mQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb2xzLmxlbmd0aDtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0TnVtYmVyT2ZSb3dzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoO1xuICB9O1xuICBcbiAgdGhpcy50b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sczogY29scywgXG4gICAgICByb3dzOiByb3dzXG4gICAgfTtcbiAgfTtcbn1cblxuRGF0YVRhYmxlLmZyb21KU09OID0gZnVuY3Rpb24oanNvbikge1xuICAvKlxuICB2YXIgcmVzdWx0ID0gbmV3IERhdGFUYWJsZSgpO1xuICAoZGF0YS5jb2xzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbiwgY29sdW1uSW5kZXgpIHtcbiAgICByZXN1bHQuYWRkQ29sdW1uKGNvbHVtbi50eXBlLCBjb2x1bW4ubGFiZWwsIGNvbHVtbi5wYXR0ZXJuKTtcbiAgICAoZGF0YS5yb3dzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJvdywgcm93SW5kZXgpIHtcbiAgICAgIHZhciBjZWxsID0gcm93W2NvbHVtbkluZGV4XTtcbiAgICAgIHJlc3VsdC5zZXRDZWxsKHJvd0luZGV4LCBjb2x1bW5JbmRleCwgY2VsbC52LCBjZWxsLmYpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDsqL1xuICByZXR1cm4gbmV3IERhdGFUYWJsZShqc29uKTsgXG59O1xuXG5cbmZ1bmN0aW9uIGRldGVjdENvbHVtblR5cGUoc3RyaW5nKSB7XG4gIHZhciBkYXRlVmFsdWUgPSBkZm9ybWF0LnBhcnNlKHN0cmluZyk7XG4gIHZhciBudW1WYWx1ZSA9IG5mb3JtYXQucGFyc2Uoc3RyaW5nKTtcbiAgaWYgKCFpc05hTihuZm9ybWF0LnBhcnNlKHN0cmluZykpKSB7XG4gICAgLy8gTnVtYmVyXG4gICAgcmV0dXJuIFwibnVtYmVyXCI7XG4gIH0gZWxzZSBpZiAoZGZvcm1hdC5wYXJzZShzdHJpbmcpKSB7XG4gICAgcmV0dXJuIFwiZGF0ZVwiO1xuICB9XG4gIHJldHVybiBcInN0cmluZ1wiO1xufVxuXG5EYXRhVGFibGUuZnJvbUFycmF5ID0gZnVuY3Rpb24oZGF0YSwgb3B0aW9ucykge1xuICBcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBEYXRhVGFibGUpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICBcbiAgaWYgKGRhdGEucm93cyB8fCBkYXRhLmNvbHMpIHtcbiAgICByZXR1cm4gbmV3IERhdGFUYWJsZShkYXRhKTtcbiAgfVxuICB2YXIgY29sdW1uRGF0YSA9IFtdO1xuICB2YXIgcm93SW5kZXgsIGNvbHVtbkluZGV4O1xuICB2YXIgZmlyc3RSb3dBc0xhYmVscyA9IGZhbHNlO1xuICBkYXRhID0gZGF0YS5zbGljZSgpO1xuICB2YXIgbGVuID0gTWF0aC5taW4oMiwgZGF0YS5sZW5ndGgpO1xuICBcbiAgXG4gIC8vIFRyaW0gZW1wdHkgcm93c1xuICB2YXIgdHJpbW1lZCA9IFtdO1xuICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgZGF0YS5sZW5ndGg7IHJvd0luZGV4KysgKSB7XG4gICAgdmFyIHJvdyA9IGRhdGFbcm93SW5kZXhdO1xuICAgIHZhciBpc0VtcHR5ID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgcm93Lmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICAgIHZhciBjZWxsID0gZGF0YVtyb3dJbmRleF1bY29sdW1uSW5kZXhdO1xuICAgICAgaWYgKCEodHlwZW9mIGNlbGwgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBjZWxsID09PSBudWxsIHx8IGNlbGwubGVuZ3RoID09PSAwKSkge1xuICAgICAgICBpc0VtcHR5ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNFbXB0eSkge1xuICAgICAgdHJpbW1lZC5wdXNoKHJvdyk7XG4gICAgfVxuICB9XG4gIGRhdGEgPSB0cmltbWVkO1xuICBcbiAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IGxlbjsgcm93SW5kZXgrKyApIHtcbiAgICB2YXIgcm93ID0gZGF0YVtyb3dJbmRleF07XG4gICAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IHJvdy5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgICB2YXIgY29sID0gY29sdW1uRGF0YVtjb2x1bW5JbmRleF0gPSBjb2x1bW5EYXRhW2NvbHVtbkluZGV4XSB8fCB7fTsgXG4gICAgICB2YXIgZm9ybWF0dGVkVmFsdWUgPSByb3dbY29sdW1uSW5kZXhdO1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgdmFyIGNvbHVtblR5cGUgPSBkZXRlY3RDb2x1bW5UeXBlKGZvcm1hdHRlZFZhbHVlKTtcbiAgICAgIGlmIChjb2x1bW5UeXBlID09PSBcInN0cmluZ1wiICYmIHJvd0luZGV4ID09PSAwICYmIGZvcm1hdHRlZFZhbHVlKSB7XG4gICAgICAgIGNvbC5sYWJlbCA9IGZvcm1hdHRlZFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgdmFyIGZpcnN0Um93QXNMYWJlbHMgPSB0cnVlO1xuICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgY29sdW1uRGF0YS5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgdmFyIGNlbGwxID0gZGF0YVswXVtjb2x1bW5JbmRleF07XG4gICAgdmFyIGNlbGwyID0gZGF0YVsxXVtjb2x1bW5JbmRleF07XG4gICAgdmFyIGNvbHVtblR5cGUxID0gZGV0ZWN0Q29sdW1uVHlwZShjZWxsMSk7XG4gICAgdmFyIGNvbHVtblR5cGUyID0gZGV0ZWN0Q29sdW1uVHlwZShjZWxsMik7XG4gICAgaWYgKGNvbHVtblR5cGUxICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICBmaXJzdFJvd0FzTGFiZWxzID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIFxuICBpZiAoZmlyc3RSb3dBc0xhYmVscykge1xuICAgIHZhciBsYWJlbFJvdyA9IGRhdGFbMF07XG4gICAgZGF0YS5zcGxpY2UoMCwgMSk7XG4gICAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGNvbHVtbkRhdGEubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgICAgIGNvbC5sYWJlbCA9IGxhYmVsUm93W2NvbHVtbkluZGV4XTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGNvbHVtbkRhdGEubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgICAgIHZhciBjb2wgPSBjb2x1bW5EYXRhW2NvbHVtbkluZGV4XTtcbiAgICAgICBjb2wubGFiZWwgPSBcIlwiO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gVHJpbSBhcnJheSB0byAxMDAgcm93c1xuICBpZiAoZGF0YS5sZW5ndGggPiAxMDApIHtcbiAgICB2YXIgbSA9IE1hdGgucm91bmQoKGRhdGEubGVuZ3RoIC0gMikgLyAxMDApO1xuICAgIGlmIChtID4gMSkge1xuICAgICAgdmFyIHRyaW1tZWQgPSBbZGF0YVswXV07XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IChkYXRhLmxlbmd0aCAtIDIpOyBpKyspIHtcbiAgICAgICAgaWYgKGkgJSBtID09PSAwKSB7XG4gICAgICAgICAgdHJpbW1lZC5wdXNoKGRhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cmltbWVkLnB1c2goZGF0YVtkYXRhLmxlbmd0aCAtIDFdKTtcbiAgICAgIGRhdGEgPSB0cmltbWVkO1xuICAgIH1cbiAgfVxuICBcbiAgXG4gIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhLmxlbmd0aDsgcm93SW5kZXgrKyApIHtcbiAgICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgY29sdW1uRGF0YS5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgICB2YXIgY2VsbCA9IGRhdGFbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgIHZhciBjb2wgPSBjb2x1bW5EYXRhW2NvbHVtbkluZGV4XTtcbiAgICAgIGNvbC52YWx1ZSA9IGNvbC52YWx1ZSB8fCAwO1xuICAgICAgdmFyIGxlbmd0aCA9IGNlbGwudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICBpZiAoIWNvbC52YWx1ZSB8fCBsZW5ndGggPiBjb2wudmFsdWUudG9TdHJpbmcoKS5sZW5ndGgpIHtcbiAgICAgICAgY29sLnZhbHVlID0gY2VsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIC8vIERldGVjdFxuICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgY29sdW1uRGF0YS5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgdmFyIGNvbCA9IGNvbHVtbkRhdGFbY29sdW1uSW5kZXhdO1xuICAgIHZhciBjb2x1bW5UeXBlID0gZGV0ZWN0Q29sdW1uVHlwZShjb2wudmFsdWUpO1xuICAgIHZhciBmb3JtYXQgPSBudWxsLCB2YWx1ZSA9IG51bGw7XG4gICAgdmFyIHRvb2wgPSBjb2x1bW5UeXBlID09PSBcImRhdGVcIiA/IGRmb3JtYXQgOiBjb2x1bW5UeXBlID09PSBcIm51bWJlclwiID8gbmZvcm1hdCA6IG51bGw7XG4gICAgaWYgKHRvb2wpIHtcbiAgICAgIHZhbHVlID0gdG9vbC5wYXJzZShjb2wudmFsdWUpO1xuICAgICAgZm9ybWF0ID0gdG9vbC5kZXRlY3QodmFsdWUsIGNvbC52YWx1ZSk7XG4gICAgfVxuICAgIGRlbGV0ZSBjb2wudmFsdWU7XG4gICAgY29sLnR5cGUgPSBjb2x1bW5UeXBlO1xuICAgIGNvbC5wYXR0ZXJuID0gZm9ybWF0ICYmIGZvcm1hdC5wYXR0ZXJuIHx8IG51bGw7XG4gICAgY29sLmxvY2FsZSA9IGZvcm1hdCAmJiBmb3JtYXQubG9jYWxlIHx8IG51bGw7XG4gIH1cblxuICAvLyBQYXJzZVxuICB2YXIgcm93cyA9IFtdO1xuICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgZGF0YS5sZW5ndGg7IHJvd0luZGV4KysgKSB7XG4gICAgdmFyIHJvdyA9IFtdO1xuICAgIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBjb2x1bW5EYXRhLmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICAgIHZhciBjb2wgPSBjb2x1bW5EYXRhW2NvbHVtbkluZGV4XTtcbiAgICAgIHZhciBjZWxsID0gZGF0YVtyb3dJbmRleF1bY29sdW1uSW5kZXhdO1xuICAgICAgdmFyIGNvbHVtblR5cGUgPSBjb2wudHlwZTtcbiAgICAgIFxuICAgICAgaWYgKGNvbHVtblR5cGUgPT09ICdudW1iZXInIHx8IGNvbHVtblR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICB2YXIgdG9vbCA9IGNvbHVtblR5cGUgPT09IFwiZGF0ZVwiID8gZGZvcm1hdCA6IGNvbHVtblR5cGUgPT09IFwibnVtYmVyXCIgPyBuZm9ybWF0IDogbnVsbDtcbiAgICAgICAgY2VsbCA9IHtcbiAgICAgICAgICB2OiB0b29sLnBhcnNlKGNlbGwsIGNvbC5wYXR0ZXJuLCBjb2wubG9jYWxlKSxcbiAgICAgICAgICBmOiBjZWxsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbC50eXBlID0gY29sdW1uVHlwZTtcbiAgICAgIHJvd1tjb2x1bW5JbmRleF0gPSBjZWxsO1xuICAgIH1cbiAgICByb3dzLnB1c2gocm93KTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGFUYWJsZSh7Y29sczogY29sdW1uRGF0YSwgcm93czogcm93c30pO1xufTtcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFUYWJsZTsiLCJ2YXIgbnRpY2tzID0gcmVxdWlyZSgnLi9udGlja3MnKTtcblxudmFyXG4gIFxuICBkYXlzSW5Nb250aCA9IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSArIDEsIDApLmdldERhdGUoKTtcbiAgfSwgICAgXG4gIFxuICBkYXRlRGlmZiA9IChmdW5jdGlvbigpIHtcbiAgICBcbiAgICB2YXJcbiAgICAgIG1vbnRoRGlmZiA9IGZ1bmN0aW9uKGQxLCBkMikge1xuICAgICAgICB2YXIgbW9udGhzO1xuICAgICAgICBtb250aHMgPSAoZDIuZ2V0RnVsbFllYXIoKSAtIGQxLmdldEZ1bGxZZWFyKCkpICogMTI7XG4gICAgICAgIG1vbnRocyAtPSBkMS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgbW9udGhzICs9IGQyLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICByZXR1cm4gbW9udGhzIDw9IDAgPyAwIDogbW9udGhzO1xuICAgICAgfTtcbiAgICBcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyLCBmbGFncykge1xuICAgICAgcmVzdWx0ID0ge307XG4gICAgICBcbiAgICAgIGZsYWdzID0gdHlwZW9mIGZsYWdzICE9PSAndW5kZWZpbmVkJyA/IGZsYWdzIDogMSB8IDIgfCA0IHwgOCB8IDE2IHwgMzI7XG4gICAgICBcbiAgICAgIGRhdGUxID0gbmV3IERhdGUoZGF0ZTEpO1xuICAgICAgZGF0ZTIgPSBuZXcgRGF0ZShkYXRlMik7XG4gICAgICBcbiAgICAgIHZhclxuICAgICAgICB0MSA9IGRhdGUxLmdldFRpbWUoKSxcbiAgICAgICAgdDIgPSBkYXRlMi5nZXRUaW1lKCksXG4gICAgICAgIHR6MSA9IGRhdGUyLmdldFRpbWV6b25lT2Zmc2V0KCksXG4gICAgICAgIHR6MiA9IGRhdGUyLmdldFRpbWV6b25lT2Zmc2V0KCksXG4gICAgICAgIHllYXJzLFxuICAgICAgICBtb250aHMsXG4gICAgICAgIGRheXMsXG4gICAgICAgIGhvdXJzLFxuICAgICAgICBtaW51dGVzO1xuXG4gICAgICBpZiAoZmxhZ3MgJiAxIHx8IGZsYWdzICYgMiB8fCBmbGFncyAmIDQpIHtcbiAgICAgICAgbW9udGhzID0gbW9udGhEaWZmKGRhdGUxLCBkYXRlMik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDEpIHtcbiAgICAgICAgeWVhcnMgPSBNYXRoLmZsb29yKG1vbnRocyAvIDEyKTtcbiAgICAgICAgbW9udGhzID0gbW9udGhzIC0geWVhcnMgKiAxMjtcbiAgICAgICAgcmVzdWx0LnllYXJzID0geWVhcnM7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDQpIHtcbiAgICAgICAgaWYgKGZsYWdzICYgMikge1xuICAgICAgICAgIGlmIChkYXRlMi5nZXRVVENEYXRlKCkgPj0gZGF0ZTEuZ2V0VVRDRGF0ZSgpKSB7XG4gICAgICAgICAgICBkYXlzID0gZGF0ZTIuZ2V0VVRDRGF0ZSgpIC0gZGF0ZTEuZ2V0VVRDRGF0ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb250aHMtLTtcbiAgICAgICAgICAgIGRheXMgPSBkYXRlMS5nZXRVVENEYXRlKCkgLSBkYXRlMi5nZXRVVENEYXRlKCkgKyBkYXlzSW5Nb250aChkYXRlMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRheXMgPSAodDIgLSB0MSkgLyAxMDAwIC8gNjAgLyA2MCAvIDI0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDIpIHtcbiAgICAgICAgcmVzdWx0Lm1vbnRocyA9IG1vbnRocztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgNCkge1xuICAgICAgICByZXN1bHQuZGF5cyA9IE1hdGguYWJzKE1hdGgucm91bmQoZGF5cykpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiA4KSB7XG4gICAgICAgIC8vIEhvdXJzXG4gICAgICAgIGhvdXJzID0gKHQyIC0gdDEpIC8gMTAwMCAvIDYwIC8gNjA7XG4gICAgICAgIGlmIChmbGFncyAmIDQpIHtcbiAgICAgICAgICBob3VycyA9IE1hdGgucm91bmQoKHQyIC0gdDEpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNCkgKiAyNCAtIGhvdXJzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5ob3VycyA9IE1hdGgucm91bmQoaG91cnMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiAxNikge1xuICAgICAgICAvLyBNaW51dGVzXG4gICAgICAgIG1pbnV0ZXMgPSAodDIgLSB0MSkgLyAxMDAwIC8gNjA7XG4gICAgICAgIGlmIChmbGFncyAmIDgpIHtcbiAgICAgICAgICBtaW51dGVzID0gTWF0aC5yb3VuZCgodDIgLSB0MSkgLyAxMDAwIC8gNjAgLyA2MCkgKiA2MCAtIG1pbnV0ZXM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0Lm1pbnV0ZXMgPSBNYXRoLnJvdW5kKG1pbnV0ZXMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiAzMikge1xuICAgICAgICAvLyBNaW51dGVzXG4gICAgICAgIHNlY29uZHMgPSAodDIgLSB0MSkgLyAxMDAwO1xuICAgICAgICBpZiAoZmxhZ3MgJiAxNikge1xuICAgICAgICAgIHNlY29uZHMgPSBNYXRoLnJvdW5kKCh0MiAtIHQxKSAvIDEwMDAgLyA2MCkgKiA2MCAtIHNlY29uZHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnNlY29uZHMgPSBNYXRoLnJvdW5kKHNlY29uZHMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0pKCksXG4gIFxuICBkYXRlVGlja3MgPSBmdW5jdGlvbihtaW4sIG1heCwgY291bnQsIG91dGVyKSB7XG5cbiAgICAvLyBEZWZhdWx0c1xuICAgIG1pbiA9IHR5cGVvZiBtaW4gPT09IFwidW5kZWZpbmVkXCIgfHwgaXNOYU4obWluKSA/IDAgOiBtaW47XG4gICAgbWF4ID0gdHlwZW9mIG1heCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBpc05hTihtYXgpPyAxIDogbWF4O1xuICAgIGNvdW50ID0gdHlwZW9mIGNvdW50ICE9PSBcIm51bWJlclwiID8gMTAgOiBjb3VudDtcbiAgICBvdXRlciA9IHR5cGVvZiBvdXRlciA9PT0gXCJ1bmRlZmluZWRcIiA/IGZhbHNlIDogb3V0ZXIsXG4gICAgdGlja3MgPSBbXTtcbiAgICBcbiAgICBtaW4gPSBuZXcgRGF0ZShtaW4pO1xuICAgIG1heCA9IG5ldyBEYXRlKG1heCk7XG4gICAgXG4gICAgaWYgKG1pbi5nZXRUaW1lKCkgPT09IG1heC5nZXRUaW1lKCkpIHtcbiAgICAgIHJldHVybiBbbWluLCBtYXhdO1xuICAgIH1cbiAgICBcbiAgICB2YXIgdGlja1VuaXQgPSBudWxsO1xuICAgIHZhciBvLCB2LCBmID0gMSwgc2YsIHN2O1xuICAgIHdoaWxlKGYgPD0gMzIgJiYgKG8gPSBkYXRlRGlmZihtaW4sIG1heCwgZikpKSB7XG4gICAgICB2ID0gb1tPYmplY3Qua2V5cyhvKVswXV07XG4gICAgICBpZiAodiA8IGNvdW50IHx8IGYgPT09IDEpIHtcbiAgICAgICAgc2YgPSBmO1xuICAgICAgICBzdiA9IHY7XG4gICAgICAgIGYqPTI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgdmFyIGRpZmYgPSBkYXRlRGlmZihtaW4sIG1heCk7XG4gICAgXG4gICAgaWYgKHNmID09PSAxKSB7XG4gICAgICAvLyBZZWFyIHNjYWxlXG4gICAgICBcbiAgICAgIHZhciB5ZWFyTWluRGF0ZSA9IG5ldyBEYXRlKFwiMS8xL1wiICsgbWluLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgdmFyIHllYXJNYXhEYXRlID0gbmV3IERhdGUoXCIxLzEvXCIgKyBtYXguZ2V0RnVsbFllYXIoKSk7XG4gICAgICBcbiAgICAgIHZhciB5ZWFyTWluRGlmZiA9IGRhdGVEaWZmKHllYXJNaW5EYXRlLCBtaW4sIDAgfCAyKS5tb250aHMgLyAxMjtcbiAgICAgIHZhciB5ZWFyTWF4RGlmZiA9IGRhdGVEaWZmKHllYXJNYXhEYXRlLCBtYXgsIDAgfCAyKS5tb250aHMgLyAxMjtcbiAgICAgIFxuICAgICAgdmFyIHllYXJUaWNrcyA9IG50aWNrcyhtaW4uZ2V0RnVsbFllYXIoKSArIHllYXJNaW5EaWZmLCBtYXguZ2V0RnVsbFllYXIoKSArIHllYXJNYXhEaWZmLCBjb3VudCwgb3V0ZXIpO1xuICAgICAgXG4gICAgICBmb3IgKHZhciBpID0gMDsgdGljayA9IHllYXJUaWNrc1tpXTsgaSsrKSB7XG4gICAgICAgIHZhciBkZWNZZWFyID0gdGljaztcbiAgICAgICAgdmFyIGludFllYXIgPSBNYXRoLmZsb29yKGRlY1llYXIpO1xuICAgICAgICB2YXIgZGVjTW9udGggPSAoZGVjWWVhciAtIGludFllYXIpICogMTI7XG4gICAgICAgIHZhciBpbnRNb250aCA9IE1hdGguZmxvb3IoZGVjTW9udGgpO1xuICAgICAgICB2YXIgaW50RGF0ZSA9IG5ldyBEYXRlKGludFllYXIsIGludE1vbnRoLCAwKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkZWNEYXkgPSAoZGVjTW9udGggLSBpbnRNb250aCkgKiBkYXlzSW5Nb250aChpbnREYXRlKTtcbiAgICAgICAgdmFyIGludERheSA9IE1hdGguZmxvb3IoZGVjRGF5KTtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShcIjEvMS8xOTcwXCIpO1xuICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKGludFllYXIpO1xuICAgICAgICBkYXRlLnNldE1vbnRoKGludE1vbnRoKTtcbiAgICAgICAgZGF0ZS5zZXREYXRlKGludERheSArIDEpO1xuICAgICAgICBcbiAgICAgICAgdGlja3NbaV0gPSBkYXRlO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gdGlja3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNjYWxlIG5vdCBzdXBwb3J0ZWQgY3VycmVudGx5XG4gICAgICBjb25zb2xlLndhcm4oXCJTQ0FMRSBOT1QgU1VQUE9SVEVEXCIpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfTtcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IGRhdGVUaWNrczsiLCJ2YXIgbG4xMCA9IE1hdGgubG9nKDEwKTtcbnZhciBjYWxjU3RlcFNpemUgPSBmdW5jdGlvbihyYW5nZSwgdGFyZ2V0U3RlcHMpXG57XG4gIFxuICAvLyBjYWxjdWxhdGUgYW4gaW5pdGlhbCBndWVzcyBhdCBzdGVwIHNpemVcbiAgdmFyIHRlbXBTdGVwID0gcmFuZ2UgLyB0YXJnZXRTdGVwcztcblxuICAvLyBnZXQgdGhlIG1hZ25pdHVkZSBvZiB0aGUgc3RlcCBzaXplXG4gIHZhciBtYWcgPSBNYXRoLmZsb29yKE1hdGgubG9nKHRlbXBTdGVwKSAvIGxuMTApO1xuICB2YXIgbWFnUG93ID0gTWF0aC5wb3coMTAsIG1hZyk7XG5cbiAgLy8gY2FsY3VsYXRlIG1vc3Qgc2lnbmlmaWNhbnQgZGlnaXQgb2YgdGhlIG5ldyBzdGVwIHNpemVcbiAgdmFyIG1hZ01zZCA9IE1hdGgucm91bmQodGVtcFN0ZXAgLyBtYWdQb3cgKyAwLjUpO1xuXG4gIC8vIHByb21vdGUgdGhlIE1TRCB0byBlaXRoZXIgMSwgMiwgb3IgNVxuICBpZiAobWFnTXNkID4gNS4wKVxuICAgIG1hZ01zZCA9IDEwLjA7XG4gIGVsc2UgaWYgKG1hZ01zZCA+IDIuMClcbiAgICBtYWdNc2QgPSA1LjA7XG4gIGVsc2UgaWYgKG1hZ01zZCA+IDEuMClcbiAgICBtYWdNc2QgPSAyLjA7XG5cbiAgcmV0dXJuIG1hZ01zZCAqIG1hZ1Bvdztcbn07XG5cblxudmFyIFxuICBuaWNlRnJhY3Rpb24gPSBmdW5jdGlvbihudW1iZXIsIHJvdW5kKSB7XG4gICAgXG4gICAgdmFyXG4gICAgICBsb2cxMCA9IE1hdGgubG9nKG51bWJlcikgLyBNYXRoLmxvZygxMCksXG4gICAgICBleHBvbmVudCA9IE1hdGguZmxvb3IobG9nMTApLFxuICAgICAgZnJhY3Rpb24gPSBudW1iZXIgLyBNYXRoLnBvdygxMCwgZXhwb25lbnQpLFxuICAgICAgcmVzdWx0O1xuXG4gICAgaWYgKHJvdW5kKSB7XG4gICAgICBpZiAoZnJhY3Rpb24gPCAxLjUpIHtcbiAgICAgICAgcmVzdWx0ID0gMTtcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPCAzKSB7XG4gICAgICAgIHJlc3VsdCA9IDI7XG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgNykge1xuICAgICAgICByZXN1bHQgPSA1O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gMTA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmcmFjdGlvbiA8PSAxKSB7XG4gICAgICAgIHJlc3VsdCA9IDE7XG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDIpIHtcbiAgICAgICAgcmVzdWx0ID0gMjtcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gNSkge1xuICAgICAgICByZXN1bHQgPSA1O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gMTA7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiByZXN1bHQgKiBNYXRoLnBvdygxMCwgZXhwb25lbnQpO1xuICB9LFxuICBcbiAgbnVtVGlja3MgPSBmdW5jdGlvbihtaW4sIG1heCwgY291bnQsIG91dGVyKSB7XG5cbiAgICBpZiAobWluID09PSBtYXgpIHtcbiAgICAgIHJldHVybiBbbWF4XTtcbiAgICB9XG4gICAgICAgICAgXG4gICAgLy8gRGVmYXVsdHNcbiAgICBtaW4gPSB0eXBlb2YgbWluID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTmFOKG1pbikgPyAwIDogbWluO1xuICAgIG1heCA9IHR5cGVvZiBtYXggPT09IFwidW5kZWZpbmVkXCIgfHwgaXNOYU4obWF4KSA/IDEgOiBtYXg7XG4gICAgY291bnQgPSB0eXBlb2YgY291bnQgIT09IFwibnVtYmVyXCIgPyAxMCA6IGNvdW50O1xuICAgIG91dGVyID0gdHlwZW9mIG91dGVyID09PSBcInVuZGVmaW5lZFwiID8gZmFsc2UgOiBvdXRlcjtcbiAgICBcbiAgICB2YXJcbiAgICAgIGRpZmYgPSBtYXggLSBtaW4sXG4gICAgICAvL3JhbmdlID0gbmljZUZyYWN0aW9uKGRpZmYpLFxuICAgICAgLy9pbnRlcnZhbCA9IG5pY2VGcmFjdGlvbihyYW5nZSAvIGNvdW50KSxcbiAgICAgIGludGVydmFsID0gY2FsY1N0ZXBTaXplKGRpZmYsIGNvdW50KSxcbiAgICAgIG5taW4gPSBtaW4gLSBtaW4gJSBpbnRlcnZhbCxcbiAgICAgIG5tYXggPSBtYXggLSBtYXggJSBpbnRlcnZhbCxcbiAgICAgIHNpemUsXG4gICAgICB0aWNrSXRlbXMgPSBbXSxcbiAgICAgIHRpY2tWYWx1ZSxcbiAgICAgIGk7XG4gIFxuICAgaWYgKG91dGVyKSB7XG4gICAgICAgIFxuICAgICAgaWYgKG5taW4gPiBtaW4pIHtcbiAgICAgICAgbm1pbi09IGludGVydmFsO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAobm1heCA8IG1heCkge1xuICAgICAgICBubWF4Kz0gaW50ZXJ2YWw7XG4gICAgICB9XG4gICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICBcbiAgICAgIGlmIChubWluIDwgbWluKSB7XG4gICAgICAgIG5taW4rPSBpbnRlcnZhbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKG5tYXggPiBtYXgpIHtcbiAgICAgICAgbm1heC09IGludGVydmFsO1xuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIFxuICAgIGZvciAoaSA9IG5taW47IGkgPD0gbm1heDsgaSs9aW50ZXJ2YWwpIHtcbiAgICAgIHRpY2tJdGVtcy5wdXNoKGkpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGlja0l0ZW1zO1xuICB9O1xuICBcbm1vZHVsZS5leHBvcnRzID0gbnVtVGlja3M7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByb3VuZChudW0sIGRpZ2l0cykge1xuICBkaWdpdHMgPSB0eXBlb2YgZGlnaXRzID09PSAnbnVtYmVyJyA/IGRpZ2l0cyA6IDE7XG4gIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQobnVtKTtcbiAgaWYgKCFpc05hTih2YWx1ZSkgJiYgbmV3IFN0cmluZyh2YWx1ZSkubGVuZ3RoID09PSBuZXcgU3RyaW5nKG51bSkubGVuZ3RoKSB7XG4gICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlLnRvRml4ZWQoZGlnaXRzKSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBudW07XG59OyIsInZhciBpMThuID0gcmVxdWlyZShcIi4vbG9jYWxlcy9hbGxcIik7XG5cbmZ1bmN0aW9uIGNhcnRlc2lhblByb2R1Y3RPZihhcnJheSwgdW5pcXVlKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoYXJyYXksIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgcmV0ID0gW107XG4gICAgYS5mb3JFYWNoKGZ1bmN0aW9uKGEpIHtcbiAgICAgIGIuZm9yRWFjaChmdW5jdGlvbihiKSB7XG4gICAgICAgIGlmICghdW5pcXVlIHx8IGEuaW5kZXhPZihiKSA8IDApIHtcbiAgICAgICAgICByZXQucHVzaChhLmNvbmNhdChbYl0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfSwgW1tdXSk7XG59XG5cbmZ1bmN0aW9uIHNvcnRCeVJlbGV2YW5jZShhLCBiKSB7XG4gIHJldHVybiBhLnJlbGV2YW5jZSA+IGIucmVsZXZhbmNlID8gLTEgOiBhLnJlbGV2YW5jZSA8IGIucmVsZXZhbmNlID8gMSA6IDA7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHIpIHtcbiAgc3RyID0gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgc3RyID0gc3RyLnJlcGxhY2UoL1xccy9nLCBcIlxcXFxzXCIpO1xuICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBwYWQoIGEsIGIgKSB7XG4gIHJldHVybiAoMWUxNSArIGEgKyBcIlwiKS5zbGljZSgtYik7XG59XG5cbmZ1bmN0aW9uIGdldExvY2FsZURhdGEobG9jYWxlKSB7XG4gIGlmIChpMThuW2xvY2FsZV0pIHtcbiAgICByZXR1cm4gaTE4bltsb2NhbGVdO1xuICB9XG4gIGZvciAodmFyIGtleSBpbiBpMThuKSB7XG4gICAgaWYgKGkxOG5ba2V5XS5lcXVhbHMgJiYgaTE4bltrZXldLmVxdWFscy5zcGxpdChcIixcIikuaW5kZXhPZihsb2NhbGUpID49IDApIHtcbiAgICAgIHJldHVybiBpMThuW2tleV07XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRMb2NhbGVzKGxvY2FsZSkge1xuICB2YXIgbG9jYWxlcyA9IFtdO1xuICBPYmplY3Qua2V5cyhpMThuKS5mb3JFYWNoKGZ1bmN0aW9uKGxvY2FsZSkge1xuICAgIGxvY2FsZXMucHVzaChsb2NhbGUpO1xuICAgIGxvY2FsZXMgPSBsb2NhbGVzLmNvbmNhdChpMThuW2xvY2FsZV0uZXF1YWxzICYmIGkxOG5bbG9jYWxlXS5lcXVhbHMuc3BsaXQoL1xccyosXFxzKi8pIHx8IFtdKTtcbiAgfSk7XG4gIHJldHVybiBsb2NhbGVzO1xufVxuXG5mdW5jdGlvbiBnZXRSZXBsYWNlbWVudHMobG9jYWxlRGF0YSwgZGF0ZSkge1xuICB2YXJcbiAgICByZXN1bHQgPSB7fSxcbiAgICBkMiA9IFwiXFxcXGR7Mn1cIixcbiAgICBkNCA9IFwiXFxcXGR7NH1cIixcbiAgICB3ZWVrZGF5TmFtZXMgPSBsb2NhbGVEYXRhLndlZWtkYXksXG4gICAgbW9udGhOYW1lcyA9IGxvY2FsZURhdGEubW9udGgsXG4gICAgZGF5ID0gZGF0ZSA/IChkYXRlLmdldERheSgpIC0gMSArIDcpICUgNyA6IC0xO1xuICAgIGtleXMgPSBbXCJ5eXl5XCIsIFwieXlcIiwgXCJ5XCIsIFwiTU1NTVwiLCBcIk1NTVwiLCBcIk1NXCIsIFwiTVwiLCBcImRkZGRcIiwgXCJkZGRcIiwgXCJkZFwiLCBcImRcIiwgXCJISFwiLCBcIkhcIiwgXCJoaFwiLCBcImhcIiwgXCJtbVwiLCBcIm1cIiwgXCJzc1wiLCBcInNcIiwgXCJ0dFwiLCBcInRcIl0sXG4gICAgdmFsdWVzID0gZGF0ZSA/IFxuICAgICAgW1xuICAgICAgICAvLyBZZWFyXG4gICAgICAgIGRhdGUuZ2V0RnVsbFllYXIoKSwgXG4gICAgICAgIHBhZChkYXRlLmdldFllYXIoKSwgMiksIFxuICAgICAgICBkYXRlLmdldFllYXIoKSxcbiAgICAgICAgXG4gICAgICAgIC8vIE1vbnRoXG4gICAgICAgIG1vbnRoTmFtZXMubG9uZ1tkYXRlLmdldE1vbnRoKCldLCBcbiAgICAgICAgbW9udGhOYW1lcy5zaG9ydFtkYXRlLmdldE1vbnRoKCldLCBcbiAgICAgICAgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEsIDIpLFxuICAgICAgICBkYXRlLmdldE1vbnRoKCkgKyAxLFxuICAgICAgICBcbiAgICAgICAgLy8gRGF5XG4gICAgICAgIHdlZWtkYXlOYW1lcy5sb25nW2RheV0sXG4gICAgICAgIHdlZWtkYXlOYW1lcy5zaG9ydFtkYXldLFxuICAgICAgICBwYWQoZGF0ZS5nZXREYXRlKCksIDIpLFxuICAgICAgICBkYXRlLmdldERhdGUoKSxcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdXJcbiAgICAgICAgZGF0ZS5nZXRIb3VycygpLFxuICAgICAgICBwYWQoZGF0ZS5nZXRIb3VycygpLCAyKSxcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdXIxMlxuICAgICAgICBwYWQoZGF0ZS5nZXRIb3VycygpICUgMTIsIDIpLFxuICAgICAgICBkYXRlLmdldEhvdXJzKCkgJSAxMixcbiAgICAgICAgXG4gICAgICAgIC8vIE1pbnV0ZVxuICAgICAgICBwYWQoZGF0ZS5nZXRNaW51dGVzKCksIDIpLFxuICAgICAgICBkYXRlLmdldE1pbnV0ZXMoKSxcbiAgICAgICAgXG4gICAgICAgIC8vIFNlY29uZFxuICAgICAgICBwYWQoZGF0ZS5nZXRTZWNvbmRzKCksIDIpLFxuICAgICAgICBkYXRlLmdldFNlY29uZHMoKSxcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdXIxMiBEZXNpZ25hdG9yXG4gICAgICAgIGRhdGUuZ2V0SG91cnMoKSA+PSAxMiA/IFwiUE1cIiA6IFwiQU1cIixcbiAgICAgICAgKGRhdGUuZ2V0SG91cnMoKSA+PSAxMiA/IFwiUE1cIiA6IFwiQU1cIikuc3Vic3RyaW5nKDAsIDEpXG4gICAgICBdIDogXG4gICAgICBbXG4gICAgICAgIC8vIFllYXJcbiAgICAgICAgZDQsXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIE1vbnRoXG4gICAgICAgIG1vbnRoTmFtZXMubG9uZy5tYXAoZXNjYXBlUmVnRXhwKS5qb2luKFwifFwiKSxcbiAgICAgICAgbW9udGhOYW1lcy5zaG9ydC5tYXAoZXNjYXBlUmVnRXhwKS5qb2luKFwifFwiKSxcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gRGF5XG4gICAgICAgIHdlZWtkYXlOYW1lcy5sb25nLm1hcChlc2NhcGVSZWdFeHApLmpvaW4oXCJ8XCIpLFxuICAgICAgICB3ZWVrZGF5TmFtZXMuc2hvcnQubWFwKGVzY2FwZVJlZ0V4cCkuam9pbihcInxcIiksXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdXJcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91cjEyXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIE1pbnV0ZVxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBTZWNvbmRcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91cjEyIERlc2lnbmF0b3JcbiAgICAgICAgXCJBTXxQTVwiLFxuICAgICAgICBcIkF8UFwiXG4gICAgICAgIFxuICAgICAgXTtcbiAgICBcbiAgICBcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5LCBpbmRleCkge1xuICAgICAgdmFyIHZhbHVlID0gdmFsdWVzW2luZGV4XTtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0KGRhdGUsIHBhdHRlcm4sIGxvY2FsZSkge1xuICAgXG4gIHZhclxuICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGxvY2FsZSB8fCAnZW4nKSxcbiAgICBwYXR0ZXJuID0gcGF0dGVybiB8fCBsb2NhbGVEYXRhLnBhdHRlcm5zWzBdIHx8IFwieXl5eS9NTS9kZCBoaDpzcyB0dFwiLFxuICAgIHJlcGxhY2VtZW50cyA9IGdldFJlcGxhY2VtZW50cyhsb2NhbGVEYXRhLCBkYXRlKSxcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoXCJcXFxcYig/OlwiICsgT2JqZWN0LmtleXMocmVwbGFjZW1lbnRzKS5qb2luKFwifFwiKSArIFwiKVxcXFxiXCIsIFwiZ1wiKSxcbiAgICBtYXRjaCwgXG4gICAgaW5kZXggPSAwLFxuICAgIHJlc3VsdCA9IFwiXCI7XG4gIFxuICB3aGlsZSAobWF0Y2ggPSByZWdleC5leGVjKHBhdHRlcm4pKSB7XG4gICAgcmVzdWx0Kz0gcGF0dGVybi5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4KTtcbiAgICByZXN1bHQrPSByZXBsYWNlbWVudHNbbWF0Y2hdO1xuICAgIGluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gIH1cbiAgcmVzdWx0Kz0gcGF0dGVybi5zdWJzdHJpbmcoaW5kZXgpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZShzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuICB2YXIgbG9jYWxlcyA9IGxvY2FsZSBpbnN0YW5jZW9mIEFycmF5ID8gbG9jYWxlIDogbG9jYWxlID8gW2xvY2FsZV0gOiBPYmplY3Qua2V5cyhpMThuKTtcbiAgdmFyIGRhdGUgPSBudWxsO1xuICBcbiAgbG9jYWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGxvY2FsZSkge1xuICAgIFxuICAgIGlmIChkYXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHZhclxuICAgICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEobG9jYWxlKSxcbiAgICAgIHBhcnRzID0gZ2V0UmVwbGFjZW1lbnRzKGxvY2FsZURhdGEpLFxuICAgICAgcGF0dGVyblJlZ2V4ID0gbmV3IFJlZ0V4cChcIlxcXFxiKFwiICsgT2JqZWN0LmtleXMocGFydHMpLmpvaW4oXCJ8XCIpICsgXCIpXCIgKyBcIlxcXFxiXCIsIFwiZ1wiKSxcbiAgICAgIHBhdHRlcm5zID0gcGF0dGVybiBpbnN0YW5jZW9mIEFycmF5ID8gcGF0dGVybiA6IHBhdHRlcm4gPyBbcGF0dGVybl0gOiBsb2NhbGVEYXRhLnBhdHRlcm5zO1xuICAgICAgXG4gICAgcGF0dGVybnMuZm9yRWFjaChmdW5jdGlvbihwYXR0ZXJuKSB7XG4gICAgICBcbiAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICBcbiAgICAgIHZhclxuICAgICAgICBjYXB0dXJlcyA9IFtdLFxuICAgICAgICBtYXRjaCxcbiAgICAgICAgbWF0Y2hlcyxcbiAgICAgICAgaG91cjEycG0sXG4gICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgZGF0ZVJlZ2V4ID0gXCJcIjtcbiAgICAgIFxuICAgICAgd2hpbGUoIG1hdGNoID0gcGF0dGVyblJlZ2V4LmV4ZWMocGF0dGVybikgKSB7XG4gICAgICAgIGNhcHR1cmVzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgICBkYXRlUmVnZXgrPSBlc2NhcGVSZWdFeHAocGF0dGVybi5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4KSk7XG4gICAgICAgIGRhdGVSZWdleCs9IFwiKFwiICsgcGFydHNbT2JqZWN0LmtleXMocGFydHMpLmZpbHRlcihmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoWzBdID09PSBwYXJ0O1xuICAgICAgICB9KVswXV0gKyBcIilcIjtcbiAgICAgICAgaW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGRhdGVSZWdleCs9IGVzY2FwZVJlZ0V4cChwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCkpO1xuICAgICAgXG4gICAgICBtYXRjaCA9IChuZXcgUmVnRXhwKGRhdGVSZWdleCkpLmV4ZWMoc3RyaW5nKTtcbiAgICAgIFxuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShcIjBcIik7XG4gICAgICAgIG1hdGNoZXMgPSBtYXRjaC5zbGljZSgxKTtcbiAgICAgICAgXG4gICAgICAgIGhvdXIxMnBtID0gKG1hdGNoZXMuZmlsdGVyKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgIHJldHVybiAoY2FwdHVyZXNbaW5kZXhdID09PSBcInR0XCIgfHwgY2FwdHVyZXNbaW5kZXhdID09PSBcInRcIikgJiYgdmFsdWUuc3Vic3RyaW5nKDAsIDEpLnRvVXBwZXJDYXNlKCkgPT09IFwiUFwiO1xuICAgICAgICB9KS5sZW5ndGggPiAwKTtcbiAgICAgICAgXG4gICAgICAgIHZhciB5ZWFyLCBtb250aCwgbW9udGhEYXksIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzO1xuICAgICAgICBcbiAgICAgICAgbWF0Y2hlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgIHZhciBudW1lcmljVmFsdWUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgc3dpdGNoIChjYXB0dXJlc1tpbmRleF0pIHtcbiAgICAgICAgICAgIGNhc2UgJ3l5eXknOiBcbiAgICAgICAgICAgICAgeWVhciA9IG51bWVyaWNWYWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdNTU1NJzpcbiAgICAgICAgICAgICAgbW9udGggPSBsb2NhbGVEYXRhLm1vbnRoLmxvbmcuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgICAgICAgbW9udGggPSBsb2NhbGVEYXRhLm1vbnRoLnNob3J0LmluZGV4T2YodmFsdWUpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ01NJzpcbiAgICAgICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgICAgICBtb250aCA9IG51bWVyaWNWYWx1ZSAtIDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGRkZCc6XG4gICAgICAgICAgICBjYXNlICdkZGQnOlxuICAgICAgICAgICAgICAvLyBDYW5ub3QgZGV0ZXJtaW5lIGRhdGUgZnJvbSB3ZWVrZGF5XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGQnOlxuICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgIG1vbnRoRGF5ID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0hIJzpcbiAgICAgICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICAgICAgICBob3VycyA9IG51bWVyaWNWYWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdoaCc6XG4gICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgaG91cnMgPSBob3VyMTJwbSA/IG51bWVyaWNWYWx1ZSArIDEyIDogbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21tJzpcbiAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICBtaW51dGVzID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NzJzpcbiAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICBzZWNvbmRzID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKHllYXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeWVhcik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChtb250aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRNb250aChtb250aCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChtb250aERheSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXREYXRlKG1vbnRoRGF5KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGhvdXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldEhvdXJzKGhvdXJzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1pbnV0ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0TWludXRlcyhtaW51dGVzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHNlY29uZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0U2Vjb25kcyhzZWNvbmRzKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCBpc05hTiggZGF0ZS5nZXRUaW1lKCkgKSApIHtcbiAgICAgICAgICBkYXRlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBWYWxpZFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgfVxuICAgICAgXG4gICAgfSk7XG4gIH0pO1xuICBcbiAgaWYgKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICBcbiAgcmV0dXJuIGRhdGU7XG59XG5cbmZ1bmN0aW9uIGRldGVjdChkYXRlLCBzdHJpbmcpIHtcbiAgdmFyXG4gICAgbG9jYWxlcyA9IE9iamVjdC5rZXlzKGkxOG4pLFxuICAgIHJlc3VsdExvY2FsZVBhdHRlcm5zID0gW107XG5cbiAgbG9jYWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGxvY2FsZSkge1xuICAgIFxuICAgIHZhciBcbiAgICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGxvY2FsZSksXG4gICAgICByZXBsYWNlbWVudHMgPSBnZXRSZXBsYWNlbWVudHMobG9jYWxlRGF0YSwgZGF0ZSksXG4gICAgICB2YWx1ZXMgPSBPYmplY3Qua2V5cyhyZXBsYWNlbWVudHMpLm1hcChmdW5jdGlvbihwYXJ0KXtcbiAgICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnRzW3BhcnRdLnRvU3RyaW5nKCk7XG4gICAgICAgIH0pLmZpbHRlcihmdW5jdGlvbihwYXJ0LCBpbmRleCwgc2VsZikge1xuICAgICAgICAgIHJldHVybiBzZWxmLmluZGV4T2YocGFydCkgPT09IGluZGV4O1xuICAgICAgICB9KS5tYXAoZXNjYXBlUmVnRXhwKS5tYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQodmFsdWUpKSA/IFwiXFxcXGJcIiArIHZhbHVlICsgXCJcXFxcYlwiIDogdmFsdWU7XG4gICAgICAgIH0pLFxuICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKHZhbHVlcy5qb2luKFwifFwiKSwgXCJnXCIpLFxuICAgICAgbWF0Y2gsIHN1YnN0cmluZywgaW5kZXggPSAwLFxuICAgICAgcGF0dGVyblBhcnRzID0gW10sXG4gICAgICBwYXR0ZXJuUGFydHNJbmRleCA9IFtdLFxuICAgICAgbWF0Y2hSYW5rID0gMCxcbiAgICAgIG1hdGNoZXMgPSBbXSxcbiAgICAgIGhvdXIxMiA9IGZhbHNlLFxuICAgICAgcmVzdCA9IFwiXCI7XG4gICAgICBcbiAgICAgIHdoaWxlIChtYXRjaCA9IHJlZ2V4LmV4ZWMoc3RyaW5nKSkge1xuICAgICAgICBpZiAobWF0Y2hbMF0gPT09IHJlcGxhY2VtZW50c1tcInR0XCJdLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICBob3VyMTIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG1hdGNoZXMucHVzaChtYXRjaCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGZvciAodmFyIG0gPSAwOyBtIDwgbWF0Y2hlcy5sZW5ndGg7IG0rKykge1xuICAgICAgICBtYXRjaCA9IG1hdGNoZXNbbV07XG4gICAgICAgIHN1YnN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgaWYgKHN1YnN0cmluZykge1xuICAgICAgICAgIHJlc3QrPSBzdWJzdHJpbmc7XG4gICAgICAgICAgcGF0dGVyblBhcnRzLnB1c2goW3BhdHRlcm5QYXJ0c0luZGV4Lmxlbmd0aF0pO1xuICAgICAgICAgIHBhdHRlcm5QYXJ0c0luZGV4LnB1c2goc3Vic3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWF0Y2hpbmdQYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwYXJ0IGluIHJlcGxhY2VtZW50cykge1xuICAgICAgICAgIGlmIChtYXRjaFswXSA9PT0gcmVwbGFjZW1lbnRzW3BhcnRdLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgIGlmICgocGFydCA9PT0gXCJISFwiIHx8IHBhcnQgPT09IFwiSFwiKSAmJiBob3VyMTIpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IHBhdHRlcm5QYXJ0c0luZGV4LmluZGV4T2YocGFydCk7XG4gICAgICAgICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgICAgICAgaSA9IHBhdHRlcm5QYXJ0c0luZGV4Lmxlbmd0aDtcbiAgICAgICAgICAgICAgcGF0dGVyblBhcnRzSW5kZXgucHVzaChwYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hdGNoaW5nUGFydHMucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWF0Y2hSYW5rKz0gMSAvIG1hdGNoaW5nUGFydHMubGVuZ3RoO1xuICAgICAgICBwYXR0ZXJuUGFydHMucHVzaChtYXRjaGluZ1BhcnRzKTtcbiAgICAgICAgaW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHN1YnN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoaW5kZXgpO1xuICAgICAgcmVzdCs9IHN1YnN0cmluZztcbiAgICAgIFxuICAgICAgaWYgKHN1YnN0cmluZykge1xuICAgICAgICBwYXR0ZXJuUGFydHMucHVzaChbcGF0dGVyblBhcnRzSW5kZXgubGVuZ3RoXSk7XG4gICAgICAgIHBhdHRlcm5QYXJ0c0luZGV4LnB1c2goc3Vic3RyaW5nKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVzdWx0TG9jYWxlUGF0dGVybnMucHVzaCh7XG4gICAgICAgIGxvY2FsZTogbG9jYWxlLCBcbiAgICAgICAgbG9jYWxlRGF0YTogbG9jYWxlRGF0YSxcbiAgICAgICAgcmVsZXZhbmNlOiBtYXRjaFJhbmsgKyAoMSAtIHJlc3QubGVuZ3RoIC8gc3RyaW5nLmxlbmd0aCksXG4gICAgICAgIHBhdHRlcm46IHtcbiAgICAgICAgICBwYXJ0czogcGF0dGVyblBhcnRzLFxuICAgICAgICAgIGluZGV4OiBwYXR0ZXJuUGFydHNJbmRleFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICBcbiAgfSk7XG4gIFxuICBpZiAoIXJlc3VsdExvY2FsZVBhdHRlcm5zLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIFxuICByZXN1bHRMb2NhbGVQYXR0ZXJucy5zb3J0KHNvcnRCeVJlbGV2YW5jZSk7XG4gIFxuICBpZiAoIXJlc3VsdExvY2FsZVBhdHRlcm5zLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIFxuICB2YXIgcmVsZXZhbmNlID0gcmVzdWx0TG9jYWxlUGF0dGVybnNbMF0ucmVsZXZhbmNlO1xuICBcbiAgdmFyIHJlc3VsdHMgPSByZXN1bHRMb2NhbGVQYXR0ZXJucy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0RGF0YSkge1xuICAgIHJldHVybiByZXN1bHREYXRhLnJlbGV2YW5jZSA9PT0gcmVsZXZhbmNlOyBcbiAgfSkubWFwKGZ1bmN0aW9uKHJlc3VsdERhdGEpIHtcbiAgICBcbiAgICB2YXJcbiAgICAgIHBhdHRlcm5EYXRhID0gcmVzdWx0RGF0YS5wYXR0ZXJuLFxuICAgICAgY29tYmluYXRpb25zID0gY2FydGVzaWFuUHJvZHVjdE9mKHBhdHRlcm5EYXRhLnBhcnRzLCB0cnVlKSxcbiAgICAgIHBhdHRlcm5zID0gY29tYmluYXRpb25zLm1hcChmdW5jdGlvbihjb21iaW5hdGlvbikge1xuICAgICAgICB2YXIgc3RyaW5nID0gY29tYmluYXRpb24ubWFwKGZ1bmN0aW9uKHBhcnRJbmRleCkge1xuICAgICAgICAgIHJldHVybiBwYXR0ZXJuRGF0YS5pbmRleFtwYXJ0SW5kZXhdO1xuICAgICAgICB9KS5qb2luKFwiXCIpO1xuICAgICAgICB2YXIgcmVsZXZhbmNlID0gcmVzdWx0RGF0YS5sb2NhbGVEYXRhLnBhdHRlcm5zLmZpbHRlcihmdW5jdGlvbihsb2NhbGVQYXR0ZXJuKSB7XG4gICAgICAgICAgcmV0dXJuIHN0cmluZy5pbmRleE9mKGxvY2FsZVBhdHRlcm4pID49IDA7XG4gICAgICAgIH0pLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN0OiByZXN1bHREYXRhLnJlc3QsXG4gICAgICAgICAgc3RyaW5nOiBzdHJpbmcsXG4gICAgICAgICAgcmVsZXZhbmNlOiByZWxldmFuY2VcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIFxuICAgIGlmICghcGF0dGVybnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgcGF0dGVybnMuc29ydChzb3J0QnlSZWxldmFuY2UpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICByZXN0OiBwYXR0ZXJuc1swXS5yZXN0LFxuICAgICAgcmVsZXZhbmNlOiBwYXR0ZXJuc1swXS5yZWxldmFuY2UsXG4gICAgICBwYXR0ZXJuOiBwYXR0ZXJuc1swXS5zdHJpbmcsIFxuICAgICAgbG9jYWxlOiByZXN1bHREYXRhLmxvY2FsZVxuICAgIH07XG4gIH0pO1xuICBcbiAgcmVzdWx0cy5zb3J0KHNvcnRCeVJlbGV2YW5jZSk7XG4gIFxuICBpZiAocmVzdWx0c1swXSkge1xuICAgIHJldHVybiB7XG4gICAgICBwYXR0ZXJuOiByZXN1bHRzWzBdLnBhdHRlcm4sXG4gICAgICBsb2NhbGU6IHJlc3VsdHNbMF0ubG9jYWxlXG4gICAgfTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGRmb3JtYXQoZGF0ZSwgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHJldHVybiBmb3JtYXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuZGZvcm1hdC5wYXJzZSA9IGZ1bmN0aW9uKHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHJldHVybiBwYXJzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuZGZvcm1hdC5kZXRlY3QgPSBmdW5jdGlvbihkYXRlLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRldGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGRmb3JtYXQ7IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiZW5cIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJKYW51YXJ5XCIsXG4gICAgICAgIFwiRmVicnVhcnlcIixcbiAgICAgICAgXCJNYXJjaFwiLFxuICAgICAgICBcIkFwcmlsXCIsXG4gICAgICAgIFwiTWF5XCIsXG4gICAgICAgIFwiSnVuZVwiLFxuICAgICAgICBcIkp1bHlcIixcbiAgICAgICAgXCJBdWd1c3RcIixcbiAgICAgICAgXCJTZXB0ZW1iZXJcIixcbiAgICAgICAgXCJPY3RvYmVyXCIsXG4gICAgICAgIFwiTm92ZW1iZXJcIixcbiAgICAgICAgXCJEZWNlbWJlclwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiSmFuXCIsXG4gICAgICAgIFwiRmViXCIsXG4gICAgICAgIFwiTWFyXCIsXG4gICAgICAgIFwiQXByXCIsXG4gICAgICAgIFwiTWF5XCIsXG4gICAgICAgIFwiSnVuXCIsXG4gICAgICAgIFwiSnVsXCIsXG4gICAgICAgIFwiQXVnXCIsXG4gICAgICAgIFwiU2VwXCIsXG4gICAgICAgIFwiT2N0XCIsXG4gICAgICAgIFwiTm92XCIsXG4gICAgICAgIFwiRGVjXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIk1vbmRheVwiLFxuICAgICAgICBcIlR1ZXNkYXlcIixcbiAgICAgICAgXCJXZWRuZXNkYXlcIixcbiAgICAgICAgXCJUaHVyc2RheVwiLFxuICAgICAgICBcIkZyaWRheVwiLFxuICAgICAgICBcIlNhdHVyZGF5XCIsXG4gICAgICAgIFwiU3VuZGF5XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJNb25cIixcbiAgICAgICAgXCJUdWVcIixcbiAgICAgICAgXCJXZWRcIixcbiAgICAgICAgXCJUaHVcIixcbiAgICAgICAgXCJGcmlcIixcbiAgICAgICAgXCJTYXRcIixcbiAgICAgICAgXCJTdW5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIE1NTU0gZGQsIHl5eXksIGhoOm1tOnNzIHR0XCIsXG4gICAgICBcIk1NTU0gZGQsIHl5eXksIGhoOm1tOnNzIHR0XCIsXG4gICAgICBcIk1NTSBkZCwgeXl5eSwgaGg6bW06c3MgdHRcIixcbiAgICAgIFwiTU0vZGQveXl5eSwgaGg6bW0gdHRcIixcbiAgICAgIFwiZGRkZCwgTU1NTSBkZCwgeXl5eVwiLFxuICAgICAgXCJNTU1NIGRkLCB5eXl5XCIsXG4gICAgICBcIk1NTSBkZCwgeXl5eVwiLFxuICAgICAgXCJNTS9kZC95eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJoaDptbTpzcyB0dFwiLFxuICAgICAgXCJoaDptbSB0dFwiXG4gICAgXVxuICB9LFxuICBcImRlXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiSmFudWFyXCIsXG4gICAgICAgIFwiRmVicnVhclwiLFxuICAgICAgICBcIk3DpHJ6XCIsXG4gICAgICAgIFwiQXByaWxcIixcbiAgICAgICAgXCJNYWlcIixcbiAgICAgICAgXCJKdW5pXCIsXG4gICAgICAgIFwiSnVsaVwiLFxuICAgICAgICBcIkF1Z3VzdFwiLFxuICAgICAgICBcIlNlcHRlbWJlclwiLFxuICAgICAgICBcIk9rdG9iZXJcIixcbiAgICAgICAgXCJOb3ZlbWJlclwiLFxuICAgICAgICBcIkRlemVtYmVyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJKYW5cIixcbiAgICAgICAgXCJGZWJcIixcbiAgICAgICAgXCJNw6RyXCIsXG4gICAgICAgIFwiQXByXCIsXG4gICAgICAgIFwiTWFpXCIsXG4gICAgICAgIFwiSnVuXCIsXG4gICAgICAgIFwiSnVsXCIsXG4gICAgICAgIFwiQXVnXCIsXG4gICAgICAgIFwiU2VwXCIsXG4gICAgICAgIFwiT2t0XCIsXG4gICAgICAgIFwiTm92XCIsXG4gICAgICAgIFwiRGV6XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIk1vbnRhZ1wiLFxuICAgICAgICBcIkRpZW5zdGFnXCIsXG4gICAgICAgIFwiTWl0dHdvY2hcIixcbiAgICAgICAgXCJEb25uZXJzdGFnXCIsXG4gICAgICAgIFwiRnJlaXRhZ1wiLFxuICAgICAgICBcIlNhbXN0YWdcIixcbiAgICAgICAgXCJTb25udGFnXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJNby5cIixcbiAgICAgICAgXCJEaS5cIixcbiAgICAgICAgXCJNaS5cIixcbiAgICAgICAgXCJEby5cIixcbiAgICAgICAgXCJGci5cIixcbiAgICAgICAgXCJTYS5cIixcbiAgICAgICAgXCJTby5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkLiBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC4gTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuTU0ueXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZC4gTU1NTSB5eXl5XCIsXG4gICAgICBcImRkLiBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuIE1NTSB5eXl5XCIsXG4gICAgICBcImRkLk1NLnl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiZnJcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJqYW52aWVyXCIsXG4gICAgICAgIFwiZsOpdnJpZXJcIixcbiAgICAgICAgXCJtYXJzXCIsXG4gICAgICAgIFwiYXZyaWxcIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJqdWluXCIsXG4gICAgICAgIFwianVpbGxldFwiLFxuICAgICAgICBcImFvw7t0XCIsXG4gICAgICAgIFwic2VwdGVtYnJlXCIsXG4gICAgICAgIFwib2N0b2JyZVwiLFxuICAgICAgICBcIm5vdmVtYnJlXCIsXG4gICAgICAgIFwiZMOpY2VtYnJlXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJqYW52LlwiLFxuICAgICAgICBcImbDqXZyLlwiLFxuICAgICAgICBcIm1hcnNcIixcbiAgICAgICAgXCJhdnIuXCIsXG4gICAgICAgIFwibWFpXCIsXG4gICAgICAgIFwianVpblwiLFxuICAgICAgICBcImp1aWwuXCIsXG4gICAgICAgIFwiYW/Du3RcIixcbiAgICAgICAgXCJzZXB0LlwiLFxuICAgICAgICBcIm9jdC5cIixcbiAgICAgICAgXCJub3YuXCIsXG4gICAgICAgIFwiZMOpYy5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibHVuZGlcIixcbiAgICAgICAgXCJtYXJkaVwiLFxuICAgICAgICBcIm1lcmNyZWRpXCIsXG4gICAgICAgIFwiamV1ZGlcIixcbiAgICAgICAgXCJ2ZW5kcmVkaVwiLFxuICAgICAgICBcInNhbWVkaVwiLFxuICAgICAgICBcImRpbWFuY2hlXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJsdW4uXCIsXG4gICAgICAgIFwibWFyLlwiLFxuICAgICAgICBcIm1lci5cIixcbiAgICAgICAgXCJqZXUuXCIsXG4gICAgICAgIFwidmVuLlwiLFxuICAgICAgICBcInNhbS5cIixcbiAgICAgICAgXCJkaW0uXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NIHl5eXlcIixcbiAgICAgIFwiZGQvTU0veXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJlc1wiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkVuZXJvXCIsXG4gICAgICAgIFwiRmVicmVyb1wiLFxuICAgICAgICBcIk1hcnpvXCIsXG4gICAgICAgIFwiQWJyaWxcIixcbiAgICAgICAgXCJNYXlvXCIsXG4gICAgICAgIFwiSnVuaW9cIixcbiAgICAgICAgXCJKdWxpb1wiLFxuICAgICAgICBcIkFnb3N0b1wiLFxuICAgICAgICBcIlNlcHRpZW1icmVcIixcbiAgICAgICAgXCJPY3R1YnJlXCIsXG4gICAgICAgIFwiTm92aWVtYnJlXCIsXG4gICAgICAgIFwiRGljaWVtYnJlXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJFbmUuXCIsXG4gICAgICAgIFwiRmViLlwiLFxuICAgICAgICBcIk1hci5cIixcbiAgICAgICAgXCJBYnIuXCIsXG4gICAgICAgIFwiTWF5LlwiLFxuICAgICAgICBcIkp1bi5cIixcbiAgICAgICAgXCJKdWwuXCIsXG4gICAgICAgIFwiQWdvLlwiLFxuICAgICAgICBcIlNlcHQuXCIsXG4gICAgICAgIFwiT2N0LlwiLFxuICAgICAgICBcIk5vdi5cIixcbiAgICAgICAgXCJEaWMuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImx1bmVzXCIsXG4gICAgICAgIFwibWFydGVzXCIsXG4gICAgICAgIFwibWnDqXJjb2xlc1wiLFxuICAgICAgICBcImp1ZXZlc1wiLFxuICAgICAgICBcInZpZXJuZXNcIixcbiAgICAgICAgXCJzw6FiYWRvXCIsXG4gICAgICAgIFwiZG9taW5nb1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwibHVuLlwiLFxuICAgICAgICBcIm1hci5cIixcbiAgICAgICAgXCJtacOpLlwiLFxuICAgICAgICBcImp1ZS5cIixcbiAgICAgICAgXCJ2aWUuXCIsXG4gICAgICAgIFwic8OhYi5cIixcbiAgICAgICAgXCJkb20uXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBkZSBNTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgZGUgTU1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIGRlIE1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NL3l5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgZGUgTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkIGRlIE1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZCBkZSBNTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJNTU0gZGUgeXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcIml0XCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiR2VubmFpb1wiLFxuICAgICAgICBcIkZlYmJyYWlvXCIsXG4gICAgICAgIFwiTWFyem9cIixcbiAgICAgICAgXCJBcHJpbGVcIixcbiAgICAgICAgXCJNYWdnaW9cIixcbiAgICAgICAgXCJHaXVnbm9cIixcbiAgICAgICAgXCJMdWdsaW9cIixcbiAgICAgICAgXCJBZ29zdG9cIixcbiAgICAgICAgXCJTZXR0ZW1icmVcIixcbiAgICAgICAgXCJPdHRvYnJlXCIsXG4gICAgICAgIFwiTm92ZW1icmVcIixcbiAgICAgICAgXCJEaWNlbWJyZVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiZ2VuXCIsXG4gICAgICAgIFwiZmViXCIsXG4gICAgICAgIFwibWFyXCIsXG4gICAgICAgIFwiYXByXCIsXG4gICAgICAgIFwibWFnXCIsXG4gICAgICAgIFwiZ2l1XCIsXG4gICAgICAgIFwibHVnXCIsXG4gICAgICAgIFwiYWdvXCIsXG4gICAgICAgIFwic2V0XCIsXG4gICAgICAgIFwib3R0XCIsXG4gICAgICAgIFwibm92XCIsXG4gICAgICAgIFwiZGljXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImx1bmVkw6xcIixcbiAgICAgICAgXCJtYXJ0ZWTDrFwiLFxuICAgICAgICBcIm1lcmNvbGVkw6xcIixcbiAgICAgICAgXCJnaW92ZWTDrFwiLFxuICAgICAgICBcInZlbmVyZMOsXCIsXG4gICAgICAgIFwic2FiYXRvXCIsXG4gICAgICAgIFwiZG9tZW5pY2FcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImx1blwiLFxuICAgICAgICBcIm1hclwiLFxuICAgICAgICBcIm1lclwiLFxuICAgICAgICBcImdpb1wiLFxuICAgICAgICBcInZlblwiLFxuICAgICAgICBcInNhYlwiLFxuICAgICAgICBcImRvbVwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NTS95eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NL3l5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkL01NTS95eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwibmxcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJqYW51YXJpXCIsXG4gICAgICAgIFwiZmVicnVhcmlcIixcbiAgICAgICAgXCJtYWFydFwiLFxuICAgICAgICBcImFwcmlsXCIsXG4gICAgICAgIFwibWVpXCIsXG4gICAgICAgIFwianVuaVwiLFxuICAgICAgICBcImp1bGlcIixcbiAgICAgICAgXCJhdWd1c3R1c1wiLFxuICAgICAgICBcInNlcHRlbWJlclwiLFxuICAgICAgICBcIm9rdG9iZXJcIixcbiAgICAgICAgXCJub3ZlbWJlclwiLFxuICAgICAgICBcImRlY2VtYmVyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJqYW5cIixcbiAgICAgICAgXCJmZWJcIixcbiAgICAgICAgXCJtcnRcIixcbiAgICAgICAgXCJhcHJcIixcbiAgICAgICAgXCJtZWlcIixcbiAgICAgICAgXCJqdW5cIixcbiAgICAgICAgXCJqdWxcIixcbiAgICAgICAgXCJhdWdcIixcbiAgICAgICAgXCJzZXBcIixcbiAgICAgICAgXCJva3RcIixcbiAgICAgICAgXCJub3ZcIixcbiAgICAgICAgXCJkZWNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibWFhbmRhZ1wiLFxuICAgICAgICBcImRpbnNkYWdcIixcbiAgICAgICAgXCJ3b2Vuc2RhZ1wiLFxuICAgICAgICBcImRvbmRlcmRhZ1wiLFxuICAgICAgICBcInZyaWpkYWdcIixcbiAgICAgICAgXCJ6YXRlcmRhZ1wiLFxuICAgICAgICBcInpvbmRhZ1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwibWFcIixcbiAgICAgICAgXCJkaVwiLFxuICAgICAgICBcIndvXCIsXG4gICAgICAgIFwiZG9cIixcbiAgICAgICAgXCJ2clwiLFxuICAgICAgICBcInphXCIsXG4gICAgICAgIFwiem9cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC1NTS15eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC1NTS15eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcInRyXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiT2Nha1wiLFxuICAgICAgICBcIsWedWJhdFwiLFxuICAgICAgICBcIk1hcnRcIixcbiAgICAgICAgXCJOaXNhblwiLFxuICAgICAgICBcIk1hecSxc1wiLFxuICAgICAgICBcIkhhemlyYW5cIixcbiAgICAgICAgXCJUZW1tdXpcIixcbiAgICAgICAgXCJBxJ91c3Rvc1wiLFxuICAgICAgICBcIkV5bMO8bFwiLFxuICAgICAgICBcIkVraW1cIixcbiAgICAgICAgXCJLYXPEsW1cIixcbiAgICAgICAgXCJBcmFsxLFrXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJPY2FcIixcbiAgICAgICAgXCLFnnViXCIsXG4gICAgICAgIFwiTWFyXCIsXG4gICAgICAgIFwiTmlzXCIsXG4gICAgICAgIFwiTWF5XCIsXG4gICAgICAgIFwiSGF6XCIsXG4gICAgICAgIFwiVGVtXCIsXG4gICAgICAgIFwiQcSfdVwiLFxuICAgICAgICBcIkV5bFwiLFxuICAgICAgICBcIkVraVwiLFxuICAgICAgICBcIkthc1wiLFxuICAgICAgICBcIkFyYVwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJQYXphcnRlc2lcIixcbiAgICAgICAgXCJTYWzEsVwiLFxuICAgICAgICBcIsOHYXLFn2FtYmFcIixcbiAgICAgICAgXCJQZXLFn2VtYmVcIixcbiAgICAgICAgXCJDdW1hXCIsXG4gICAgICAgIFwiQ3VtYXJ0ZXNpXCIsXG4gICAgICAgIFwiUGF6YXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIlB6dFwiLFxuICAgICAgICBcIlNhbFwiLFxuICAgICAgICBcIsOHYXJcIixcbiAgICAgICAgXCJQZXJcIixcbiAgICAgICAgXCJDdW1cIixcbiAgICAgICAgXCJDbXRcIixcbiAgICAgICAgXCJQYXpcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkIE1NTU0geXl5eSBkZGRkIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5IEhIOm1tXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBkZGRkXCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC5NTS55eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImJyXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiR2VudmVyXCIsXG4gICAgICAgIFwiQ8q8aHdldnJlclwiLFxuICAgICAgICBcIk1ldXJ6aFwiLFxuICAgICAgICBcIkVicmVsXCIsXG4gICAgICAgIFwiTWFlXCIsXG4gICAgICAgIFwiTWV6aGV2ZW5cIixcbiAgICAgICAgXCJHb3VlcmVcIixcbiAgICAgICAgXCJFb3N0XCIsXG4gICAgICAgIFwiR3dlbmdvbG9cIixcbiAgICAgICAgXCJIZXJlXCIsXG4gICAgICAgIFwiRHVcIixcbiAgICAgICAgXCJLZXJ6dVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiR2VuXCIsXG4gICAgICAgIFwiQ8q8aHdlXCIsXG4gICAgICAgIFwiTWV1clwiLFxuICAgICAgICBcIkViclwiLFxuICAgICAgICBcIk1hZVwiLFxuICAgICAgICBcIk1lemhcIixcbiAgICAgICAgXCJHb3VlXCIsXG4gICAgICAgIFwiRW9zdFwiLFxuICAgICAgICBcIkd3ZW5cIixcbiAgICAgICAgXCJIZXJlXCIsXG4gICAgICAgIFwiRHVcIixcbiAgICAgICAgXCJLZXJcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiTHVuXCIsXG4gICAgICAgIFwiTWV1cnpoXCIsXG4gICAgICAgIFwiTWVyY8q8aGVyXCIsXG4gICAgICAgIFwiWWFvdVwiLFxuICAgICAgICBcIkd3ZW5lclwiLFxuICAgICAgICBcIlNhZG9yblwiLFxuICAgICAgICBcIlN1bFwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwibHVuXCIsXG4gICAgICAgIFwibWV1LlwiLFxuICAgICAgICBcIm1lci5cIixcbiAgICAgICAgXCJ5YW91XCIsXG4gICAgICAgIFwiZ3dlLlwiLFxuICAgICAgICBcInNhZC5cIixcbiAgICAgICAgXCJzdWxcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcInl5eXkgTU1NTSBkZCwgZGRkZCBISDptbTpzc1wiLFxuICAgICAgXCJ5eXl5IE1NTU0gZGQgSEg6bW06c3NcIixcbiAgICAgIFwieXl5eSBNTU0gZGQgSEg6bW06c3NcIixcbiAgICAgIFwieXl5eS1NTS1kZCBISDptbVwiLFxuICAgICAgXCJ5eXl5IE1NTU0gZGQsIGRkZGRcIixcbiAgICAgIFwieXl5eSBNTU1NIGRkXCIsXG4gICAgICBcInl5eXkgTU1NIGRkXCIsXG4gICAgICBcInl5eXktTU0tZGRcIixcbiAgICAgIFwieXl5eSBNTU1NXCIsXG4gICAgICBcInl5eXkgTU1NXCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwicHRcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJqYW5laXJvXCIsXG4gICAgICAgIFwiZmV2ZXJlaXJvXCIsXG4gICAgICAgIFwibWFyw6dvXCIsXG4gICAgICAgIFwiYWJyaWxcIixcbiAgICAgICAgXCJtYWlvXCIsXG4gICAgICAgIFwianVuaG9cIixcbiAgICAgICAgXCJqdWxob1wiLFxuICAgICAgICBcImFnb3N0b1wiLFxuICAgICAgICBcInNldGVtYnJvXCIsXG4gICAgICAgIFwib3V0dWJyb1wiLFxuICAgICAgICBcIm5vdmVtYnJvXCIsXG4gICAgICAgIFwiZGV6ZW1icm9cIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImphblwiLFxuICAgICAgICBcImZldlwiLFxuICAgICAgICBcIm1hclwiLFxuICAgICAgICBcImFiclwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcImp1blwiLFxuICAgICAgICBcImp1bFwiLFxuICAgICAgICBcImFnb1wiLFxuICAgICAgICBcInNldFwiLFxuICAgICAgICBcIm91dFwiLFxuICAgICAgICBcIm5vdlwiLFxuICAgICAgICBcImRlelwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJzZWd1bmRhLWZlaXJhXCIsXG4gICAgICAgIFwidGVyw6dhLWZlaXJhXCIsXG4gICAgICAgIFwicXVhcnRhLWZlaXJhXCIsXG4gICAgICAgIFwicXVpbnRhLWZlaXJhXCIsXG4gICAgICAgIFwic2V4dGEtZmVpcmFcIixcbiAgICAgICAgXCJzw6FiYWRvXCIsXG4gICAgICAgIFwiZG9taW5nb1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwic2VnXCIsXG4gICAgICAgIFwidGVyXCIsXG4gICAgICAgIFwicXVhXCIsXG4gICAgICAgIFwicXVpXCIsXG4gICAgICAgIFwic2V4XCIsXG4gICAgICAgIFwic8OhYlwiLFxuICAgICAgICBcImRvbVwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgZGUgTU1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIGRlIE1NTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBkZSBNTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTS95eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkIGRlIE1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZCBkZSBNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQgZGUgTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQvTU0veXl5eVwiLFxuICAgICAgXCJNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJiZ1wiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcItGP0L3Rg9Cw0YDQuFwiLFxuICAgICAgICBcItGE0LXQstGA0YPQsNGA0LhcIixcbiAgICAgICAgXCLQvNCw0YDRglwiLFxuICAgICAgICBcItCw0L/RgNC40LtcIixcbiAgICAgICAgXCLQvNCw0LlcIixcbiAgICAgICAgXCLRjtC90LhcIixcbiAgICAgICAgXCLRjtC70LhcIixcbiAgICAgICAgXCLQsNCy0LPRg9GB0YJcIixcbiAgICAgICAgXCLRgdC10L/RgtC10LzQstGA0LhcIixcbiAgICAgICAgXCLQvtC60YLQvtC80LLRgNC4XCIsXG4gICAgICAgIFwi0L3QvtC10LzQstGA0LhcIixcbiAgICAgICAgXCLQtNC10LrQtdC80LLRgNC4XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLRj9C9LlwiLFxuICAgICAgICBcItGE0LXQstGALlwiLFxuICAgICAgICBcItC80LDRgNGCXCIsXG4gICAgICAgIFwi0LDQv9GALlwiLFxuICAgICAgICBcItC80LDQuVwiLFxuICAgICAgICBcItGO0L3QuFwiLFxuICAgICAgICBcItGO0LvQuFwiLFxuICAgICAgICBcItCw0LLQsy5cIixcbiAgICAgICAgXCLRgdC10L/Rgi5cIixcbiAgICAgICAgXCLQvtC60YIuXCIsXG4gICAgICAgIFwi0L3QvtC10LwuXCIsXG4gICAgICAgIFwi0LTQtdC6LlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLQv9C+0L3QtdC00LXQu9C90LjQulwiLFxuICAgICAgICBcItCy0YLQvtGA0L3QuNC6XCIsXG4gICAgICAgIFwi0YHRgNGP0LTQsFwiLFxuICAgICAgICBcItGH0LXRgtCy0YrRgNGC0YrQulwiLFxuICAgICAgICBcItC/0LXRgtGK0LpcIixcbiAgICAgICAgXCLRgdGK0LHQvtGC0LBcIixcbiAgICAgICAgXCLQvdC10LTQtdC70Y9cIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcItC/0L1cIixcbiAgICAgICAgXCLQstGCXCIsXG4gICAgICAgIFwi0YHRgFwiLFxuICAgICAgICBcItGH0YJcIixcbiAgICAgICAgXCLQv9GCXCIsXG4gICAgICAgIFwi0YHQsVwiLFxuICAgICAgICBcItC90LRcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSDQsy4sIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSDQsy4sIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5INCzLiwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuTU0ueXl5eSDQsy4sIEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZCBNTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQuTU0ueXl5eSDQsy5cIixcbiAgICAgIFwiTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJNTU0geXl5eSDQsy5cIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJpblwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkphbnVhcmlcIixcbiAgICAgICAgXCJGZWJydWFyaVwiLFxuICAgICAgICBcIk1hcmV0XCIsXG4gICAgICAgIFwiQXByaWxcIixcbiAgICAgICAgXCJNZWlcIixcbiAgICAgICAgXCJKdW5pXCIsXG4gICAgICAgIFwiSnVsaVwiLFxuICAgICAgICBcIkFndXN0dXNcIixcbiAgICAgICAgXCJTZXB0ZW1iZXJcIixcbiAgICAgICAgXCJPa3RvYmVyXCIsXG4gICAgICAgIFwiTm92ZW1iZXJcIixcbiAgICAgICAgXCJEZXNlbWJlclwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiSmFuXCIsXG4gICAgICAgIFwiRmViXCIsXG4gICAgICAgIFwiTWFyXCIsXG4gICAgICAgIFwiQXByXCIsXG4gICAgICAgIFwiTWVpXCIsXG4gICAgICAgIFwiSnVuXCIsXG4gICAgICAgIFwiSnVsXCIsXG4gICAgICAgIFwiQWd0XCIsXG4gICAgICAgIFwiU2VwXCIsXG4gICAgICAgIFwiT2t0XCIsXG4gICAgICAgIFwiTm92XCIsXG4gICAgICAgIFwiRGVzXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIlNlbmluXCIsXG4gICAgICAgIFwiU2VsYXNhXCIsXG4gICAgICAgIFwiUmFidVwiLFxuICAgICAgICBcIkthbWlzXCIsXG4gICAgICAgIFwiSnVtYXRcIixcbiAgICAgICAgXCJTYWJ0dVwiLFxuICAgICAgICBcIk1pbmdndVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiU2VuXCIsXG4gICAgICAgIFwiU2VsXCIsXG4gICAgICAgIFwiUmFiXCIsXG4gICAgICAgIFwiS2FtXCIsXG4gICAgICAgIFwiSnVtXCIsXG4gICAgICAgIFwiU2FiXCIsXG4gICAgICAgIFwiTWluXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXkgSEgubW0uc3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhILm1tLnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5IEhILm1tLnNzXCIsXG4gICAgICBcImRkL01NL3l5eXkgSEgubW1cIixcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISC5tbS5zc1wiLFxuICAgICAgXCJISC5tbVwiXG4gICAgXVxuICB9LFxuICBcInJvXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiaWFudWFyaWVcIixcbiAgICAgICAgXCJmZWJydWFyaWVcIixcbiAgICAgICAgXCJtYXJ0aWVcIixcbiAgICAgICAgXCJhcHJpbGllXCIsXG4gICAgICAgIFwibWFpXCIsXG4gICAgICAgIFwiaXVuaWVcIixcbiAgICAgICAgXCJpdWxpZVwiLFxuICAgICAgICBcImF1Z3VzdFwiLFxuICAgICAgICBcInNlcHRlbWJyaWVcIixcbiAgICAgICAgXCJvY3RvbWJyaWVcIixcbiAgICAgICAgXCJub2llbWJyaWVcIixcbiAgICAgICAgXCJkZWNlbWJyaWVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImlhbi5cIixcbiAgICAgICAgXCJmZWIuXCIsXG4gICAgICAgIFwibWFyLlwiLFxuICAgICAgICBcImFwci5cIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJpdW4uXCIsXG4gICAgICAgIFwiaXVsLlwiLFxuICAgICAgICBcImF1Zy5cIixcbiAgICAgICAgXCJzZXB0LlwiLFxuICAgICAgICBcIm9jdC5cIixcbiAgICAgICAgXCJub3YuXCIsXG4gICAgICAgIFwiZGVjLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJsdW5pXCIsXG4gICAgICAgIFwibWFyyJtpXCIsXG4gICAgICAgIFwibWllcmN1cmlcIixcbiAgICAgICAgXCJqb2lcIixcbiAgICAgICAgXCJ2aW5lcmlcIixcbiAgICAgICAgXCJzw6JtYsSDdMSDXCIsXG4gICAgICAgIFwiZHVtaW5pY8SDXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJMdW5cIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJNaWVcIixcbiAgICAgICAgXCJKb2lcIixcbiAgICAgICAgXCJWaW5cIixcbiAgICAgICAgXCJTw6JtXCIsXG4gICAgICAgIFwiRHVtXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXksIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXksIEhIOm1tOnNzXCIsXG4gICAgICBcImRkLk1NLnl5eXksIEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuTU0ueXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJta1wiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcItGY0LDQvdGD0LDRgNC4XCIsXG4gICAgICAgIFwi0YTQtdCy0YDRg9Cw0YDQuFwiLFxuICAgICAgICBcItC80LDRgNGCXCIsXG4gICAgICAgIFwi0LDQv9GA0LjQu1wiLFxuICAgICAgICBcItC80LDRmFwiLFxuICAgICAgICBcItGY0YPQvdC4XCIsXG4gICAgICAgIFwi0ZjRg9C70LhcIixcbiAgICAgICAgXCLQsNCy0LPRg9GB0YJcIixcbiAgICAgICAgXCLRgdC10L/RgtC10LzQstGA0LhcIixcbiAgICAgICAgXCLQvtC60YLQvtC80LLRgNC4XCIsXG4gICAgICAgIFwi0L3QvtC10LzQstGA0LhcIixcbiAgICAgICAgXCLQtNC10LrQtdC80LLRgNC4XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLRmNCw0L0uXCIsXG4gICAgICAgIFwi0YTQtdCyLlwiLFxuICAgICAgICBcItC80LDRgC5cIixcbiAgICAgICAgXCLQsNC/0YAuXCIsXG4gICAgICAgIFwi0LzQsNGYXCIsXG4gICAgICAgIFwi0ZjRg9C9LlwiLFxuICAgICAgICBcItGY0YPQuy5cIixcbiAgICAgICAgXCLQsNCy0LMuXCIsXG4gICAgICAgIFwi0YHQtdC/0YIuXCIsXG4gICAgICAgIFwi0L7QutGCLlwiLFxuICAgICAgICBcItC90L7QtdC8LlwiLFxuICAgICAgICBcItC00LXQui5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi0L/QvtC90LXQtNC10LvQvdC40LpcIixcbiAgICAgICAgXCLQstGC0L7RgNC90LjQulwiLFxuICAgICAgICBcItGB0YDQtdC00LBcIixcbiAgICAgICAgXCLRh9C10YLQstGA0YLQvtC6XCIsXG4gICAgICAgIFwi0L/QtdGC0L7QulwiLFxuICAgICAgICBcItGB0LDQsdC+0YLQsFwiLFxuICAgICAgICBcItC90LXQtNC10LvQsFwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi0L/QvtC9LlwiLFxuICAgICAgICBcItCy0YIuXCIsXG4gICAgICAgIFwi0YHRgNC1LlwiLFxuICAgICAgICBcItGH0LXRgi5cIixcbiAgICAgICAgXCLQv9C10YIuXCIsXG4gICAgICAgIFwi0YHQsNCxLlwiLFxuICAgICAgICBcItC90LXQtC5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSDQsy4gSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5INCzLiBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSDQsy4gSEg6bW06c3NcIixcbiAgICAgIFwiZGQuTU0ueXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQgTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkLk1NLnl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJNTU0geXl5eSDQsy5cIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJ0aFwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIuC4oeC4geC4o+C4suC4hOC4oVwiLFxuICAgICAgICBcIuC4geC4uOC4oeC4oOC4suC4nuC4seC4meC4mOC5jFwiLFxuICAgICAgICBcIuC4oeC4teC4meC4suC4hOC4oVwiLFxuICAgICAgICBcIuC5gOC4oeC4qeC4suC4ouC4mVwiLFxuICAgICAgICBcIuC4nuC4pOC4qeC4oOC4suC4hOC4oVwiLFxuICAgICAgICBcIuC4oeC4tOC4luC4uOC4meC4suC4ouC4mVwiLFxuICAgICAgICBcIuC4geC4o+C4geC4juC4suC4hOC4oVwiLFxuICAgICAgICBcIuC4quC4tOC4h+C4q+C4suC4hOC4oVwiLFxuICAgICAgICBcIuC4geC4seC4meC4ouC4suC4ouC4mVwiLFxuICAgICAgICBcIuC4leC4uOC4peC4suC4hOC4oVwiLFxuICAgICAgICBcIuC4nuC4pOC4qOC4iOC4tOC4geC4suC4ouC4mVwiLFxuICAgICAgICBcIuC4mOC4seC4meC4p+C4suC4hOC4oVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi4LihLuC4hC5cIixcbiAgICAgICAgXCLguIEu4LieLlwiLFxuICAgICAgICBcIuC4oeC4tS7guIQuXCIsXG4gICAgICAgIFwi4LmA4LihLuC4oi5cIixcbiAgICAgICAgXCLguJ4u4LiELlwiLFxuICAgICAgICBcIuC4oeC4tC7guKIuXCIsXG4gICAgICAgIFwi4LiBLuC4hC5cIixcbiAgICAgICAgXCLguKou4LiELlwiLFxuICAgICAgICBcIuC4gS7guKIuXCIsXG4gICAgICAgIFwi4LiVLuC4hC5cIixcbiAgICAgICAgXCLguJ4u4LiiLlwiLFxuICAgICAgICBcIuC4mC7guIQuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIuC4p+C4seC4meC4iOC4seC4meC4l+C4o+C5jFwiLFxuICAgICAgICBcIuC4p+C4seC4meC4reC4seC4h+C4hOC4suC4o1wiLFxuICAgICAgICBcIuC4p+C4seC4meC4nuC4uOC4mFwiLFxuICAgICAgICBcIuC4p+C4seC4meC4nuC4pOC4q+C4seC4quC4muC4lOC4tVwiLFxuICAgICAgICBcIuC4p+C4seC4meC4qOC4uOC4geC4o+C5jFwiLFxuICAgICAgICBcIuC4p+C4seC4meC5gOC4quC4suC4o+C5jFwiLFxuICAgICAgICBcIuC4p+C4seC4meC4reC4suC4l+C4tOC4leC4ouC5jFwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi4LiILlwiLFxuICAgICAgICBcIuC4rS5cIixcbiAgICAgICAgXCLguJ4uXCIsXG4gICAgICAgIFwi4Lie4LikLlwiLFxuICAgICAgICBcIuC4qC5cIixcbiAgICAgICAgXCLguKouXCIsXG4gICAgICAgIFwi4Lit4LiyLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCBkZCBNTU1NIDI1NDMgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSAyNTQzIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSAyNTQzIEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NLzI1NDMgSEg6bW1cIixcbiAgICAgIFwiZGRkZCBkZCBNTU1NIDI1NDNcIixcbiAgICAgIFwiZGQgTU1NTSAyNTQzXCIsXG4gICAgICBcImRkIE1NTSAyNTQzXCIsXG4gICAgICBcImRkL01NLzI1NDNcIixcbiAgICAgIFwiTU1NTSAyNTQzXCIsXG4gICAgICBcIk1NTSAyNTQzXCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiZW5cIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIixcIixcbiAgICAgIFwiLlwiLFxuICAgICAgMCxcbiAgICAgIFwiXCJcbiAgICBdLFxuICAgIFwiZXF1YWxzXCI6IFwidGhcIlxuICB9LFxuICBcImRlXCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIuXCIsXG4gICAgICBcIixcIixcbiAgICAgIDAsXG4gICAgICBcIiBcIlxuICAgIF0sXG4gICAgXCJlcXVhbHNcIjogXCJyb1wiXG4gIH0sXG4gIFwiZnJcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIiBcIixcbiAgICAgIFwiLFwiLFxuICAgICAgMCxcbiAgICAgIFwiIFwiXG4gICAgXVxuICB9LFxuICBcImVzXCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIgXCIsXG4gICAgICBcIixcIixcbiAgICAgIDAsXG4gICAgICBcIlwiXG4gICAgXSxcbiAgICBcImVxdWFsc1wiOiBcImJyLGJnXCJcbiAgfSxcbiAgXCJpdFwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiLlwiLFxuICAgICAgXCIsXCIsXG4gICAgICAwLFxuICAgICAgXCJcIlxuICAgIF0sXG4gICAgXCJlcXVhbHNcIjogXCJubCxwdCxpbixta1wiXG4gIH0sXG4gIFwidHJcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIi5cIixcbiAgICAgIFwiLFwiLFxuICAgICAgMSxcbiAgICAgIFwiXCJcbiAgICBdXG4gIH1cbn07IiwidmFyIGkxOG4gPSByZXF1aXJlKFwiLi9sb2NhbGVzL2FsbFwiKTtcblxuXG4vLyBQYWQgUmlnaHRcbmZ1bmN0aW9uIHBhZFJpZ2h0KCBzdHJpbmcsIGxlbmd0aCwgY2hhcmFjdGVyICkge1xuICBpZiAoc3RyaW5nLmxlbmd0aCA8IGxlbmd0aCkge1xuICAgIHJldHVybiBzdHJpbmcgKyBBcnJheShsZW5ndGggLSBzdHJpbmcubGVuZ3RoICsgMSkuam9pbihjaGFyYWN0ZXIgfHwgXCIwXCIpO1xuICB9XG4gIHJldHVybiBzdHJpbmc7XG59XG4gIFxuLy8gUGFkIExlZnRcbmZ1bmN0aW9uIHBhZExlZnQoIHN0cmluZywgbGVuZ3RoLCBjaGFyYWN0ZXIgKSB7XG4gIGlmIChzdHJpbmcubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIEFycmF5KGxlbmd0aCAtIHN0cmluZy5sZW5ndGggKyAxKS5qb2luKGNoYXJhY3RlciB8fCBcIjBcIikgKyBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cm5naTtcbn1cbiAgXG4gIFxuZnVuY3Rpb24gdG9QcmVjaXNpb24obiwgc2lnKSB7XG4gIGlmIChuICE9PSAwKSB7XG4gICAgdmFyIG11bHQgPSBNYXRoLnBvdygxMCwgc2lnIC0gTWF0aC5mbG9vcihNYXRoLmxvZyhuKSAvIE1hdGguTE4xMCkgLSAxKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChuICogbXVsdCkgLyBtdWx0O1xuICB9XG4gIHJldHVybiBuO1xufVxuICBcbmZ1bmN0aW9uIGdldExvY2FsZURhdGEobG9jYWxlKSB7XG4gIGlmIChpMThuW2xvY2FsZV0pIHtcbiAgICByZXR1cm4gaTE4bltsb2NhbGVdO1xuICB9XG4gIGZvciAodmFyIGtleSBpbiBpMThuKSB7XG4gICAgaWYgKGkxOG5ba2V5XS5lcXVhbHMgJiYgaTE4bltrZXldLmVxdWFscy5zcGxpdChcIixcIikuaW5kZXhPZihsb2NhbGUpID49IDApIHtcbiAgICAgIHJldHVybiBpMThuW2tleV07XG4gICAgfVxuICB9O1xufVxuICBcbiAgXG52YXIgcGF0dGVyblJlZ2V4ID0gbmV3IFJlZ0V4cCgvXlxccyooJXxcXHcqKT8oWyMwXSooPzooLClbIzBdKykqKSg/OihcXC4pKFsjMF0rKSk/KCV8XFx3Kik/XFxzKiQvKTtcbiAgXG4gIFxuZnVuY3Rpb24gZm9ybWF0KG51bWJlciwgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHZhciBsb2NhbGVEYXRhO1xuICAgXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbaV0gPT09IFwic3RyaW5nXCIgJiYgYXJndW1lbnRzW2ldLm1hdGNoKC9bYS16XXsyfS8pKSB7XG4gICAgICBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YShhcmd1bWVudHNbaV0pO1xuICAgICAgYXJndW1lbnRzW2ldID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXR0ZXJuID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgfVxuICAgIFxuICBpZiAoIWxvY2FsZURhdGEpIHtcbiAgICBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YSgnZW4nKTtcbiAgfSBcbiAgIFxuICBwYXR0ZXJuID0gcGF0dGVybiB8fCBcIiMsIyMjLiNcIjtcbiAgIFxuICB2YXJcbiAgICBhcmdzID0gbG9jYWxlRGF0YS5hcmdzLFxuICAgIHN0eWxlID0gXCJkZWNpbWFsXCIsXG4gICAgdXNlR3JvdXBpbmcgPSBmYWxzZSxcbiAgICBncm91cGluZ1doaXRlc3BhY2UgPSBcIiBcIiB8fCBcIlxcdTAwQTBcIixcbiAgICBncm91cGluZ1NlcGFyYXRvciA9IGFyZ3NbMF0sXG4gICAgcmFkaXggPSBhcmdzWzFdLFxuICAgIGxlYWRpbmdVbml0ID0gYXJnc1syXSxcbiAgICB1bml0U3BhY2UgPSBhcmdzWzNdID8gXCJcXHUwMEEwXCIgOiBcIlwiLFxuICAgIGxlbmd0aCA9IG51bWJlci50b1N0cmluZygpLmxlbmd0aCxcbiAgICBzaWduaWZpY2FudERpZ2l0cyA9IC0xO1xuICAgICBcbiAgICAgdmFyIHBhdHRlcm5NYXRjaCA9IHBhdHRlcm5SZWdleC5leGVjKHBhdHRlcm4pO1xuICAgICBcbiAgICAgdmFyIGludFBhdHRlcm5TdHJpbmcgPSBwYXR0ZXJuTWF0Y2ggJiYgcGF0dGVybk1hdGNoWzJdLnJlcGxhY2UoLywvZywgXCJcIikgfHwgXCJcIjtcbiAgICAgdmFyIGludFBhZE1hdGNoID0gaW50UGF0dGVyblN0cmluZyA/IGludFBhdHRlcm5TdHJpbmcubWF0Y2goL14wKi8pIDogbnVsbDtcbiAgICAgXG4gICAgIHZhciBpbnRQYWRMZW5ndGggPSBpbnRQYWRNYXRjaCA/IGludFBhZE1hdGNoWzBdLmxlbmd0aCA6IDA7XG4gICAgIFxuICAgICB2YXIgZGVjUGF0dGVyblN0cmluZyA9IHBhdHRlcm5NYXRjaFs1XSB8fCBcIlwiO1xuICAgICBcbiAgICAgdmFyIGRlY1BhZE1hdGNoID0gZGVjUGF0dGVyblN0cmluZyA/IGRlY1BhdHRlcm5TdHJpbmcubWF0Y2goLzAqJC8pIDogbnVsbDtcbiAgICAgdmFyIGRlY1BhZExlbmd0aCA9IGRlY1BhZE1hdGNoID8gZGVjUGFkTWF0Y2hbMF0ubGVuZ3RoIDogMDtcbiAgICAgXG4gICAgIHZhciBmcmFjdGlvbkRpZ2l0cyA9IGRlY1BhdHRlcm5TdHJpbmcubGVuZ3RoIHx8IDA7XG4gICAgIFxuICAgICB2YXIgc2lnbmlmaWNhbnRGcmFjdGlvbkRpZ2l0cyA9IGRlY1BhdHRlcm5TdHJpbmcubGVuZ3RoIC0gZGVjUGFkTGVuZ3RoO1xuICAgICB2YXIgc2lnbmlmaWNhbnREaWdpdHMgPSAoaW50UGF0dGVyblN0cmluZy5sZW5ndGggLSBpbnRQYWRMZW5ndGgpICsgZnJhY3Rpb25EaWdpdHM7XG4gICAgIFxuICAgICB2YXIgaXNOZWdhdGl2ZSA9IG51bWJlciA8IDAgPyB0cnVlIDogMDtcbiAgICAgXG4gICAgIG51bWJlciA9IE1hdGguYWJzKG51bWJlcik7XG4gICAgIFxuICAgICBzdHlsZSA9IHBhdHRlcm5NYXRjaFsxXSB8fCBwYXR0ZXJuTWF0Y2hbcGF0dGVybk1hdGNoLmxlbmd0aCAtIDFdID8gXCJwZXJjZW50XCIgOiBzdHlsZTtcbiAgICAgdXNlR3JvdXBpbmcgPSBwYXR0ZXJuTWF0Y2hbM10gPyB0cnVlIDogdXNlR3JvdXBpbmc7XG4gICAgIFxuICAgICB1bml0ID0gc3R5bGUgPT09IFwicGVyY2VudFwiID8gXCIlXCIgOiBzdHlsZSA9PT0gXCJjdXJyZW5jeVwiID8gY3VycmVuY3kgOiBcIlwiO1xuICAgICBcbiAgICAgc2lnbmlmaWNhbnREaWdpdHMgPSBNYXRoLmZsb29yKG51bWJlcikudG9TdHJpbmcoKS5sZW5ndGggKyBmcmFjdGlvbkRpZ2l0cztcbiAgICAgaWYgKGZyYWN0aW9uRGlnaXRzID4gMCAmJiBzaWduaWZpY2FudERpZ2l0cyA+IDApIHtcbiAgICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KHRvUHJlY2lzaW9uKG51bWJlciwgc2lnbmlmaWNhbnREaWdpdHMpLnRvU3RyaW5nKCkpO1xuICAgICB9XG4gICAgIFxuICAgICBpZiAoc3R5bGUgPT09ICdwZXJjZW50Jykge1xuICAgICAgIG51bWJlciA9IG51bWJlciAqIDEwMDtcbiAgICAgfVxuICAgICBcbiAgIHZhclxuICAgICBpbnRWYWx1ZSA9IHBhcnNlSW50KG51bWJlciksXG4gICAgIGRlY1ZhbHVlID0gcGFyc2VGbG9hdCgobnVtYmVyIC0gaW50VmFsdWUpLnRvUHJlY2lzaW9uKDEyKSk7XG4gICBcbiAgIHZhciBkZWNTdHJpbmcgPSBkZWNWYWx1ZS50b1N0cmluZygpO1xuICAgXG4gICBkZWNTdHJpbmcgPSBkZWNWYWx1ZS50b0ZpeGVkKGZyYWN0aW9uRGlnaXRzKTtcbiAgIGRlY1N0cmluZyA9IGRlY1N0cmluZy5yZXBsYWNlKC9eMFxcLi8sIFwiXCIpO1xuICAgZGVjU3RyaW5nID0gZGVjU3RyaW5nLnJlcGxhY2UoLzAqJC8sIFwiXCIpO1xuICAgZGVjU3RyaW5nID0gZGVjU3RyaW5nID8gZGVjU3RyaW5nIDogZnJhY3Rpb25EaWdpdHMgPiAwID8gXCIwXCIgOiBcIlwiO1xuICAgXG4gICBpZiAoZGVjUGFkTGVuZ3RoKSB7XG4gICAgIGRlY1N0cmluZyA9IHBhZFJpZ2h0KGRlY1N0cmluZywgZnJhY3Rpb25EaWdpdHMsIFwiMFwiKTtcbiAgIH1cbiAgIFxuICAgaWYgKChkZWNQYWRMZW5ndGggfHwgZGVjVmFsdWUgPiAwKSAmJiBmcmFjdGlvbkRpZ2l0cyA+IDApIHtcbiAgICAgZGVjU3RyaW5nID0gcmFkaXggKyBkZWNTdHJpbmc7XG4gICB9IGVsc2Uge1xuICAgICBkZWNTdHJpbmcgPSBcIlwiO1xuICAgICBpbnRWYWx1ZSA9IE1hdGgucm91bmQobnVtYmVyKTtcbiAgIH1cbiAgIFxuICAgdmFyIGludFN0cmluZyA9IGludFZhbHVlLnRvU3RyaW5nKCk7XG4gICBcbiAgIGlmIChpbnRQYWRMZW5ndGggPiAwKSB7XG4gICAgIGludFN0cmluZyA9IHBhZExlZnQoaW50U3RyaW5nLCBpbnRQYXR0ZXJuU3RyaW5nLmxlbmd0aCwgXCIwXCIpO1xuICAgfVxuICAgXG4gICBpZiAodXNlR3JvdXBpbmcpIHtcbiAgICAgaW50U3RyaW5nID0gaW50U3RyaW5nLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIGdyb3VwaW5nU2VwYXJhdG9yLnJlcGxhY2UoL1xccy9nLCBncm91cGluZ1doaXRlc3BhY2UpIHx8IFwiLFwiKTtcbiAgIH1cblxuICAgdmFyIG51bVN0cmluZyA9IChpc05lZ2F0aXZlID8gXCItXCIgOiBcIlwiKSArIGludFN0cmluZyArIGRlY1N0cmluZztcbiAgICAgXG4gICByZXR1cm4gdW5pdCA/IGxlYWRpbmdVbml0ID8gdW5pdCArIHVuaXRTcGFjZSArIG51bVN0cmluZyA6IG51bVN0cmluZyArIHVuaXRTcGFjZSArIHVuaXQgOiBudW1TdHJpbmc7XG4gfVxuXG5mdW5jdGlvbiBpc0xvY2FsZShsb2NhbGUpIHtcbiAgcmV0dXJuICh0eXBlb2YgbG9jYWxlID09PSBcInN0cmluZ1wiICYmIGxvY2FsZS5tYXRjaCgvW2Etel17Mn0vKSk7XG59XG5cbmZ1bmN0aW9uIGRldGVjdChzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuXG4gIHZhciBpbnB1dFBhdHRlcm4gPSBudWxsO1xuICBmb3IgKHZhciBhID0gMTsgYSA8IGFyZ3VtZW50cy5sZW5ndGg7IGErKykge1xuICAgIHZhciBhcmcgPSBhcmd1bWVudHNbYV07XG4gICAgaWYgKGFyZyBpbnN0YW5jZW9mIEFycmF5IHx8IGlzTG9jYWxlKGFyZykpIHtcbiAgICAgIGxvY2FsZSA9IGFyZztcbiAgICB9IGVsc2UgaWYgKCFpbnB1dFBhdHRlcm4pIHtcbiAgICAgIGlucHV0UGF0dGVybiA9IGFyZztcbiAgICB9XG4gIH1cbiAgcGF0dGVybiA9IGlucHV0UGF0dGVybjtcbiAgXG4gIHZhciBsb2NhbGVzID0gbG9jYWxlIGluc3RhbmNlb2YgQXJyYXkgPyBsb2NhbGUgOiBsb2NhbGUgPyBbbG9jYWxlXSA6IE9iamVjdC5rZXlzKGkxOG4pO1xuICBcbiAgdmFyIHBhdHRlcm5NYXRjaDtcbiAgdmFyIHBhdHRlcm5Vbml0O1xuICAgXG4gIGlmIChwYXR0ZXJuKSB7XG4gICAgcGF0dGVybk1hdGNoID0gcGF0dGVyblJlZ2V4LmV4ZWMocGF0dGVybik7XG4gICAgcGF0dGVyblVuaXQgPSBwYXR0ZXJuTWF0Y2ggPyBwYXR0ZXJuTWF0Y2hbMV0gfHwgcGF0dGVybk1hdGNoW3BhdHRlcm5NYXRjaC5sZW5ndGggLSAxXSA6IG51bGw7XG4gIH1cbiAgXG4gIHZhciByZXN1bHRzID0gbG9jYWxlcy5tYXAoZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgXG4gICAgIHZhciBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YShsb2NhbGUpO1xuICAgICBcbiAgICAgdmFyIHJlc3VsdCA9IHtsb2NhbGU6IGxvY2FsZSwgcGF0dGVybjogcGF0dGVybiwgcmVsZXZhbmNlOiAwfTtcbiAgICAgdmFyIHZhbHVlID0gTmFOO1xuICAgICBcbiAgICAgaWYgKGxvY2FsZURhdGEpIHtcbiAgICAgICB2YXIgYXJncyA9IGxvY2FsZURhdGEuYXJncztcbiAgICAgICBcbiAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgXG4gICAgICAgICB2YXIgbnVtYmVyUmVnZXhQYXJ0ID0gXCIoW1xcKy1dP1xcXFxkKig/OlwiICsgYXJnc1swXS5yZXBsYWNlKC9cXC4vLCBcIlxcXFwuXCIpLnJlcGxhY2UoL1xccy8sIFwiXFxcXHNcIikgKyBcIlxcXFxkezN9KSopKD86XCIgKyBhcmdzWzFdLnJlcGxhY2UoL1xcLi9nLCBcIlxcXFwuXCIpICsgXCIoXFxcXGQqKSk/XCI7XG4gICAgICAgICB2YXIgbGVhZGluZ1VuaXQgPSBhcmdzWzJdO1xuICAgICAgICAgdmFyIHVuaXRTcGFjZSA9IGFyZ3NbM107XG4gICAgICAgICB2YXIgdW5pdFNwYWNlUmVnZXhQYXJ0ID0gXCJcIiArIHVuaXRTcGFjZS5yZXBsYWNlKC9cXHMvLCBcIlxcXFxzXCIpICsgXCJcIjtcbiAgICAgICAgIHZhciB1bml0UmVnZXhQYXJ0ID0gXCIoJXxbXFx3Kl0pXCI7XG4gICAgICAgICB2YXIgbnVtYmVyUmVnZXggPSBudW1iZXJSZWdleFBhcnQsIG1hdGNoTnVtSW5kZXggPSAxLCBtYXRjaFVuaXRJbmRleCA9IDM7XG4gICAgICAgICBcbiAgICAgICAgIHZhciBkZXRlY3RlZFBhdHRlcm47XG4gICAgICAgICBcbiAgICAgICAgIGlmIChsZWFkaW5nVW5pdCkge1xuICAgICAgICAgICBudW1iZXJSZWdleCA9IFwiKD86XCIgKyB1bml0UmVnZXhQYXJ0ICsgdW5pdFNwYWNlUmVnZXhQYXJ0ICsgXCIpP1wiICsgbnVtYmVyUmVnZXhQYXJ0O1xuICAgICAgICAgICBtYXRjaE51bUluZGV4ID0gMjtcbiAgICAgICAgICAgbWF0Y2hVbml0SW5kZXggPSAxO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgbnVtYmVyUmVnZXggPSBudW1iZXJSZWdleFBhcnQgKyBcIig/OlwiICsgdW5pdFNwYWNlUmVnZXhQYXJ0ICsgdW5pdFJlZ2V4UGFydCArIFwiKT9cIjtcbiAgICAgICAgIH1cbiAgICAgICAgIFxuICAgICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIl5cXFxccypcIiArIG51bWJlclJlZ2V4ICsgXCJcXFxccyokXCIpO1xuICAgICAgICAgdmFyIG1hdGNoID0gcmVnZXguZXhlYyhzdHJpbmcpO1xuICAgICAgICAgXG4gICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgIHZhciBpbnRTdHJpbmcgPSBtYXRjaFttYXRjaE51bUluZGV4XTtcbiAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWRJbnRTdHJpbmcgPSBpbnRTdHJpbmcucmVwbGFjZShuZXcgUmVnRXhwKGFyZ3NbMF0ucmVwbGFjZSgvXFwuLywgXCJcXFxcLlwiKS5yZXBsYWNlKC9cXHMvLCBcIlxcXFxzXCIpLCBcImdcIiksIFwiXCIpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgdmFyIGRlY1N0cmluZyA9IG1hdGNoW21hdGNoTnVtSW5kZXggKyAxXSB8fCBcIlwiO1xuICAgICAgICAgICB2YXIgdW5pdE1hdGNoID0gbWF0Y2hbbWF0Y2hVbml0SW5kZXhdO1xuICAgICAgICAgICBcbiAgICAgICAgICAgaWYgKHBhdHRlcm4gJiYgKCFwYXR0ZXJuVW5pdCAmJiB1bml0TWF0Y2gpKSB7XG4gICAgICAgICAgICAgLy8gSW52YWxpZCBiZWNhdXNlIG9mIHVuaXRcbiAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICB9XG4gICAgICAgICAgIFxuICAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQobm9ybWFsaXplZEludFN0cmluZyArIChkZWNTdHJpbmcgPyBcIi5cIiArIGRlY1N0cmluZyA6IFwiXCIpKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIGlmICh1bml0TWF0Y2ggJiYgdW5pdE1hdGNoID09PSBcIiVcIikge1xuICAgICAgICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCgodmFsdWUgLyAxMDApLnRvUHJlY2lzaW9uKDEyKSk7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICAgIHJlc3VsdC5yZWxldmFuY2UgPSBtYXRjaC5maWx0ZXIoZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgIH0pLmxlbmd0aCAqIDEwICsgdmFsdWUudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgICAgIFxuICAgICAgICAgICBcbiAgICAgICAgICAgdmFyIGRldGVjdGVkUGF0dGVybiA9IFwiXCI7XG4gICAgICAgICAgIGlmICghcGF0dGVybikge1xuICAgICAgICAgICAgIGRldGVjdGVkUGF0dGVybiA9IFwiI1wiO1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIGlmICh2YWx1ZSA+PSAxMDAwICYmIGludFN0cmluZy5pbmRleE9mKGFyZ3NbMF0pID49IDApIHtcbiAgICAgICAgICAgICAgIGRldGVjdGVkUGF0dGVybiA9IFwiIywjIyNcIjtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgaWYgKGRlY1N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgIGRldGVjdGVkUGF0dGVybis9IFwiLlwiICsgKG5ldyBBcnJheShkZWNTdHJpbmcubGVuZ3RoICsgMSkpLmpvaW4oIFwiI1wiICk7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIGlmICh1bml0TWF0Y2ggJiYgdW5pdE1hdGNoID09PSBcIiVcIikge1xuICAgICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuKz0gXCIlXCI7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIHJlc3VsdC5wYXR0ZXJuID0gZGV0ZWN0ZWRQYXR0ZXJuO1xuICAgICAgICAgICAgIFxuICAgICAgICAgICB9XG4gICAgICAgICAgIFxuICAgICAgICAgfVxuICAgICAgICAgXG4gICAgICAgfVxuICAgICB9XG4gICAgIHJlc3VsdC52YWx1ZSA9IHZhbHVlO1xuICAgICByZXR1cm4gcmVzdWx0O1xuICAgfSkuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICByZXR1cm4gIWlzTmFOKHJlc3VsdC52YWx1ZSk7XG4gICB9KTtcbiAgIFxuICAgLy8gVW5pcXVlIHZhbHVlc1xuICAgdmFyIGZpbHRlcmVkVmFsdWVzID0gW107XG4gICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgIGlmIChmaWx0ZXJlZFZhbHVlcy5pbmRleE9mKHJlc3VsdC52YWx1ZSkgPCAwKSB7XG4gICAgICAgZmlsdGVyZWRWYWx1ZXMucHVzaChyZXN1bHQudmFsdWUpO1xuICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgIH1cbiAgIH0pO1xuICAgcmVzdWx0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgcmV0dXJuIGEucmVsZXZhbmNlIDwgYi5yZWxldmFuY2U7XG4gICB9KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuXG5cbi8qIEludGVyZmFjZSAqL1xuZnVuY3Rpb24gbmZvcm1hdChudW1iZXIsIHBhdHRlcm4sIGxvY2FsZSkge1xuICByZXR1cm4gZm9ybWF0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG4gXG5uZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgcmV0dXJuIGRldGVjdC5jYWxsKHRoaXMsIHN0cmluZywgcGF0dGVybiwgbG9jYWxlKS5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfSlbMF07XG59O1xuXG5uZm9ybWF0LmRldGVjdCA9IGZ1bmN0aW9uKG51bWJlciwgc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgaWYgKHR5cGVvZiBudW1iZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gQ2Fubm90IGFjY3VyYXRlbHkgZGV0ZXJtaW5lIHBhdHRlcm4gYW5kIGxvY2FsZVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBkZXRlY3QuY2FsbCh0aGlzLCBzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHJldHVybiB0eXBlb2YgbnVtYmVyICE9PSAnbnVtYmVyJyB8fCByZXN1bHQudmFsdWUgPT09IG51bWJlcjtcbiAgfSkubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHJldHVybiB7XG4gICAgICBsb2NhbGU6IHJlc3VsdC5sb2NhbGUsXG4gICAgICBwYXR0ZXJuOiByZXN1bHQucGF0dGVyblxuICAgIH07XG4gIH0pWzBdO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5mb3JtYXQ7IiwidmFyIF92ID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgXG4gIHZhciBcbiAgICBTVkdfTkFNRVNQQUNFX1VSSSA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcbiAgICBNQVRIID0gTWF0aCxcbiAgICBQSSA9IE1BVEguUEksXG4gICAgY29zID0gTUFUSC5jb3MsXG4gICAgc2luID0gTUFUSC5zaW4sXG4gICAgc3FydCA9IE1BVEguc3FydCxcbiAgICBwb3cgPSBNQVRILnBvdyxcbiAgICBmbG9vciA9IE1BVEguZmxvb3IsXG4gIFxuICAgIC8qKlxuICAgICAqIFJvdW5kcyBhIG51bWJlciB0byBwcmVjaXNpb25cbiAgICAgKi8gXG4gICAgcm91bmQgPSBmdW5jdGlvbihudW0sIGRpZ2l0cykge1xuICAgICAgZGlnaXRzID0gdHlwZW9mIGRpZ2l0cyA9PT0gJ251bWJlcicgPyBkaWdpdHMgOiAxO1xuICAgICAgaWYgKHR5cGVvZiBudW0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAodmFyIHggaW4gbnVtKSB7XG4gICAgICAgICAgbnVtW3hdID0gcm91bmQobnVtW3hdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQWN0dWFsbHkgcm91bmQgbnVtYmVyXG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQobnVtKTtcbiAgICAgICAgaWYgKCFpc05hTih2YWx1ZSkgJiYgbmV3IFN0cmluZyh2YWx1ZSkubGVuZ3RoID09PSBuZXcgU3RyaW5nKG51bSkubGVuZ3RoKSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlLnRvRml4ZWQoZGlnaXRzKSk7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtO1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIENhbWVsaXplIGEgc3RyaW5nXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICAgICAqLyBcbiAgICBjYW1lbGl6ZSA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWNoZSA9IHt9O1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgICByZXR1cm4gY2FjaGVbc3RyaW5nXSA9IGNhY2hlW3N0cmluZ10gfHwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKFxcLVthLXpdKS9nLCBmdW5jdGlvbigkMSl7cmV0dXJuICQxLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgnLScsJycpO30pO1xuICAgICAgICB9KSgpO1xuICAgICAgfTtcbiAgICB9KSgpLFxuICBcbiAgICAvKipcbiAgICAgKiBIeXBoZW5hdGUgYSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gICAgICovXG4gICAgaHlwaGVuYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhY2hlID0ge307XG4gICAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBjYWNoZVtzdHJpbmddID0gY2FjaGVbc3RyaW5nXSB8fCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKCQxKXtyZXR1cm4gXCItXCIrJDEudG9Mb3dlckNhc2UoKTt9KTtcbiAgICAgICAgfSkoKTtcbiAgICAgIH07XG4gICAgfSkoKSxcbiAgXG4gICAgLyoqXG4gICAgICogRXh0ZW5kcyBhbiBvYmplY3RcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRydWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVzdGluYXRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlXG4gICAgICovXG4gICAgZXh0ZW5kID0gZnVuY3Rpb24oZGVlcCwgZGVzdGluYXRpb24sIHNvdXJjZSkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsIGkgPSB0eXBlb2YgZGVlcCA9PT0gJ2Jvb2xlYW4nID8gMiA6IDEsIGRlc3QgPSBhcmd1bWVudHNbaSAtIDFdLCBzcmMsIHByb3AsIHZhbHVlO1xuICAgICAgZm9yICg7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNyYyA9IGFyZ3NbaV07XG4gICAgICAgIGZvciAocHJvcCBpbiBzcmMpIHtcbiAgICAgICAgICB2YWx1ZSA9IHNyY1twcm9wXTtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICBkZXN0W3Byb3BdID0gZGVzdFtwcm9wXSB8fCB7fTtcbiAgICAgICAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICAgICAgICBleHRlbmQodHJ1ZSwgZGVzdFtwcm9wXSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkZXN0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVzdDtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRvIEFycmF5XG4gICAgICogQHBhcmFtIHtCb29sZWFufSB0cnVlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlc3RpbmF0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZVxuICAgICAqL1xuICAgIHRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIFxuICAgICAgLy9yZXR1cm4gb2JqICYmIChvYmoubGVuZ3RoICYmIFtdLnNsaWNlLmNhbGwob2JqKSB8fCBbb2JqXSk7XG4gICAgICBcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGwgPSBvYmogJiYgb2JqLmxlbmd0aCB8fCAwLCBpLCByZXN1bHQgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKG9ialtpXSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKG9ialtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdC5sZW5ndGggJiYgcmVzdWx0IHx8IFtvYmpdO1xuICAgIH0sXG4gICAgXG4gICAgLy8gRE9NIE1hbmlwdWxhdGlvblxuICAgIFxuICAgIHBhcmVudCA9IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHJldHVybiBlbGVtLnBhcmVudE5vZGU7XG4gICAgfSxcbiAgICBcbiAgICBhcHBlbmQgPSBmdW5jdGlvbiggcGFyZW50LCBjaGlsZCApIHtcbiAgICAgIHBhcmVudCA9IHBhcmVudCAmJiBwYXJlbnRbMF0gfHwgcGFyZW50O1xuICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQuYXBwZW5kQ2hpbGQpIHtcbiAgICAgICAgdG9BcnJheShjaGlsZCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgcHJlcGVuZCA9IGZ1bmN0aW9uKCBwYXJlbnQsIGNoaWxkICkge1xuICAgICAgcGFyZW50ID0gcGFyZW50WzBdIHx8IHBhcmVudDtcbiAgICAgIHRvQXJyYXkoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgcGFyZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICByZW1vdmUgPSBmdW5jdGlvbiggZWxlbSwgY2hpbGQgKSB7XG4gICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgdG9BcnJheShjaGlsZCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgIGVsZW0ucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoZWxlbS5wYXJlbnROb2RlKSB7XG4gICAgICAgIGVsZW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGh0bWwgPSBmdW5jdGlvbihlbGVtLCBzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcpIHtcbiAgICAgICAgZWxlbS5pbm5lckhUTUwgPSBzdHJpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWxlbS5pbm5lckhUTUw7XG4gICAgfSxcbiAgICBcbiAgICB0ZXh0ID0gZnVuY3Rpb24oZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0udGV4dENvbnRlbnQ7XG4gICAgfSxcbiAgICBcbiAgICBhdHRyID0gZnVuY3Rpb24gKGVsZW0sIG5hbWUsIHZhbHVlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbnVsbCwgb2JqID0ge30sIHByb3AsIHB4ID0gWyd4JywgJ3knLCAnZHgnLCAnZHknLCAnY3gnLCAnY3knXTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgb2JqID0gbmFtZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgb2JqW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBtYXBTdHlsZXMobmFtZSkge1xuICAgICAgICByZXR1cm4gaHlwaGVuYXRlKG5hbWUpICsgXCI6IFwiICsgdmFsdWVbbmFtZV07XG4gICAgICB9XG4gICAgICBpZiAoT2JqZWN0LmtleXMob2JqKS5sZW5ndGgpIHtcbiAgICAgICAgZm9yIChuYW1lIGluIG9iaikge1xuICAgICAgICAgIHByb3AgPSB0eXBlb2YgZWxlbVtjYW1lbGl6ZShuYW1lKV0gIT09ICd1bmRlZmluZWQnID8gY2FtZWxpemUobmFtZSkgOiBoeXBoZW5hdGUobmFtZSk7XG4gICAgICAgICAgdmFsdWUgPSBvYmpbbmFtZV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vIFNldFxuICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdzdHlsZScgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IE9iamVjdC5rZXlzKHZhbHVlKS5tYXAobWFwU3R5bGVzKS5qb2luKFwiOyBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gcHguaW5kZXhPZihwcm9wKSA+PSAwID8gcm91bmQodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKHByb3AsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIC8vIEdldFxuICAgICAgICAgICAgcmVzdWx0ID0gZWxlbS5nZXRBdHRyaWJ1dGUocHJvcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gIFxuICAgIGNzcyA9IGZ1bmN0aW9uKGVsZW0sIG5hbWUsIHZhbHVlKSB7XG4gICAgICB2YXIgbWFwID0ge30sIGNzc1RleHQgPSBudWxsO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtYXAgPSBuYW1lO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbWFwW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgICBjc3NUZXh0ID0gT2JqZWN0LmtleXMobWFwKS5tYXAoZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gaHlwaGVuYXRlKG5hbWUpICsgXCI6IFwiICsgbWFwW25hbWVdO1xuICAgICAgfSkuam9pbihcIjsgXCIpO1xuICAgICAgaWYgKGNzc1RleHQgJiYgY3NzVGV4dC5sZW5ndGgpIHtcbiAgICAgICAgZWxlbS5zdHlsZS5jc3NUZXh0ID0gZWxlbS5zdHlsZS5jc3NUZXh0ICsgY3NzVGV4dDtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWxlbS5zdHlsZVtuYW1lXSB8fCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xuICAgIH0sXG4gICAgXG4gICAgYWRkQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgIH0sXG4gICAgXG4gICAgaGFzQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgICAgIHJldHVybiBlbGVtLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xuICAgIH0sXG4gICAgXG4gICAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgIH0sXG4gICAgXG4gICAgdG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgICAgIGVsZW0uY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogR2V0cyBhIHBhaXIgb2YgYmV6aWVyIGNvbnRyb2wgcG9pbnRzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHgwXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkwXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHgxXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkxXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHgyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRcbiAgICAgKi9cbiAgICBnZXRDb250cm9sUG9pbnRzID0gZnVuY3Rpb24oIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHQgKSB7XG4gICAgICB0ID0gdHlwZW9mIHQgPT09ICdudW1iZXInID8gdCA6IDAuNTtcbiAgICAgIHZhclxuICAgICAgICBkMDEgPSBzcXJ0KCBwb3coIHgxIC0geDAsIDIgKSArIHBvdyggeTEgLSB5MCwgMiApICksXG4gICAgICAgIGQxMiA9IHNxcnQoIHBvdyggeDIgLSB4MSwgMiApICsgcG93KCB5MiAtIHkxLCAyICkgKSxcbiAgICAgICAgZmEgPSB0ICogZDAxIC8gKCBkMDEgKyBkMTIgKSwgICAvLyBzY2FsaW5nIGZhY3RvciBmb3IgdHJpYW5nbGUgVGFcbiAgICAgICAgZmIgPSB0ICogZDEyIC8gKCBkMDEgKyBkMTIgKSwgICAvLyBkaXR0byBmb3IgVGIsIHNpbXBsaWZpZXMgdG8gZmI9dC1mYVxuICAgICAgICBwMXggPSB4MSAtIGZhICogKCB4MiAtIHgwICksICAgIC8vIHgyLXgwIGlzIHRoZSB3aWR0aCBvZiB0cmlhbmdsZSBUXG4gICAgICAgIHAxeSA9IHkxIC0gZmEgKiAoIHkyIC0geTAgKSwgICAgLy8geTIteTAgaXMgdGhlIGhlaWdodCBvZiBUXG4gICAgICAgIHAyeCA9IHgxICsgZmIgKiAoIHgyIC0geDAgKSxcbiAgICAgICAgcDJ5ID0geTEgKyBmYiAqICggeTIgLSB5MCApO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcDE6IHt4OiBwMXgsIHk6IHAxeX0sIFxuICAgICAgICBwMjoge3g6IHAyeCwgeTogcDJ5fVxuICAgICAgfTtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBTZXJpYWxpemVzIHBvaW50cyBhcyBzdmcgcGF0aCBkZWZpbml0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheX0gcG9pbnRzXG4gICAgICovXG4gICAgZ2V0UGF0aCA9IGZ1bmN0aW9uKCBwb2ludHMgKSB7XG4gICAgICByZXR1cm4gcG9pbnRzLm1hcChmdW5jdGlvbihwb2ludCkge1xuICAgICAgICByZXR1cm4gcG9pbnQueCArIFwiLFwiICsgcG9pbnQueTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH0sXG4gIFxuICBcbiAgICAvKipcbiAgICAgKiBWaXN1YWxpc3QgcXVlcnkgY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBfdiA9IGZ1bmN0aW9uKHNlbGVjdG9yLCB3aWR0aCwgaGVpZ2h0LCBhdHRycykge1xuICAgICAgdmFyIGFyZywgaSwgcywgdywgaCwgYSwgc2V0O1xuICAgICAgZm9yIChpID0gMCwgYXJnOyBhcmcgPSBhcmd1bWVudHNbaV07IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKHBhcnNlRmxvYXQoYXJnKSkpIHtcbiAgICAgICAgICAvLyBOdW1lcmljXG4gICAgICAgICAgYXJnID0gdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgPyBwYXJzZUZsb2F0KGFyZykgKyBcInB4XCIgOiBhcmc7XG4gICAgICAgICAgaWYgKHR5cGVvZiB3ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdyA9IGFyZztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAvLyBQbGFpbiBvYmplY3RcbiAgICAgICAgICBhID0gYXJnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZSBtYXkgYmUgYSBzZWxlY3RvclxuICAgICAgICAgIHMgPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNldCA9IHMgaW5zdGFuY2VvZiBWaXN1YWxpc3QgPyBzIDogbmV3IFZpc3VhbGlzdChzKTtcbiAgICAgIHNldC5hdHRyKGV4dGVuZCh0cnVlLCBhIHx8IHt9LCB7XG4gICAgICAgIHdpZHRoOiB3LCBcbiAgICAgICAgaGVpZ2h0OiBoXG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gc2V0O1xuICAgIH07XG5cbiAgLyoqXG4gICAqIFZpc3VhbGlzdCBDbGFzc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAgICovXG5cbiAgZnVuY3Rpb24gVmlzdWFsaXN0KHNlbGVjdG9yKSB7XG4gICAgdmFyIHNldCA9IG51bGwsIGVsZW0sIHJlc3VsdCwgaSwgc3ZnO1xuICAgIC8vIENvbGxlY3QgY29uc3RydWN0b3IgYXJnc1xuICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdvYmplY3QnICYmIHNlbGVjdG9yLm5hbWVzcGFjZVVSSSA9PT0gU1ZHX05BTUVTUEFDRV9VUkkpIHtcbiAgICAgIC8vIEV4aXN0aW5nIEVsZW1lbnRcbiAgICAgIHNldCA9IFtzZWxlY3Rvcl07XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBTZWxlY3RvclxuICAgICAgcmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICBmb3IgKGkgPSAwLCBlbGVtOyBlbGVtID0gcmVzdWx0W2ldOyBpKyspIHtcbiAgICAgICAgaWYgKGVsZW0ubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFX1VSSSApIHtcbiAgICAgICAgICBzZXQgPSBzZXQgfHwgW107XG4gICAgICAgICAgc2V0LnB1c2goZWxlbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzZXQpIHtcbiAgICAgIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTkFNRVNQQUNFX1VSSSwgJ3N2ZycpO1xuICAgICAgc3ZnLnNldEF0dHJpYnV0ZShcInhtbG5zXCIsIFNWR19OQU1FU1BBQ0VfVVJJKTtcbiAgICAgIHNldCA9IFtzdmddO1xuICAgIH1cbiAgICB0aGlzLnB1c2guYXBwbHkodGhpcywgc2V0IHx8IFtdKTtcbiAgfVxuICBcbiAgVmlzdWFsaXN0LnByb3RvdHlwZSA9IFtdO1xuICBcbiAgLy8gU3RhdGljIG1ldGhvZHNcbiAgX3YuZXh0ZW5kID0gZXh0ZW5kO1xuICBfdi5hdHRyID0gYXR0cjtcbiAgX3YuY3NzID0gY3NzO1xuICBcbiAgLy8gUGx1Z2luIEFQSVxuICBfdi5mbiA9IFZpc3VhbGlzdC5wcm90b3R5cGU7XG4gIFxuICAvKipcbiAgICogRXh0ZW5kcyB2aXN1YWxpc3QgcHJvdG90eXBlXG4gICAqIEBwYXJhbSB7QXJyYXl9IG1ldGhvZHNcbiAgICovXG4gIF92LmZuLmV4dGVuZCA9IGZ1bmN0aW9uKCBtZXRob2RzICkge1xuICAgIGZvciAodmFyIHggaW4gbWV0aG9kcykge1xuICAgICAgVmlzdWFsaXN0LnByb3RvdHlwZVt4XSA9IG1ldGhvZHNbeF07XG4gICAgfVxuICB9O1xuICBcbiAgLy8gUHJpdmF0ZSBDb21wb25lbnRzXG4gIFxuICAvKipcbiAgICogRHJhdyBiYXNpYyBzaGFwZXNcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICogQHBhcmFtIHtBcnJheX0gY2hpbGRyZW4gXG4gICAqL1xuICBmdW5jdGlvbiBzaGFwZSh0YWdOYW1lLCBwYXJhbXMsIGF0dHJzLCBjaGlsZHJlbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgX3YoZWxlbSkuYXBwZW5kKHNlbGYuY3JlYXRlKHRhZ05hbWUsIGV4dGVuZCh0cnVlLCB7fSwgYXR0cnMsIHJvdW5kKHBhcmFtcykpKS5hcHBlbmQoY2hpbGRyZW4pKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLy8gUHVibGljIENvbXBvbmVudHNcbiAgXG4gIF92LmZuLmV4dGVuZCh7XG4gICAgXG4gICAgc2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5sZW5ndGg7XG4gICAgfSxcbiAgICBcbiAgICB0b0FycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0b0FycmF5KHRoaXMpO1xuICAgIH0sXG4gICAgXG4gICAgZ2V0OiBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGluZGV4ICE9PSAndW5kZWZpbmVkJyA/IGluZGV4IDwgMCA/IHRoaXNbdGhpcy5sZW5ndGggLSBpbmRleF0gOiB0aGlzW2luZGV4XSA6IHRoaXMudG9BcnJheSgpO1xuICAgIH0sXG4gICAgXG4gICAgaW5kZXg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXNbMF0gJiYgdG9BcnJheSh0aGlzWzBdLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YodGhpc1swXSkgfHwgLTE7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoZSBzcGVjaWZpZWQgY2hpbGQgdG8gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2hpbGRcbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKCBjaGlsZCApIHtcbiAgICAgIGlmICh0aGlzWzBdKSB7XG4gICAgICAgIGFwcGVuZCh0aGlzWzBdLCBjaGlsZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhlIGN1cnJlbnQgc2V0IG9mIGVsZW1lbnRzIHRvIHRoZSBzcGVjaWZpZWQgcGFyZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gICAgICovXG4gICAgYXBwZW5kVG86IGZ1bmN0aW9uKCBwYXJlbnQgKSB7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgYXBwZW5kKHBhcmVudCwgZWxlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQcmVwZW5kcyB0aGUgc3BlY2lmaWVkIGNoaWxkIHRvIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gICAgICovXG4gICAgcHJlcGVuZDogZnVuY3Rpb24oIGNoaWxkICkge1xuICAgICAgaWYgKHRoaXNbMF0pIHtcbiAgICAgICAgcHJlcGVuZCh0aGlzWzBdLCBjaGlsZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFByZXBlbmRzIHRoZSBjdXJyZW50IHNldCBvZiBlbGVtZW50cyB0byB0aGUgc3BlY2lmaWVkIHBhcmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuICAgICAqL1xuICAgIHByZXBlbmRUbzogZnVuY3Rpb24oIHBhcmVudCApIHtcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIHByZXBlbmQocGFyZW50LCBlbGVtKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBpbiB0aGUgc2V0IG9yIHJlbW92ZXMgdGhlIHNwZWNpZmllZCBjaGlsZCBmcm9tIHRoZSBzZXQgb2YgbWF0Y2hlZCBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2hpbGRcbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCBjaGlsZCApIHtcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIHJlbW92ZShlbGVtLCBjaGlsZCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBjaGlsZHJlbiBmcm9tIGVsZW1lbnRzIGluIHRoZSBzZXRcbiAgICAgKi9cbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW0uY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGVsZW0ucmVtb3ZlQ2hpbGQoZWxlbS5jaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICBpLS07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwYXJlbnQgbm9kZSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqL1xuICAgIHBhcmVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpc1swXSAmJiBwYXJlbnQodGhpc1swXSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBmb3IgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzIG9yIHNldCBvbmUgb3IgbW9yZSBhdHRyaWJ1dGVzIGZvciBldmVyeSBtYXRjaGVkIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAgICAgKi9cbiAgICBhdHRyOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcztcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIHZhciByZXQgPSBhdHRyKGVsZW0sIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgaWYgKHJldCAhPT0gbnVsbCkge1xuICAgICAgICAgIHJlc3VsdCA9IHJldDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhIGNvbXB1dGVkIHN0eWxlIHByb3BlcnR5IGZvciB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0IG9mIG1hdGNoZWQgZWxlbWVudHMgb3Igc2V0IG9uZSBvciBtb3JlIENTUyBwcm9wZXJ0aWVzIGZvciBldmVyeSBtYXRjaGVkIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAgICAgKi9cbiAgICBjc3M6IGZ1bmN0aW9uKCBuYW1lLCB2YWx1ZSApIHtcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzO1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgdmFyIHJldCA9IGNzcyhlbGVtLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIGlmIChyZXQgIT09IG51bGwpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZlZCB0YWduYW1lLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWdOYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbiggdGFnTmFtZSwgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gX3YoKHRoaXNbMF0gJiYgdGhpc1swXS5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50KS5jcmVhdGVFbGVtZW50TlModGhpc1swXSAmJiB0aGlzWzBdLm5hbWVzcGFjZVVSSSB8fCBTVkdfTkFNRVNQQUNFX1VSSSwgdGFnTmFtZSkpLmF0dHIoYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0cyBvciBzZXRzIHRoZSB3aWR0aCBvbiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXG4gICAgICovXG4gICAgd2lkdGg6IGZ1bmN0aW9uKCB3aWR0aCApIHtcbiAgICAgIC8vY29uc29sZS53YXJuKFwiZGVwcmVjYXRlZFwiKTtcbiAgICAgIGlmICh0eXBlb2Ygd2lkdGggPT09ICd1bmRlZmluZWQnICYmIHRoaXNbMF0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICB9XG4gICAgICB0aGlzLmF0dHIoJ3dpZHRoJywgd2lkdGgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXRzIG9yIHNldHMgdGhlIGhlaWdodCBvbiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGhlaWdodDogZnVuY3Rpb24oIGhlaWdodCApIHtcbiAgICAgIC8vY29uc29sZS53YXJuKFwiZGVwcmVjYXRlZFwiKTtcbiAgICAgIGlmICh0eXBlb2YgaGVpZ2h0ID09PSAndW5kZWZpbmVkJyAmJiB0aGlzWzBdKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSBib3VuZGluZyBib3ggb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKi9cbiAgICBiYm94OiBmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBiID0gdGhpc1swXSAmJiB0aGlzWzBdLmdldEJCb3goKTtcbiAgICAgICAgYiA9IHtcbiAgICAgICAgICB4OiBiLngsXG4gICAgICAgICAgeTogYi55LFxuICAgICAgICAgIHdpZHRoOiBiLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogYi5oZWlnaHRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiB7eDogMCwgeTogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07XG4gICAgICB9IFxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSBjb21wdXRlZCB0ZXh0IGxlbmd0aCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0IGlmIGFwcGxpY2FibGUuXG4gICAgICovXG4gICAgY29tcHV0ZWRUZXh0TGVuZ3RoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzWzBdICYmIHRoaXNbMF0uZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgZ3JvdXAgbGF5ZXIgb24gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIGc6IGZ1bmN0aW9uKCBhdHRycyApIHtcbiAgICAgIHZhciBnID0gdGhpcy5jcmVhdGUoJ2cnLCBhdHRycyk7XG4gICAgICBfdih0aGlzWzBdKS5hcHBlbmQoZyk7XG4gICAgICByZXR1cm4gZztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGEgY2lyY2xlIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY3hcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY3lcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIGNpcmNsZTogZnVuY3Rpb24oIGN4LCBjeSwgciwgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCBcImNpcmNsZVwiLCB7XG4gICAgICAgIGN4OiBjeCwgXG4gICAgICAgIGN5OiBjeSwgXG4gICAgICAgIHI6IHJcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGFuIGVsbGlwc2Ugb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByeVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIGVsbGlwc2U6IGZ1bmN0aW9uKCBjeCwgY3ksIHJ4LCByeSwgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCBcImVsbGlwc2VcIiwge1xuICAgICAgICBjeDogY3gsIFxuICAgICAgICBjeTogY3ksIFxuICAgICAgICByeDogcngsXG4gICAgICAgIHJ5OiByeVxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSByZWN0YW5nbGUgb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgcmVjdDogZnVuY3Rpb24oIHgsIHksIHdpZHRoLCBoZWlnaHQsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgXCJyZWN0XCIsIHtcbiAgICAgICAgeDogeCwgXG4gICAgICAgIHk6IHksIFxuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIGxpbmUgb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5MVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5MlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIGxpbmU6IGZ1bmN0aW9uKCB4MSwgeTEsIHgyLCB5MiwgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCBcImxpbmVcIiwge1xuICAgICAgICB4MTogeDEsXG4gICAgICAgIHkxOiB5MSxcbiAgICAgICAgeDI6IHgyLFxuICAgICAgICB5MjogeTJcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGEgcG9seWdvbiBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIHBvbHlnb246IGZ1bmN0aW9uKCBwb2ludHMsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgJ3BvbHlnb24nLCB7XG4gICAgICAgIHBvaW50czogZ2V0UGF0aChwb2ludHMpXG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIHBvbHlnb24gb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBwb2x5bGluZTogZnVuY3Rpb24oIHBvaW50cywgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCAncG9seWxpbmUnLCB7XG4gICAgICAgIHBvaW50czogZ2V0UGF0aChwb2ludHMpXG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIHBhdGggb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgcGF0aDogZnVuY3Rpb24oIGQsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgJ3BhdGgnLCB7ZDogZH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGV4dCBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICB0ZXh0OiBmdW5jdGlvbiggeCwgeSwgc3RyaW5nLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsICd0ZXh0Jywge1xuICAgICAgICB4OiB4LCBcbiAgICAgICAgeTogeVxuICAgICAgfSwgYXR0cnMsIFsodGhpc1swXSAmJiB0aGlzWzBdLm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQpLmNyZWF0ZVRleHROb2RlKHN0cmluZyldKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgYSBzbW9vdGggZ3JhcGggb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqL1xuICAgIGdyYXBoOiBmdW5jdGlvbiggcG9pbnRzLCBvcHRpb25zICkge1xuICAgICAgXG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICBcbiAgICAgICAgdmFyXG4gICAgICAgICAgb3B0cyA9IGV4dGVuZCh7XG4gICAgICAgICAgICBzbW9vdGg6IGZhbHNlLCBcbiAgICAgICAgICAgIHRlbnNpb246IDAuNCxcbiAgICAgICAgICAgIGFwcHJveGltYXRlOiB0cnVlXG4gICAgICAgICAgfSwgb3B0aW9ucyksXG4gICAgICAgICAgdCA9ICFpc05hTiggb3B0cy50ZW5zaW9uICkgPyBvcHRzLnRlbnNpb24gOiAwLjUsXG4gICAgICAgICAgZWwgPSBfdihlbGVtKSwgXG4gICAgICAgICAgcCxcbiAgICAgICAgICBpLFxuICAgICAgICAgIGMsXG4gICAgICAgICAgZCxcbiAgICAgICAgICBwMSxcbiAgICAgICAgICBwMixcbiAgICAgICAgICBjcHMsXG4gICAgICAgICAgcGF0aCA9IGVsLmNyZWF0ZSgncGF0aCcpLFxuICAgICAgICAgIHBhdGhTdHIgPSBcIlwiO1xuICAgICAgICAgIFxuICAgICAgICBlbC5hcHBlbmQocGF0aCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIW9wdHMuc21vb3RoKSB7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHAgPSBwb2ludHNbaV07XG4gICAgICAgICAgICBwYXRoU3RyKz0gaSA+IDAgPyBcIkxcIiA6IFwiTVwiO1xuICAgICAgICAgICAgcGF0aFN0cis9IHJvdW5kKHAueCkgKyBcIiBcIiArIHJvdW5kKHAueSkgKyBcIiBcIjtcbiAgICAgICAgICB9IFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNtb290aFxuICAgICAgICAgIGlmIChvcHRzLmFwcHJveGltYXRlKSB7XG4gICAgICAgICAgICBwID0gcG9pbnRzWzBdO1xuICAgICAgICAgICAgcGF0aFN0cis9IFwiTVwiICsgcm91bmQocC54KSArIFwiIFwiICsgcm91bmQocC55KSArIFwiIFwiO1xuICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjID0gKHBvaW50c1tpXS54ICsgcG9pbnRzW2kgKyAxXS54KSAvIDI7XG4gICAgICAgICAgICAgICAgZCA9IChwb2ludHNbaV0ueSArIHBvaW50c1tpICsgMV0ueSkgLyAyO1xuICAgICAgICAgICAgICAgIHBhdGhTdHIrPSBcIlFcIiArIHJvdW5kKHBvaW50c1tpXS54KSArIFwiIFwiICsgcm91bmQocG9pbnRzW2ldLnkpICsgXCIgXCIgKyBjICsgXCIgXCIgKyBkICsgXCIgXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoU3RyKz0gXCJUXCIgKyByb3VuZChwb2ludHNbaV0ueCkgKyBcIiBcIiArIHJvdW5kKHBvaW50c1tpXS55KSArIFwiIFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwID0gcG9pbnRzWzBdO1xuICAgICAgICAgICAgcGF0aFN0cis9IFwiTVwiICsgcC54ICsgXCIgXCIgKyBwLnkgKyBcIiBcIjtcbiAgICAgICAgICAgIGZvciAoaSA9IDE7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSs9MSkge1xuICAgICAgICAgICAgICBwID0gcG9pbnRzW2kgLSAxXTtcbiAgICAgICAgICAgICAgcDEgPSBwb2ludHNbaV07XG4gICAgICAgICAgICAgIHAyID0gcG9pbnRzW2kgKyAxXTtcbiAgICAgICAgICAgICAgY3BzID0gZ2V0Q29udHJvbFBvaW50cyhwLngsIHAueSwgcDEueCwgcDEueSwgcDIueCwgcDIueSwgdCk7XG4gICAgICAgICAgICAgIHBhdGhTdHIrPSBcIkNcIiArIHJvdW5kKGNwcy5wMS54KSArIFwiIFwiICsgcm91bmQoY3BzLnAxLnkpICsgXCIgXCIgKyByb3VuZChjcHMucDIueCkgKyBcIiBcIiArIHJvdW5kKGNwcy5wMi55KSArIFwiIFwiICsgcm91bmQocDIueCkgKyBcIiBcIiArIHJvdW5kKHAyLnkpICsgXCIgXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoU3RyKz0gXCJUXCIgKyByb3VuZChwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdLngpICsgXCIgXCIgKyByb3VuZChwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdLnkpICsgXCIgXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkZWxldGUgb3B0cy5zbW9vdGg7XG4gICAgICAgIGRlbGV0ZSBvcHRzLnRlbnNpb247XG4gICAgICAgIGRlbGV0ZSBvcHRzLmFwcHJveGltYXRlO1xuICAgICAgICBcbiAgICAgICAgcGF0aC5hdHRyKGV4dGVuZCh7XG4gICAgICAgICAgZmlsbDogJ25vbmUnXG4gICAgICAgIH0sIG9wdHMsIHtcbiAgICAgICAgICBkOiBwYXRoU3RyXG4gICAgICAgIH0pKTtcbiAgICAgICAgXG4gICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBhcmMoKSBtZXRob2QgY3JlYXRlcyBhbiBhcmMvY3VydmUgKHVzZWQgdG8gY3JlYXRlIGNpcmNsZXMsIG9yIHBhcnRzIG9mIGNpcmNsZXMpLiBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc0FuZ2xlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGVBbmdsZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gY291bnRlcmNsb2Nrd2lzZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIGFyYzogZnVuY3Rpb24oY3gsIGN5LCByLCBzQW5nbGUsIGVBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSwgYXR0cnMpIHtcbiAgICAgIGNvdW50ZXJjbG9ja3dpc2UgPSB0eXBlb2YgY291bnRlcmNsb2Nrd2lzZSA9PT0gJ2Jvb2xlYW4nID8gY291bnRlcmNsb2Nrd2lzZSA6IGZhbHNlO1xuICAgICAgdmFyXG4gICAgICAgIGQgPSAnTSAnICsgcm91bmQoY3gpICsgJywgJyArIHJvdW5kKGN5KSxcbiAgICAgICAgY3hzLFxuICAgICAgICBjeXMsXG4gICAgICAgIGN4ZSxcbiAgICAgICAgY3llO1xuICAgICAgaWYgKGVBbmdsZSAtIHNBbmdsZSA9PT0gTWF0aC5QSSAqIDIpIHtcbiAgICAgICAgLy8gQ2lyY2xlXG4gICAgICAgIGQrPSAnIG0gLScgKyByICsgJywgMCBhICcgKyByICsgJywnICsgciArICcgMCAxLDAgJyArIChyICogMikgKyAnLDAgYSAnICsgciArICcsJyArIHIgKyAnIDAgMSwwIC0nICsgKHIgKiAyKSArICcsMCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjeHMgPSByb3VuZChjeCArIGNvcyhzQW5nbGUpICogcik7XG4gICAgICAgIGN5cyA9IHJvdW5kKGN5ICsgc2luKHNBbmdsZSkgKiByKTtcbiAgICAgICAgY3hlID0gcm91bmQoY3ggKyBjb3MoZUFuZ2xlKSAqIHIpO1xuICAgICAgICBjeWUgPSByb3VuZChjeSArIHNpbihlQW5nbGUpICogcik7XG4gICAgICAgIGQrPSBcIiBMXCIgKyBjeHMgKyBcIixcIiArIGN5cyArXG4gICAgICAgICAgXCIgQVwiICsgciArIFwiLFwiICsgciArIFwiIDAgXCIgKyAoZUFuZ2xlIC0gc0FuZ2xlID4gUEkgPyAxIDogMCkgKyBcIixcIiArIChjb3VudGVyY2xvY2t3aXNlID8gMCA6IDEpICtcbiAgICAgICAgICBcIiBcIiArIGN4ZSArIFwiLFwiICsgY3llICsgXCIgWlwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgXCJwYXRoXCIsIHtcbiAgICAgICAgZDogZFxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0ZXh0IGludG8gYSBib3VuZGluZyBib3ggYnkgd3JhcHBpbmcgbGluZXMgYXQgc3BhY2VzLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB4XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gd2lkdGhcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0cmluZ1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIHRleHRib3g6IGZ1bmN0aW9uKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBzdHJpbmcsIGF0dHJzICkge1xuICAgICAgXG4gICAgICB2YXIgXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgXG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICBcbiAgICAgICAgdmFyXG4gICAgICAgICAgX3ZlbGVtID0gX3YoZWxlbSksXG4gICAgICAgICAgbGluZXMgPSB3aWR0aCA/IFtdIDogW3N0cmluZ10sIFxuICAgICAgICAgIGxpbmUgPSBbXSxcbiAgICAgICAgICBsZW5ndGggPSAwLFxuICAgICAgICAgIHdvcmRzID0gd2lkdGggPyBzdHJpbmcuc3BsaXQoL1xccysvKSA6IFtdLFxuICAgICAgICAgIHRleHQgPSBzZWxmLmNyZWF0ZSgndGV4dCcsIGV4dGVuZCh0cnVlLCB7fSwgYXR0cnMsIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSkpLFxuICAgICAgICAgIHRleHROb2RlLFxuICAgICAgICAgIGxpbmVIZWlnaHQgPSBwYXJzZUZsb2F0KF92ZWxlbS5jc3MoJ2xpbmUtaGVpZ2h0JykpLFxuICAgICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChfdmVsZW0uY3NzKCdmb250LXNpemUnKSksXG4gICAgICAgICAgdGV4dEFsaWduID0gdGV4dC5jc3MoJ3RleHQtYWxpZ24nKSxcbiAgICAgICAgICB0eSA9IDA7XG4gICAgICAgIFxuICAgICAgICBfdmVsZW0uYXBwZW5kKHRleHQpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgIC8vIEJyZWFrIGxpbmVzXG4gICAgICAgICAgdGV4dE5vZGUgPSBlbGVtLm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7XG4gICAgICAgICAgdGV4dC5hcHBlbmQodGV4dE5vZGUpO1xuICAgICAgICAgIHdvcmRzLmZvckVhY2goZnVuY3Rpb24od29yZCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHRleHROb2RlLmRhdGEgPSBsaW5lLmpvaW4oJyAnKSArICcgJyArIHdvcmQ7XG4gICAgICAgICAgICBsZW5ndGggPSB0ZXh0LmNvbXB1dGVkVGV4dExlbmd0aCgpO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA+IHdpZHRoKSB7XG4gICAgICAgICAgICAgIGxpbmVzLnB1c2gobGluZS5qb2luKCcgJykpO1xuICAgICAgICAgICAgICBsaW5lID0gW3dvcmRdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbGluZS5wdXNoKHdvcmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGluZGV4ID09PSB3b3Jkcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGxpbmVzLnB1c2gobGluZS5qb2luKCcgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRleHQucmVtb3ZlKHRleHROb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gUmVuZGVyIGxpbmVzXG4gICAgICAgIGxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSwgaW5kZXgpIHtcbiAgICAgICAgICB2YXIgdHNwYW4sIGR5O1xuICAgICAgICAgIGlmICghaGVpZ2h0IHx8IHR5ICsgcGFyc2VGbG9hdChsaW5lSGVpZ2h0KSA8IGhlaWdodCkge1xuICAgICAgICAgICAgZHkgPSBpbmRleCA+IDAgPyBsaW5lSGVpZ2h0IDogZm9udFNpemUgLSAyO1xuICAgICAgICAgICAgdHkrPSBkeTtcbiAgICAgICAgICAgIHRzcGFuID0gc2VsZi5jcmVhdGUoJ3RzcGFuJywge2R5OiBkeX0pO1xuICAgICAgICAgICAgdGV4dC5hcHBlbmQodHNwYW4pO1xuICAgICAgICAgICAgdHNwYW5cbiAgICAgICAgICAgICAgLmFwcGVuZChlbGVtLm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGluZSkpXG4gICAgICAgICAgICAgIC5hdHRyKCd4JywgcGFyc2VJbnQodGV4dC5hdHRyKCd4JyksIHVuZGVmaW5lZCkgKyAod2lkdGggLSB0c3Bhbi5jb21wdXRlZFRleHRMZW5ndGgoKSkgKiAodGV4dEFsaWduID09PSAnZW5kJyB8fCB0ZXh0QWxpZ24gPT09ICdyaWdodCcgPyAxIDogdGV4dEFsaWduID09PSAnY2VudGVyJyB8fCB0ZXh0QWxpZ24gPT09ICdtaWRkbGUnID8gMC41IDogMCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVuZGVycyBhbiB1bm9yZGVyZWQgbGlzdC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICogQHBhcmFtIHtBcnJheX0gaXRlbXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqL1xuICAgIGxpc3Q6IGZ1bmN0aW9uKCB4LCB5LCBpdGVtcywgb3B0aW9ucyApIHtcbiAgICAgIHJldHVybiB0aGlzLmxpc3Rib3goeCwgeSwgMCwgMCwgaXRlbXMsIG9wdGlvbnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVuZGVycyBhbiB1bm9yZGVyZWQgbGlzdCBpbnRvIHRoZSBzcGVjaWZpZWQgYm91bmRzLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHtBcnJheX0gaXRlbXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqL1xuICAgIGxpc3Rib3g6IGZ1bmN0aW9uKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBpdGVtcywgb3B0aW9ucyApIHtcbiAgICAgIGl0ZW1zID0gdG9BcnJheShpdGVtcykubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJyA/IHtsYWJlbDogaXRlbX0gOiBpdGVtO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHt9LCB7XG4gICAgICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgICAgICBidWxsZXQ6IHtcbiAgICAgICAgICBzaGFwZTogJ2NpcmNsZSdcbiAgICAgICAgfVxuICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICBcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgdG9wID0geTtcbiAgICAgICAgXG4gICAgICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICBcbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIF92ZWxlbSA9IF92KGVsZW0pLFxuICAgICAgICAgICAgaXRlbU9wdHMgPSBleHRlbmQodHJ1ZSwge30sIG9wdGlvbnMsIGl0ZW0pLFxuICAgICAgICAgICAgaG9yaXpvbnRhbCA9IGl0ZW1PcHRzLmhvcml6b250YWwsXG4gICAgICAgICAgICBzaGFwZSA9IGl0ZW1PcHRzLmJ1bGxldC5zaGFwZSxcbiAgICAgICAgICAgIGxhYmVsID0gaXRlbU9wdHMubGFiZWwsXG4gICAgICAgICAgICBidWxsZXRBdHRycyxcbiAgICAgICAgICAgIGl0ZW1MYXllciA9IF92ZWxlbS5nKCksXG4gICAgICAgICAgICBsaW5lSGVpZ2h0ID0gcGFyc2VGbG9hdChfdmVsZW0uY3NzKCdsaW5lLWhlaWdodCcpKSxcbiAgICAgICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChfdmVsZW0uY3NzKCdmb250LXNpemUnKSksXG4gICAgICAgICAgICBidWxsZXRTaXplID0gcm91bmQoZm9udFNpemUgKiAwLjY1KSxcbiAgICAgICAgICAgIHNwYWNpbmcgPSBsaW5lSGVpZ2h0ICogMC4yLFxuICAgICAgICAgICAgaXRlbVdpZHRoLFxuICAgICAgICAgICAgaXRlbUhlaWdodDtcbiAgICAgICAgICBcbiAgICAgICAgICBkZWxldGUgaXRlbU9wdHMuYnVsbGV0LnNoYXBlO1xuICAgICAgICAgIGRlbGV0ZSBpdGVtT3B0cy5ob3Jpem9udGFsO1xuICAgICAgICAgIGRlbGV0ZSBpdGVtT3B0cy5sYWJlbDtcbiAgICAgICAgICBcbiAgICAgICAgICBidWxsZXRBdHRycyA9IGV4dGVuZCh0cnVlLCB7fSwgaXRlbU9wdHMsIGl0ZW1PcHRzLmJ1bGxldCk7IFxuICAgICAgICAgIFxuICAgICAgICAgIGRlbGV0ZSBpdGVtT3B0cy5idWxsZXQ7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGhlaWdodCAmJiB5ICsgZm9udFNpemUgPiB0b3AgKyBoZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUmVuZGVyIGJ1bGxldFxuICAgICAgICAgIGlmIChzaGFwZSA9PT0gJ2NpcmNsZScpIHtcbiAgICAgICAgICAgIGl0ZW1MYXllci5jaXJjbGUoeCArIGJ1bGxldFNpemUgLyAyLCB5ICsgKGZvbnRTaXplIC0gYnVsbGV0U2l6ZSkgLyAyICsgYnVsbGV0U2l6ZSAvIDIsIGJ1bGxldFNpemUgLyAyLCBidWxsZXRBdHRycyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW1MYXllci5yZWN0KHgsIHJvdW5kKHkpICsgKGZvbnRTaXplIC0gYnVsbGV0U2l6ZSkgLyAyLCBidWxsZXRTaXplLCBidWxsZXRTaXplLCBidWxsZXRBdHRycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlbmRlciBsYWJlbFxuICAgICAgICAgIGl0ZW1MYXllci50ZXh0Ym94KHggKyBidWxsZXRTaXplICsgc3BhY2luZywgeSwgd2lkdGggPyB3aWR0aCAtIGJ1bGxldFNpemUgLSBzcGFjaW5nIDogMCwgaGVpZ2h0ID8gdG9wICsgaGVpZ2h0IC0geSA6IDAsIGxhYmVsLCBpdGVtT3B0cyk7XG4gICAgICAgICAgXG4gICAgICAgICAgaXRlbVdpZHRoID0gTWF0aC5jZWlsKGl0ZW1MYXllci5iYm94KCkud2lkdGggKyBmb250U2l6ZSk7XG4gICAgICAgICAgaXRlbUhlaWdodCA9IE1hdGgucm91bmQoaXRlbUxheWVyLmJib3goKS5oZWlnaHQgKyAobGluZUhlaWdodCAtIGZvbnRTaXplKSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKGhvcml6b250YWwpIHtcbiAgICAgICAgICAgIHgrPSBpdGVtV2lkdGg7XG4gICAgICAgICAgICBpZiAod2lkdGggJiYgeCA+IHdpZHRoKSB7XG4gICAgICAgICAgICAgIHkrPSBpdGVtSGVpZ2h0O1xuICAgICAgICAgICAgICB4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeSs9IGl0ZW1IZWlnaHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICBcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuICBcbiAgcmV0dXJuIF92O1xuICBcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gX3Y7Il19
