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
      p = pie.p = p + pie.v / total;
      
      eAngle = p * Math.PI * 2 - Math.PI / 2;
      
      chartLayer.g({fill: options.colors[index % options.colors.length]}).arc(x + r, y + r, r, sAngle, eAngle, 1);
      
      // Render label
      a = sAngle + (eAngle - sAngle) / 2;
      ax = r + Math.cos(a) * (r + labelDistance);
      ay = r + Math.sin(a) * (r + labelDistance);
      
      gridLayer.text(x + ax, y + ay, pie.f, {textAnchor: 'middle', dx: '0.1em', dy: '0.7em'});
      
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
    colors: "#287CCE,#963A74,#48E387,#E5A069,#50F2F7,#F55A44,#737373".split(/[\s,]+/),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2hhcnRyLmpzIiwic3JjL2NoYXJ0cy9DYXJ0ZXNpYW5DaGFydC5qcyIsInNyYy9jaGFydHMvYmFyY2hhcnQuanMiLCJzcmMvY2hhcnRzL2Jhc2VjaGFydC5qcyIsInNyYy9jaGFydHMvY2hhcnR3cmFwcGVyLmpzIiwic3JjL2NoYXJ0cy9jb2x1bW5jaGFydC5qcyIsInNyYy9jaGFydHMvbGluZWNoYXJ0LmpzIiwic3JjL2NoYXJ0cy9waWVjaGFydC5qcyIsInNyYy9jaGFydHMvdGFibGVjaGFydC5qcyIsInNyYy9jaGFydHMvdmlzdWFsY2hhcnQuanMiLCJzcmMvdXRpbHMvZGF0YXRhYmxlLmpzIiwic3JjL3V0aWxzL2R0aWNrcy5qcyIsInNyYy91dGlscy9udGlja3MuanMiLCJzcmMvdXRpbHMvcm91bmQuanMiLCJ2ZW5kb3IvZGZvcm1hdC9zcmMvZGZvcm1hdC5qcyIsInZlbmRvci9kZm9ybWF0L3NyYy9sb2NhbGVzL2FsbC5qcyIsInZlbmRvci9uZm9ybWF0L3NyYy9sb2NhbGVzL2FsbC5qcyIsInZlbmRvci9uZm9ybWF0L3NyYy9uZm9ybWF0LmpzIiwidmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyptb2R1bGUuZXhwb3J0cyA9IHtcbiAgUGllQ2hhcnQ6IHJlcXVpcmUoJy4vY2hhcnRzL3BpZWNoYXJ0JyksXG4gIExpbmVDaGFydDogcmVxdWlyZSgnLi9jaGFydHMvbGluZWNoYXJ0JyksXG4gIENvbHVtbkNoYXJ0OiByZXF1aXJlKCcuL2NoYXJ0cy9jb2x1bW5jaGFydCcpLFxuICBWaXN1YWxDaGFydDogcmVxdWlyZSgnLi9jaGFydHMvdmlzdWFsY2hhcnQnKSxcbiAgQ2FydGVzaWFuQ2hhcnQ6IHJlcXVpcmUoJy4vY2hhcnRzL2NhcnRlc2lhbmNoYXJ0JyksXG4gIENoYXJ0V3JhcHBlcjogcmVxdWlyZSgnLi9jaGFydHMvY2hhcnR3cmFwcGVyJylcbn07Ki9cblxudmFyIENoYXJ0V3JhcHBlciA9IHJlcXVpcmUoJy4vY2hhcnRzL2NoYXJ0d3JhcHBlcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgQ2hhcnRXcmFwcGVyKGVsZW1lbnQsIG9wdGlvbnMpO1xufTtcbiIsInZhclxuICBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIiksXG4gIG5mb3JtYXQgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL25mb3JtYXQvc3JjL25mb3JtYXRcIiksXG4gIGRmb3JtYXQgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL2Rmb3JtYXQvc3JjL2Rmb3JtYXRcIiksXG4gIG50aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9udGlja3NcIiksXG4gIGR0aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9kdGlja3NcIiksXG4gIFZpc3VhbENoYXJ0ID0gcmVxdWlyZSgnLi92aXN1YWxjaGFydCcpO1xuXG5mdW5jdGlvbiB0cmltU2V0KHZhbHVlcywgY291bnQpIHtcbiAgLy8gVHJpbSBhcnJheSB0byBjb3VudFxuICB2YXJcbiAgICBtID0gTWF0aC5yb3VuZCh2YWx1ZXMubGVuZ3RoIC8gY291bnQpLFxuICAgIHRyaW1tZWQgPSBbXTtcbiAgaWYgKG0gPiAxKSB7XG4gICAgdmFyIHRyaW1tZWQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgJSBtID09PSAwKSB7XG4gICAgICAgIHRyaW1tZWQucHVzaChkYXRhW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyaW1tZWQ7XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuXG5mdW5jdGlvbiBDYXJ0ZXNpYW5DaGFydCgpIHtcbiAgVmlzdWFsQ2hhcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaXN1YWxDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLCB7XG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIFZpc3VhbENoYXJ0LnByb3RvdHlwZS5kZWZhdWx0cywge1xuICB9KSxcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7XG4gICAgVmlzdWFsQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBWaXN1YWxDaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgZWxlbSA9IHRoaXMuZWxlbWVudCxcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveCxcbiAgICAgIGN3ID0gY2hhcnRCb3gud2lkdGgsXG4gICAgICBjaCA9IGNoYXJ0Qm94LmhlaWdodCxcbiAgICAgIGdyaWRMYXllciA9IGNoYXJ0TGF5ZXIuZyh7c3R5bGU6IHtmb250U2l6ZTogJzkwJSd9fSksXG4gICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgY2F0ZWdvcnlSYW5nZSA9IHRoaXMuY2F0ZWdvcnlSYW5nZSxcbiAgICAgIGNhdGVnb3J5Rm9ybWF0ID0gdGhpcy5jYXRlZ29yeUZvcm1hdCxcbiAgICAgIGNhdGVnb3J5VHlwZSA9IHRoaXMuY2F0ZWdvcnlUeXBlLFxuICAgICAgY2F0ZWdvcnlUaWNrcyA9IHRoaXMuY2F0ZWdvcnlUaWNrcyxcbiAgICAgIGNhdGVnb3J5TWluID0gTWF0aC5taW4oY2F0ZWdvcnlSYW5nZS5taW4sIGNhdGVnb3J5VGlja3NbMF0pLFxuICAgICAgY2F0ZWdvcnlNYXggPSBNYXRoLm1heChjYXRlZ29yeVJhbmdlLm1heCwgY2F0ZWdvcnlUaWNrc1tjYXRlZ29yeVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIGNhdGVnb3J5R3JpZExpbmVzID0gdGhpcy5jYXRlZ29yeUdyaWRMaW5lcyxcbiAgICAgIHZhbHVlRm9ybWF0ID0gdGhpcy52YWx1ZUZvcm1hdCxcbiAgICAgIHZhbHVlVHlwZSA9IHRoaXMudmFsdWVUeXBlLFxuICAgICAgdmFsdWVUaWNrcyA9IHRoaXMudmFsdWVUaWNrcyxcbiAgICAgIHZhbHVlUmFuZ2UgPSB0aGlzLnZhbHVlUmFuZ2UsXG4gICAgICB2YWx1ZU1pbiA9IE1hdGgubWluKHZhbHVlUmFuZ2UubWluLCB2YWx1ZVRpY2tzWzBdKSxcbiAgICAgIHZhbHVlTWF4ID0gTWF0aC5tYXgodmFsdWVSYW5nZS5tYXgsIHZhbHVlVGlja3NbdmFsdWVUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICB2YWx1ZUdyaWRMaW5lcyA9IHRoaXMudmFsdWVHcmlkTGluZXMsXG4gICAgICBsYWJlbEhvcml6b250YWxTcGFjaW5nID0gMTMsXG4gICAgICBsYWJlbFZlcnRpY2FsU3BhY2luZyA9IDEzLFxuICAgICAgZmxpcEF4ZXMgPSB0aGlzLmZsaXBBeGVzLFxuICAgICAgY2xpcENhdGVnb3J5R3JpZCA9IHRoaXMuY2xpcENhdGVnb3J5R3JpZCxcbiAgICAgIGNsaXBWYWx1ZUdyaWQgPSB0aGlzLmNsaXBWYWx1ZUdyaWQsXG4gICAgICB0ZXh0Q29sb3IgPSBjaGFydExheWVyLmNzcygnY29sb3InKSwgXG4gICAgICBtdXN0Um90YXRlLFxuICAgICAgdGV4dHM7XG4gICAgICBcbiAgICBtdXN0Um90YXRlID0gZmFsc2U7XG4gICAgdGV4dHMgPSBbXTtcbiAgICBcbiAgICB2YXIgcGF0aCA9IFwiXCI7XG4gICAgY2F0ZWdvcnlUaWNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRpY2ssIGluZGV4KSB7XG4gICAgICB2YXIgdGlja0NvbG9yID0gY2F0ZWdvcnlUeXBlID09PSAnbnVtYmVyJyAmJiB0aWNrID09PSAwID8gMC43NSA6IDAuMjU7XG4gICAgICB2YXIgdGlja1dpZHRoID0gKGZsaXBBeGVzID8gY2ggOiBjdykgLyAoY2F0ZWdvcnlUaWNrcy5sZW5ndGgpO1xuICAgICAgXG4gICAgICB2YXIgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgPSAodGljayAtIGNhdGVnb3J5TWluKSAvIChjYXRlZ29yeU1heCAtIGNhdGVnb3J5TWluKTtcbiAgICAgIFxuICAgICAgdmFyIHgxO1xuICAgICAgaWYgKGZsaXBBeGVzKSB7XG4gICAgICAgIHgxID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChjbGlwQ2F0ZWdvcnlHcmlkKSB7XG4gICAgICAgICAgeDEgPSB0aWNrV2lkdGggLyAyICsgdGlja1dpZHRoICogaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeDEgPSBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSAqIGN3O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciB5MTtcbiAgICAgIGlmIChmbGlwQXhlcykge1xuICAgICAgICBpZiAoY2xpcENhdGVnb3J5R3JpZCkge1xuICAgICAgICAgIHkxID0gY2ggLSAodGlja1dpZHRoIC8gMiArIHRpY2tXaWR0aCAqIGluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB5MSA9IGNoIC0gbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgKiBjaDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgeDIgPSBmbGlwQXhlcyA/IGN3IDogeDE7XG4gICAgICB2YXIgeTIgPSBmbGlwQXhlcyA/IHkxIDogY2g7XG4gICAgICBcbiAgICAgIHZhciBsaW5lID0ge3gxOiBNYXRoLnJvdW5kKHgxKSwgeTE6IE1hdGgucm91bmQoeTEpLCB4MjogTWF0aC5yb3VuZCh4MiksIHkyOiBNYXRoLnJvdW5kKHkyKX07XG4gICAgICBcbiAgICAgIGlmIChjYXRlZ29yeUdyaWRMaW5lcykge1xuICAgICAgICBcbiAgICAgICAgLy9ncmlkTGF5ZXIubGluZShsaW5lLngxLCBsaW5lLnkxLCBsaW5lLngyLCBsaW5lLnkyLCB7c3Ryb2tlOiAnbGlnaHRncmF5Jywgc3Ryb2tlT3BhY2l0eTogdGlja0NvbG9yfSk7XG4gICAgICAgIHZhciBsaW5lUGF0aCA9IFwiTSBcIiArIGxpbmUueDEgKyBcIiBcIiArIGxpbmUueTEgKyBcIiBMXCIgKyBsaW5lLngyICsgXCIgXCIgKyBsaW5lLnkyO1xuICAgICAgICBpZiAoY2F0ZWdvcnlUeXBlID09PSAnbnVtYmVyJyAmJiB0aWNrID09PSAwKSB7XG4gICAgICAgICAgZ3JpZExheWVyLnBhdGgobGluZVBhdGgsIHtzdHJva2U6ICdsaWdodGdyYXknLCBzdHJva2VPcGFjaXR5OiAwLjc1fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aCs9IGxpbmVQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBsYWJlbDtcbiAgICAgIGlmIChjYXRlZ29yeVR5cGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgbGFiZWwgPSBuZm9ybWF0KHRpY2ssIGNhdGVnb3J5Rm9ybWF0LnBhdHRlcm4sIGNhdGVnb3J5Rm9ybWF0LmxvY2FsZSk7XG4gICAgICB9IGVsc2UgaWYgKGNhdGVnb3J5VHlwZSA9PT0gXCJkYXRlXCIpIHtcbiAgICAgICAgbGFiZWwgPSBkZm9ybWF0KHRpY2ssIGNhdGVnb3J5Rm9ybWF0LnBhdHRlcm4sIGNhdGVnb3J5Rm9ybWF0LmxvY2FsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbCA9IGRhdGFUYWJsZS5nZXRWYWx1ZSh0aWNrLCBjYXRlZ29yeUluZGV4KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGxhYmVsWCA9IGZsaXBBeGVzID8geDEgLSBsYWJlbEhvcml6b250YWxTcGFjaW5nIDogeDE7XG4gICAgICB2YXIgbGFiZWxZID0gZmxpcEF4ZXMgPyBjaCAtIHkxIDogeTIgKyBsYWJlbFZlcnRpY2FsU3BhY2luZztcbiAgICAgIFxuICAgICAgdmFyIGxhYmVsV2lkdGggPSBmbGlwQXhlcyA/IGNoYXJ0Qm94LnggLSBsYWJlbEhvcml6b250YWxTcGFjaW5nIDogdGlja1dpZHRoO1xuICAgICAgdmFyIHRleHRBbmNob3IgPSBmbGlwQXhlcyA/ICdlbmQnIDogJ21pZGRsZSc7IFxuICAgICAgdmFyIHRleHQgPSBncmlkTGF5ZXIuY3JlYXRlKFwidGV4dFwiLCB7XG4gICAgICAgIHg6IE1hdGgucm91bmQobGFiZWxYKSwgXG4gICAgICAgIHk6IE1hdGgucm91bmQobGFiZWxZKSxcbiAgICAgICAgZHk6IFwiMC40ZW1cIixcbiAgICAgICAgdGV4dEFuY2hvcjogdGV4dEFuY2hvclxuICAgICAgfSkuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxhYmVsKSk7XG4gICAgICBcbiAgICAgIHRleHRzLnB1c2godGV4dCk7XG4gICAgICBcbiAgICAgIGdyaWRMYXllci5hcHBlbmQodGV4dCk7XG4gICAgICBcbiAgICAgIGlmICh0ZXh0LmNvbXB1dGVkVGV4dExlbmd0aCgpID4gbGFiZWxXaWR0aCkge1xuICAgICAgICBtdXN0Um90YXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH0pO1xuICAgIFxuICAgIFxuICAgIGlmIChtdXN0Um90YXRlKSB7XG4gICAgICB0ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHggPSB0ZXh0LmF0dHIoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0ZXh0LmF0dHIoJ3knKTtcbiAgICAgICAgdGV4dC5hdHRyKHtcbiAgICAgICAgICB0ZXh0QW5jaG9yOiAnZW5kJyxcbiAgICAgICAgICB0cmFuc2Zvcm06IFwicm90YXRlKC0zMiBcIiArIHggKyBcIixcIiArIHkgKyBcIilcIlxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBtdXN0Um90YXRlID0gZmFsc2U7XG4gICAgdGV4dHMgPSBbXTtcbiAgICBcbiAgICBcbiAgICB2YWx1ZVRpY2tzLmZvckVhY2goZnVuY3Rpb24odGljaywgaW5kZXgpIHtcbiAgICAgIFxuICAgICAgdmFyIHRpY2tXaWR0aCA9IChmbGlwQXhlcyA/IGNoYXJ0Qm94LmhlaWdodCA6IGNoYXJ0Qm94LndpZHRoKSAvICh2YWx1ZVRpY2tzLmxlbmd0aCArIDEpO1xuICAgICAgdmFyIHRpY2tDb2xvciA9IHZhbHVlVHlwZSA9PT0gJ251bWJlcicgJiYgdGljayA9PT0gMCA/IDAuNzUgOiAwLjI1O1xuICAgICAgXG4gICAgICB2YXIgbm9ybWFsaXplZFZhbHVlID0gKHRpY2sgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICB2YXIgeDE7XG4gICAgICBcbiAgICAgIGlmIChmbGlwQXhlcykge1xuICAgICAgICBpZiAoY2xpcFZhbHVlR3JpZCkge1xuICAgICAgICAgIHgxID0gdGlja1dpZHRoICogMC41ICsgdGlja1dpZHRoICogaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeDEgPSBub3JtYWxpemVkVmFsdWUgKiBjaGFydEJveC53aWR0aDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeDEgPSAwO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgeTE7XG4gICAgICBpZiAoZmxpcEF4ZXMpIHtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNsaXBWYWx1ZUdyaWQpIHtcbiAgICAgICAgICB5MSA9IHRpY2tXaWR0aCAqIDAuNSArIHRpY2tXaWR0aCAqIGluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHkxID0gY2hhcnRCb3guaGVpZ2h0IC0gbm9ybWFsaXplZFZhbHVlICogY2hhcnRCb3guaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciB4MiA9IGZsaXBBeGVzID8geDEgOiBjaGFydEJveC53aWR0aDtcbiAgICAgIHZhciB5MiA9IGZsaXBBeGVzID8gY2hhcnRCb3guaGVpZ2h0IDogeTE7XG4gICAgICBcbiAgICAgIHZhciBsaW5lID0ge3gxOiBNYXRoLnJvdW5kKHgxKSwgeTE6IE1hdGgucm91bmQoeTEpLCB4MjogTWF0aC5yb3VuZCh4MiksIHkyOiBNYXRoLnJvdW5kKHkyKX07XG4gICAgICBcbiAgICAgIGlmICh2YWx1ZUdyaWRMaW5lcykge1xuICAgICAgICAvL2dyaWRMYXllci5saW5lKGxpbmUueDEsIGxpbmUueTEsIGxpbmUueDIsIGxpbmUueTIsIHtzdHJva2U6ICdsaWdodGdyYXknLCBzdHJva2VPcGFjaXR5OiB0aWNrQ29sb3J9KTtcbiAgICAgICAgdmFyIGxpbmVQYXRoID0gXCJNIFwiICsgbGluZS54MSArIFwiIFwiICsgbGluZS55MSArIFwiIExcIiArIGxpbmUueDIgKyBcIiBcIiArIGxpbmUueTI7XG4gICAgICAgIGlmICh2YWx1ZVR5cGUgPT09ICdudW1iZXInICYmIHRpY2sgPT09IDApIHtcbiAgICAgICAgICBncmlkTGF5ZXIucGF0aChsaW5lUGF0aCwge3N0cm9rZTogJ2xpZ2h0Z3JheScsIHN0cm9rZU9wYWNpdHk6IDAuNzV9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoKz0gbGluZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHZhbHVlVHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBsYWJlbCA9IG5mb3JtYXQodGljaywgdmFsdWVGb3JtYXQucGF0dGVybiwgdmFsdWVGb3JtYXQubG9jYWxlKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSBcImRhdGVcIikge1xuICAgICAgICBsYWJlbCA9IGRmb3JtYXQodGljaywgdmFsdWVGb3JtYXQucGF0dGVybiwgdmFsdWVGb3JtYXQubG9jYWxlKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGxhYmVsWCA9IGZsaXBBeGVzID8geDEgOiB4MSAtIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmc7XG4gICAgICB2YXIgbGFiZWxZID0gZmxpcEF4ZXMgPyB5MiArIGxhYmVsVmVydGljYWxTcGFjaW5nIDogeTE7XG4gICAgICB2YXIgbGFiZWxXaWR0aCA9IGZsaXBBeGVzID8gdGlja1dpZHRoIDogY2hhcnRCb3gueCAtIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmc7XG4gICAgICB2YXIgdGV4dEFuY2hvciA9IGZsaXBBeGVzID8gJ21pZGRsZScgOiAnZW5kJzsgXG4gICAgICBcbiAgICAgIHZhciB0ZXh0ID0gZ3JpZExheWVyLmNyZWF0ZShcInRleHRcIiwge1xuICAgICAgICB4OiBNYXRoLnJvdW5kKGxhYmVsWCksIFxuICAgICAgICB5OiBNYXRoLnJvdW5kKGxhYmVsWSksXG4gICAgICAgIGR5OiBcIjAuNGVtXCIsXG4gICAgICAgIHRleHRBbmNob3I6IHRleHRBbmNob3JcbiAgICAgIH0pLmFwcGVuZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsYWJlbCkpO1xuICAgICAgXG4gICAgICBncmlkTGF5ZXIuYXBwZW5kKHRleHQpO1xuICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgZ3JpZExheWVyLnBhdGgocGF0aCwge3N0cm9rZTogJ2xpZ2h0Z3JheScsIHN0cm9rZU9wYWNpdHk6IDAuMjV9KTtcbiAgICBcbiAgICBpZiAobXVzdFJvdGF0ZSkge1xuICAgICAgdGV4dHMuZm9yRWFjaChmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciB4ID0gdGV4dC5hdHRyKCd4Jyk7XG4gICAgICAgIHZhciB5ID0gdGV4dC5hdHRyKCd5Jyk7XG4gICAgICAgIHRleHQuYXR0cih7XG4gICAgICAgICAgdGV4dEFuY2hvcjogJ2VuZCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBcInJvdGF0ZSgtMzIgXCIgKyB4ICsgXCIsXCIgKyB5ICsgXCIpXCJcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgXG4gIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUsIHtcbiAgY2F0ZWdvcnlJbmRleDoge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5VHlwZToge1xuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVRhYmxlICYmIHRoaXMuZGF0YVRhYmxlLmdldENvbHVtblR5cGUodGhpcy5jYXRlZ29yeUluZGV4KTtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5UmFuZ2U6IHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsIFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGU7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGlmIChkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZSh0aGlzLmNhdGVnb3J5SW5kZXgpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IGRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSAtIDFcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFUYWJsZS5nZXRDb2x1bW5SYW5nZSh0aGlzLmNhdGVnb3J5SW5kZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICBjYXRlZ29yeUZvcm1hdDoge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgICBjb2x1bW5QYXR0ZXJuID0gZGF0YVRhYmxlLmdldENvbHVtblBhdHRlcm4oY2F0ZWdvcnlJbmRleCksXG4gICAgICAgIGNvbHVtbkxvY2FsZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5Mb2NhbGUoY2F0ZWdvcnlJbmRleCk7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGlmIChjb2x1bW5QYXR0ZXJuKSB7XG4gICAgICAgICAgLy8gUHJlZmVyIHNob3J0IG5hbWVzIG9uIHNjYWxlXG4gICAgICAgICAgY29sdW1uUGF0dGVybi5yZXBsYWNlKC9NTU1NLywgXCJNTU1cIik7XG4gICAgICAgICAgY29sdW1uUGF0dGVybi5yZXBsYWNlKC9kZGRkLywgXCJkZGRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwYXR0ZXJuOiBjb2x1bW5QYXR0ZXJuLFxuICAgICAgICAgIGxvY2FsZTogY29sdW1uTG9jYWxlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5VGlja3M6IHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhclxuICAgICAgICByYW5nZSA9IHRoaXMuY2F0ZWdvcnlSYW5nZSxcbiAgICAgICAgdHlwZSA9IHRoaXMuY2F0ZWdvcnlUeXBlLFxuICAgICAgICBtaW4gPSByYW5nZS5taW4sXG4gICAgICAgIG1heCA9IHJhbmdlLm1heCxcbiAgICAgICAgY291bnQgPSBNYXRoLm1pbigxMCwgdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkpLFxuICAgICAgICBvdXRlciA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBudGlja3MobWluLCBtYXgsIGNvdW50LCBvdXRlcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICByZXR1cm4gZHRpY2tzKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBtYXggPSB0aGlzLmRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSAtIDE7XG4gICAgICAgIHJldHVybiAoQXJyYXkuYXBwbHkobnVsbCwge2xlbmd0aDogdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCl9KS5tYXAoTnVtYmVyLmNhbGwsIE51bWJlcikpLm1hcChmdW5jdGlvbih0aWNrKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGljayk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdmFsdWVSYW5nZToge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuZGF0YVRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhclxuICAgICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgICAgcmVzdWx0ID0ge30sXG4gICAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgICByYW5nZTtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgaWYgKGNvbHVtbkluZGV4ICE9PSBjYXRlZ29yeUluZGV4KSB7XG4gICAgICAgICAgICByYW5nZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5SYW5nZShjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICByZXN1bHQubWluID0gdHlwZW9mIHJlc3VsdC5taW4gPT09ICd1bmRlZmluZWQnID8gcmFuZ2UubWluIDogTWF0aC5taW4ocmVzdWx0Lm1pbiwgcmFuZ2UubWluKTtcbiAgICAgICAgICAgIHJlc3VsdC5tYXggPSB0eXBlb2YgcmVzdWx0Lm1heCA9PT0gJ3VuZGVmaW5lZCcgPyByYW5nZS5tYXggOiBNYXRoLm1heChyZXN1bHQubWF4LCByYW5nZS5tYXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LFxuICB2YWx1ZVR5cGU6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmRhdGFUYWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXg7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICAgIGlmIChjb2x1bW5JbmRleCAhPT0gY2F0ZWdvcnlJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgdmFsdWVGb3JtYXQ6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICBjb2x1bW5JbmRleCxcbiAgICAgICAgY2F0ZWdvcnlJbmRleCA9IHRoaXMuY2F0ZWdvcnlJbmRleCxcbiAgICAgICAgdmFsdWVUeXBlID0gdGhpcy52YWx1ZVR5cGU7XG4gICAgICAgIFxuICAgICAgaWYgKGRhdGFUYWJsZSkge1xuICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICBpZiAoY29sdW1uSW5kZXggIT09IGNhdGVnb3J5SW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBjb2x1bW5QYXR0ZXJuID0gZGF0YVRhYmxlLmdldENvbHVtblBhdHRlcm4oY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgdmFyIGNvbHVtbkxvY2FsZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5Mb2NhbGUoY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgaWYgKGNvbHVtblBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgLy8gUHJlZmVyIHNob3J0IG5hbWVzIG9uIHNjYWxlXG4gICAgICAgICAgICAgIGNvbHVtblBhdHRlcm4ucmVwbGFjZSgvTU1NTS8sIFwiTU1NXCIpO1xuICAgICAgICAgICAgICBjb2x1bW5QYXR0ZXJuLnJlcGxhY2UoL2RkZGQvLCBcImRkZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHBhdHRlcm46IGNvbHVtblBhdHRlcm4sXG4gICAgICAgICAgICAgIGxvY2FsZTogY29sdW1uTG9jYWxlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgdmFsdWVUaWNrczoge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAvKlxuICAgICAgdmFyXG4gICAgICAgIHJhbmdlID0gdGhpcy52YWx1ZVJhbmdlLFxuICAgICAgICB0eXBlID0gdGhpcy52YWx1ZVR5cGUsXG4gICAgICAgIGNvdW50ID0gTWF0aC5taW4oMTAsIHRoaXMuZGF0YVRhYmxlLmdldE51bWJlck9mUm93cygpKTtcbiAgICAgIHJldHVybiAodHlwZSA9PT0gJ251bWJlcicgPyBudGlja3MgOiB0eXBlID09PSAnZGF0ZScgPyBkdGlja3MgOiBzdGlja3MpKHJhbmdlLm1pbiwgcmFuZ2UubWF4LCA2LCB0cnVlKTsqL1xuICAgICAgdmFyXG4gICAgICAgIHJhbmdlID0gdGhpcy52YWx1ZVJhbmdlLFxuICAgICAgICB0eXBlID0gdGhpcy52YWx1ZVR5cGUsXG4gICAgICAgIG1pbiA9IHJhbmdlLm1pbixcbiAgICAgICAgbWF4ID0gcmFuZ2UubWF4LFxuICAgICAgICBjb3VudCA9IDUsXG4gICAgICAgIG91dGVyID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gbnRpY2tzKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZGF0ZScpIHtcbiAgICAgICAgcmV0dXJuIGR0aWNrcyhtaW4sIG1heCwgY291bnQsIG91dGVyKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWF4ID0gdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkgLSAxO1xuICAgICAgICByZXR1cm4gbnRpY2tzKDAsIG1heCwgTWF0aC5taW4obWF4ICsgMSwgY291bnQpLCBvdXRlcikubWFwKGZ1bmN0aW9uKHRpY2spIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0aWNrKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBsZWdlbmRJdGVtczoge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNvbG9ySW5kZXggPSAwLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgbGFiZWw7XG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICAgIGlmICh0aGlzLmNhdGVnb3J5SW5kZXggIT09IGNvbHVtbkluZGV4KSB7XG4gICAgICAgICAgICBsYWJlbCA9IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2xhYmVsOiBkYXRhVGFibGUuZ2V0Q29sdW1uTGFiZWwoY29sdW1uSW5kZXgpIHx8IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVlhZWlwiLmNoYXJBdChjb2x1bW5JbmRleCAlIDIxKSwgYnVsbGV0OiB7IGZpbGw6IG9wdGlvbnMuY29sb3JzW2NvbG9ySW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdIH0gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2xvckluZGV4Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSxcbiAgZmxpcEF4ZXM6IHtcbiAgICB2YWx1ZTogZmFsc2UsXG4gICAgd3JpdGVhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSxcbiAgY2xpcENhdGVnb3J5R3JpZDoge1xuICAgIHZhbHVlOiBmYWxzZSxcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9LFxuICBjYXRlZ29yeUdyaWRMaW5lczoge1xuICAgIHZhbHVlOiB0cnVlLFxuICAgIHdyaXRlYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0sXG4gIGNsaXBWYWx1ZUdyaWQ6IHtcbiAgICB2YWx1ZTogZmFsc2UsXG4gICAgd3JpdGVhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSxcbiAgdmFsdWVHcmlkTGluZXM6IHtcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FydGVzaWFuQ2hhcnQ7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcbnZhciBudGlja3MgPSByZXF1aXJlKFwiLi4vdXRpbHMvbnRpY2tzXCIpO1xudmFyIGR0aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9kdGlja3NcIik7XG52YXIgQ29sdW1uQ2hhcnQgPSByZXF1aXJlKCcuL2NvbHVtbmNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIEJhckNoYXJ0KCkge1xuICBDb2x1bW5DaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5CYXJDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbHVtbkNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChDb2x1bW5DaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IF92LmV4dGVuZCh0cnVlLCB7fSwgQ29sdW1uQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gIH0pXG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQmFyQ2hhcnQucHJvdG90eXBlLCB7XG4gIGZsaXBBeGVzOiB7XG4gICAgdmFsdWU6IHRydWVcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyQ2hhcnQ7IiwidmFyIERhdGFUYWJsZSA9IHJlcXVpcmUoXCIuLi91dGlscy9kYXRhdGFibGVcIik7XG52YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xuXG5mdW5jdGlvbiBCYXNlQ2hhcnQoZWxlbWVudCwgb3B0aW9ucykge1xuICBcbiAgLy8gQ29uc3RydWN0IEJhc2VDaGFydFxuICB2YXJcbiAgICBlbGVtID0gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpIDogZWxlbWVudCxcbiAgICBvcHRzID0gX3YuZXh0ZW5kKHRydWUsIHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlLmRlZmF1bHRzLCBvcHRpb25zKSxcbiAgICBkYXRhVGFibGUgPSBEYXRhVGFibGUuZnJvbUFycmF5KG9wdGlvbnMuZGF0YSk7XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgZWxlbWVudDoge1xuICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICB9XG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIG9wdHMgPSBfdi5leHRlbmQodHJ1ZSwgb3B0cywgb3B0aW9ucyk7XG4gICAgICAgIGRhdGFUYWJsZSA9IERhdGFUYWJsZS5mcm9tQXJyYXkob3B0cy5kYXRhKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9XG4gICAgfSxcbiAgICBkYXRhVGFibGU6IHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFUYWJsZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBcbiAgLy8gY2FsbCBjb25zdHJ1Y3RcbiAgdGhpcy5fY29uc3RydWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIFxuICAvLyBTZXQgb3B0aW9ucyBhbmQgcmVuZGVyIGNoYXJ0XG4gIHRoaXMucmVuZGVyKCk7XG59XG5cblxuX3YuZXh0ZW5kKEJhc2VDaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IHtcbiAgICAvKlxuICAgIHN0eWxlOiB7XG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgZm9udFNpemU6ICcxMnB4JyxcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgY29sb3I6ICcjODE4Mzg2J1xuICAgIH0qL1xuICB9LFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHt9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vIENsZWFyXG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgLy8gQXBwbHkgc3R5bGVzXG4gICAgX3YuY3NzKHRoaXMuZWxlbWVudCwgdGhpcy5vcHRpb25zLnN0eWxlKTtcbiAgfVxufSk7XG5cbiAgXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VDaGFydDsiLCJ2YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xudmFyIERhdGFUYWJsZSA9IHJlcXVpcmUoXCIuLi91dGlscy9kYXRhdGFibGVcIik7XG52YXIgTGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lY2hhcnQnKTtcbnZhciBQaWVDaGFydCA9IHJlcXVpcmUoJy4vcGllY2hhcnQnKTtcbnZhciBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY29sdW1uY2hhcnQnKTtcbnZhciBCYXJDaGFydCA9IHJlcXVpcmUoJy4vYmFyY2hhcnQnKTtcbnZhciBUYWJsZUNoYXJ0ID0gcmVxdWlyZSgnLi90YWJsZWNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIGdldENoYXJ0VHlwZShkYXRhVGFibGUpIHtcbiAgXG4gIGlmIChkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkgPiAyMCkge1xuICAgIHJldHVybiBcImxpbmVcIjtcbiAgfVxuICBcbiAgcmV0dXJuICdwaWUnO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFydENsYXNzKHR5cGUpIHtcbiAgdmFyIGNsYXp6O1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGNsYXp6ID0gTGluZUNoYXJ0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGllJzpcbiAgICAgIGNsYXp6ID0gUGllQ2hhcnQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjb2x1bW4nOlxuICAgICAgY2xhenogPSBDb2x1bW5DaGFydDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jhcic6XG4gICAgICBjbGF6eiA9IEJhckNoYXJ0O1xuICAgICAgYnJlYWs7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY2xhenogPSBUYWJsZUNoYXJ0O1xuICAgICAgXG4gIH1cbiAgcmV0dXJuIGNsYXp6O1xufVxuXG5mdW5jdGlvbiBDaGFydFdyYXBwZXIoZWxlbWVudCwgb3B0aW9ucykge1xuICBcbiAgdmFyXG4gICAgY2hhcnQsXG4gICAgb3B0cyA9IF92LmV4dGVuZCh0cnVlLCB0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5kZWZhdWx0cyk7XG4gICAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICBjaGFydDoge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHNldDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0cyA9IF92LmV4dGVuZCh0cnVlLCBvcHRzLCBvcHRpb25zKTtcbiAgICAgICAgdmFyIGRhdGFUYWJsZSA9IERhdGFUYWJsZS5mcm9tQXJyYXkob3B0cy5kYXRhKTtcbiAgICAgICAgdmFyIGNoYXJ0VHlwZSA9IG9wdHMudHlwZSB8fCBnZXRDaGFydFR5cGUoZGF0YVRhYmxlKTtcbiAgICAgICAgdmFyIGNoYXJ0Q2xhc3MgPSBnZXRDaGFydENsYXNzKGNoYXJ0VHlwZSk7XG4gICAgICAgIG9wdHMuZGF0YSA9IGRhdGFUYWJsZTtcbiAgICAgICAgaWYgKGNoYXJ0ICYmIGNoYXJ0LmNvbnN0cnVjdG9yID09PSBjaGFydENsYXNzKSB7XG4gICAgICAgICAgY2hhcnQub3B0aW9ucyA9IG9wdHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhcnQgPSBuZXcgY2hhcnRDbGFzcyhjaGFydCAmJiBjaGFydC5lbGVtZW50IHx8IGVsZW1lbnQsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIFxuICB0aGlzLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbn1cblxuX3YuZXh0ZW5kKENoYXJ0V3JhcHBlci5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IHtcbiAgfSxcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7fSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNoYXJ0LnJlbmRlcigpO1xuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2hhcnRXcmFwcGVyLnByb3RvdHlwZSwge1xuICBlbGVtZW50OiB7XG4gICAgc2V0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB0aGlzLmNoYXJ0LmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJ0LmVsZW1lbnQ7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFydFdyYXBwZXI7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcbnZhciBudGlja3MgPSByZXF1aXJlKFwiLi4vdXRpbHMvbnRpY2tzXCIpO1xudmFyIGR0aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9kdGlja3NcIik7XG52YXIgQ2FydGVzaWFuQ2hhcnQgPSByZXF1aXJlKCcuL2NhcnRlc2lhbmNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIENvbHVtbkNoYXJ0KCkge1xuICBDYXJ0ZXNpYW5DaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5Db2x1bW5DaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChDb2x1bW5DaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IF92LmV4dGVuZCh0cnVlLCB7fSwgQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gIH0pLFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBcbiAgICB2YXJcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgIGNoYXJ0TGF5ZXIgPSB0aGlzLmNoYXJ0TGF5ZXIsXG4gICAgICBjaGFydEJveCA9IHRoaXMuY2hhcnRCb3gsXG4gICAgICBjb2x1bW5JbmRleCA9IHRoaXMuY29sdW1uSW5kZXgsXG4gICAgICByb3dJbmRleCA9IDAsXG4gICAgICB2YWx1ZUluZGV4ID0gMCxcbiAgICAgIHZhbHVlUmFuZ2UgPSB0aGlzLnZhbHVlUmFuZ2UsXG4gICAgICB2YWx1ZVRpY2tzID0gdGhpcy52YWx1ZVRpY2tzLFxuICAgICAgdmFsdWVNaW4gPSBNYXRoLm1pbih2YWx1ZVJhbmdlLm1pbiwgdmFsdWVUaWNrc1swXSksXG4gICAgICB2YWx1ZU1heCA9IE1hdGgubWF4KHZhbHVlUmFuZ2UubWF4LCB2YWx1ZVRpY2tzW3ZhbHVlVGlja3MubGVuZ3RoIC0gMV0pLFxuICAgICAgY2F0ZWdvcnlUeXBlID0gdGhpcy5jYXRlZ29yeVR5cGUsXG4gICAgICBjYXRlZ29yeVJhbmdlID0gdGhpcy5jYXRlZ29yeVJhbmdlLFxuICAgICAgY2F0ZWdvcnlUaWNrcyA9IHRoaXMuY2F0ZWdvcnlUaWNrcyxcbiAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXgsXG4gICAgICBjYXRlZ29yeU1pbiA9IE1hdGgubWluKGNhdGVnb3J5UmFuZ2UubWluLCBjYXRlZ29yeVRpY2tzWzBdKSxcbiAgICAgIGNhdGVnb3J5TWF4ID0gTWF0aC5tYXgoY2F0ZWdvcnlSYW5nZS5tYXgsIGNhdGVnb3J5VGlja3NbY2F0ZWdvcnlUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICBmbGlwQXhlcyA9IHRoaXMuZmxpcEF4ZXMsXG4gICAgICBncmFwaExheWVyLFxuICAgICAgcG9pbnRzLFxuICAgICAgdmFsdWUsXG4gICAgICBub3JtYWxpemVkVmFsdWUsXG4gICAgICBjYXRlZ29yeVZhbHVlLFxuICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUsXG4gICAgICB4LFxuICAgICAgeTtcbiAgICAgIFxuICAgIHZhciByb3dzID0gZGF0YVRhYmxlLmdldFNvcnRlZFJvd3MoY2F0ZWdvcnlJbmRleCk7XG4gICAgXG4gICAgdmFyIHJlY3RXaWR0aCA9IGNoYXJ0Qm94LndpZHRoIC8gKGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKSAtIDEpO1xuICAgIHZhciB0aWNrV2lkdGggPSAoZmxpcEF4ZXMgPyBjaGFydEJveC5oZWlnaHQgOiBjaGFydEJveC53aWR0aCkgLyByb3dzLmxlbmd0aDsgXG4gICAgdmFyIGNvbHVtbldpZHRoID0gTWF0aC5tYXgoMSwgdGlja1dpZHRoIC8gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpKTtcbiAgICB2YXIgY29sdW1uU3BhY2luZyA9IGNvbHVtbldpZHRoICogMC4yNTtcbiAgICB2YXIgbSA9IDE7XG4gICBcbiAgICB2YXIgc3VtID0ge307XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICBcbiAgICBncmFwaExheWVyID0gY2hhcnRMYXllci5nKHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdXG4gICAgfSk7XG4gICAgXG4gICAgZm9yIChyb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgcm93cy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICB2YXIgc3RlcCA9IHJvd0luZGV4ICUgbSA9PT0gMDtcbiAgICAgIFxuICAgICAgdmFyIHZhbHVlSW5kZXggPSAwO1xuICAgICAgXG4gICAgICBcbiAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICBcbiAgICAgICAgaWYgKGNvbHVtbkluZGV4ICE9PSBjYXRlZ29yeUluZGV4KSB7XG4gICAgICAgICAgXG4gICAgICAgICAgY2F0ZWdvcnlWYWx1ZSA9IGNhdGVnb3J5VHlwZSA9PT0gJ3N0cmluZycgPyByb3dJbmRleCA6IHJvd3Nbcm93SW5kZXhdW2NhdGVnb3J5SW5kZXhdO1xuICAgICAgICAgIG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlID0gKGNhdGVnb3J5VmFsdWUgLSBjYXRlZ29yeU1pbikgLyAoIGNhdGVnb3J5TWF4IC0gY2F0ZWdvcnlNaW4pO1xuICAgICAgXG4gICAgICAgICAgLy9cbiAgICAgICAgICBwb2ludHMgPSBbXTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSByb3dzW3Jvd0luZGV4XVtjb2x1bW5JbmRleF07XG4gICAgICAgICAgXG4gICAgICAgICAgc3VtW2NvbHVtbkluZGV4XSA9IHN1bVtjb2x1bW5JbmRleF0gfHwgMDtcbiAgICAgICAgICBzdW1bY29sdW1uSW5kZXhdKz0gdmFsdWU7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gKHZhbHVlIC0gdmFsdWVNaW4pIC8gKHZhbHVlTWF4IC0gdmFsdWVNaW4pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbm9ybWFsaXplZFZhbHVlWmVybyA9IDA7XG4gICAgICAgICAgICBpZiAodmFsdWVNaW4gPCAwICYmIHZhbHVlTWF4ID4gMCkge1xuICAgICAgICAgICAgICBub3JtYWxpemVkVmFsdWVaZXJvID0gKDAgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBub3JtYWxpemVkQ2F0ZWdvcnlaZXJvID0gMDtcbiAgICAgICAgICAgIGlmIChjYXRlZ29yeU1pbiA8IDAgJiYgY2F0ZWdvcnlNYXggPiAwKSB7XG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWRDYXRlZ29yeVplcm8gPSAoMCAtIGNhdGVnb3J5TWluKSAvIChjYXRlZ29yeU1heCAtIGNhdGVnb3J5TWluKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHcgPSBNYXRoLm1heCgxLCBjb2x1bW5XaWR0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qdmFyIHh2ID0gZmxpcEF4ZXMgPyBub3JtYWxpemVkVmFsdWUgOiBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZTtcbiAgICAgICAgICAgIHZhciB5diA9IGZsaXBBeGVzID8gbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgOiBub3JtYWxpemVkVmFsdWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB6diA9IGZsaXBBeGVzID8gbm9ybWFsaXplZENhdGVnb3J5WmVybyA6IG5vcm1hbGl6ZWRWYWx1ZVplcm87XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgeHYgPSBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZTtcbiAgICAgICAgICAgIHZhciB5diA9IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICAgICAgICAgIHZhciB6diA9IG5vcm1hbGl6ZWRWYWx1ZVplcm87XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjdyA9IGZsaXBBeGVzID8gY2hhcnRCb3gud2lkdGggOiBjaGFydEJveC53aWR0aCAtIHRpY2tXaWR0aDtcbiAgICAgICAgICAgIHZhciBjaCA9IGZsaXBBeGVzID8gY2hhcnRCb3guaGVpZ2h0IC0gdGlja1dpZHRoIDogY2hhcnRCb3guaGVpZ2h0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbyA9IGNvbHVtbldpZHRoIC8gMiArIHZhbHVlSW5kZXggKiBjb2x1bW5XaWR0aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIG94ID0gZmxpcEF4ZXMgPyAwIDogbztcbiAgICAgICAgICAgIHZhciBveSA9IGZsaXBBeGVzID8gbyA6IDA7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgeCA9IHh2ICogY3cgKyBveDtcbiAgICAgICAgICAgIHkgPSB5diAqIGNoICsgb3k7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIHggPSB4diAqIGN3ICsgb3g7XG4gICAgICAgICAgICB2YXIgeSA9IGNoIC0geXYgKiBjaCArIG95O1xuICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBoID0geXYgKiBjaDtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAvL2lmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgeSA9IGNoIC0genYgKiBjaDtcbiAgICAgICAgICAgICAgaCA9ICh6diAtIHl2KSAqIGNoO1xuICAgICAgICAgICAgLyp9IGVsc2UgaWYgKHZhbHVlID49IDApIHtcbiAgICAgICAgICAgICAgaCA9IGggLSB6diAqIGNoO1xuICAgICAgICAgICAgfSovXG4gICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGZsaXBBeGVzKSB7XG4gICAgICAgICAgICAgIGggPSB3O1xuICAgICAgICAgICAgICB3ID0gKHl2IC0genYpICogY3c7XG4gICAgICAgICAgICAgIHggPSB6diAqIGN3O1xuICAgICAgICAgICAgICB5ID0geHYgKiBjaCArIG95O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgXG4gICAgICAgICAgICAgIHgxID0gTWF0aC5yb3VuZCh4KSxcbiAgICAgICAgICAgICAgeTEgPSBNYXRoLnJvdW5kKHkpLFxuICAgICAgICAgICAgICB4MiA9IE1hdGgucm91bmQoeCkgKyBNYXRoLnJvdW5kKHcpLFxuICAgICAgICAgICAgICB5MiA9IE1hdGgucm91bmQoeSkgKyBNYXRoLnJvdW5kKGgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBncmFwaExheWVyLnBhdGgoJ00nICsgeDEgKycsJyArIHkxICsgJyAnICsgeDIgKyAnLCcgKyB5MSArICcgJyArIHgyICsgJywnICsgeTIgKyAnICcgKyB4MSArICcsJyArIHkyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9ncmFwaExheWVyLmNpcmNsZSh4MSwgeTEsIDEwLCB7ZmlsbDogJ3JlZCd9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICB2YWx1ZUluZGV4Kys7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgZ3JhcGhMYXllci5ncmFwaChwb2ludHMsIHtcbiAgICAgICAgICBzdHJva2U6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAxLjVcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgXG4gICAgICAgIFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RlcCkge1xuICAgICAgY291bnQgPSAwO1xuICAgICAgc3VtID0ge307XG4gICAgfVxuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ29sdW1uQ2hhcnQucHJvdG90eXBlLCB7XG4gIGNsaXBDYXRlZ29yeUdyaWQ6IHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9LFxuICBjYXRlZ29yeUdyaWRMaW5lczoge1xuICAgIHZhbHVlOiBmYWxzZVxuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNoYXJ0OyIsInZhciBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIik7XG5cbnZhciBDYXJ0ZXNpYW5DaGFydCA9IHJlcXVpcmUoJy4vQ2FydGVzaWFuQ2hhcnQnKTtcblxuZnVuY3Rpb24gTGluZUNoYXJ0KCkge1xuICBDYXJ0ZXNpYW5DaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5MaW5lQ2hhcnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoTGluZUNoYXJ0LnByb3RvdHlwZSwge1xuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSksXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIFxuICAgIHZhclxuICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveCxcbiAgICAgIGNvbHVtbkluZGV4ID0gdGhpcy5jb2x1bW5JbmRleCxcbiAgICAgIHJvd0luZGV4ID0gMCxcbiAgICAgIHZhbHVlSW5kZXggPSAwLFxuICAgICAgdmFsdWVSYW5nZSA9IHRoaXMudmFsdWVSYW5nZSxcbiAgICAgIHZhbHVlVGlja3MgPSB0aGlzLnZhbHVlVGlja3MsXG4gICAgICB2YWx1ZU1pbiA9IE1hdGgubWluKHZhbHVlUmFuZ2UubWluLCB2YWx1ZVRpY2tzWzBdKSxcbiAgICAgIHZhbHVlTWF4ID0gTWF0aC5tYXgodmFsdWVSYW5nZS5tYXgsIHZhbHVlVGlja3NbdmFsdWVUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICBjYXRlZ29yeVR5cGUgPSB0aGlzLmNhdGVnb3J5VHlwZSxcbiAgICAgIGNhdGVnb3J5UmFuZ2UgPSB0aGlzLmNhdGVnb3J5UmFuZ2UsXG4gICAgICBjYXRlZ29yeVRpY2tzID0gdGhpcy5jYXRlZ29yeVRpY2tzLFxuICAgICAgY2F0ZWdvcnlJbmRleCA9IHRoaXMuY2F0ZWdvcnlJbmRleCxcbiAgICAgIGNhdGVnb3J5TWluID0gTWF0aC5taW4oY2F0ZWdvcnlSYW5nZS5taW4sIGNhdGVnb3J5VGlja3NbMF0pLFxuICAgICAgY2F0ZWdvcnlNYXggPSBNYXRoLm1heChjYXRlZ29yeVJhbmdlLm1heCwgY2F0ZWdvcnlUaWNrc1tjYXRlZ29yeVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIGZsaXBBeGVzID0gdGhpcy5mbGlwQXhlcyxcbiAgICAgIGdyYXBoTGF5ZXIgPSBjaGFydExheWVyLmcoKSxcbiAgICAgIHBvaW50cyxcbiAgICAgIHZhbHVlLFxuICAgICAgbm9ybWFsaXplZFZhbHVlLFxuICAgICAgY2F0ZWdvcnlWYWx1ZSxcbiAgICAgIG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlLFxuICAgICAgeCxcbiAgICAgIHk7XG4gICAgICBcbiAgICB2YXIgcm93cyA9IGRhdGFUYWJsZS5nZXRTb3J0ZWRSb3dzKGNhdGVnb3J5SW5kZXgpO1xuICAgIFxuICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgaWYgKGNvbHVtbkluZGV4ICE9PSBjYXRlZ29yeUluZGV4KSB7XG4gICAgICAgIHBvaW50cyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy9mb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgICAgZm9yIChyb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgcm93cy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICBcbiAgICAgICAgICB2YWx1ZSA9IHJvd3Nbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgICAgICAvL3ZhbHVlID0gZGF0YVRhYmxlLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgY2F0ZWdvcnlWYWx1ZSA9IGNhdGVnb3J5VHlwZSA9PT0gJ3N0cmluZycgPyByb3dJbmRleCA6IHJvd3Nbcm93SW5kZXhdW2NhdGVnb3J5SW5kZXhdO1xuICAgICAgICAgIC8vY2F0ZWdvcnlWYWx1ZSA9IGNhdGVnb3J5VHlwZSA9PT0gJ3N0cmluZycgPyByb3dJbmRleCA6IGRhdGFUYWJsZS5nZXRWYWx1ZShyb3dJbmRleCwgY2F0ZWdvcnlJbmRleCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgPSAoY2F0ZWdvcnlWYWx1ZSAtIGNhdGVnb3J5TWluKSAvICggY2F0ZWdvcnlNYXggLSBjYXRlZ29yeU1pbik7XG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSAodmFsdWUgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4diA9IGZsaXBBeGVzID8gbm9ybWFsaXplZFZhbHVlIDogbm9ybWFsaXplZENhdGVnb3J5VmFsdWU7XG4gICAgICAgICAgICB2YXIgeXYgPSBmbGlwQXhlcyA/IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlIDogbm9ybWFsaXplZFZhbHVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4ID0gTWF0aC5yb3VuZCh4diAqIGNoYXJ0Qm94LndpZHRoKTtcbiAgICAgICAgICAgIHkgPSBNYXRoLnJvdW5kKGNoYXJ0Qm94LmhlaWdodCAtIHl2ICogY2hhcnRCb3guaGVpZ2h0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcG9pbnRzLnB1c2goe3g6IHgsIHk6IHl9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGdyYXBoTGF5ZXIuZ3JhcGgocG9pbnRzLCB7XG4gICAgICAgICAgc21vb3RoOiBvcHRpb25zLnNtb290aCxcbiAgICAgICAgICBzdHJva2U6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAxLjVcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB2YWx1ZUluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQ2hhcnQ7IiwidmFyXG4gIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKSxcbiAgbmZvcm1hdCA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvbmZvcm1hdC9zcmMvbmZvcm1hdFwiKSxcbiAgZGZvcm1hdCA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvZGZvcm1hdC9zcmMvZGZvcm1hdFwiKSxcbiAgcm91bmQgPSByZXF1aXJlKCcuLi91dGlscy9yb3VuZCcpLFxuICBWaXN1YWxDaGFydCA9IHJlcXVpcmUoJy4vdmlzdWFsY2hhcnQnKTtcblxuZnVuY3Rpb24gUGllQ2hhcnQoKSB7XG4gIFZpc3VhbENoYXJ0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblBpZUNoYXJ0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlzdWFsQ2hhcnQucHJvdG90eXBlKTtcblxuX3YuZXh0ZW5kKFBpZUNoYXJ0LnByb3RvdHlwZSwge1xuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBWaXN1YWxDaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSksXG4gIF9jb25zdHJ1Y3Q6IGZ1bmN0aW9uKCkge1xuICAgIFZpc3VhbENoYXJ0LnByb3RvdHlwZS5fY29uc3RydWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgVmlzdWFsQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICBcbiAgICB2YXJcbiAgICAgIGxhYmVsRm9udFNpemUgPSAxMSxcbiAgICAgIGxhYmVsRGlzdGFuY2UgPSBsYWJlbEZvbnRTaXplICsgbGFiZWxGb250U2l6ZSAqIDAuNzUsXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgZWxlbSA9IHRoaXMuZWxlbWVudCxcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcbiAgICAgIGdyaWRMYXllciA9IGNoYXJ0TGF5ZXIuZyh7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgZm9udFNpemU6IGxhYmVsRm9udFNpemUgKyBcInB4XCJcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBjaGFydEJveCA9IHRoaXMuY2hhcnRCb3gsXG4gICAgICByb3dJbmRleCxcbiAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgY29sdW1uVHlwZSxcbiAgICAgIHR5cGUgPSBnZXRUeXBlT2ZEYXRhKGRhdGFUYWJsZSksXG4gICAgICBwaWVzID0gW10sXG4gICAgICBwaWUsXG4gICAgICB0b3RhbCA9IDAsXG4gICAgICBsYWJlbCxcbiAgICAgIHZhbHVlLFxuICAgICAgZm9ybWF0dGVkVmFsdWUsXG4gICAgICBwYXR0ZXJuLFxuICAgICAgbG9jYWxlLFxuICAgICAgaW5kZXgsXG4gICAgICBwYWRkaW5nID0gbGFiZWxEaXN0YW5jZSAqIDAuNzUsXG4gICAgICAvL3BhZGRpbmcgPSAzMCxcbiAgICAgIHkgPSBwYWRkaW5nLFxuICAgICAgciA9IChNYXRoLm1pbihjaGFydEJveC53aWR0aCwgY2hhcnRCb3guaGVpZ2h0KSAtIHBhZGRpbmcgKiAyICkgLyAyLFxuICAgICAgeCA9IGNoYXJ0Qm94LndpZHRoIC8gMiAtIHIsXG4gICAgICBwID0gMCxcbiAgICAgIGcsXG4gICAgICBhLFxuICAgICAgYXgsXG4gICAgICBheSxcbiAgICAgIHNBbmdsZSxcbiAgICAgIGVBbmdsZTtcbiAgICAgIFxuICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAvLyBDb2x1bW4gYmFzZWQgdmFsdWVzXG4gICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgY29sdW1uVHlwZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgaWYgKGNvbHVtblR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdmFsdWUgPSBkYXRhVGFibGUuZ2V0Q29sdW1uQXZlcmFnZShjb2x1bW5JbmRleCk7XG4gICAgICAgICAgcGF0dGVybiA9IGRhdGFUYWJsZS5nZXRDb2x1bW5QYXR0ZXJuKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBsb2NhbGUgPSBkYXRhVGFibGUuZ2V0Q29sdW1uTG9jYWxlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IG5mb3JtYXQodmFsdWUsIHBhdHRlcm4sIGxvY2FsZSk7XG4gICAgICAgICAgcGllcy5wdXNoKHt2OiB2YWx1ZSwgZjogZm9ybWF0dGVkVmFsdWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSb3cgYmFzZWQgdmFsdWVzXG4gICAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgY29sdW1uVHlwZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBpZiAoY29sdW1uVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIC8vIE51bWVyaWMgdmFsdWVcbiAgICAgICAgICAgIHZhbHVlID0gZGF0YVRhYmxlLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IGRhdGFUYWJsZS5nZXRGb3JtYXR0ZWRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgICAgICAgcGllcy5wdXNoKHt2OiB2YWx1ZSwgZjogZm9ybWF0dGVkVmFsdWV9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvLyBTdW0gdXAgdG90YWxcbiAgICBmb3IgKHZhciBpID0gMDsgcGllID0gcGllc1tpXTsgaSsrKSB7XG4gICAgICB0b3RhbCs9IHBpZS52O1xuICAgIH07XG4gICAgXG4gICAgLy8gRHJhdyBiYWNrZ3JvdW5kXG4gICAgY2hhcnRMYXllci5jaXJjbGUoeCArIHIsIHkgKyByLCByLCB7XG4gICAgICBmaWxsOiAnbGlnaHRncmF5J1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFJlbmRlciBwaWVzIGFuZCBsYWJlbHNcbiAgICBmb3IgKGluZGV4ID0gMDsgcGllID0gcGllc1tpbmRleF07IGluZGV4KyspIHtcbiAgICAgIFxuICAgICAgLy8gUmVuZGVyIHBpZVxuICAgICAgc0FuZ2xlID0gcCAqIE1hdGguUEkgKiAyIC0gTWF0aC5QSSAvIDI7XG4gICAgICBwID0gcGllLnAgPSBwICsgcGllLnYgLyB0b3RhbDtcbiAgICAgIFxuICAgICAgZUFuZ2xlID0gcCAqIE1hdGguUEkgKiAyIC0gTWF0aC5QSSAvIDI7XG4gICAgICBcbiAgICAgIGNoYXJ0TGF5ZXIuZyh7ZmlsbDogb3B0aW9ucy5jb2xvcnNbaW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdfSkuYXJjKHggKyByLCB5ICsgciwgciwgc0FuZ2xlLCBlQW5nbGUsIDEpO1xuICAgICAgXG4gICAgICAvLyBSZW5kZXIgbGFiZWxcbiAgICAgIGEgPSBzQW5nbGUgKyAoZUFuZ2xlIC0gc0FuZ2xlKSAvIDI7XG4gICAgICBheCA9IHIgKyBNYXRoLmNvcyhhKSAqIChyICsgbGFiZWxEaXN0YW5jZSk7XG4gICAgICBheSA9IHIgKyBNYXRoLnNpbihhKSAqIChyICsgbGFiZWxEaXN0YW5jZSk7XG4gICAgICBcbiAgICAgIGdyaWRMYXllci50ZXh0KHggKyBheCwgeSArIGF5LCBwaWUuZiwge3RleHRBbmNob3I6ICdtaWRkbGUnLCBkeDogJzAuMWVtJywgZHk6ICcwLjdlbSd9KTtcbiAgICAgIFxuICAgIH1cbiAgICBcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGdldFR5cGVPZkRhdGEoZGF0YVRhYmxlKSB7XG4gIC8vIERldGVjdCB0eXBlIG9mIGRhdGFcbiAgdmFyIGNvbHVtblR5cGU7XG4gIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgIGNvbHVtblR5cGUgPSBkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCk7XG4gICAgaWYgKGNvbHVtblR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDA7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBpZUNoYXJ0LnByb3RvdHlwZSwge1xuICBcbiAgbGVnZW5kSXRlbXM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgcm93SW5kZXgsXG4gICAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgICB2YWx1ZUluZGV4ID0gMCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHR5cGUgPSBnZXRUeXBlT2ZEYXRhKGRhdGFUYWJsZSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgICAvLyBDb2x1bW4gYmFzZWQgdmFsdWVzXG4gICAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCh7bGFiZWw6IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCksIGJ1bGxldDogeyBmaWxsOiBvcHRpb25zLmNvbG9yc1t2YWx1ZUluZGV4ICUgb3B0aW9ucy5jb2xvcnMubGVuZ3RoXSB9IH0pO1xuICAgICAgICAgICAgICB2YWx1ZUluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFJvdyBiYXNlZCB2YWx1ZXNcbiAgICAgICAgZm9yIChyb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mUm93cygpOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAvLyBMYWJlbFxuICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGRhdGFUYWJsZS5nZXRGb3JtYXR0ZWRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpIHx8IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVlhZWlwiLmNoYXJBdChyb3dJbmRleCAlIDIxKSxcbiAgICAgICAgICAgICAgICBidWxsZXQ6IHtcbiAgICAgICAgICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdmFsdWVJbmRleCsrO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIFxuICAgIH1cbiAgfVxuICBcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpZUNoYXJ0OyIsInZhciBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIik7XG5cbnZhciBCYXNlQ2hhcnQgPSByZXF1aXJlKCcuL2Jhc2VjaGFydCcpO1xuXG5mdW5jdGlvbiBUYWJsZUNoYXJ0KCkge1xuICBCYXNlQ2hhcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuVGFibGVDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoVGFibGVDaGFydC5wcm90b3R5cGUsIHtcbiAgXG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIEJhc2VDaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSksXG4gIFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHtcbiAgICBCYXNlQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZW5kZXIgbGF5ZXJcbiAgICBCYXNlQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHZhclxuICAgICAgZWxlbWVudCA9IHRoaXMuZWxlbWVudCxcbiAgICAgIGxheWVyID0gX3YoKSxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgcm93SW5kZXgsXG4gICAgICBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQsXG4gICAgICB0YWJsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCd0YWJsZScpLFxuICAgICAgY2FwdGlvbiA9IGRvYy5jcmVhdGVFbGVtZW50KCdjYXB0aW9uJyksXG4gICAgICB0aGVhZCA9IGRvYy5jcmVhdGVFbGVtZW50KCd0aGVhZCcpLFxuICAgICAgdGJvZHkgPSBkb2MuY3JlYXRlRWxlbWVudCgndGJvZHknKSxcbiAgICAgIHRyLCB0aCwgdGQsXG4gICAgICBldmVuO1xuICAgICAgXG4gICAgICAvLyBSZW5kZXIgaHRtbFxuICAgICAgXG4gICAgX3YuY3NzKHRhYmxlLCB7XG4gICAgICBmb250U2l6ZTogJzEycHgnLFxuICAgICAgYm9yZGVyQ29sbGFwc2U6IFwiY29sbGFwc2VcIixcbiAgICAgIGJvcmRlcjogXCIxcHggc29saWQgI2VmZWZlZlwiLFxuICAgICAgbWFyZ2luQm90dG9tOiAnMS41ZW0nLFxuICAgICAgd2lkdGg6ICc2MDBweCcsXG4gICAgICBtYXhXaWR0aDogJzEwMCUnLFxuICAgICAgZGlzcGxheTogJ3RhYmxlJyxcbiAgICAgIHRhYmxlTGF5b3V0OiAnZml4ZWQnXG4gICAgfSk7XG4gICAgXG4gICAgY2FwdGlvbi5pbm5lckhUTUwgPSBvcHRpb25zLnRpdGxlIHx8IFwiVGFibGVDaGFydFwiO1xuICAgIFxuICAgIF92LmNzcyhjYXB0aW9uLCB7XG4gICAgICBmb250U2l6ZTogXCIxMjAlXCIsXG4gICAgICBjb2xvcjogJ2luaGVyaXQnLFxuICAgICAgdGV4dEFsaWduOiAnbGVmdCdcbiAgICB9KTtcbiAgICBcbiAgICB0YWJsZS5hcHBlbmRDaGlsZChjYXB0aW9uKTtcbiAgICAvKl92LmNzcyh0aGVhZCwge1xuICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgIH0pO1xuICAgIF92LmNzcyh0Ym9keSwge1xuICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgIH0pOyovXG4gICAgXG4gICAgXG4gICAgdGFibGUuYXBwZW5kQ2hpbGQodGhlYWQpO1xuICAgIFxuICAgIC8vIENvbHVtbiB0aXRsZXNcbiAgICB2YXIgaGFzQ29sdW1uTGFiZWxzID0gZmFsc2U7IFxuICAgIHRyID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG4gICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICB0aCA9IGRvYy5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgICAgdmFyIGxhYmVsID0gZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KTtcbiAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICBoYXNDb2x1bW5MYWJlbHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGguaW5uZXJIVE1MID0gbGFiZWw7XG4gICAgICBfdi5jc3ModGgsIHtcbiAgICAgICAgLy93aWR0aDogMTAwIC8gZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpICsgXCIlXCIsXG4gICAgICAgIGJvcmRlcjogXCIxcHggc29saWQgI2RmZGZkZlwiLFxuICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlZmVmZWYnLFxuICAgICAgICB3b3JkV3JhcDogJ2JyZWFrLXdvcmQnLFxuICAgICAgICBwYWRkaW5nOiAnNXB4J1xuICAgICAgfSk7XG4gICAgICB0ci5hcHBlbmRDaGlsZCh0aCk7XG4gICAgfVxuICAgIGlmIChoYXNDb2x1bW5MYWJlbHMpIHtcbiAgICAgIHRoZWFkLmFwcGVuZENoaWxkKHRyKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUm93c1xuICAgIHRhYmxlLmFwcGVuZENoaWxkKHRib2R5KTtcbiAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgIGV2ZW4gPSByb3dJbmRleCAlIDI7XG4gICAgICB0ciA9IGRvYy5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgIHRkID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIHRkLmlubmVySFRNTCA9IGRhdGFUYWJsZS5nZXRGb3JtYXR0ZWRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgICBfdi5jc3ModGQsIHtcbiAgICAgICAgICAvL3dpZHRoOiAxMDAgLyBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCkgKyBcIiVcIixcbiAgICAgICAgICBib3JkZXI6IFwiMXB4IHNvbGlkICNlZmVmZWZcIixcbiAgICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBldmVuID8gJyNmYWZhZmEnIDogJycsXG4gICAgICAgICAgd29yZFdyYXA6ICdicmVhay13b3JkJyxcbiAgICAgICAgICBwYWRkaW5nOiAnNXB4J1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgIH1cbiAgICAgIHRib2R5LmFwcGVuZENoaWxkKHRyKTtcbiAgICB9XG4gICAgXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgXG4gICAgXG4gICAgLy8gUmVuZGVyIFNWRyBMYXllciB1c2luZyBhIGZvcmVpZ24gb2JqZWN0XG4gICAgLypcbiAgICBsYXllclxuICAgICAgLmNsZWFyKClcbiAgICAgIC5hdHRyKHtcbiAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcInhNaWRZTWlkIG1lZXRcIixcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDBcbiAgICAgIH0pO1xuXG4gICAgdmFyIGZvcmVpZ24gPSBsYXllclxuICAgICAgLmNyZWF0ZSgnZm9yZWlnbk9iamVjdCcsIHtcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgaGVpZ2h0OiA0MDBcbiAgICAgIH0pO1xuICAgICAgXG4gICAgdmFyIGJvZHkgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgJ2JvZHknKTtcbiAgICBmb3JlaWduLmF0dHIoJ3JlcXVpcmVkLWV4dGVuc2lvbnMnLCBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIik7XG4gICAgbGF5ZXIuYXBwZW5kKGZvcmVpZ24pO1xuICAgIGZvcmVpZ24uYXBwZW5kKGJvZHkpO1xuICAgIFxuICAgIGJvZHkuYXBwZW5kQ2hpbGQodGFibGUpO1xuICAgIFxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGxheWVyWzBdKTtcbiAgICAqL1xuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGFibGVDaGFydC5wcm90b3R5cGUsIHtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlQ2hhcnQ7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcblxudmFyXG4gIEJhc2VDaGFydCA9IHJlcXVpcmUoJy4vYmFzZWNoYXJ0JyksXG4gIHJvdW5kID0gcmVxdWlyZSgnLi4vdXRpbHMvcm91bmQnKTtcblxuZnVuY3Rpb24gVmlzdWFsQ2hhcnQoKSB7XG4gIEJhc2VDaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5WaXN1YWxDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoVmlzdWFsQ2hhcnQucHJvdG90eXBlLCB7XG4gIFxuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBCYXNlQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgLy9jb2xvcnM6IFsnbmF2eScsICdtYXJvb24nLCAnb2xpdmUnLCAndGVhbCcsICdicm93bicsICdncmVlbicsICdibHVlJywgJ3B1cnBsZScsICdvcmFuZ2UnLCAndmlvbGV0JywgJ2N5YW4nLCAnZnVjaHNpYScsICd5ZWxsb3cnLCAnbGltZScsICdhcXVhJywgJ3JlZCddLFxuICAgIGNvbG9yczogXCIjMjg3Q0NFLCM5NjNBNzQsIzQ4RTM4NywjRTVBMDY5LCM1MEYyRjcsI0Y1NUE0NCwjNzM3MzczXCIuc3BsaXQoL1tcXHMsXSsvKSxcbiAgICBsZWdlbmQ6ICd0b3AnXG4gIH0pLFxuICBcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7XG4gIFxuICAgIEJhc2VDaGFydC5wcm90b3R5cGUuX2NvbnN0cnVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHZhclxuICAgICAgbGF5ZXIgPSBfdigpLFxuICAgICAgY2hhcnRMYXllciA9IGxheWVyLmNyZWF0ZSgnZycpO1xuICAgICAgICBcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBsYXllcjoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNoYXJ0TGF5ZXI6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gY2hhcnRMYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFJlbmRlciBsYXllclxuICAgIEJhc2VDaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyXG4gICAgICB3aWR0aCA9IDYwMCxcbiAgICAgIGhlaWdodCA9IDQwMCxcbiAgICAgIHNwYWNpbmcgPSA3LFxuICAgICAgXG4gICAgICBlbGVtID0gdGhpcy5lbGVtZW50LFxuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgbGF5ZXIgPSB0aGlzLmxheWVyLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcblxuICAgICAgY2hhcnRCb3gsXG4gICAgICBcbiAgICAgIHRpdGxlTGF5ZXIsXG4gICAgICB0aXRsZSA9IG9wdGlvbnMudGl0bGUgfHwgXCJcIixcbiAgICAgIFxuICAgICAgbGVnZW5kSXRlbXMgPSB0aGlzLmxlZ2VuZEl0ZW1zLFxuICAgICAgbGVnZW5kTGF5ZXIsXG4gICAgICBsZWdlbmRCb3ggPSB7fTtcbiAgICAgIC8qXG4gICAgICBfdi5jc3MoZWxlbSwge1xuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgbWF4V2lkdGg6IHdpZHRoICsgXCJweFwiLFxuICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodCArIFwicHhcIixcbiAgICAgICAgLy9wYWRkaW5nVG9wOiAoKHdpZHRoIC8gaGVpZ2h0KSArIDEwMCkgKyBcIiVcIixcbiAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgIH0pOyovXG5cbiAgICAgIC8vIFJlbmRlciBsYXllclxuICAgICAgZWxlbS5hcHBlbmRDaGlsZChsYXllclswXSk7XG4gICAgICBsYXllclxuICAgICAgICAuY2xlYXIoKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgICBoZWlnaHQ6IDQwMCxcbiAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcbiAgICAgICAgICAvKndpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLCovXG4gICAgICAgICAgLy9oZWlnaHQ6IFwiYXV0b1wiLFxuICAgICAgICAgIC8vd2lkdGg6IHdpZHRoICsgXCJweFwiLFxuICAgICAgICAgIC8vaGVpZ2h0OiBoZWlnaHQgKyBcInB4XCIsXG4gICAgICAgICAgLy9oZWlnaHQ6IGhlaWdodCArIFwicHhcIixcbiAgICAgICAgICBcbiAgICAgICAgICAvL2hlaWdodDogaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICAgIC8qXG4gICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgIGhlaWdodDogXCJhdXRvXCIsXG4gICAgICAgICAgKi9cbiAgICAgICAgICAvL2hlaWdodDogXCJhdXRvXCIsXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIGZpbGw6IF92LmNzcyhlbGVtLCAnY29sb3InKSwgXG4gICAgICAgICAgICAvKnBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgbGVmdDogMCwqL1xuICAgICAgICAgICAgLy93aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICAvL2hlaWdodDogXCJhdXRvXCIsXG4gICAgICAgICAgICAvL21heEhlaWdodDogaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICAgICAgbWF4V2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHQgKyBcInB4XCIsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiYXV0b1wiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aWV3Qm94OiBcIjAgMCBcIiArIDYwMCArIFwiIFwiICsgNDAwLFxuICAgICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW86IFwieE1pZFlNaWQgbWVldFwiXG4gICAgICAgICAgLy9wcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcIm5vbmVcIlxuICAgICAgICAgIC8vcHJlc2VydmVBc3BlY3RSYXRpbzogXCJ4TWluWU1pbiBtZWV0XCJcbiAgICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vbWF4LXdpZHRoOiAxMDAlOyBtYXgtaGVpZ2h0OiA0MDBweDsgaGVpZ2h0OiBhdXRvO1xuICAgICAgLy9sYXllci5hdHRyKCdzdHlsZScsIGxheWVyWzBdLnN0eWxlLmNzc1RleHQgKyAnIGhlaWdodDonICsgaGVpZ2h0ICsgJ3B4XFxcXCcpO1xuICAgICAgXG4gICAgICAvKlxuICAgICAgY29uc29sZS5sb2cobGF5ZXIuYXR0cignd2lkdGgnKSwgbGF5ZXIuYXR0cignaGVpZ2h0JykpO1xuICAgICAgY29uc29sZS5sb2cobGF5ZXIuYXR0cignc3R5bGUnKSk7XG4gICAgICBjb25zb2xlLmxvZyhsYXllci5hdHRyKCd2aWV3Qm94JykpO1xuICAgICAgY29uc29sZS5sb2cobGF5ZXIuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycpKTtcbiAgICAgICovXG4gICAgIFxuICAgICAgY2hhcnRCb3ggPSB0aGlzLmNoYXJ0Qm94O1xuICAgICAgdmFyIGxheWVyUmVjdCA9IHRoaXMubGF5ZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBcbiAgICAgIFxuICAgICAgdmFyIHRleHRDb2xvciA9IGxheWVyLmNzcygnY29sb3InKTtcbiAgICAgIC8vIFJlbmRlciB0aXRsZVxuICAgICAgdGl0bGVMYXllciA9IGxheWVyLmcoKTtcbiAgICAgIHRpdGxlTGF5ZXJcbiAgICAgICAgLnRleHQoMCwgLTIsIHRpdGxlLCB7c3R5bGU6IHtmb250U2l6ZTogJzEyMCUnfSwgdGV4dEFuY2hvcjogJ3N0YXJ0J30pXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBcInRyYW5zbGF0ZShcIiArIE1hdGguZmxvb3IoY2hhcnRCb3gueCkgKyBcIixcIiArIE1hdGguZmxvb3IoY2hhcnRCb3gueSAtIHNwYWNpbmcpICsgXCIpXCIpO1xuICAgICAgXG4gICAgICBpZiAodGhpcy5sZWdlbmRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgbGVnZW5kTGF5ZXIgPSBsYXllci5nKCk7XG4gICAgICAgIC8vIFJlbmRlciBsZWdlbmRcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmxlZ2VuZCkge1xuICAgICAgICAgIGNhc2UgJ3RvcCc6IFxuICAgICAgICAgICAgbGVnZW5kTGF5ZXJcbiAgICAgICAgICAgICAgLmxpc3Rib3goMCwgMCwgY2hhcnRCb3gud2lkdGgsIDAsIGxlZ2VuZEl0ZW1zLCB7aG9yaXpvbnRhbDogdHJ1ZSwgZmlsbDogdGV4dENvbG9yfSlcbiAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueCkgKyAnLCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnkgLSBzcGFjaW5nICogMiAtIGxlZ2VuZExheWVyLmJib3goKS5oZWlnaHQpICsgJyknKTtcbiAgICAgICAgICAgIHRpdGxlTGF5ZXJcbiAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIFwidHJhbnNsYXRlKFwiICsgTWF0aC5mbG9vcihjaGFydEJveC54KSArIFwiLFwiICsgTWF0aC5mbG9vcihjaGFydEJveC55IC0gc3BhY2luZyAqIDMgLSBsZWdlbmRMYXllci5iYm94KCkuaGVpZ2h0KSArIFwiKVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6IFxuICAgICAgICAgICAgbGVnZW5kTGF5ZXJcbiAgICAgICAgICAgICAgLmxpc3Rib3goMCwgMCwgY2hhcnRCb3gud2lkdGgsIDAsIGxlZ2VuZEl0ZW1zLCB7aG9yaXpvbnRhbDogdHJ1ZSwgZmlsbDogdGV4dENvbG9yfSlcbiAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueCArIHNwYWNpbmcpICsgJywnICsgTWF0aC5mbG9vcihjaGFydEJveC55ICsgY2hhcnRCb3guaGVpZ2h0ICsgc3BhY2luZykgKyAnKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbGVmdCc6IFxuICAgICAgICAgICAgbGVnZW5kTGF5ZXJcbiAgICAgICAgICAgICAgLmxpc3Rib3goMCwgMCwgY2hhcnRCb3gud2lkdGgsIDAsIGxlZ2VuZEl0ZW1zLCB7ZmlsbDogdGV4dENvbG9yfSlcbiAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueCArIHNwYWNpbmcpICsgJywnICsgTWF0aC5mbG9vcihjaGFydEJveC55ICsgc3BhY2luZykgKyAnKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgbGVnZW5kTGF5ZXJcbiAgICAgICAgICAgICAgLmxpc3Rib3goMCwgMCwgbGF5ZXJSZWN0LndpZHRoIC0gKGNoYXJ0Qm94LnggKyBjaGFydEJveC53aWR0aCkgLSBzcGFjaW5nICogMiwgMCwgbGVnZW5kSXRlbXMsIHtmaWxsOiB0ZXh0Q29sb3J9KVxuICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgTWF0aC5mbG9vcihjaGFydEJveC54ICsgY2hhcnRCb3gud2lkdGggKyBzcGFjaW5nKSArICcsJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueSkgKyAnKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgXG4gICAgLy8gQWRkIGNoYXJ0IGxheWVyXG4gICAgY2hhcnRMYXllci5jbGVhcigpO1xuICAgIGxheWVyLmFwcGVuZChjaGFydExheWVyKTtcbiAgXG4gICAgLy9sYXllci5yZWN0KGNoYXJ0Qm94LngsIGNoYXJ0Qm94LnksIGNoYXJ0Qm94LndpZHRoLCBjaGFydEJveC5oZWlnaHQsIHtzdHlsZTogXCJmaWxsOnRyYW5zcGFyZW50O3N0cm9rZTpibGFjaztzdHJva2Utd2lkdGg6MTtvcGFjaXR5OjAuNVwifSk7XG4gICAgY2hhcnRMYXllci5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjaGFydEJveC54ICsgJywnICsgY2hhcnRCb3gueSArICcpJyk7XG4gIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhWaXN1YWxDaGFydC5wcm90b3R5cGUsIHtcbiAgY2hhcnRCb3g6IHtcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuIHt4OiAwLCB5OiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwfTtcbiAgICAgIH1cbiAgICAgIHZhclxuICAgICAgICBzID0gMC42LFxuICAgICAgICAvL3JlY3QgPSB0aGlzLmxheWVyICYmIHRoaXMubGF5ZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZpZXdCb3ggPSB0aGlzLmxheWVyLmF0dHIoJ3ZpZXdCb3gnKS5zcGxpdChcIiBcIiksXG4gICAgICAgIHcgPSByb3VuZCh2aWV3Qm94WzJdKSxcbiAgICAgICAgaCA9IHJvdW5kKHZpZXdCb3hbM10pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogcm91bmQodyAqICgxIC0gcykgLyAyKSxcbiAgICAgICAgeTogcm91bmQoaCAqICgxIC0gcykgLyAyKSxcbiAgICAgICAgd2lkdGg6IHcgKiBzLFxuICAgICAgICBoZWlnaHQ6IGggKiBzXG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgbGVnZW5kSXRlbXM6IHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICBjb2xvckluZGV4ID0gMCxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGxhYmVsO1xuICAgICAgaWYgKGRhdGFUYWJsZSkge1xuICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICBsYWJlbCA9IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCk7XG4gICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7bGFiZWw6IGxhYmVsLCBidWxsZXQ6IHsgZmlsbDogb3B0aW9ucy5jb2xvcnNbY29sb3JJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF0gfSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29sb3JJbmRleCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlzdWFsQ2hhcnQ7IiwidmFyXG4gIG5mb3JtYXQgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL25mb3JtYXQvc3JjL25mb3JtYXRcIiksXG4gIGRmb3JtYXQgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL2Rmb3JtYXQvc3JjL2Rmb3JtYXRcIik7XG5cbmZ1bmN0aW9uIERhdGFUYWJsZShkYXRhKSB7XG4gIFxuICBpZiAoZGF0YSBpbnN0YW5jZW9mIERhdGFUYWJsZSkge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG4gIFxuICB2YXIgXG4gICAgY29scyA9IGRhdGEgJiYgZGF0YS5jb2xzIHx8IFtdLFxuICAgIHJvd3MgPSBkYXRhICYmIGRhdGEucm93cyB8fCBbXTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uSWQgPSBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgIHJldHVybiBjb2xzW2NvbHVtbkluZGV4XSAmJiBjb2xzW2NvbHVtbkluZGV4XS5pZDtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uTGFiZWwgPSBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgIHJldHVybiBjb2xzW2NvbHVtbkluZGV4XSAmJiBjb2xzW2NvbHVtbkluZGV4XS5sYWJlbCB8fCBcIlwiO1xuICAgIC8vcmV0dXJuIGNvbHNbY29sdW1uSW5kZXhdICYmIChjb2xzW2NvbHVtbkluZGV4XS5sYWJlbCB8fCBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZYWVpcIi5jaGFyQXQoY29sdW1uSW5kZXggJSAyMSkpO1xuICB9O1xuICBcbiAgdGhpcy5nZXRDb2x1bW5UeXBlID0gZnVuY3Rpb24oY29sdW1uSW5kZXgpIHtcbiAgICByZXR1cm4gY29sc1tjb2x1bW5JbmRleF0gJiYgY29sc1tjb2x1bW5JbmRleF0udHlwZTtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uUGF0dGVybiA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4KSB7XG4gICAgcmV0dXJuIGNvbHNbY29sdW1uSW5kZXhdICYmIGNvbHNbY29sdW1uSW5kZXhdLnBhdHRlcm47XG4gIH07XG4gIFxuICB0aGlzLmdldENvbHVtbkxvY2FsZSA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4KSB7XG4gICAgcmV0dXJuIGNvbHNbY29sdW1uSW5kZXhdICYmIGNvbHNbY29sdW1uSW5kZXhdLmxvY2FsZTtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uUmFuZ2UgPSBmdW5jdGlvbihjb2x1bW5JbmRleCwgcm93SW5kZXhTdGFydCwgcm93SW5kZXhFbmQpIHtcbiAgICBpZiAodGhpcy5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7bWluOiB0aGlzLmdldFZhbHVlKDAsIGNvbHVtbkluZGV4KSwgbWF4OiB0aGlzLmdldFZhbHVlKHRoaXMuZ2V0TnVtYmVyT2ZSb3dzKCkgLSAxLCBjb2x1bW5JbmRleCl9O1xuICAgIH1cbiAgICByb3dJbmRleFN0YXJ0ID0gcm93SW5kZXhTdGFydCA/IHJvd0luZGV4U3RhcnQgOiAwO1xuICAgIHJvd0luZGV4RW5kID0gcm93SW5kZXhFbmQgPyByb3dJbmRleEVuZCA6IHRoaXMuZ2V0TnVtYmVyT2ZSb3dzKCkgLSAxO1xuICAgIHZhciB2YWx1ZSwgbWluID0gbnVsbCwgbWF4ID0gbnVsbDtcbiAgICBmb3IgKHJvd0luZGV4ID0gcm93SW5kZXhTdGFydDsgcm93SW5kZXggPD0gcm93SW5kZXhFbmQ7IHJvd0luZGV4KyspIHtcbiAgICAgIHZhbHVlID0gdGhpcy5nZXRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUudmFsdWVPZiAmJiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZSkpIHtcbiAgICAgICAgbWluID0gbWluID09PSBudWxsIHx8IHZhbHVlLnZhbHVlT2YoKSA8IG1pbi52YWx1ZU9mKCkgPyB2YWx1ZSA6IG1pbjtcbiAgICAgICAgbWF4ID0gbWF4ID09PSBudWxsIHx8IHZhbHVlLnZhbHVlT2YoKSA+IG1heC52YWx1ZU9mKCkgPyB2YWx1ZSA6IG1heDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHttaW46IG1pbiwgbWF4OiBtYXh9O1xuICB9O1xuICBcbiAgdGhpcy5nZXRDb2x1bW5BdmVyYWdlID0gZnVuY3Rpb24oY29sdW1uSW5kZXgsIHJvd0luZGV4U3RhcnQsIHJvd0luZGV4RW5kKSB7XG4gICAgcm93SW5kZXhTdGFydCA9IHJvd0luZGV4U3RhcnQgPyByb3dJbmRleFN0YXJ0IDogMDtcbiAgICByb3dJbmRleEVuZCA9IHJvd0luZGV4RW5kID8gcm93SW5kZXhFbmQgOiB0aGlzLmdldE51bWJlck9mUm93cygpIC0gMTtcbiAgICB2YXIgY291bnQgPSByb3dJbmRleEVuZCArIDEgLSByb3dJbmRleFN0YXJ0LCBzdW0gPSAwO1xuICAgIGZvciAocm93SW5kZXggPSByb3dJbmRleFN0YXJ0OyByb3dJbmRleCA8PSByb3dJbmRleEVuZDsgcm93SW5kZXgrKykge1xuICAgICAgdmFsdWUgPSB0aGlzLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlLnZhbHVlT2YoKSA9PT0gXCJzdHJpbmdcIiAmJiAhdmFsdWUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBzdW0rPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgfVxuICAgIHZhciBhdmcgPSBzdW0gLyBjb3VudDtcbiAgICBpZiAodGhpcy5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KSA9PT0gJ2RhdGUnKSB7XG4gICAgICBhdmcgPSBuZXcgRGF0ZShhdmcpO1xuICAgIH1cbiAgICByZXR1cm4gYXZnO1xuICB9O1xuICBcbiAgdGhpcy5nZXREaXN0aW5jdFZhbHVlcyA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4KSB7XG4gICAgdmFyXG4gICAgICByb3dJbmRleDtcbiAgICAgIHZhbHVlcyA9IFtdO1xuICAgIGZvciAocm93SW5kZXggPSAwOyByb3dJbmRleCA8IHRoaXMuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUocm93SW5kZXgsIGNvbHVtbkluZGV4KTtcbiAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0U29ydGVkUm93cyA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4LCBkZXNjKSB7XG4gICAgdmFyXG4gICAgICByZXN1bHQgPSByb3dzLnNsaWNlKCk7XG4gICAgaWYgKHRoaXMuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXN1bHQgPSBkZXNjID8gcmVzdWx0LnJldmVyc2UoKSA6IHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICB2YXIgYXYgPSAodHlwZW9mIGFbY29sdW1uSW5kZXhdID09PSAnb2JqZWN0JyA/IGFbY29sdW1uSW5kZXhdLnYgOiBhW2NvbHVtbkluZGV4XSk7XG4gICAgICAgIHZhciBidiA9ICh0eXBlb2YgYltjb2x1bW5JbmRleF0gPT09ICdvYmplY3QnID8gYltjb2x1bW5JbmRleF0udiA6IGJbY29sdW1uSW5kZXhdKTtcbiAgICAgICAgdmFyIHMgPSBhdiA8IGJ2ID8gLTEgOiBhdiA+IGJ2ID8gMSA6IDA7XG4gICAgICAgIHJldHVybiBkZXNjID8gcyAqIC0xIDogcztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiByb3cubWFwKGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBjZWxsID09PSAnb2JqZWN0JyA/IGNlbGwudiA6IGNlbGw7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0VmFsdWUgPSBmdW5jdGlvbihyb3dJbmRleCwgY29sdW1uSW5kZXgpIHtcbiAgICB2YXIgY2VsbCA9IHJvd3Nbcm93SW5kZXhdICYmIHJvd3Nbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICByZXR1cm4gdHlwZW9mIGNlbGwgPT09ICdvYmplY3QnID8gY2VsbC52IDogY2VsbDtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Rm9ybWF0dGVkVmFsdWUgPSBmdW5jdGlvbihyb3dJbmRleCwgY29sdW1uSW5kZXgpIHtcbiAgICB2YXIgY2VsbCA9IHJvd3Nbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICByZXR1cm4gdHlwZW9mIGNlbGwgPT09ICdvYmplY3QnID8gdHlwZW9mIGNlbGwuZiAhPT0gJ3VuZGVmaW5lZCcgPyBjZWxsLmYgOiBjZWxsLnYgOiBjZWxsO1xuICB9O1xuICBcbiAgdGhpcy5nZXROdW1iZXJPZkNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29scy5sZW5ndGg7XG4gIH07XG4gIFxuICB0aGlzLmdldE51bWJlck9mUm93cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiByb3dzLmxlbmd0aDtcbiAgfTtcbiAgXG4gIHRoaXMudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbHM6IGNvbHMsIFxuICAgICAgcm93czogcm93c1xuICAgIH07XG4gIH07XG59XG5cbkRhdGFUYWJsZS5mcm9tSlNPTiA9IGZ1bmN0aW9uKGpzb24pIHtcbiAgLypcbiAgdmFyIHJlc3VsdCA9IG5ldyBEYXRhVGFibGUoKTtcbiAgKGRhdGEuY29scyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4sIGNvbHVtbkluZGV4KSB7XG4gICAgcmVzdWx0LmFkZENvbHVtbihjb2x1bW4udHlwZSwgY29sdW1uLmxhYmVsLCBjb2x1bW4ucGF0dGVybik7XG4gICAgKGRhdGEucm93cyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyb3csIHJvd0luZGV4KSB7XG4gICAgICB2YXIgY2VsbCA9IHJvd1tjb2x1bW5JbmRleF07XG4gICAgICByZXN1bHQuc2V0Q2VsbChyb3dJbmRleCwgY29sdW1uSW5kZXgsIGNlbGwudiwgY2VsbC5mKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7Ki9cbiAgcmV0dXJuIG5ldyBEYXRhVGFibGUoanNvbik7IFxufTtcblxuXG5mdW5jdGlvbiBkZXRlY3RDb2x1bW5UeXBlKHN0cmluZykge1xuICB2YXIgZGF0ZVZhbHVlID0gZGZvcm1hdC5wYXJzZShzdHJpbmcpO1xuICB2YXIgbnVtVmFsdWUgPSBuZm9ybWF0LnBhcnNlKHN0cmluZyk7XG4gIGlmICghaXNOYU4obmZvcm1hdC5wYXJzZShzdHJpbmcpKSkge1xuICAgIC8vIE51bWJlclxuICAgIHJldHVybiBcIm51bWJlclwiO1xuICB9IGVsc2UgaWYgKGRmb3JtYXQucGFyc2Uoc3RyaW5nKSkge1xuICAgIHJldHVybiBcImRhdGVcIjtcbiAgfVxuICByZXR1cm4gXCJzdHJpbmdcIjtcbn1cblxuRGF0YVRhYmxlLmZyb21BcnJheSA9IGZ1bmN0aW9uKGRhdGEsIG9wdGlvbnMpIHtcbiAgXG4gIGlmIChkYXRhIGluc3RhbmNlb2YgRGF0YVRhYmxlKSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbiAgXG4gIGlmIChkYXRhLnJvd3MgfHwgZGF0YS5jb2xzKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRhVGFibGUoZGF0YSk7XG4gIH1cbiAgdmFyIGNvbHVtbkRhdGEgPSBbXTtcbiAgdmFyIHJvd0luZGV4LCBjb2x1bW5JbmRleDtcbiAgdmFyIGZpcnN0Um93QXNMYWJlbHMgPSBmYWxzZTtcbiAgZGF0YSA9IGRhdGEuc2xpY2UoKTtcbiAgdmFyIGxlbiA9IE1hdGgubWluKDIsIGRhdGEubGVuZ3RoKTtcbiAgXG4gIFxuICAvLyBUcmltIGVtcHR5IHJvd3NcbiAgdmFyIHRyaW1tZWQgPSBbXTtcbiAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IGRhdGEubGVuZ3RoOyByb3dJbmRleCsrICkge1xuICAgIHZhciByb3cgPSBkYXRhW3Jvd0luZGV4XTtcbiAgICB2YXIgaXNFbXB0eSA9IHRydWU7XG4gICAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IHJvdy5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgICB2YXIgY2VsbCA9IGRhdGFbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgIGlmICghKHR5cGVvZiBjZWxsID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgY2VsbCA9PT0gbnVsbCB8fCBjZWxsLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzRW1wdHkpIHtcbiAgICAgIHRyaW1tZWQucHVzaChyb3cpO1xuICAgIH1cbiAgfVxuICBkYXRhID0gdHJpbW1lZDtcbiAgXG4gIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBsZW47IHJvd0luZGV4KysgKSB7XG4gICAgdmFyIHJvdyA9IGRhdGFbcm93SW5kZXhdO1xuICAgIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCByb3cubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgICAgdmFyIGNvbCA9IGNvbHVtbkRhdGFbY29sdW1uSW5kZXhdID0gY29sdW1uRGF0YVtjb2x1bW5JbmRleF0gfHwge307IFxuICAgICAgdmFyIGZvcm1hdHRlZFZhbHVlID0gcm93W2NvbHVtbkluZGV4XTtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHZhciBjb2x1bW5UeXBlID0gZGV0ZWN0Q29sdW1uVHlwZShmb3JtYXR0ZWRWYWx1ZSk7XG4gICAgICBpZiAoY29sdW1uVHlwZSA9PT0gXCJzdHJpbmdcIiAmJiByb3dJbmRleCA9PT0gMCAmJiBmb3JtYXR0ZWRWYWx1ZSkge1xuICAgICAgICBjb2wubGFiZWwgPSBmb3JtYXR0ZWRWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHZhciBmaXJzdFJvd0FzTGFiZWxzID0gdHJ1ZTtcbiAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGNvbHVtbkRhdGEubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgIHZhciBjZWxsMSA9IGRhdGFbMF1bY29sdW1uSW5kZXhdO1xuICAgIHZhciBjZWxsMiA9IGRhdGFbMV1bY29sdW1uSW5kZXhdO1xuICAgIHZhciBjb2x1bW5UeXBlMSA9IGRldGVjdENvbHVtblR5cGUoY2VsbDEpO1xuICAgIHZhciBjb2x1bW5UeXBlMiA9IGRldGVjdENvbHVtblR5cGUoY2VsbDIpO1xuICAgIGlmIChjb2x1bW5UeXBlMSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgZmlyc3RSb3dBc0xhYmVscyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBcbiAgaWYgKGZpcnN0Um93QXNMYWJlbHMpIHtcbiAgICB2YXIgbGFiZWxSb3cgPSBkYXRhWzBdO1xuICAgIGRhdGEuc3BsaWNlKDAsIDEpO1xuICAgIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBjb2x1bW5EYXRhLmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICAgICBjb2wubGFiZWwgPSBsYWJlbFJvd1tjb2x1bW5JbmRleF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBjb2x1bW5EYXRhLmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICAgICB2YXIgY29sID0gY29sdW1uRGF0YVtjb2x1bW5JbmRleF07XG4gICAgICAgY29sLmxhYmVsID0gXCJcIjtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIFRyaW0gYXJyYXkgdG8gMTAwIHJvd3NcbiAgaWYgKGRhdGEubGVuZ3RoID4gMTAwKSB7XG4gICAgdmFyIG0gPSBNYXRoLnJvdW5kKChkYXRhLmxlbmd0aCAtIDIpIC8gMTAwKTtcbiAgICBpZiAobSA+IDEpIHtcbiAgICAgIHZhciB0cmltbWVkID0gW2RhdGFbMF1dO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCAoZGF0YS5sZW5ndGggLSAyKTsgaSsrKSB7XG4gICAgICAgIGlmIChpICUgbSA9PT0gMCkge1xuICAgICAgICAgIHRyaW1tZWQucHVzaChkYXRhW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdHJpbW1lZC5wdXNoKGRhdGFbZGF0YS5sZW5ndGggLSAxXSk7XG4gICAgICBkYXRhID0gdHJpbW1lZDtcbiAgICB9XG4gIH1cbiAgXG4gIFxuICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgZGF0YS5sZW5ndGg7IHJvd0luZGV4KysgKSB7XG4gICAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGNvbHVtbkRhdGEubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgICAgdmFyIGNlbGwgPSBkYXRhW3Jvd0luZGV4XVtjb2x1bW5JbmRleF07XG4gICAgICB2YXIgY29sID0gY29sdW1uRGF0YVtjb2x1bW5JbmRleF07XG4gICAgICBjb2wudmFsdWUgPSBjb2wudmFsdWUgfHwgMDtcbiAgICAgIHZhciBsZW5ndGggPSBjZWxsLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgaWYgKCFjb2wudmFsdWUgfHwgbGVuZ3RoID4gY29sLnZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoKSB7XG4gICAgICAgIGNvbC52YWx1ZSA9IGNlbGw7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICAvLyBEZXRlY3RcbiAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGNvbHVtbkRhdGEubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgIHZhciBjb2wgPSBjb2x1bW5EYXRhW2NvbHVtbkluZGV4XTtcbiAgICB2YXIgY29sdW1uVHlwZSA9IGRldGVjdENvbHVtblR5cGUoY29sLnZhbHVlKTtcbiAgICB2YXIgZm9ybWF0ID0gbnVsbCwgdmFsdWUgPSBudWxsO1xuICAgIHZhciB0b29sID0gY29sdW1uVHlwZSA9PT0gXCJkYXRlXCIgPyBkZm9ybWF0IDogY29sdW1uVHlwZSA9PT0gXCJudW1iZXJcIiA/IG5mb3JtYXQgOiBudWxsO1xuICAgIGlmICh0b29sKSB7XG4gICAgICB2YWx1ZSA9IHRvb2wucGFyc2UoY29sLnZhbHVlKTtcbiAgICAgIGZvcm1hdCA9IHRvb2wuZGV0ZWN0KHZhbHVlLCBjb2wudmFsdWUpO1xuICAgIH1cbiAgICBkZWxldGUgY29sLnZhbHVlO1xuICAgIGNvbC50eXBlID0gY29sdW1uVHlwZTtcbiAgICBjb2wucGF0dGVybiA9IGZvcm1hdCAmJiBmb3JtYXQucGF0dGVybiB8fCBudWxsO1xuICAgIGNvbC5sb2NhbGUgPSBmb3JtYXQgJiYgZm9ybWF0LmxvY2FsZSB8fCBudWxsO1xuICB9XG5cbiAgLy8gUGFyc2VcbiAgdmFyIHJvd3MgPSBbXTtcbiAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IGRhdGEubGVuZ3RoOyByb3dJbmRleCsrICkge1xuICAgIHZhciByb3cgPSBbXTtcbiAgICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgY29sdW1uRGF0YS5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgICB2YXIgY29sID0gY29sdW1uRGF0YVtjb2x1bW5JbmRleF07XG4gICAgICB2YXIgY2VsbCA9IGRhdGFbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgIHZhciBjb2x1bW5UeXBlID0gY29sLnR5cGU7XG4gICAgICBcbiAgICAgIGlmIChjb2x1bW5UeXBlID09PSAnbnVtYmVyJyB8fCBjb2x1bW5UeXBlID09PSAnZGF0ZScpIHtcbiAgICAgICAgdmFyIHRvb2wgPSBjb2x1bW5UeXBlID09PSBcImRhdGVcIiA/IGRmb3JtYXQgOiBjb2x1bW5UeXBlID09PSBcIm51bWJlclwiID8gbmZvcm1hdCA6IG51bGw7XG4gICAgICAgIGNlbGwgPSB7XG4gICAgICAgICAgdjogdG9vbC5wYXJzZShjZWxsLCBjb2wucGF0dGVybiwgY29sLmxvY2FsZSksXG4gICAgICAgICAgZjogY2VsbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb2wudHlwZSA9IGNvbHVtblR5cGU7XG4gICAgICByb3dbY29sdW1uSW5kZXhdID0gY2VsbDtcbiAgICB9XG4gICAgcm93cy5wdXNoKHJvdyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRhVGFibGUoe2NvbHM6IGNvbHVtbkRhdGEsIHJvd3M6IHJvd3N9KTtcbn07XG4gIFxubW9kdWxlLmV4cG9ydHMgPSBEYXRhVGFibGU7IiwidmFyIG50aWNrcyA9IHJlcXVpcmUoJy4vbnRpY2tzJyk7XG5cbnZhclxuICBcbiAgZGF5c0luTW9udGggPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0WWVhcigpLCBkYXRlLmdldE1vbnRoKCkgKyAxLCAwKS5nZXREYXRlKCk7XG4gIH0sICAgIFxuICBcbiAgZGF0ZURpZmYgPSAoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgdmFyXG4gICAgICBtb250aERpZmYgPSBmdW5jdGlvbihkMSwgZDIpIHtcbiAgICAgICAgdmFyIG1vbnRocztcbiAgICAgICAgbW9udGhzID0gKGQyLmdldEZ1bGxZZWFyKCkgLSBkMS5nZXRGdWxsWWVhcigpKSAqIDEyO1xuICAgICAgICBtb250aHMgLT0gZDEuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgIG1vbnRocyArPSBkMi5nZXRNb250aCgpICsgMTtcbiAgICAgICAgcmV0dXJuIG1vbnRocyA8PSAwID8gMCA6IG1vbnRocztcbiAgICAgIH07XG4gICAgXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGUxLCBkYXRlMiwgZmxhZ3MpIHtcbiAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgXG4gICAgICBmbGFncyA9IHR5cGVvZiBmbGFncyAhPT0gJ3VuZGVmaW5lZCcgPyBmbGFncyA6IDEgfCAyIHwgNCB8IDggfCAxNiB8IDMyO1xuICAgICAgXG4gICAgICBkYXRlMSA9IG5ldyBEYXRlKGRhdGUxKTtcbiAgICAgIGRhdGUyID0gbmV3IERhdGUoZGF0ZTIpO1xuICAgICAgXG4gICAgICB2YXJcbiAgICAgICAgdDEgPSBkYXRlMS5nZXRUaW1lKCksXG4gICAgICAgIHQyID0gZGF0ZTIuZ2V0VGltZSgpLFxuICAgICAgICB0ejEgPSBkYXRlMi5nZXRUaW1lem9uZU9mZnNldCgpLFxuICAgICAgICB0ejIgPSBkYXRlMi5nZXRUaW1lem9uZU9mZnNldCgpLFxuICAgICAgICB5ZWFycyxcbiAgICAgICAgbW9udGhzLFxuICAgICAgICBkYXlzLFxuICAgICAgICBob3VycyxcbiAgICAgICAgbWludXRlcztcblxuICAgICAgaWYgKGZsYWdzICYgMSB8fCBmbGFncyAmIDIgfHwgZmxhZ3MgJiA0KSB7XG4gICAgICAgIG1vbnRocyA9IG1vbnRoRGlmZihkYXRlMSwgZGF0ZTIpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiAxKSB7XG4gICAgICAgIHllYXJzID0gTWF0aC5mbG9vcihtb250aHMgLyAxMik7XG4gICAgICAgIG1vbnRocyA9IG1vbnRocyAtIHllYXJzICogMTI7XG4gICAgICAgIHJlc3VsdC55ZWFycyA9IHllYXJzO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiA0KSB7XG4gICAgICAgIGlmIChmbGFncyAmIDIpIHtcbiAgICAgICAgICBpZiAoZGF0ZTIuZ2V0VVRDRGF0ZSgpID49IGRhdGUxLmdldFVUQ0RhdGUoKSkge1xuICAgICAgICAgICAgZGF5cyA9IGRhdGUyLmdldFVUQ0RhdGUoKSAtIGRhdGUxLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbW9udGhzLS07XG4gICAgICAgICAgICBkYXlzID0gZGF0ZTEuZ2V0VVRDRGF0ZSgpIC0gZGF0ZTIuZ2V0VVRDRGF0ZSgpICsgZGF5c0luTW9udGgoZGF0ZTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXlzID0gKHQyIC0gdDEpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiAyKSB7XG4gICAgICAgIHJlc3VsdC5tb250aHMgPSBtb250aHM7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDQpIHtcbiAgICAgICAgcmVzdWx0LmRheXMgPSBNYXRoLmFicyhNYXRoLnJvdW5kKGRheXMpKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgOCkge1xuICAgICAgICAvLyBIb3Vyc1xuICAgICAgICBob3VycyA9ICh0MiAtIHQxKSAvIDEwMDAgLyA2MCAvIDYwO1xuICAgICAgICBpZiAoZmxhZ3MgJiA0KSB7XG4gICAgICAgICAgaG91cnMgPSBNYXRoLnJvdW5kKCh0MiAtIHQxKSAvIDEwMDAgLyA2MCAvIDYwIC8gMjQpICogMjQgLSBob3VycztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQuaG91cnMgPSBNYXRoLnJvdW5kKGhvdXJzKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgMTYpIHtcbiAgICAgICAgLy8gTWludXRlc1xuICAgICAgICBtaW51dGVzID0gKHQyIC0gdDEpIC8gMTAwMCAvIDYwO1xuICAgICAgICBpZiAoZmxhZ3MgJiA4KSB7XG4gICAgICAgICAgbWludXRlcyA9IE1hdGgucm91bmQoKHQyIC0gdDEpIC8gMTAwMCAvIDYwIC8gNjApICogNjAgLSBtaW51dGVzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5taW51dGVzID0gTWF0aC5yb3VuZChtaW51dGVzKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgMzIpIHtcbiAgICAgICAgLy8gTWludXRlc1xuICAgICAgICBzZWNvbmRzID0gKHQyIC0gdDEpIC8gMTAwMDtcbiAgICAgICAgaWYgKGZsYWdzICYgMTYpIHtcbiAgICAgICAgICBzZWNvbmRzID0gTWF0aC5yb3VuZCgodDIgLSB0MSkgLyAxMDAwIC8gNjApICogNjAgLSBzZWNvbmRzO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5zZWNvbmRzID0gTWF0aC5yb3VuZChzZWNvbmRzKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9KSgpLFxuICBcbiAgZGF0ZVRpY2tzID0gZnVuY3Rpb24obWluLCBtYXgsIGNvdW50LCBvdXRlcikge1xuXG4gICAgLy8gRGVmYXVsdHNcbiAgICBtaW4gPSB0eXBlb2YgbWluID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTmFOKG1pbikgPyAwIDogbWluO1xuICAgIG1heCA9IHR5cGVvZiBtYXggPT09IFwidW5kZWZpbmVkXCIgfHwgaXNOYU4obWF4KT8gMSA6IG1heDtcbiAgICBjb3VudCA9IHR5cGVvZiBjb3VudCAhPT0gXCJudW1iZXJcIiA/IDEwIDogY291bnQ7XG4gICAgb3V0ZXIgPSB0eXBlb2Ygb3V0ZXIgPT09IFwidW5kZWZpbmVkXCIgPyBmYWxzZSA6IG91dGVyLFxuICAgIHRpY2tzID0gW107XG4gICAgXG4gICAgbWluID0gbmV3IERhdGUobWluKTtcbiAgICBtYXggPSBuZXcgRGF0ZShtYXgpO1xuICAgIFxuICAgIGlmIChtaW4uZ2V0VGltZSgpID09PSBtYXguZ2V0VGltZSgpKSB7XG4gICAgICByZXR1cm4gW21pbiwgbWF4XTtcbiAgICB9XG4gICAgXG4gICAgdmFyIHRpY2tVbml0ID0gbnVsbDtcbiAgICB2YXIgbywgdiwgZiA9IDEsIHNmLCBzdjtcbiAgICB3aGlsZShmIDw9IDMyICYmIChvID0gZGF0ZURpZmYobWluLCBtYXgsIGYpKSkge1xuICAgICAgdiA9IG9bT2JqZWN0LmtleXMobylbMF1dO1xuICAgICAgaWYgKHYgPCBjb3VudCB8fCBmID09PSAxKSB7XG4gICAgICAgIHNmID0gZjtcbiAgICAgICAgc3YgPSB2O1xuICAgICAgICBmKj0yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHZhciBkaWZmID0gZGF0ZURpZmYobWluLCBtYXgpO1xuICAgIFxuICAgIGlmIChzZiA9PT0gMSkge1xuICAgICAgLy8gWWVhciBzY2FsZVxuICAgICAgXG4gICAgICB2YXIgeWVhck1pbkRhdGUgPSBuZXcgRGF0ZShcIjEvMS9cIiArIG1pbi5nZXRGdWxsWWVhcigpKTtcbiAgICAgIHZhciB5ZWFyTWF4RGF0ZSA9IG5ldyBEYXRlKFwiMS8xL1wiICsgbWF4LmdldEZ1bGxZZWFyKCkpO1xuICAgICAgXG4gICAgICB2YXIgeWVhck1pbkRpZmYgPSBkYXRlRGlmZih5ZWFyTWluRGF0ZSwgbWluLCAwIHwgMikubW9udGhzIC8gMTI7XG4gICAgICB2YXIgeWVhck1heERpZmYgPSBkYXRlRGlmZih5ZWFyTWF4RGF0ZSwgbWF4LCAwIHwgMikubW9udGhzIC8gMTI7XG4gICAgICBcbiAgICAgIHZhciB5ZWFyVGlja3MgPSBudGlja3MobWluLmdldEZ1bGxZZWFyKCkgKyB5ZWFyTWluRGlmZiwgbWF4LmdldEZ1bGxZZWFyKCkgKyB5ZWFyTWF4RGlmZiwgY291bnQsIG91dGVyKTtcbiAgICAgIFxuICAgICAgZm9yICh2YXIgaSA9IDA7IHRpY2sgPSB5ZWFyVGlja3NbaV07IGkrKykge1xuICAgICAgICB2YXIgZGVjWWVhciA9IHRpY2s7XG4gICAgICAgIHZhciBpbnRZZWFyID0gTWF0aC5mbG9vcihkZWNZZWFyKTtcbiAgICAgICAgdmFyIGRlY01vbnRoID0gKGRlY1llYXIgLSBpbnRZZWFyKSAqIDEyO1xuICAgICAgICB2YXIgaW50TW9udGggPSBNYXRoLmZsb29yKGRlY01vbnRoKTtcbiAgICAgICAgdmFyIGludERhdGUgPSBuZXcgRGF0ZShpbnRZZWFyLCBpbnRNb250aCwgMCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgZGVjRGF5ID0gKGRlY01vbnRoIC0gaW50TW9udGgpICogZGF5c0luTW9udGgoaW50RGF0ZSk7XG4gICAgICAgIHZhciBpbnREYXkgPSBNYXRoLmZsb29yKGRlY0RheSk7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoXCIxLzEvMTk3MFwiKTtcbiAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihpbnRZZWFyKTtcbiAgICAgICAgZGF0ZS5zZXRNb250aChpbnRNb250aCk7XG4gICAgICAgIGRhdGUuc2V0RGF0ZShpbnREYXkgKyAxKTtcbiAgICAgICAgXG4gICAgICAgIHRpY2tzW2ldID0gZGF0ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHRpY2tzO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTY2FsZSBub3Qgc3VwcG9ydGVkIGN1cnJlbnRseVxuICAgICAgY29uc29sZS53YXJuKFwiU0NBTEUgTk9UIFNVUFBPUlRFRFwiKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH07XG4gIFxubW9kdWxlLmV4cG9ydHMgPSBkYXRlVGlja3M7IiwidmFyIGxuMTAgPSBNYXRoLmxvZygxMCk7XG52YXIgY2FsY1N0ZXBTaXplID0gZnVuY3Rpb24ocmFuZ2UsIHRhcmdldFN0ZXBzKVxue1xuICBcbiAgLy8gY2FsY3VsYXRlIGFuIGluaXRpYWwgZ3Vlc3MgYXQgc3RlcCBzaXplXG4gIHZhciB0ZW1wU3RlcCA9IHJhbmdlIC8gdGFyZ2V0U3RlcHM7XG5cbiAgLy8gZ2V0IHRoZSBtYWduaXR1ZGUgb2YgdGhlIHN0ZXAgc2l6ZVxuICB2YXIgbWFnID0gTWF0aC5mbG9vcihNYXRoLmxvZyh0ZW1wU3RlcCkgLyBsbjEwKTtcbiAgdmFyIG1hZ1BvdyA9IE1hdGgucG93KDEwLCBtYWcpO1xuXG4gIC8vIGNhbGN1bGF0ZSBtb3N0IHNpZ25pZmljYW50IGRpZ2l0IG9mIHRoZSBuZXcgc3RlcCBzaXplXG4gIHZhciBtYWdNc2QgPSBNYXRoLnJvdW5kKHRlbXBTdGVwIC8gbWFnUG93ICsgMC41KTtcblxuICAvLyBwcm9tb3RlIHRoZSBNU0QgdG8gZWl0aGVyIDEsIDIsIG9yIDVcbiAgaWYgKG1hZ01zZCA+IDUuMClcbiAgICBtYWdNc2QgPSAxMC4wO1xuICBlbHNlIGlmIChtYWdNc2QgPiAyLjApXG4gICAgbWFnTXNkID0gNS4wO1xuICBlbHNlIGlmIChtYWdNc2QgPiAxLjApXG4gICAgbWFnTXNkID0gMi4wO1xuXG4gIHJldHVybiBtYWdNc2QgKiBtYWdQb3c7XG59O1xuXG5cbnZhciBcbiAgbmljZUZyYWN0aW9uID0gZnVuY3Rpb24obnVtYmVyLCByb3VuZCkge1xuICAgIFxuICAgIHZhclxuICAgICAgbG9nMTAgPSBNYXRoLmxvZyhudW1iZXIpIC8gTWF0aC5sb2coMTApLFxuICAgICAgZXhwb25lbnQgPSBNYXRoLmZsb29yKGxvZzEwKSxcbiAgICAgIGZyYWN0aW9uID0gbnVtYmVyIC8gTWF0aC5wb3coMTAsIGV4cG9uZW50KSxcbiAgICAgIHJlc3VsdDtcblxuICAgIGlmIChyb3VuZCkge1xuICAgICAgaWYgKGZyYWN0aW9uIDwgMS41KSB7XG4gICAgICAgIHJlc3VsdCA9IDE7XG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgMykge1xuICAgICAgICByZXN1bHQgPSAyO1xuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8IDcpIHtcbiAgICAgICAgcmVzdWx0ID0gNTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IDEwO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnJhY3Rpb24gPD0gMSkge1xuICAgICAgICByZXN1bHQgPSAxO1xuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSAyKSB7XG4gICAgICAgIHJlc3VsdCA9IDI7XG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDUpIHtcbiAgICAgICAgcmVzdWx0ID0gNTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IDEwO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzdWx0ICogTWF0aC5wb3coMTAsIGV4cG9uZW50KTtcbiAgfSxcbiAgXG4gIG51bVRpY2tzID0gZnVuY3Rpb24obWluLCBtYXgsIGNvdW50LCBvdXRlcikge1xuXG4gICAgaWYgKG1pbiA9PT0gbWF4KSB7XG4gICAgICByZXR1cm4gW21heF07XG4gICAgfVxuICAgICAgICAgIFxuICAgIC8vIERlZmF1bHRzXG4gICAgbWluID0gdHlwZW9mIG1pbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBpc05hTihtaW4pID8gMCA6IG1pbjtcbiAgICBtYXggPSB0eXBlb2YgbWF4ID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTmFOKG1heCkgPyAxIDogbWF4O1xuICAgIGNvdW50ID0gdHlwZW9mIGNvdW50ICE9PSBcIm51bWJlclwiID8gMTAgOiBjb3VudDtcbiAgICBvdXRlciA9IHR5cGVvZiBvdXRlciA9PT0gXCJ1bmRlZmluZWRcIiA/IGZhbHNlIDogb3V0ZXI7XG4gICAgXG4gICAgdmFyXG4gICAgICBkaWZmID0gbWF4IC0gbWluLFxuICAgICAgLy9yYW5nZSA9IG5pY2VGcmFjdGlvbihkaWZmKSxcbiAgICAgIC8vaW50ZXJ2YWwgPSBuaWNlRnJhY3Rpb24ocmFuZ2UgLyBjb3VudCksXG4gICAgICBpbnRlcnZhbCA9IGNhbGNTdGVwU2l6ZShkaWZmLCBjb3VudCksXG4gICAgICBubWluID0gbWluIC0gbWluICUgaW50ZXJ2YWwsXG4gICAgICBubWF4ID0gbWF4IC0gbWF4ICUgaW50ZXJ2YWwsXG4gICAgICBzaXplLFxuICAgICAgdGlja0l0ZW1zID0gW10sXG4gICAgICB0aWNrVmFsdWUsXG4gICAgICBpO1xuICBcbiAgIGlmIChvdXRlcikge1xuICAgICAgICBcbiAgICAgIGlmIChubWluID4gbWluKSB7XG4gICAgICAgIG5taW4tPSBpbnRlcnZhbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKG5tYXggPCBtYXgpIHtcbiAgICAgICAgbm1heCs9IGludGVydmFsO1xuICAgICAgfVxuICAgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgXG4gICAgICBpZiAobm1pbiA8IG1pbikge1xuICAgICAgICBubWluKz0gaW50ZXJ2YWw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChubWF4ID4gbWF4KSB7XG4gICAgICAgIG5tYXgtPSBpbnRlcnZhbDtcbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICBcbiAgICBmb3IgKGkgPSBubWluOyBpIDw9IG5tYXg7IGkrPWludGVydmFsKSB7XG4gICAgICB0aWNrSXRlbXMucHVzaChpKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRpY2tJdGVtcztcbiAgfTtcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IG51bVRpY2tzOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcm91bmQobnVtLCBkaWdpdHMpIHtcbiAgZGlnaXRzID0gdHlwZW9mIGRpZ2l0cyA9PT0gJ251bWJlcicgPyBkaWdpdHMgOiAxO1xuICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KG51bSk7XG4gIGlmICghaXNOYU4odmFsdWUpICYmIG5ldyBTdHJpbmcodmFsdWUpLmxlbmd0aCA9PT0gbmV3IFN0cmluZyhudW0pLmxlbmd0aCkge1xuICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZS50b0ZpeGVkKGRpZ2l0cykpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gbnVtO1xufTsiLCJ2YXIgaTE4biA9IHJlcXVpcmUoXCIuL2xvY2FsZXMvYWxsXCIpO1xuXG5mdW5jdGlvbiBjYXJ0ZXNpYW5Qcm9kdWN0T2YoYXJyYXksIHVuaXF1ZSkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnJlZHVjZS5jYWxsKGFycmF5LCBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHJldCA9IFtdO1xuICAgIGEuZm9yRWFjaChmdW5jdGlvbihhKSB7XG4gICAgICBiLmZvckVhY2goZnVuY3Rpb24oYikge1xuICAgICAgICBpZiAoIXVuaXF1ZSB8fCBhLmluZGV4T2YoYikgPCAwKSB7XG4gICAgICAgICAgcmV0LnB1c2goYS5jb25jYXQoW2JdKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG4gIH0sIFtbXV0pO1xufVxuXG5mdW5jdGlvbiBzb3J0QnlSZWxldmFuY2UoYSwgYikge1xuICByZXR1cm4gYS5yZWxldmFuY2UgPiBiLnJlbGV2YW5jZSA/IC0xIDogYS5yZWxldmFuY2UgPCBiLnJlbGV2YW5jZSA/IDEgOiAwO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyKSB7XG4gIHN0ciA9IHN0ci5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHMvZywgXCJcXFxcc1wiKTtcbiAgcmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gcGFkKCBhLCBiICkge1xuICByZXR1cm4gKDFlMTUgKyBhICsgXCJcIikuc2xpY2UoLWIpO1xufVxuXG5mdW5jdGlvbiBnZXRMb2NhbGVEYXRhKGxvY2FsZSkge1xuICBpZiAoaTE4bltsb2NhbGVdKSB7XG4gICAgcmV0dXJuIGkxOG5bbG9jYWxlXTtcbiAgfVxuICBmb3IgKHZhciBrZXkgaW4gaTE4bikge1xuICAgIGlmIChpMThuW2tleV0uZXF1YWxzICYmIGkxOG5ba2V5XS5lcXVhbHMuc3BsaXQoXCIsXCIpLmluZGV4T2YobG9jYWxlKSA+PSAwKSB7XG4gICAgICByZXR1cm4gaTE4bltrZXldO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TG9jYWxlcyhsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZXMgPSBbXTtcbiAgT2JqZWN0LmtleXMoaTE4bikuZm9yRWFjaChmdW5jdGlvbihsb2NhbGUpIHtcbiAgICBsb2NhbGVzLnB1c2gobG9jYWxlKTtcbiAgICBsb2NhbGVzID0gbG9jYWxlcy5jb25jYXQoaTE4bltsb2NhbGVdLmVxdWFscyAmJiBpMThuW2xvY2FsZV0uZXF1YWxzLnNwbGl0KC9cXHMqLFxccyovKSB8fCBbXSk7XG4gIH0pO1xuICByZXR1cm4gbG9jYWxlcztcbn1cblxuZnVuY3Rpb24gZ2V0UmVwbGFjZW1lbnRzKGxvY2FsZURhdGEsIGRhdGUpIHtcbiAgdmFyXG4gICAgcmVzdWx0ID0ge30sXG4gICAgZDIgPSBcIlxcXFxkezJ9XCIsXG4gICAgZDQgPSBcIlxcXFxkezR9XCIsXG4gICAgd2Vla2RheU5hbWVzID0gbG9jYWxlRGF0YS53ZWVrZGF5LFxuICAgIG1vbnRoTmFtZXMgPSBsb2NhbGVEYXRhLm1vbnRoLFxuICAgIGRheSA9IGRhdGUgPyAoZGF0ZS5nZXREYXkoKSAtIDEgKyA3KSAlIDcgOiAtMTtcbiAgICBrZXlzID0gW1wieXl5eVwiLCBcInl5XCIsIFwieVwiLCBcIk1NTU1cIiwgXCJNTU1cIiwgXCJNTVwiLCBcIk1cIiwgXCJkZGRkXCIsIFwiZGRkXCIsIFwiZGRcIiwgXCJkXCIsIFwiSEhcIiwgXCJIXCIsIFwiaGhcIiwgXCJoXCIsIFwibW1cIiwgXCJtXCIsIFwic3NcIiwgXCJzXCIsIFwidHRcIiwgXCJ0XCJdLFxuICAgIHZhbHVlcyA9IGRhdGUgPyBcbiAgICAgIFtcbiAgICAgICAgLy8gWWVhclxuICAgICAgICBkYXRlLmdldEZ1bGxZZWFyKCksIFxuICAgICAgICBwYWQoZGF0ZS5nZXRZZWFyKCksIDIpLCBcbiAgICAgICAgZGF0ZS5nZXRZZWFyKCksXG4gICAgICAgIFxuICAgICAgICAvLyBNb250aFxuICAgICAgICBtb250aE5hbWVzLmxvbmdbZGF0ZS5nZXRNb250aCgpXSwgXG4gICAgICAgIG1vbnRoTmFtZXMuc2hvcnRbZGF0ZS5nZXRNb250aCgpXSwgXG4gICAgICAgIHBhZChkYXRlLmdldE1vbnRoKCkgKyAxLCAyKSxcbiAgICAgICAgZGF0ZS5nZXRNb250aCgpICsgMSxcbiAgICAgICAgXG4gICAgICAgIC8vIERheVxuICAgICAgICB3ZWVrZGF5TmFtZXMubG9uZ1tkYXldLFxuICAgICAgICB3ZWVrZGF5TmFtZXMuc2hvcnRbZGF5XSxcbiAgICAgICAgcGFkKGRhdGUuZ2V0RGF0ZSgpLCAyKSxcbiAgICAgICAgZGF0ZS5nZXREYXRlKCksXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyXG4gICAgICAgIGRhdGUuZ2V0SG91cnMoKSxcbiAgICAgICAgcGFkKGRhdGUuZ2V0SG91cnMoKSwgMiksXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyMTJcbiAgICAgICAgcGFkKGRhdGUuZ2V0SG91cnMoKSAlIDEyLCAyKSxcbiAgICAgICAgZGF0ZS5nZXRIb3VycygpICUgMTIsXG4gICAgICAgIFxuICAgICAgICAvLyBNaW51dGVcbiAgICAgICAgcGFkKGRhdGUuZ2V0TWludXRlcygpLCAyKSxcbiAgICAgICAgZGF0ZS5nZXRNaW51dGVzKCksXG4gICAgICAgIFxuICAgICAgICAvLyBTZWNvbmRcbiAgICAgICAgcGFkKGRhdGUuZ2V0U2Vjb25kcygpLCAyKSxcbiAgICAgICAgZGF0ZS5nZXRTZWNvbmRzKCksXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyMTIgRGVzaWduYXRvclxuICAgICAgICBkYXRlLmdldEhvdXJzKCkgPj0gMTIgPyBcIlBNXCIgOiBcIkFNXCIsXG4gICAgICAgIChkYXRlLmdldEhvdXJzKCkgPj0gMTIgPyBcIlBNXCIgOiBcIkFNXCIpLnN1YnN0cmluZygwLCAxKVxuICAgICAgXSA6IFxuICAgICAgW1xuICAgICAgICAvLyBZZWFyXG4gICAgICAgIGQ0LFxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBNb250aFxuICAgICAgICBtb250aE5hbWVzLmxvbmcubWFwKGVzY2FwZVJlZ0V4cCkuam9pbihcInxcIiksXG4gICAgICAgIG1vbnRoTmFtZXMuc2hvcnQubWFwKGVzY2FwZVJlZ0V4cCkuam9pbihcInxcIiksXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIERheVxuICAgICAgICB3ZWVrZGF5TmFtZXMubG9uZy5tYXAoZXNjYXBlUmVnRXhwKS5qb2luKFwifFwiKSxcbiAgICAgICAgd2Vla2RheU5hbWVzLnNob3J0Lm1hcChlc2NhcGVSZWdFeHApLmpvaW4oXCJ8XCIpLFxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdXIxMlxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBNaW51dGVcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gU2Vjb25kXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdXIxMiBEZXNpZ25hdG9yXG4gICAgICAgIFwiQU18UE1cIixcbiAgICAgICAgXCJBfFBcIlxuICAgICAgICBcbiAgICAgIF07XG4gICAgXG4gICAgXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgaW5kZXgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHZhbHVlc1tpbmRleF07XG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdChkYXRlLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgIFxuICB2YXJcbiAgICBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YShsb2NhbGUgfHwgJ2VuJyksXG4gICAgcGF0dGVybiA9IHBhdHRlcm4gfHwgbG9jYWxlRGF0YS5wYXR0ZXJuc1swXSB8fCBcInl5eXkvTU0vZGQgaGg6c3MgdHRcIixcbiAgICByZXBsYWNlbWVudHMgPSBnZXRSZXBsYWNlbWVudHMobG9jYWxlRGF0YSwgZGF0ZSksXG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKFwiXFxcXGIoPzpcIiArIE9iamVjdC5rZXlzKHJlcGxhY2VtZW50cykuam9pbihcInxcIikgKyBcIilcXFxcYlwiLCBcImdcIiksXG4gICAgbWF0Y2gsIFxuICAgIGluZGV4ID0gMCxcbiAgICByZXN1bHQgPSBcIlwiO1xuICBcbiAgd2hpbGUgKG1hdGNoID0gcmVnZXguZXhlYyhwYXR0ZXJuKSkge1xuICAgIHJlc3VsdCs9IHBhdHRlcm4uc3Vic3RyaW5nKGluZGV4LCBtYXRjaC5pbmRleCk7XG4gICAgcmVzdWx0Kz0gcmVwbGFjZW1lbnRzW21hdGNoXTtcbiAgICBpbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICB9XG4gIHJlc3VsdCs9IHBhdHRlcm4uc3Vic3RyaW5nKGluZGV4KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcGFyc2Uoc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZXMgPSBsb2NhbGUgaW5zdGFuY2VvZiBBcnJheSA/IGxvY2FsZSA6IGxvY2FsZSA/IFtsb2NhbGVdIDogT2JqZWN0LmtleXMoaTE4bik7XG4gIHZhciBkYXRlID0gbnVsbDtcbiAgXG4gIGxvY2FsZXMuZm9yRWFjaChmdW5jdGlvbihsb2NhbGUpIHtcbiAgICBcbiAgICBpZiAoZGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICB2YXJcbiAgICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGxvY2FsZSksXG4gICAgICBwYXJ0cyA9IGdldFJlcGxhY2VtZW50cyhsb2NhbGVEYXRhKSxcbiAgICAgIHBhdHRlcm5SZWdleCA9IG5ldyBSZWdFeHAoXCJcXFxcYihcIiArIE9iamVjdC5rZXlzKHBhcnRzKS5qb2luKFwifFwiKSArIFwiKVwiICsgXCJcXFxcYlwiLCBcImdcIiksXG4gICAgICBwYXR0ZXJucyA9IHBhdHRlcm4gaW5zdGFuY2VvZiBBcnJheSA/IHBhdHRlcm4gOiBwYXR0ZXJuID8gW3BhdHRlcm5dIDogbG9jYWxlRGF0YS5wYXR0ZXJucztcbiAgICAgIFxuICAgIHBhdHRlcm5zLmZvckVhY2goZnVuY3Rpb24ocGF0dGVybikge1xuICAgICAgXG4gICAgICBpZiAoZGF0ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgXG4gICAgICB2YXJcbiAgICAgICAgY2FwdHVyZXMgPSBbXSxcbiAgICAgICAgbWF0Y2gsXG4gICAgICAgIG1hdGNoZXMsXG4gICAgICAgIGhvdXIxMnBtLFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIGRhdGVSZWdleCA9IFwiXCI7XG4gICAgICBcbiAgICAgIHdoaWxlKCBtYXRjaCA9IHBhdHRlcm5SZWdleC5leGVjKHBhdHRlcm4pICkge1xuICAgICAgICBjYXB0dXJlcy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgICAgZGF0ZVJlZ2V4Kz0gZXNjYXBlUmVnRXhwKHBhdHRlcm4uc3Vic3RyaW5nKGluZGV4LCBtYXRjaC5pbmRleCkpO1xuICAgICAgICBkYXRlUmVnZXgrPSBcIihcIiArIHBhcnRzW09iamVjdC5rZXlzKHBhcnRzKS5maWx0ZXIoZnVuY3Rpb24ocGFydCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaFswXSA9PT0gcGFydDtcbiAgICAgICAgfSlbMF1dICsgXCIpXCI7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgICB9XG4gICAgICBkYXRlUmVnZXgrPSBlc2NhcGVSZWdFeHAocGF0dGVybi5zdWJzdHJpbmcoaW5kZXgpKTtcbiAgICAgIFxuICAgICAgbWF0Y2ggPSAobmV3IFJlZ0V4cChkYXRlUmVnZXgpKS5leGVjKHN0cmluZyk7XG4gICAgICBcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUoXCIwXCIpO1xuICAgICAgICBtYXRjaGVzID0gbWF0Y2guc2xpY2UoMSk7XG4gICAgICAgIFxuICAgICAgICBob3VyMTJwbSA9IChtYXRjaGVzLmZpbHRlcihmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gKGNhcHR1cmVzW2luZGV4XSA9PT0gXCJ0dFwiIHx8IGNhcHR1cmVzW2luZGV4XSA9PT0gXCJ0XCIpICYmIHZhbHVlLnN1YnN0cmluZygwLCAxKS50b1VwcGVyQ2FzZSgpID09PSBcIlBcIjtcbiAgICAgICAgfSkubGVuZ3RoID4gMCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgeWVhciwgbW9udGgsIG1vbnRoRGF5LCBob3VycywgbWludXRlcywgc2Vjb25kcztcbiAgICAgICAgXG4gICAgICAgIG1hdGNoZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICB2YXIgbnVtZXJpY1ZhbHVlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgIHN3aXRjaCAoY2FwdHVyZXNbaW5kZXhdKSB7XG4gICAgICAgICAgICBjYXNlICd5eXl5JzogXG4gICAgICAgICAgICAgIHllYXIgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTU1NTSc6XG4gICAgICAgICAgICAgIG1vbnRoID0gbG9jYWxlRGF0YS5tb250aC5sb25nLmluZGV4T2YodmFsdWUpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ01NTSc6XG4gICAgICAgICAgICAgIG1vbnRoID0gbG9jYWxlRGF0YS5tb250aC5zaG9ydC5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdNTSc6XG4gICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgbW9udGggPSBudW1lcmljVmFsdWUgLSAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RkZGQnOlxuICAgICAgICAgICAgY2FzZSAnZGRkJzpcbiAgICAgICAgICAgICAgLy8gQ2Fubm90IGRldGVybWluZSBkYXRlIGZyb20gd2Vla2RheVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICBtb250aERheSA9IG51bWVyaWNWYWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdISCc6XG4gICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgaG91cnMgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGgnOlxuICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgIGhvdXJzID0gaG91cjEycG0gPyBudW1lcmljVmFsdWUgKyAxMiA6IG51bWVyaWNWYWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgbWludXRlcyA9IG51bWVyaWNWYWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzcyc6XG4gICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgc2Vjb25kcyA9IG51bWVyaWNWYWx1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICh5ZWFyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobW9udGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobW9udGhEYXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0RGF0ZShtb250aERheSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChob3VycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRIb3Vycyhob3Vycyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChtaW51dGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldE1pbnV0ZXMobWludXRlcyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChzZWNvbmRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldFNlY29uZHMoc2Vjb25kcyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICggaXNOYU4oIGRhdGUuZ2V0VGltZSgpICkgKSB7XG4gICAgICAgICAgZGF0ZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVmFsaWRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgIH1cbiAgICAgIFxuICAgIH0pO1xuICB9KTtcbiAgXG4gIGlmIChkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cbiAgXG4gIHJldHVybiBkYXRlO1xufVxuXG5mdW5jdGlvbiBkZXRlY3QoZGF0ZSwgc3RyaW5nKSB7XG4gIHZhclxuICAgIGxvY2FsZXMgPSBPYmplY3Qua2V5cyhpMThuKSxcbiAgICByZXN1bHRMb2NhbGVQYXR0ZXJucyA9IFtdO1xuXG4gIGxvY2FsZXMuZm9yRWFjaChmdW5jdGlvbihsb2NhbGUpIHtcbiAgICBcbiAgICB2YXIgXG4gICAgICBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YShsb2NhbGUpLFxuICAgICAgcmVwbGFjZW1lbnRzID0gZ2V0UmVwbGFjZW1lbnRzKGxvY2FsZURhdGEsIGRhdGUpLFxuICAgICAgdmFsdWVzID0gT2JqZWN0LmtleXMocmVwbGFjZW1lbnRzKS5tYXAoZnVuY3Rpb24ocGFydCl7XG4gICAgICAgICAgcmV0dXJuIHJlcGxhY2VtZW50c1twYXJ0XS50b1N0cmluZygpO1xuICAgICAgICB9KS5maWx0ZXIoZnVuY3Rpb24ocGFydCwgaW5kZXgsIHNlbGYpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5pbmRleE9mKHBhcnQpID09PSBpbmRleDtcbiAgICAgICAgfSkubWFwKGVzY2FwZVJlZ0V4cCkubWFwKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KHZhbHVlKSkgPyBcIlxcXFxiXCIgKyB2YWx1ZSArIFwiXFxcXGJcIiA6IHZhbHVlO1xuICAgICAgICB9KSxcbiAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCh2YWx1ZXMuam9pbihcInxcIiksIFwiZ1wiKSxcbiAgICAgIG1hdGNoLCBzdWJzdHJpbmcsIGluZGV4ID0gMCxcbiAgICAgIHBhdHRlcm5QYXJ0cyA9IFtdLFxuICAgICAgcGF0dGVyblBhcnRzSW5kZXggPSBbXSxcbiAgICAgIG1hdGNoUmFuayA9IDAsXG4gICAgICBtYXRjaGVzID0gW10sXG4gICAgICBob3VyMTIgPSBmYWxzZSxcbiAgICAgIHJlc3QgPSBcIlwiO1xuICAgICAgXG4gICAgICB3aGlsZSAobWF0Y2ggPSByZWdleC5leGVjKHN0cmluZykpIHtcbiAgICAgICAgaWYgKG1hdGNoWzBdID09PSByZXBsYWNlbWVudHNbXCJ0dFwiXS50b1N0cmluZygpKSB7XG4gICAgICAgICAgaG91cjEyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBtYXRjaGVzLnB1c2gobWF0Y2gpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBmb3IgKHZhciBtID0gMDsgbSA8IG1hdGNoZXMubGVuZ3RoOyBtKyspIHtcbiAgICAgICAgbWF0Y2ggPSBtYXRjaGVzW21dO1xuICAgICAgICBzdWJzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKGluZGV4LCBtYXRjaC5pbmRleCk7XG4gICAgICAgIGlmIChzdWJzdHJpbmcpIHtcbiAgICAgICAgICByZXN0Kz0gc3Vic3RyaW5nO1xuICAgICAgICAgIHBhdHRlcm5QYXJ0cy5wdXNoKFtwYXR0ZXJuUGFydHNJbmRleC5sZW5ndGhdKTtcbiAgICAgICAgICBwYXR0ZXJuUGFydHNJbmRleC5wdXNoKHN1YnN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hdGNoaW5nUGFydHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcGFydCBpbiByZXBsYWNlbWVudHMpIHtcbiAgICAgICAgICBpZiAobWF0Y2hbMF0gPT09IHJlcGxhY2VtZW50c1twYXJ0XS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICBpZiAoKHBhcnQgPT09IFwiSEhcIiB8fCBwYXJ0ID09PSBcIkhcIikgJiYgaG91cjEyKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGkgPSBwYXR0ZXJuUGFydHNJbmRleC5pbmRleE9mKHBhcnQpO1xuICAgICAgICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgICAgICAgIGkgPSBwYXR0ZXJuUGFydHNJbmRleC5sZW5ndGg7XG4gICAgICAgICAgICAgIHBhdHRlcm5QYXJ0c0luZGV4LnB1c2gocGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXRjaGluZ1BhcnRzLnB1c2goaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1hdGNoUmFuays9IDEgLyBtYXRjaGluZ1BhcnRzLmxlbmd0aDtcbiAgICAgICAgcGF0dGVyblBhcnRzLnB1c2gobWF0Y2hpbmdQYXJ0cyk7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgICB9XG4gICAgICBzdWJzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKGluZGV4KTtcbiAgICAgIHJlc3QrPSBzdWJzdHJpbmc7XG4gICAgICBcbiAgICAgIGlmIChzdWJzdHJpbmcpIHtcbiAgICAgICAgcGF0dGVyblBhcnRzLnB1c2goW3BhdHRlcm5QYXJ0c0luZGV4Lmxlbmd0aF0pO1xuICAgICAgICBwYXR0ZXJuUGFydHNJbmRleC5wdXNoKHN1YnN0cmluZyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJlc3VsdExvY2FsZVBhdHRlcm5zLnB1c2goe1xuICAgICAgICBsb2NhbGU6IGxvY2FsZSwgXG4gICAgICAgIGxvY2FsZURhdGE6IGxvY2FsZURhdGEsXG4gICAgICAgIHJlbGV2YW5jZTogbWF0Y2hSYW5rICsgKDEgLSByZXN0Lmxlbmd0aCAvIHN0cmluZy5sZW5ndGgpLFxuICAgICAgICBwYXR0ZXJuOiB7XG4gICAgICAgICAgcGFydHM6IHBhdHRlcm5QYXJ0cyxcbiAgICAgICAgICBpbmRleDogcGF0dGVyblBhcnRzSW5kZXhcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgXG4gIH0pO1xuICBcbiAgaWYgKCFyZXN1bHRMb2NhbGVQYXR0ZXJucy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBcbiAgcmVzdWx0TG9jYWxlUGF0dGVybnMuc29ydChzb3J0QnlSZWxldmFuY2UpO1xuICBcbiAgaWYgKCFyZXN1bHRMb2NhbGVQYXR0ZXJucy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBcbiAgdmFyIHJlbGV2YW5jZSA9IHJlc3VsdExvY2FsZVBhdHRlcm5zWzBdLnJlbGV2YW5jZTtcbiAgXG4gIHZhciByZXN1bHRzID0gcmVzdWx0TG9jYWxlUGF0dGVybnMuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdERhdGEpIHtcbiAgICByZXR1cm4gcmVzdWx0RGF0YS5yZWxldmFuY2UgPT09IHJlbGV2YW5jZTsgXG4gIH0pLm1hcChmdW5jdGlvbihyZXN1bHREYXRhKSB7XG4gICAgXG4gICAgdmFyXG4gICAgICBwYXR0ZXJuRGF0YSA9IHJlc3VsdERhdGEucGF0dGVybixcbiAgICAgIGNvbWJpbmF0aW9ucyA9IGNhcnRlc2lhblByb2R1Y3RPZihwYXR0ZXJuRGF0YS5wYXJ0cywgdHJ1ZSksXG4gICAgICBwYXR0ZXJucyA9IGNvbWJpbmF0aW9ucy5tYXAoZnVuY3Rpb24oY29tYmluYXRpb24pIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IGNvbWJpbmF0aW9uLm1hcChmdW5jdGlvbihwYXJ0SW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gcGF0dGVybkRhdGEuaW5kZXhbcGFydEluZGV4XTtcbiAgICAgICAgfSkuam9pbihcIlwiKTtcbiAgICAgICAgdmFyIHJlbGV2YW5jZSA9IHJlc3VsdERhdGEubG9jYWxlRGF0YS5wYXR0ZXJucy5maWx0ZXIoZnVuY3Rpb24obG9jYWxlUGF0dGVybikge1xuICAgICAgICAgIHJldHVybiBzdHJpbmcuaW5kZXhPZihsb2NhbGVQYXR0ZXJuKSA+PSAwO1xuICAgICAgICB9KS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVzdDogcmVzdWx0RGF0YS5yZXN0LFxuICAgICAgICAgIHN0cmluZzogc3RyaW5nLFxuICAgICAgICAgIHJlbGV2YW5jZTogcmVsZXZhbmNlXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICBcbiAgICBpZiAoIXBhdHRlcm5zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIFxuICAgIHBhdHRlcm5zLnNvcnQoc29ydEJ5UmVsZXZhbmNlKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdDogcGF0dGVybnNbMF0ucmVzdCxcbiAgICAgIHJlbGV2YW5jZTogcGF0dGVybnNbMF0ucmVsZXZhbmNlLFxuICAgICAgcGF0dGVybjogcGF0dGVybnNbMF0uc3RyaW5nLCBcbiAgICAgIGxvY2FsZTogcmVzdWx0RGF0YS5sb2NhbGVcbiAgICB9O1xuICB9KTtcbiAgXG4gIHJlc3VsdHMuc29ydChzb3J0QnlSZWxldmFuY2UpO1xuICBcbiAgaWYgKHJlc3VsdHNbMF0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0dGVybjogcmVzdWx0c1swXS5wYXR0ZXJuLFxuICAgICAgbG9jYWxlOiByZXN1bHRzWzBdLmxvY2FsZVxuICAgIH07XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBkZm9ybWF0KGRhdGUsIHBhdHRlcm4sIGxvY2FsZSkge1xuICByZXR1cm4gZm9ybWF0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmRmb3JtYXQucGFyc2UgPSBmdW5jdGlvbihzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuICByZXR1cm4gcGFyc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbmRmb3JtYXQuZGV0ZWN0ID0gZnVuY3Rpb24oZGF0ZSwgc3RyaW5nKSB7XG4gIHJldHVybiBkZXRlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBkZm9ybWF0OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcImVuXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiSmFudWFyeVwiLFxuICAgICAgICBcIkZlYnJ1YXJ5XCIsXG4gICAgICAgIFwiTWFyY2hcIixcbiAgICAgICAgXCJBcHJpbFwiLFxuICAgICAgICBcIk1heVwiLFxuICAgICAgICBcIkp1bmVcIixcbiAgICAgICAgXCJKdWx5XCIsXG4gICAgICAgIFwiQXVndXN0XCIsXG4gICAgICAgIFwiU2VwdGVtYmVyXCIsXG4gICAgICAgIFwiT2N0b2JlclwiLFxuICAgICAgICBcIk5vdmVtYmVyXCIsXG4gICAgICAgIFwiRGVjZW1iZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkphblwiLFxuICAgICAgICBcIkZlYlwiLFxuICAgICAgICBcIk1hclwiLFxuICAgICAgICBcIkFwclwiLFxuICAgICAgICBcIk1heVwiLFxuICAgICAgICBcIkp1blwiLFxuICAgICAgICBcIkp1bFwiLFxuICAgICAgICBcIkF1Z1wiLFxuICAgICAgICBcIlNlcFwiLFxuICAgICAgICBcIk9jdFwiLFxuICAgICAgICBcIk5vdlwiLFxuICAgICAgICBcIkRlY1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJNb25kYXlcIixcbiAgICAgICAgXCJUdWVzZGF5XCIsXG4gICAgICAgIFwiV2VkbmVzZGF5XCIsXG4gICAgICAgIFwiVGh1cnNkYXlcIixcbiAgICAgICAgXCJGcmlkYXlcIixcbiAgICAgICAgXCJTYXR1cmRheVwiLFxuICAgICAgICBcIlN1bmRheVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiTW9uXCIsXG4gICAgICAgIFwiVHVlXCIsXG4gICAgICAgIFwiV2VkXCIsXG4gICAgICAgIFwiVGh1XCIsXG4gICAgICAgIFwiRnJpXCIsXG4gICAgICAgIFwiU2F0XCIsXG4gICAgICAgIFwiU3VuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBNTU1NIGRkLCB5eXl5LCBoaDptbTpzcyB0dFwiLFxuICAgICAgXCJNTU1NIGRkLCB5eXl5LCBoaDptbTpzcyB0dFwiLFxuICAgICAgXCJNTU0gZGQsIHl5eXksIGhoOm1tOnNzIHR0XCIsXG4gICAgICBcIk1NL2RkL3l5eXksIGhoOm1tIHR0XCIsXG4gICAgICBcImRkZGQsIE1NTU0gZGQsIHl5eXlcIixcbiAgICAgIFwiTU1NTSBkZCwgeXl5eVwiLFxuICAgICAgXCJNTU0gZGQsIHl5eXlcIixcbiAgICAgIFwiTU0vZGQveXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiaGg6bW06c3MgdHRcIixcbiAgICAgIFwiaGg6bW0gdHRcIlxuICAgIF1cbiAgfSxcbiAgXCJkZVwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkphbnVhclwiLFxuICAgICAgICBcIkZlYnJ1YXJcIixcbiAgICAgICAgXCJNw6RyelwiLFxuICAgICAgICBcIkFwcmlsXCIsXG4gICAgICAgIFwiTWFpXCIsXG4gICAgICAgIFwiSnVuaVwiLFxuICAgICAgICBcIkp1bGlcIixcbiAgICAgICAgXCJBdWd1c3RcIixcbiAgICAgICAgXCJTZXB0ZW1iZXJcIixcbiAgICAgICAgXCJPa3RvYmVyXCIsXG4gICAgICAgIFwiTm92ZW1iZXJcIixcbiAgICAgICAgXCJEZXplbWJlclwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiSmFuXCIsXG4gICAgICAgIFwiRmViXCIsXG4gICAgICAgIFwiTcOkclwiLFxuICAgICAgICBcIkFwclwiLFxuICAgICAgICBcIk1haVwiLFxuICAgICAgICBcIkp1blwiLFxuICAgICAgICBcIkp1bFwiLFxuICAgICAgICBcIkF1Z1wiLFxuICAgICAgICBcIlNlcFwiLFxuICAgICAgICBcIk9rdFwiLFxuICAgICAgICBcIk5vdlwiLFxuICAgICAgICBcIkRlelwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJNb250YWdcIixcbiAgICAgICAgXCJEaWVuc3RhZ1wiLFxuICAgICAgICBcIk1pdHR3b2NoXCIsXG4gICAgICAgIFwiRG9ubmVyc3RhZ1wiLFxuICAgICAgICBcIkZyZWl0YWdcIixcbiAgICAgICAgXCJTYW1zdGFnXCIsXG4gICAgICAgIFwiU29ubnRhZ1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiTW8uXCIsXG4gICAgICAgIFwiRGkuXCIsXG4gICAgICAgIFwiTWkuXCIsXG4gICAgICAgIFwiRG8uXCIsXG4gICAgICAgIFwiRnIuXCIsXG4gICAgICAgIFwiU2EuXCIsXG4gICAgICAgIFwiU28uXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZC4gTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLiBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuIE1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLk1NLnl5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQuIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZC4gTU1NTSB5eXl5XCIsXG4gICAgICBcImRkLiBNTU0geXl5eVwiLFxuICAgICAgXCJkZC5NTS55eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImZyXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiamFudmllclwiLFxuICAgICAgICBcImbDqXZyaWVyXCIsXG4gICAgICAgIFwibWFyc1wiLFxuICAgICAgICBcImF2cmlsXCIsXG4gICAgICAgIFwibWFpXCIsXG4gICAgICAgIFwianVpblwiLFxuICAgICAgICBcImp1aWxsZXRcIixcbiAgICAgICAgXCJhb8O7dFwiLFxuICAgICAgICBcInNlcHRlbWJyZVwiLFxuICAgICAgICBcIm9jdG9icmVcIixcbiAgICAgICAgXCJub3ZlbWJyZVwiLFxuICAgICAgICBcImTDqWNlbWJyZVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiamFudi5cIixcbiAgICAgICAgXCJmw6l2ci5cIixcbiAgICAgICAgXCJtYXJzXCIsXG4gICAgICAgIFwiYXZyLlwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcImp1aW5cIixcbiAgICAgICAgXCJqdWlsLlwiLFxuICAgICAgICBcImFvw7t0XCIsXG4gICAgICAgIFwic2VwdC5cIixcbiAgICAgICAgXCJvY3QuXCIsXG4gICAgICAgIFwibm92LlwiLFxuICAgICAgICBcImTDqWMuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImx1bmRpXCIsXG4gICAgICAgIFwibWFyZGlcIixcbiAgICAgICAgXCJtZXJjcmVkaVwiLFxuICAgICAgICBcImpldWRpXCIsXG4gICAgICAgIFwidmVuZHJlZGlcIixcbiAgICAgICAgXCJzYW1lZGlcIixcbiAgICAgICAgXCJkaW1hbmNoZVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwibHVuLlwiLFxuICAgICAgICBcIm1hci5cIixcbiAgICAgICAgXCJtZXIuXCIsXG4gICAgICAgIFwiamV1LlwiLFxuICAgICAgICBcInZlbi5cIixcbiAgICAgICAgXCJzYW0uXCIsXG4gICAgICAgIFwiZGltLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NL3l5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiZXNcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJFbmVyb1wiLFxuICAgICAgICBcIkZlYnJlcm9cIixcbiAgICAgICAgXCJNYXJ6b1wiLFxuICAgICAgICBcIkFicmlsXCIsXG4gICAgICAgIFwiTWF5b1wiLFxuICAgICAgICBcIkp1bmlvXCIsXG4gICAgICAgIFwiSnVsaW9cIixcbiAgICAgICAgXCJBZ29zdG9cIixcbiAgICAgICAgXCJTZXB0aWVtYnJlXCIsXG4gICAgICAgIFwiT2N0dWJyZVwiLFxuICAgICAgICBcIk5vdmllbWJyZVwiLFxuICAgICAgICBcIkRpY2llbWJyZVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiRW5lLlwiLFxuICAgICAgICBcIkZlYi5cIixcbiAgICAgICAgXCJNYXIuXCIsXG4gICAgICAgIFwiQWJyLlwiLFxuICAgICAgICBcIk1heS5cIixcbiAgICAgICAgXCJKdW4uXCIsXG4gICAgICAgIFwiSnVsLlwiLFxuICAgICAgICBcIkFnby5cIixcbiAgICAgICAgXCJTZXB0LlwiLFxuICAgICAgICBcIk9jdC5cIixcbiAgICAgICAgXCJOb3YuXCIsXG4gICAgICAgIFwiRGljLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJsdW5lc1wiLFxuICAgICAgICBcIm1hcnRlc1wiLFxuICAgICAgICBcIm1pw6lyY29sZXNcIixcbiAgICAgICAgXCJqdWV2ZXNcIixcbiAgICAgICAgXCJ2aWVybmVzXCIsXG4gICAgICAgIFwic8OhYmFkb1wiLFxuICAgICAgICBcImRvbWluZ29cIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImx1bi5cIixcbiAgICAgICAgXCJtYXIuXCIsXG4gICAgICAgIFwibWnDqS5cIixcbiAgICAgICAgXCJqdWUuXCIsXG4gICAgICAgIFwidmllLlwiLFxuICAgICAgICBcInPDoWIuXCIsXG4gICAgICAgIFwiZG9tLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgZGUgTU1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIGRlIE1NTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBkZSBNTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTS95eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkIGRlIE1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZCBkZSBNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQgZGUgTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQvTU0veXl5eVwiLFxuICAgICAgXCJNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJpdFwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkdlbm5haW9cIixcbiAgICAgICAgXCJGZWJicmFpb1wiLFxuICAgICAgICBcIk1hcnpvXCIsXG4gICAgICAgIFwiQXByaWxlXCIsXG4gICAgICAgIFwiTWFnZ2lvXCIsXG4gICAgICAgIFwiR2l1Z25vXCIsXG4gICAgICAgIFwiTHVnbGlvXCIsXG4gICAgICAgIFwiQWdvc3RvXCIsXG4gICAgICAgIFwiU2V0dGVtYnJlXCIsXG4gICAgICAgIFwiT3R0b2JyZVwiLFxuICAgICAgICBcIk5vdmVtYnJlXCIsXG4gICAgICAgIFwiRGljZW1icmVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImdlblwiLFxuICAgICAgICBcImZlYlwiLFxuICAgICAgICBcIm1hclwiLFxuICAgICAgICBcImFwclwiLFxuICAgICAgICBcIm1hZ1wiLFxuICAgICAgICBcImdpdVwiLFxuICAgICAgICBcImx1Z1wiLFxuICAgICAgICBcImFnb1wiLFxuICAgICAgICBcInNldFwiLFxuICAgICAgICBcIm90dFwiLFxuICAgICAgICBcIm5vdlwiLFxuICAgICAgICBcImRpY1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJsdW5lZMOsXCIsXG4gICAgICAgIFwibWFydGVkw6xcIixcbiAgICAgICAgXCJtZXJjb2xlZMOsXCIsXG4gICAgICAgIFwiZ2lvdmVkw6xcIixcbiAgICAgICAgXCJ2ZW5lcmTDrFwiLFxuICAgICAgICBcInNhYmF0b1wiLFxuICAgICAgICBcImRvbWVuaWNhXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJsdW5cIixcbiAgICAgICAgXCJtYXJcIixcbiAgICAgICAgXCJtZXJcIixcbiAgICAgICAgXCJnaW9cIixcbiAgICAgICAgXCJ2ZW5cIixcbiAgICAgICAgXCJzYWJcIixcbiAgICAgICAgXCJkb21cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTU0veXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTS95eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZC9NTU0veXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcIm5sXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiamFudWFyaVwiLFxuICAgICAgICBcImZlYnJ1YXJpXCIsXG4gICAgICAgIFwibWFhcnRcIixcbiAgICAgICAgXCJhcHJpbFwiLFxuICAgICAgICBcIm1laVwiLFxuICAgICAgICBcImp1bmlcIixcbiAgICAgICAgXCJqdWxpXCIsXG4gICAgICAgIFwiYXVndXN0dXNcIixcbiAgICAgICAgXCJzZXB0ZW1iZXJcIixcbiAgICAgICAgXCJva3RvYmVyXCIsXG4gICAgICAgIFwibm92ZW1iZXJcIixcbiAgICAgICAgXCJkZWNlbWJlclwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiamFuXCIsXG4gICAgICAgIFwiZmViXCIsXG4gICAgICAgIFwibXJ0XCIsXG4gICAgICAgIFwiYXByXCIsXG4gICAgICAgIFwibWVpXCIsXG4gICAgICAgIFwianVuXCIsXG4gICAgICAgIFwianVsXCIsXG4gICAgICAgIFwiYXVnXCIsXG4gICAgICAgIFwic2VwXCIsXG4gICAgICAgIFwib2t0XCIsXG4gICAgICAgIFwibm92XCIsXG4gICAgICAgIFwiZGVjXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIm1hYW5kYWdcIixcbiAgICAgICAgXCJkaW5zZGFnXCIsXG4gICAgICAgIFwid29lbnNkYWdcIixcbiAgICAgICAgXCJkb25kZXJkYWdcIixcbiAgICAgICAgXCJ2cmlqZGFnXCIsXG4gICAgICAgIFwiemF0ZXJkYWdcIixcbiAgICAgICAgXCJ6b25kYWdcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIm1hXCIsXG4gICAgICAgIFwiZGlcIixcbiAgICAgICAgXCJ3b1wiLFxuICAgICAgICBcImRvXCIsXG4gICAgICAgIFwidnJcIixcbiAgICAgICAgXCJ6YVwiLFxuICAgICAgICBcInpvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQtTU0teXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NIHl5eXlcIixcbiAgICAgIFwiZGQtTU0teXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJ0clwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIk9jYWtcIixcbiAgICAgICAgXCLFnnViYXRcIixcbiAgICAgICAgXCJNYXJ0XCIsXG4gICAgICAgIFwiTmlzYW5cIixcbiAgICAgICAgXCJNYXnEsXNcIixcbiAgICAgICAgXCJIYXppcmFuXCIsXG4gICAgICAgIFwiVGVtbXV6XCIsXG4gICAgICAgIFwiQcSfdXN0b3NcIixcbiAgICAgICAgXCJFeWzDvGxcIixcbiAgICAgICAgXCJFa2ltXCIsXG4gICAgICAgIFwiS2FzxLFtXCIsXG4gICAgICAgIFwiQXJhbMSxa1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiT2NhXCIsXG4gICAgICAgIFwixZ51YlwiLFxuICAgICAgICBcIk1hclwiLFxuICAgICAgICBcIk5pc1wiLFxuICAgICAgICBcIk1heVwiLFxuICAgICAgICBcIkhhelwiLFxuICAgICAgICBcIlRlbVwiLFxuICAgICAgICBcIkHEn3VcIixcbiAgICAgICAgXCJFeWxcIixcbiAgICAgICAgXCJFa2lcIixcbiAgICAgICAgXCJLYXNcIixcbiAgICAgICAgXCJBcmFcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiUGF6YXJ0ZXNpXCIsXG4gICAgICAgIFwiU2FsxLFcIixcbiAgICAgICAgXCLDh2FyxZ9hbWJhXCIsXG4gICAgICAgIFwiUGVyxZ9lbWJlXCIsXG4gICAgICAgIFwiQ3VtYVwiLFxuICAgICAgICBcIkN1bWFydGVzaVwiLFxuICAgICAgICBcIlBhemFyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJQenRcIixcbiAgICAgICAgXCJTYWxcIixcbiAgICAgICAgXCLDh2FyXCIsXG4gICAgICAgIFwiUGVyXCIsXG4gICAgICAgIFwiQ3VtXCIsXG4gICAgICAgIFwiQ210XCIsXG4gICAgICAgIFwiUGF6XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZCBNTU1NIHl5eXkgZGRkZCBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuTU0ueXl5eSBISDptbVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgZGRkZFwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuTU0ueXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJiclwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkdlbnZlclwiLFxuICAgICAgICBcIkPKvGh3ZXZyZXJcIixcbiAgICAgICAgXCJNZXVyemhcIixcbiAgICAgICAgXCJFYnJlbFwiLFxuICAgICAgICBcIk1hZVwiLFxuICAgICAgICBcIk1lemhldmVuXCIsXG4gICAgICAgIFwiR291ZXJlXCIsXG4gICAgICAgIFwiRW9zdFwiLFxuICAgICAgICBcIkd3ZW5nb2xvXCIsXG4gICAgICAgIFwiSGVyZVwiLFxuICAgICAgICBcIkR1XCIsXG4gICAgICAgIFwiS2VyenVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkdlblwiLFxuICAgICAgICBcIkPKvGh3ZVwiLFxuICAgICAgICBcIk1ldXJcIixcbiAgICAgICAgXCJFYnJcIixcbiAgICAgICAgXCJNYWVcIixcbiAgICAgICAgXCJNZXpoXCIsXG4gICAgICAgIFwiR291ZVwiLFxuICAgICAgICBcIkVvc3RcIixcbiAgICAgICAgXCJHd2VuXCIsXG4gICAgICAgIFwiSGVyZVwiLFxuICAgICAgICBcIkR1XCIsXG4gICAgICAgIFwiS2VyXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkx1blwiLFxuICAgICAgICBcIk1ldXJ6aFwiLFxuICAgICAgICBcIk1lcmPKvGhlclwiLFxuICAgICAgICBcIllhb3VcIixcbiAgICAgICAgXCJHd2VuZXJcIixcbiAgICAgICAgXCJTYWRvcm5cIixcbiAgICAgICAgXCJTdWxcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImx1blwiLFxuICAgICAgICBcIm1ldS5cIixcbiAgICAgICAgXCJtZXIuXCIsXG4gICAgICAgIFwieWFvdVwiLFxuICAgICAgICBcImd3ZS5cIixcbiAgICAgICAgXCJzYWQuXCIsXG4gICAgICAgIFwic3VsXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJ5eXl5IE1NTU0gZGQsIGRkZGQgSEg6bW06c3NcIixcbiAgICAgIFwieXl5eSBNTU1NIGRkIEhIOm1tOnNzXCIsXG4gICAgICBcInl5eXkgTU1NIGRkIEhIOm1tOnNzXCIsXG4gICAgICBcInl5eXktTU0tZGQgSEg6bW1cIixcbiAgICAgIFwieXl5eSBNTU1NIGRkLCBkZGRkXCIsXG4gICAgICBcInl5eXkgTU1NTSBkZFwiLFxuICAgICAgXCJ5eXl5IE1NTSBkZFwiLFxuICAgICAgXCJ5eXl5LU1NLWRkXCIsXG4gICAgICBcInl5eXkgTU1NTVwiLFxuICAgICAgXCJ5eXl5IE1NTVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcInB0XCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiamFuZWlyb1wiLFxuICAgICAgICBcImZldmVyZWlyb1wiLFxuICAgICAgICBcIm1hcsOnb1wiLFxuICAgICAgICBcImFicmlsXCIsXG4gICAgICAgIFwibWFpb1wiLFxuICAgICAgICBcImp1bmhvXCIsXG4gICAgICAgIFwianVsaG9cIixcbiAgICAgICAgXCJhZ29zdG9cIixcbiAgICAgICAgXCJzZXRlbWJyb1wiLFxuICAgICAgICBcIm91dHVicm9cIixcbiAgICAgICAgXCJub3ZlbWJyb1wiLFxuICAgICAgICBcImRlemVtYnJvXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJqYW5cIixcbiAgICAgICAgXCJmZXZcIixcbiAgICAgICAgXCJtYXJcIixcbiAgICAgICAgXCJhYnJcIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJqdW5cIixcbiAgICAgICAgXCJqdWxcIixcbiAgICAgICAgXCJhZ29cIixcbiAgICAgICAgXCJzZXRcIixcbiAgICAgICAgXCJvdXRcIixcbiAgICAgICAgXCJub3ZcIixcbiAgICAgICAgXCJkZXpcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwic2VndW5kYS1mZWlyYVwiLFxuICAgICAgICBcInRlcsOnYS1mZWlyYVwiLFxuICAgICAgICBcInF1YXJ0YS1mZWlyYVwiLFxuICAgICAgICBcInF1aW50YS1mZWlyYVwiLFxuICAgICAgICBcInNleHRhLWZlaXJhXCIsXG4gICAgICAgIFwic8OhYmFkb1wiLFxuICAgICAgICBcImRvbWluZ29cIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcInNlZ1wiLFxuICAgICAgICBcInRlclwiLFxuICAgICAgICBcInF1YVwiLFxuICAgICAgICBcInF1aVwiLFxuICAgICAgICBcInNleFwiLFxuICAgICAgICBcInPDoWJcIixcbiAgICAgICAgXCJkb21cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIGRlIE1NTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBkZSBNTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgZGUgTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZCBkZSBNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQgZGUgTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkIGRlIE1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcIk1NTSBkZSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiYmdcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLRj9C90YPQsNGA0LhcIixcbiAgICAgICAgXCLRhNC10LLRgNGD0LDRgNC4XCIsXG4gICAgICAgIFwi0LzQsNGA0YJcIixcbiAgICAgICAgXCLQsNC/0YDQuNC7XCIsXG4gICAgICAgIFwi0LzQsNC5XCIsXG4gICAgICAgIFwi0Y7QvdC4XCIsXG4gICAgICAgIFwi0Y7Qu9C4XCIsXG4gICAgICAgIFwi0LDQstCz0YPRgdGCXCIsXG4gICAgICAgIFwi0YHQtdC/0YLQtdC80LLRgNC4XCIsXG4gICAgICAgIFwi0L7QutGC0L7QvNCy0YDQuFwiLFxuICAgICAgICBcItC90L7QtdC80LLRgNC4XCIsXG4gICAgICAgIFwi0LTQtdC60LXQvNCy0YDQuFwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi0Y/QvS5cIixcbiAgICAgICAgXCLRhNC10LLRgC5cIixcbiAgICAgICAgXCLQvNCw0YDRglwiLFxuICAgICAgICBcItCw0L/RgC5cIixcbiAgICAgICAgXCLQvNCw0LlcIixcbiAgICAgICAgXCLRjtC90LhcIixcbiAgICAgICAgXCLRjtC70LhcIixcbiAgICAgICAgXCLQsNCy0LMuXCIsXG4gICAgICAgIFwi0YHQtdC/0YIuXCIsXG4gICAgICAgIFwi0L7QutGCLlwiLFxuICAgICAgICBcItC90L7QtdC8LlwiLFxuICAgICAgICBcItC00LXQui5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi0L/QvtC90LXQtNC10LvQvdC40LpcIixcbiAgICAgICAgXCLQstGC0L7RgNC90LjQulwiLFxuICAgICAgICBcItGB0YDRj9C00LBcIixcbiAgICAgICAgXCLRh9C10YLQstGK0YDRgtGK0LpcIixcbiAgICAgICAgXCLQv9C10YLRitC6XCIsXG4gICAgICAgIFwi0YHRitCx0L7RgtCwXCIsXG4gICAgICAgIFwi0L3QtdC00LXQu9GPXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLQv9C9XCIsXG4gICAgICAgIFwi0LLRglwiLFxuICAgICAgICBcItGB0YBcIixcbiAgICAgICAgXCLRh9GCXCIsXG4gICAgICAgIFwi0L/RglwiLFxuICAgICAgICBcItGB0LFcIixcbiAgICAgICAgXCLQvdC0XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXkg0LMuLCBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkg0LMuLCBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSDQsy4sIEhIOm1tOnNzXCIsXG4gICAgICBcImRkLk1NLnl5eXkg0LMuLCBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQgTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkLk1NLnl5eXkg0LMuXCIsXG4gICAgICBcIk1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiaW5cIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJKYW51YXJpXCIsXG4gICAgICAgIFwiRmVicnVhcmlcIixcbiAgICAgICAgXCJNYXJldFwiLFxuICAgICAgICBcIkFwcmlsXCIsXG4gICAgICAgIFwiTWVpXCIsXG4gICAgICAgIFwiSnVuaVwiLFxuICAgICAgICBcIkp1bGlcIixcbiAgICAgICAgXCJBZ3VzdHVzXCIsXG4gICAgICAgIFwiU2VwdGVtYmVyXCIsXG4gICAgICAgIFwiT2t0b2JlclwiLFxuICAgICAgICBcIk5vdmVtYmVyXCIsXG4gICAgICAgIFwiRGVzZW1iZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkphblwiLFxuICAgICAgICBcIkZlYlwiLFxuICAgICAgICBcIk1hclwiLFxuICAgICAgICBcIkFwclwiLFxuICAgICAgICBcIk1laVwiLFxuICAgICAgICBcIkp1blwiLFxuICAgICAgICBcIkp1bFwiLFxuICAgICAgICBcIkFndFwiLFxuICAgICAgICBcIlNlcFwiLFxuICAgICAgICBcIk9rdFwiLFxuICAgICAgICBcIk5vdlwiLFxuICAgICAgICBcIkRlc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJTZW5pblwiLFxuICAgICAgICBcIlNlbGFzYVwiLFxuICAgICAgICBcIlJhYnVcIixcbiAgICAgICAgXCJLYW1pc1wiLFxuICAgICAgICBcIkp1bWF0XCIsXG4gICAgICAgIFwiU2FidHVcIixcbiAgICAgICAgXCJNaW5nZ3VcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIlNlblwiLFxuICAgICAgICBcIlNlbFwiLFxuICAgICAgICBcIlJhYlwiLFxuICAgICAgICBcIkthbVwiLFxuICAgICAgICBcIkp1bVwiLFxuICAgICAgICBcIlNhYlwiLFxuICAgICAgICBcIk1pblwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5IEhILm1tLnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBISC5tbS5zc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSBISC5tbS5zc1wiLFxuICAgICAgXCJkZC9NTS95eXl5IEhILm1tXCIsXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NIHl5eXlcIixcbiAgICAgIFwiZGQvTU0veXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEgubW0uc3NcIixcbiAgICAgIFwiSEgubW1cIlxuICAgIF1cbiAgfSxcbiAgXCJyb1wiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImlhbnVhcmllXCIsXG4gICAgICAgIFwiZmVicnVhcmllXCIsXG4gICAgICAgIFwibWFydGllXCIsXG4gICAgICAgIFwiYXByaWxpZVwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcIml1bmllXCIsXG4gICAgICAgIFwiaXVsaWVcIixcbiAgICAgICAgXCJhdWd1c3RcIixcbiAgICAgICAgXCJzZXB0ZW1icmllXCIsXG4gICAgICAgIFwib2N0b21icmllXCIsXG4gICAgICAgIFwibm9pZW1icmllXCIsXG4gICAgICAgIFwiZGVjZW1icmllXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJpYW4uXCIsXG4gICAgICAgIFwiZmViLlwiLFxuICAgICAgICBcIm1hci5cIixcbiAgICAgICAgXCJhcHIuXCIsXG4gICAgICAgIFwibWFpXCIsXG4gICAgICAgIFwiaXVuLlwiLFxuICAgICAgICBcIml1bC5cIixcbiAgICAgICAgXCJhdWcuXCIsXG4gICAgICAgIFwic2VwdC5cIixcbiAgICAgICAgXCJvY3QuXCIsXG4gICAgICAgIFwibm92LlwiLFxuICAgICAgICBcImRlYy5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibHVuaVwiLFxuICAgICAgICBcIm1hcsibaVwiLFxuICAgICAgICBcIm1pZXJjdXJpXCIsXG4gICAgICAgIFwiam9pXCIsXG4gICAgICAgIFwidmluZXJpXCIsXG4gICAgICAgIFwic8OibWLEg3TEg1wiLFxuICAgICAgICBcImR1bWluaWPEg1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiTHVuXCIsXG4gICAgICAgIFwiTWFyXCIsXG4gICAgICAgIFwiTWllXCIsXG4gICAgICAgIFwiSm9pXCIsXG4gICAgICAgIFwiVmluXCIsXG4gICAgICAgIFwiU8OibVwiLFxuICAgICAgICBcIkR1bVwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5LCBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXksIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5LCBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5LCBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkLk1NLnl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwibWtcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLRmNCw0L3Rg9Cw0YDQuFwiLFxuICAgICAgICBcItGE0LXQstGA0YPQsNGA0LhcIixcbiAgICAgICAgXCLQvNCw0YDRglwiLFxuICAgICAgICBcItCw0L/RgNC40LtcIixcbiAgICAgICAgXCLQvNCw0ZhcIixcbiAgICAgICAgXCLRmNGD0L3QuFwiLFxuICAgICAgICBcItGY0YPQu9C4XCIsXG4gICAgICAgIFwi0LDQstCz0YPRgdGCXCIsXG4gICAgICAgIFwi0YHQtdC/0YLQtdC80LLRgNC4XCIsXG4gICAgICAgIFwi0L7QutGC0L7QvNCy0YDQuFwiLFxuICAgICAgICBcItC90L7QtdC80LLRgNC4XCIsXG4gICAgICAgIFwi0LTQtdC60LXQvNCy0YDQuFwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi0ZjQsNC9LlwiLFxuICAgICAgICBcItGE0LXQsi5cIixcbiAgICAgICAgXCLQvNCw0YAuXCIsXG4gICAgICAgIFwi0LDQv9GALlwiLFxuICAgICAgICBcItC80LDRmFwiLFxuICAgICAgICBcItGY0YPQvS5cIixcbiAgICAgICAgXCLRmNGD0LsuXCIsXG4gICAgICAgIFwi0LDQstCzLlwiLFxuICAgICAgICBcItGB0LXQv9GCLlwiLFxuICAgICAgICBcItC+0LrRgi5cIixcbiAgICAgICAgXCLQvdC+0LXQvC5cIixcbiAgICAgICAgXCLQtNC10LouXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcItC/0L7QvdC10LTQtdC70L3QuNC6XCIsXG4gICAgICAgIFwi0LLRgtC+0YDQvdC40LpcIixcbiAgICAgICAgXCLRgdGA0LXQtNCwXCIsXG4gICAgICAgIFwi0YfQtdGC0LLRgNGC0L7QulwiLFxuICAgICAgICBcItC/0LXRgtC+0LpcIixcbiAgICAgICAgXCLRgdCw0LHQvtGC0LBcIixcbiAgICAgICAgXCLQvdC10LTQtdC70LBcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcItC/0L7QvS5cIixcbiAgICAgICAgXCLQstGCLlwiLFxuICAgICAgICBcItGB0YDQtS5cIixcbiAgICAgICAgXCLRh9C10YIuXCIsXG4gICAgICAgIFwi0L/QtdGCLlwiLFxuICAgICAgICBcItGB0LDQsS5cIixcbiAgICAgICAgXCLQvdC10LQuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXkg0LMuIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSDQsy4gSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkg0LMuIEhIOm1tOnNzXCIsXG4gICAgICBcImRkLk1NLnl5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkIE1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZC5NTS55eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwidGhcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLguKHguIHguKPguLLguITguKFcIixcbiAgICAgICAgXCLguIHguLjguKHguKDguLLguJ7guLHguJnguJjguYxcIixcbiAgICAgICAgXCLguKHguLXguJnguLLguITguKFcIixcbiAgICAgICAgXCLguYDguKHguKnguLLguKLguJlcIixcbiAgICAgICAgXCLguJ7guKTguKnguKDguLLguITguKFcIixcbiAgICAgICAgXCLguKHguLTguJbguLjguJnguLLguKLguJlcIixcbiAgICAgICAgXCLguIHguKPguIHguI7guLLguITguKFcIixcbiAgICAgICAgXCLguKrguLTguIfguKvguLLguITguKFcIixcbiAgICAgICAgXCLguIHguLHguJnguKLguLLguKLguJlcIixcbiAgICAgICAgXCLguJXguLjguKXguLLguITguKFcIixcbiAgICAgICAgXCLguJ7guKTguKjguIjguLTguIHguLLguKLguJlcIixcbiAgICAgICAgXCLguJjguLHguJnguKfguLLguITguKFcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIuC4oS7guIQuXCIsXG4gICAgICAgIFwi4LiBLuC4ni5cIixcbiAgICAgICAgXCLguKHguLUu4LiELlwiLFxuICAgICAgICBcIuC5gOC4oS7guKIuXCIsXG4gICAgICAgIFwi4LieLuC4hC5cIixcbiAgICAgICAgXCLguKHguLQu4LiiLlwiLFxuICAgICAgICBcIuC4gS7guIQuXCIsXG4gICAgICAgIFwi4LiqLuC4hC5cIixcbiAgICAgICAgXCLguIEu4LiiLlwiLFxuICAgICAgICBcIuC4lS7guIQuXCIsXG4gICAgICAgIFwi4LieLuC4oi5cIixcbiAgICAgICAgXCLguJgu4LiELlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLguKfguLHguJnguIjguLHguJnguJfguKPguYxcIixcbiAgICAgICAgXCLguKfguLHguJnguK3guLHguIfguITguLLguKNcIixcbiAgICAgICAgXCLguKfguLHguJnguJ7guLjguJhcIixcbiAgICAgICAgXCLguKfguLHguJnguJ7guKTguKvguLHguKrguJrguJTguLVcIixcbiAgICAgICAgXCLguKfguLHguJnguKjguLjguIHguKPguYxcIixcbiAgICAgICAgXCLguKfguLHguJnguYDguKrguLLguKPguYxcIixcbiAgICAgICAgXCLguKfguLHguJnguK3guLLguJfguLTguJXguKLguYxcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIuC4iC5cIixcbiAgICAgICAgXCLguK0uXCIsXG4gICAgICAgIFwi4LieLlwiLFxuICAgICAgICBcIuC4nuC4pC5cIixcbiAgICAgICAgXCLguKguXCIsXG4gICAgICAgIFwi4LiqLlwiLFxuICAgICAgICBcIuC4reC4si5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQgZGQgTU1NTSAyNTQzIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0gMjU0MyBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0gMjU0MyBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTS8yNTQzIEhIOm1tXCIsXG4gICAgICBcImRkZGQgZGQgTU1NTSAyNTQzXCIsXG4gICAgICBcImRkIE1NTU0gMjU0M1wiLFxuICAgICAgXCJkZCBNTU0gMjU0M1wiLFxuICAgICAgXCJkZC9NTS8yNTQzXCIsXG4gICAgICBcIk1NTU0gMjU0M1wiLFxuICAgICAgXCJNTU0gMjU0M1wiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcImVuXCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIsXCIsXG4gICAgICBcIi5cIixcbiAgICAgIDAsXG4gICAgICBcIlwiXG4gICAgXSxcbiAgICBcImVxdWFsc1wiOiBcInRoXCJcbiAgfSxcbiAgXCJkZVwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiLlwiLFxuICAgICAgXCIsXCIsXG4gICAgICAwLFxuICAgICAgXCIgXCJcbiAgICBdLFxuICAgIFwiZXF1YWxzXCI6IFwicm9cIlxuICB9LFxuICBcImZyXCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIgXCIsXG4gICAgICBcIixcIixcbiAgICAgIDAsXG4gICAgICBcIiBcIlxuICAgIF1cbiAgfSxcbiAgXCJlc1wiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiIFwiLFxuICAgICAgXCIsXCIsXG4gICAgICAwLFxuICAgICAgXCJcIlxuICAgIF0sXG4gICAgXCJlcXVhbHNcIjogXCJicixiZ1wiXG4gIH0sXG4gIFwiaXRcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIi5cIixcbiAgICAgIFwiLFwiLFxuICAgICAgMCxcbiAgICAgIFwiXCJcbiAgICBdLFxuICAgIFwiZXF1YWxzXCI6IFwibmwscHQsaW4sbWtcIlxuICB9LFxuICBcInRyXCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIuXCIsXG4gICAgICBcIixcIixcbiAgICAgIDEsXG4gICAgICBcIlwiXG4gICAgXVxuICB9XG59OyIsInZhciBpMThuID0gcmVxdWlyZShcIi4vbG9jYWxlcy9hbGxcIik7XG5cblxuLy8gUGFkIFJpZ2h0XG5mdW5jdGlvbiBwYWRSaWdodCggc3RyaW5nLCBsZW5ndGgsIGNoYXJhY3RlciApIHtcbiAgaWYgKHN0cmluZy5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyaW5nICsgQXJyYXkobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCArIDEpLmpvaW4oY2hhcmFjdGVyIHx8IFwiMFwiKTtcbiAgfVxuICByZXR1cm4gc3RyaW5nO1xufVxuICBcbi8vIFBhZCBMZWZ0XG5mdW5jdGlvbiBwYWRMZWZ0KCBzdHJpbmcsIGxlbmd0aCwgY2hhcmFjdGVyICkge1xuICBpZiAoc3RyaW5nLmxlbmd0aCA8IGxlbmd0aCkge1xuICAgIHJldHVybiBBcnJheShsZW5ndGggLSBzdHJpbmcubGVuZ3RoICsgMSkuam9pbihjaGFyYWN0ZXIgfHwgXCIwXCIpICsgc3RyaW5nO1xuICB9XG4gIHJldHVybiBzdHJuZ2k7XG59XG4gIFxuICBcbmZ1bmN0aW9uIHRvUHJlY2lzaW9uKG4sIHNpZykge1xuICBpZiAobiAhPT0gMCkge1xuICAgIHZhciBtdWx0ID0gTWF0aC5wb3coMTAsIHNpZyAtIE1hdGguZmxvb3IoTWF0aC5sb2cobikgLyBNYXRoLkxOMTApIC0gMSk7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobiAqIG11bHQpIC8gbXVsdDtcbiAgfVxuICByZXR1cm4gbjtcbn1cbiAgXG5mdW5jdGlvbiBnZXRMb2NhbGVEYXRhKGxvY2FsZSkge1xuICBpZiAoaTE4bltsb2NhbGVdKSB7XG4gICAgcmV0dXJuIGkxOG5bbG9jYWxlXTtcbiAgfVxuICBmb3IgKHZhciBrZXkgaW4gaTE4bikge1xuICAgIGlmIChpMThuW2tleV0uZXF1YWxzICYmIGkxOG5ba2V5XS5lcXVhbHMuc3BsaXQoXCIsXCIpLmluZGV4T2YobG9jYWxlKSA+PSAwKSB7XG4gICAgICByZXR1cm4gaTE4bltrZXldO1xuICAgIH1cbiAgfTtcbn1cbiAgXG4gIFxudmFyIHBhdHRlcm5SZWdleCA9IG5ldyBSZWdFeHAoL15cXHMqKCV8XFx3Kik/KFsjMF0qKD86KCwpWyMwXSspKikoPzooXFwuKShbIzBdKykpPyglfFxcdyopP1xccyokLyk7XG4gIFxuICBcbmZ1bmN0aW9uIGZvcm1hdChudW1iZXIsIHBhdHRlcm4sIGxvY2FsZSkge1xuICB2YXIgbG9jYWxlRGF0YTtcbiAgIFxuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldID09PSBcInN0cmluZ1wiICYmIGFyZ3VtZW50c1tpXS5tYXRjaCgvW2Etel17Mn0vKSkge1xuICAgICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEoYXJndW1lbnRzW2ldKTtcbiAgICAgIGFyZ3VtZW50c1tpXSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0dGVybiA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gIH1cbiAgICBcbiAgaWYgKCFsb2NhbGVEYXRhKSB7XG4gICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEoJ2VuJyk7XG4gIH0gXG4gICBcbiAgcGF0dGVybiA9IHBhdHRlcm4gfHwgXCIjLCMjIy4jXCI7XG4gICBcbiAgdmFyXG4gICAgYXJncyA9IGxvY2FsZURhdGEuYXJncyxcbiAgICBzdHlsZSA9IFwiZGVjaW1hbFwiLFxuICAgIHVzZUdyb3VwaW5nID0gZmFsc2UsXG4gICAgZ3JvdXBpbmdXaGl0ZXNwYWNlID0gXCIgXCIgfHwgXCJcXHUwMEEwXCIsXG4gICAgZ3JvdXBpbmdTZXBhcmF0b3IgPSBhcmdzWzBdLFxuICAgIHJhZGl4ID0gYXJnc1sxXSxcbiAgICBsZWFkaW5nVW5pdCA9IGFyZ3NbMl0sXG4gICAgdW5pdFNwYWNlID0gYXJnc1szXSA/IFwiXFx1MDBBMFwiIDogXCJcIixcbiAgICBsZW5ndGggPSBudW1iZXIudG9TdHJpbmcoKS5sZW5ndGgsXG4gICAgc2lnbmlmaWNhbnREaWdpdHMgPSAtMTtcbiAgICAgXG4gICAgIHZhciBwYXR0ZXJuTWF0Y2ggPSBwYXR0ZXJuUmVnZXguZXhlYyhwYXR0ZXJuKTtcbiAgICAgXG4gICAgIHZhciBpbnRQYXR0ZXJuU3RyaW5nID0gcGF0dGVybk1hdGNoICYmIHBhdHRlcm5NYXRjaFsyXS5yZXBsYWNlKC8sL2csIFwiXCIpIHx8IFwiXCI7XG4gICAgIHZhciBpbnRQYWRNYXRjaCA9IGludFBhdHRlcm5TdHJpbmcgPyBpbnRQYXR0ZXJuU3RyaW5nLm1hdGNoKC9eMCovKSA6IG51bGw7XG4gICAgIFxuICAgICB2YXIgaW50UGFkTGVuZ3RoID0gaW50UGFkTWF0Y2ggPyBpbnRQYWRNYXRjaFswXS5sZW5ndGggOiAwO1xuICAgICBcbiAgICAgdmFyIGRlY1BhdHRlcm5TdHJpbmcgPSBwYXR0ZXJuTWF0Y2hbNV0gfHwgXCJcIjtcbiAgICAgXG4gICAgIHZhciBkZWNQYWRNYXRjaCA9IGRlY1BhdHRlcm5TdHJpbmcgPyBkZWNQYXR0ZXJuU3RyaW5nLm1hdGNoKC8wKiQvKSA6IG51bGw7XG4gICAgIHZhciBkZWNQYWRMZW5ndGggPSBkZWNQYWRNYXRjaCA/IGRlY1BhZE1hdGNoWzBdLmxlbmd0aCA6IDA7XG4gICAgIFxuICAgICB2YXIgZnJhY3Rpb25EaWdpdHMgPSBkZWNQYXR0ZXJuU3RyaW5nLmxlbmd0aCB8fCAwO1xuICAgICBcbiAgICAgdmFyIHNpZ25pZmljYW50RnJhY3Rpb25EaWdpdHMgPSBkZWNQYXR0ZXJuU3RyaW5nLmxlbmd0aCAtIGRlY1BhZExlbmd0aDtcbiAgICAgdmFyIHNpZ25pZmljYW50RGlnaXRzID0gKGludFBhdHRlcm5TdHJpbmcubGVuZ3RoIC0gaW50UGFkTGVuZ3RoKSArIGZyYWN0aW9uRGlnaXRzO1xuICAgICBcbiAgICAgdmFyIGlzTmVnYXRpdmUgPSBudW1iZXIgPCAwID8gdHJ1ZSA6IDA7XG4gICAgIFxuICAgICBudW1iZXIgPSBNYXRoLmFicyhudW1iZXIpO1xuICAgICBcbiAgICAgc3R5bGUgPSBwYXR0ZXJuTWF0Y2hbMV0gfHwgcGF0dGVybk1hdGNoW3BhdHRlcm5NYXRjaC5sZW5ndGggLSAxXSA/IFwicGVyY2VudFwiIDogc3R5bGU7XG4gICAgIHVzZUdyb3VwaW5nID0gcGF0dGVybk1hdGNoWzNdID8gdHJ1ZSA6IHVzZUdyb3VwaW5nO1xuICAgICBcbiAgICAgdW5pdCA9IHN0eWxlID09PSBcInBlcmNlbnRcIiA/IFwiJVwiIDogc3R5bGUgPT09IFwiY3VycmVuY3lcIiA/IGN1cnJlbmN5IDogXCJcIjtcbiAgICAgXG4gICAgIHNpZ25pZmljYW50RGlnaXRzID0gTWF0aC5mbG9vcihudW1iZXIpLnRvU3RyaW5nKCkubGVuZ3RoICsgZnJhY3Rpb25EaWdpdHM7XG4gICAgIGlmIChmcmFjdGlvbkRpZ2l0cyA+IDAgJiYgc2lnbmlmaWNhbnREaWdpdHMgPiAwKSB7XG4gICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdCh0b1ByZWNpc2lvbihudW1iZXIsIHNpZ25pZmljYW50RGlnaXRzKS50b1N0cmluZygpKTtcbiAgICAgfVxuICAgICBcbiAgICAgaWYgKHN0eWxlID09PSAncGVyY2VudCcpIHtcbiAgICAgICBudW1iZXIgPSBudW1iZXIgKiAxMDA7XG4gICAgIH1cbiAgICAgXG4gICB2YXJcbiAgICAgaW50VmFsdWUgPSBwYXJzZUludChudW1iZXIpLFxuICAgICBkZWNWYWx1ZSA9IHBhcnNlRmxvYXQoKG51bWJlciAtIGludFZhbHVlKS50b1ByZWNpc2lvbigxMikpO1xuICAgXG4gICB2YXIgZGVjU3RyaW5nID0gZGVjVmFsdWUudG9TdHJpbmcoKTtcbiAgIFxuICAgZGVjU3RyaW5nID0gZGVjVmFsdWUudG9GaXhlZChmcmFjdGlvbkRpZ2l0cyk7XG4gICBkZWNTdHJpbmcgPSBkZWNTdHJpbmcucmVwbGFjZSgvXjBcXC4vLCBcIlwiKTtcbiAgIGRlY1N0cmluZyA9IGRlY1N0cmluZy5yZXBsYWNlKC8wKiQvLCBcIlwiKTtcbiAgIGRlY1N0cmluZyA9IGRlY1N0cmluZyA/IGRlY1N0cmluZyA6IGZyYWN0aW9uRGlnaXRzID4gMCA/IFwiMFwiIDogXCJcIjtcbiAgIFxuICAgaWYgKGRlY1BhZExlbmd0aCkge1xuICAgICBkZWNTdHJpbmcgPSBwYWRSaWdodChkZWNTdHJpbmcsIGZyYWN0aW9uRGlnaXRzLCBcIjBcIik7XG4gICB9XG4gICBcbiAgIGlmICgoZGVjUGFkTGVuZ3RoIHx8IGRlY1ZhbHVlID4gMCkgJiYgZnJhY3Rpb25EaWdpdHMgPiAwKSB7XG4gICAgIGRlY1N0cmluZyA9IHJhZGl4ICsgZGVjU3RyaW5nO1xuICAgfSBlbHNlIHtcbiAgICAgZGVjU3RyaW5nID0gXCJcIjtcbiAgICAgaW50VmFsdWUgPSBNYXRoLnJvdW5kKG51bWJlcik7XG4gICB9XG4gICBcbiAgIHZhciBpbnRTdHJpbmcgPSBpbnRWYWx1ZS50b1N0cmluZygpO1xuICAgXG4gICBpZiAoaW50UGFkTGVuZ3RoID4gMCkge1xuICAgICBpbnRTdHJpbmcgPSBwYWRMZWZ0KGludFN0cmluZywgaW50UGF0dGVyblN0cmluZy5sZW5ndGgsIFwiMFwiKTtcbiAgIH1cbiAgIFxuICAgaWYgKHVzZUdyb3VwaW5nKSB7XG4gICAgIGludFN0cmluZyA9IGludFN0cmluZy5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBncm91cGluZ1NlcGFyYXRvci5yZXBsYWNlKC9cXHMvZywgZ3JvdXBpbmdXaGl0ZXNwYWNlKSB8fCBcIixcIik7XG4gICB9XG5cbiAgIHZhciBudW1TdHJpbmcgPSAoaXNOZWdhdGl2ZSA/IFwiLVwiIDogXCJcIikgKyBpbnRTdHJpbmcgKyBkZWNTdHJpbmc7XG4gICAgIFxuICAgcmV0dXJuIHVuaXQgPyBsZWFkaW5nVW5pdCA/IHVuaXQgKyB1bml0U3BhY2UgKyBudW1TdHJpbmcgOiBudW1TdHJpbmcgKyB1bml0U3BhY2UgKyB1bml0IDogbnVtU3RyaW5nO1xuIH1cblxuZnVuY3Rpb24gaXNMb2NhbGUobG9jYWxlKSB7XG4gIHJldHVybiAodHlwZW9mIGxvY2FsZSA9PT0gXCJzdHJpbmdcIiAmJiBsb2NhbGUubWF0Y2goL1thLXpdezJ9LykpO1xufVxuXG5mdW5jdGlvbiBkZXRlY3Qoc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpIHtcblxuICB2YXIgaW5wdXRQYXR0ZXJuID0gbnVsbDtcbiAgZm9yICh2YXIgYSA9IDE7IGEgPCBhcmd1bWVudHMubGVuZ3RoOyBhKyspIHtcbiAgICB2YXIgYXJnID0gYXJndW1lbnRzW2FdO1xuICAgIGlmIChhcmcgaW5zdGFuY2VvZiBBcnJheSB8fCBpc0xvY2FsZShhcmcpKSB7XG4gICAgICBsb2NhbGUgPSBhcmc7XG4gICAgfSBlbHNlIGlmICghaW5wdXRQYXR0ZXJuKSB7XG4gICAgICBpbnB1dFBhdHRlcm4gPSBhcmc7XG4gICAgfVxuICB9XG4gIHBhdHRlcm4gPSBpbnB1dFBhdHRlcm47XG4gIFxuICB2YXIgbG9jYWxlcyA9IGxvY2FsZSBpbnN0YW5jZW9mIEFycmF5ID8gbG9jYWxlIDogbG9jYWxlID8gW2xvY2FsZV0gOiBPYmplY3Qua2V5cyhpMThuKTtcbiAgXG4gIHZhciBwYXR0ZXJuTWF0Y2g7XG4gIHZhciBwYXR0ZXJuVW5pdDtcbiAgIFxuICBpZiAocGF0dGVybikge1xuICAgIHBhdHRlcm5NYXRjaCA9IHBhdHRlcm5SZWdleC5leGVjKHBhdHRlcm4pO1xuICAgIHBhdHRlcm5Vbml0ID0gcGF0dGVybk1hdGNoID8gcGF0dGVybk1hdGNoWzFdIHx8IHBhdHRlcm5NYXRjaFtwYXR0ZXJuTWF0Y2gubGVuZ3RoIC0gMV0gOiBudWxsO1xuICB9XG4gIFxuICB2YXIgcmVzdWx0cyA9IGxvY2FsZXMubWFwKGZ1bmN0aW9uKGxvY2FsZSkge1xuICAgIFxuICAgICB2YXIgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEobG9jYWxlKTtcbiAgICAgXG4gICAgIHZhciByZXN1bHQgPSB7bG9jYWxlOiBsb2NhbGUsIHBhdHRlcm46IHBhdHRlcm4sIHJlbGV2YW5jZTogMH07XG4gICAgIHZhciB2YWx1ZSA9IE5hTjtcbiAgICAgXG4gICAgIGlmIChsb2NhbGVEYXRhKSB7XG4gICAgICAgdmFyIGFyZ3MgPSBsb2NhbGVEYXRhLmFyZ3M7XG4gICAgICAgXG4gICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgIFxuICAgICAgICAgdmFyIG51bWJlclJlZ2V4UGFydCA9IFwiKFtcXCstXT9cXFxcZCooPzpcIiArIGFyZ3NbMF0ucmVwbGFjZSgvXFwuLywgXCJcXFxcLlwiKS5yZXBsYWNlKC9cXHMvLCBcIlxcXFxzXCIpICsgXCJcXFxcZHszfSkqKSg/OlwiICsgYXJnc1sxXS5yZXBsYWNlKC9cXC4vZywgXCJcXFxcLlwiKSArIFwiKFxcXFxkKikpP1wiO1xuICAgICAgICAgdmFyIGxlYWRpbmdVbml0ID0gYXJnc1syXTtcbiAgICAgICAgIHZhciB1bml0U3BhY2UgPSBhcmdzWzNdO1xuICAgICAgICAgdmFyIHVuaXRTcGFjZVJlZ2V4UGFydCA9IFwiXCIgKyB1bml0U3BhY2UucmVwbGFjZSgvXFxzLywgXCJcXFxcc1wiKSArIFwiXCI7XG4gICAgICAgICB2YXIgdW5pdFJlZ2V4UGFydCA9IFwiKCV8W1xcdypdKVwiO1xuICAgICAgICAgdmFyIG51bWJlclJlZ2V4ID0gbnVtYmVyUmVnZXhQYXJ0LCBtYXRjaE51bUluZGV4ID0gMSwgbWF0Y2hVbml0SW5kZXggPSAzO1xuICAgICAgICAgXG4gICAgICAgICB2YXIgZGV0ZWN0ZWRQYXR0ZXJuO1xuICAgICAgICAgXG4gICAgICAgICBpZiAobGVhZGluZ1VuaXQpIHtcbiAgICAgICAgICAgbnVtYmVyUmVnZXggPSBcIig/OlwiICsgdW5pdFJlZ2V4UGFydCArIHVuaXRTcGFjZVJlZ2V4UGFydCArIFwiKT9cIiArIG51bWJlclJlZ2V4UGFydDtcbiAgICAgICAgICAgbWF0Y2hOdW1JbmRleCA9IDI7XG4gICAgICAgICAgIG1hdGNoVW5pdEluZGV4ID0gMTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIG51bWJlclJlZ2V4ID0gbnVtYmVyUmVnZXhQYXJ0ICsgXCIoPzpcIiArIHVuaXRTcGFjZVJlZ2V4UGFydCArIHVuaXRSZWdleFBhcnQgKyBcIik/XCI7XG4gICAgICAgICB9XG4gICAgICAgICBcbiAgICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJeXFxcXHMqXCIgKyBudW1iZXJSZWdleCArIFwiXFxcXHMqJFwiKTtcbiAgICAgICAgIHZhciBtYXRjaCA9IHJlZ2V4LmV4ZWMoc3RyaW5nKTtcbiAgICAgICAgIFxuICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICB2YXIgaW50U3RyaW5nID0gbWF0Y2hbbWF0Y2hOdW1JbmRleF07XG4gICAgICAgICAgIHZhciBub3JtYWxpemVkSW50U3RyaW5nID0gaW50U3RyaW5nLnJlcGxhY2UobmV3IFJlZ0V4cChhcmdzWzBdLnJlcGxhY2UoL1xcLi8sIFwiXFxcXC5cIikucmVwbGFjZSgvXFxzLywgXCJcXFxcc1wiKSwgXCJnXCIpLCBcIlwiKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIHZhciBkZWNTdHJpbmcgPSBtYXRjaFttYXRjaE51bUluZGV4ICsgMV0gfHwgXCJcIjtcbiAgICAgICAgICAgdmFyIHVuaXRNYXRjaCA9IG1hdGNoW21hdGNoVW5pdEluZGV4XTtcbiAgICAgICAgICAgXG4gICAgICAgICAgIGlmIChwYXR0ZXJuICYmICghcGF0dGVyblVuaXQgJiYgdW5pdE1hdGNoKSkge1xuICAgICAgICAgICAgIC8vIEludmFsaWQgYmVjYXVzZSBvZiB1bml0XG4gICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KG5vcm1hbGl6ZWRJbnRTdHJpbmcgKyAoZGVjU3RyaW5nID8gXCIuXCIgKyBkZWNTdHJpbmcgOiBcIlwiKSk7XG4gICAgICAgICAgIFxuICAgICAgICAgICBpZiAodW5pdE1hdGNoICYmIHVuaXRNYXRjaCA9PT0gXCIlXCIpIHtcbiAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQoKHZhbHVlIC8gMTAwKS50b1ByZWNpc2lvbigxMikpO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIFxuICAgICAgICAgICByZXN1bHQucmVsZXZhbmNlID0gbWF0Y2guZmlsdGVyKGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICB9KS5sZW5ndGggKiAxMCArIHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgICAgICBcbiAgICAgICAgICAgXG4gICAgICAgICAgIHZhciBkZXRlY3RlZFBhdHRlcm4gPSBcIlwiO1xuICAgICAgICAgICBpZiAoIXBhdHRlcm4pIHtcbiAgICAgICAgICAgICBkZXRlY3RlZFBhdHRlcm4gPSBcIiNcIjtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICBpZiAodmFsdWUgPj0gMTAwMCAmJiBpbnRTdHJpbmcuaW5kZXhPZihhcmdzWzBdKSA+PSAwKSB7XG4gICAgICAgICAgICAgICBkZXRlY3RlZFBhdHRlcm4gPSBcIiMsIyMjXCI7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIGlmIChkZWNTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICBkZXRlY3RlZFBhdHRlcm4rPSBcIi5cIiArIChuZXcgQXJyYXkoZGVjU3RyaW5nLmxlbmd0aCArIDEpKS5qb2luKCBcIiNcIiApO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICBpZiAodW5pdE1hdGNoICYmIHVuaXRNYXRjaCA9PT0gXCIlXCIpIHtcbiAgICAgICAgICAgICAgIGRldGVjdGVkUGF0dGVybis9IFwiJVwiO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICByZXN1bHQucGF0dGVybiA9IGRldGVjdGVkUGF0dGVybjtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgIH1cbiAgICAgICAgIFxuICAgICAgIH1cbiAgICAgfVxuICAgICByZXN1bHQudmFsdWUgPSB2YWx1ZTtcbiAgICAgcmV0dXJuIHJlc3VsdDtcbiAgIH0pLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgcmV0dXJuICFpc05hTihyZXN1bHQudmFsdWUpO1xuICAgfSk7XG4gICBcbiAgIC8vIFVuaXF1ZSB2YWx1ZXNcbiAgIHZhciBmaWx0ZXJlZFZhbHVlcyA9IFtdO1xuICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICBpZiAoZmlsdGVyZWRWYWx1ZXMuaW5kZXhPZihyZXN1bHQudmFsdWUpIDwgMCkge1xuICAgICAgIGZpbHRlcmVkVmFsdWVzLnB1c2gocmVzdWx0LnZhbHVlKTtcbiAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICB9XG4gICB9KTtcbiAgIHJlc3VsdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgIHJldHVybiBhLnJlbGV2YW5jZSA8IGIucmVsZXZhbmNlO1xuICAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cblxuXG4vKiBJbnRlcmZhY2UgKi9cbmZ1bmN0aW9uIG5mb3JtYXQobnVtYmVyLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgcmV0dXJuIGZvcm1hdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIFxubmZvcm1hdC5wYXJzZSA9IGZ1bmN0aW9uKHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHJldHVybiBkZXRlY3QuY2FsbCh0aGlzLCBzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkubWFwKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gIH0pWzBdO1xufTtcblxubmZvcm1hdC5kZXRlY3QgPSBmdW5jdGlvbihudW1iZXIsIHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG4gIGlmICh0eXBlb2YgbnVtYmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIENhbm5vdCBhY2N1cmF0ZWx5IGRldGVybWluZSBwYXR0ZXJuIGFuZCBsb2NhbGVcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gZGV0ZWN0LmNhbGwodGhpcywgc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICByZXR1cm4gdHlwZW9mIG51bWJlciAhPT0gJ251bWJlcicgfHwgcmVzdWx0LnZhbHVlID09PSBudW1iZXI7XG4gIH0pLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbG9jYWxlOiByZXN1bHQubG9jYWxlLFxuICAgICAgcGF0dGVybjogcmVzdWx0LnBhdHRlcm5cbiAgICB9O1xuICB9KVswXTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZm9ybWF0OyIsInZhciBfdiA9IChmdW5jdGlvbigpIHtcbiAgXG4gIFxuICB2YXIgXG4gICAgU1ZHX05BTUVTUEFDRV9VUkkgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gICAgTUFUSCA9IE1hdGgsXG4gICAgUEkgPSBNQVRILlBJLFxuICAgIGNvcyA9IE1BVEguY29zLFxuICAgIHNpbiA9IE1BVEguc2luLFxuICAgIHNxcnQgPSBNQVRILnNxcnQsXG4gICAgcG93ID0gTUFUSC5wb3csXG4gICAgZmxvb3IgPSBNQVRILmZsb29yLFxuICBcbiAgICAvKipcbiAgICAgKiBSb3VuZHMgYSBudW1iZXIgdG8gcHJlY2lzaW9uXG4gICAgICovIFxuICAgIHJvdW5kID0gZnVuY3Rpb24obnVtLCBkaWdpdHMpIHtcbiAgICAgIGRpZ2l0cyA9IHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogMTtcbiAgICAgIGlmICh0eXBlb2YgbnVtID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKHZhciB4IGluIG51bSkge1xuICAgICAgICAgIG51bVt4XSA9IHJvdW5kKG51bVt4XSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFjdHVhbGx5IHJvdW5kIG51bWJlclxuICAgICAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KG51bSk7XG4gICAgICAgIGlmICghaXNOYU4odmFsdWUpICYmIG5ldyBTdHJpbmcodmFsdWUpLmxlbmd0aCA9PT0gbmV3IFN0cmluZyhudW0pLmxlbmd0aCkge1xuICAgICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZS50b0ZpeGVkKGRpZ2l0cykpO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bTtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBDYW1lbGl6ZSBhIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAgICAgKi8gXG4gICAgY2FtZWxpemUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2FjaGUgPSB7fTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlW3N0cmluZ10gPSBjYWNoZVtzdHJpbmddIHx8IChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhcXC1bYS16XSkvZywgZnVuY3Rpb24oJDEpe3JldHVybiAkMS50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoJy0nLCcnKTt9KTtcbiAgICAgICAgfSkoKTtcbiAgICAgIH07XG4gICAgfSkoKSxcbiAgXG4gICAgLyoqXG4gICAgICogSHlwaGVuYXRlIGEgc3RyaW5nXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICAgICAqL1xuICAgIGh5cGhlbmF0ZSA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWNoZSA9IHt9O1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgICByZXR1cm4gY2FjaGVbc3RyaW5nXSA9IGNhY2hlW3N0cmluZ10gfHwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbigkMSl7cmV0dXJuIFwiLVwiKyQxLnRvTG93ZXJDYXNlKCk7fSk7XG4gICAgICAgIH0pKCk7XG4gICAgICB9O1xuICAgIH0pKCksXG4gIFxuICAgIC8qKlxuICAgICAqIEV4dGVuZHMgYW4gb2JqZWN0XG4gICAgICogQHBhcmFtIHtCb29sZWFufSB0cnVlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlc3RpbmF0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZVxuICAgICAqL1xuICAgIGV4dGVuZCA9IGZ1bmN0aW9uKGRlZXAsIGRlc3RpbmF0aW9uLCBzb3VyY2UpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLCBpID0gdHlwZW9mIGRlZXAgPT09ICdib29sZWFuJyA/IDIgOiAxLCBkZXN0ID0gYXJndW1lbnRzW2kgLSAxXSwgc3JjLCBwcm9wLCB2YWx1ZTtcbiAgICAgIGZvciAoOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzcmMgPSBhcmdzW2ldO1xuICAgICAgICBmb3IgKHByb3AgaW4gc3JjKSB7XG4gICAgICAgICAgdmFsdWUgPSBzcmNbcHJvcF07XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgZGVzdFtwcm9wXSA9IGRlc3RbcHJvcF0gfHwge307XG4gICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5kKHRydWUsIGRlc3RbcHJvcF0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVzdFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyB0byBBcnJheVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gdHJ1ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXN0aW5hdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VcbiAgICAgKi9cbiAgICB0b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICBcbiAgICAgIC8vcmV0dXJuIG9iaiAmJiAob2JqLmxlbmd0aCAmJiBbXS5zbGljZS5jYWxsKG9iaikgfHwgW29ial0pO1xuICAgICAgXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBsID0gb2JqICYmIG9iai5sZW5ndGggfHwgMCwgaSwgcmVzdWx0ID0gW107XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChvYmpbaV0pIHtcbiAgICAgICAgICByZXN1bHQucHVzaChvYmpbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXN1bHQubGVuZ3RoICYmIHJlc3VsdCB8fCBbb2JqXTtcbiAgICB9LFxuICAgIFxuICAgIC8vIERPTSBNYW5pcHVsYXRpb25cbiAgICBcbiAgICBwYXJlbnQgPSBmdW5jdGlvbihlbGVtKSB7XG4gICAgICByZXR1cm4gZWxlbS5wYXJlbnROb2RlO1xuICAgIH0sXG4gICAgXG4gICAgYXBwZW5kID0gZnVuY3Rpb24oIHBhcmVudCwgY2hpbGQgKSB7XG4gICAgICBwYXJlbnQgPSBwYXJlbnQgJiYgcGFyZW50WzBdIHx8IHBhcmVudDtcbiAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50LmFwcGVuZENoaWxkKSB7XG4gICAgICAgIHRvQXJyYXkoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIHByZXBlbmQgPSBmdW5jdGlvbiggcGFyZW50LCBjaGlsZCApIHtcbiAgICAgIHBhcmVudCA9IHBhcmVudFswXSB8fCBwYXJlbnQ7XG4gICAgICB0b0FycmF5KGNoaWxkKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHBhcmVudC5maXJzdENoaWxkKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgcmVtb3ZlID0gZnVuY3Rpb24oIGVsZW0sIGNoaWxkICkge1xuICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIHRvQXJyYXkoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICBlbGVtLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGVsZW0ucGFyZW50Tm9kZSkge1xuICAgICAgICBlbGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBodG1sID0gZnVuY3Rpb24oZWxlbSwgc3RyaW5nKSB7XG4gICAgICBpZiAoc3RyaW5nKSB7XG4gICAgICAgIGVsZW0uaW5uZXJIVE1MID0gc3RyaW5nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW0uaW5uZXJIVE1MO1xuICAgIH0sXG4gICAgXG4gICAgdGV4dCA9IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHJldHVybiBlbGVtLnRleHRDb250ZW50O1xuICAgIH0sXG4gICAgXG4gICAgYXR0ciA9IGZ1bmN0aW9uIChlbGVtLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IG51bGwsIG9iaiA9IHt9LCBwcm9wLCBweCA9IFsneCcsICd5JywgJ2R4JywgJ2R5JywgJ2N4JywgJ2N5J107XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG9iaiA9IG5hbWU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIG9ialtuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbWFwU3R5bGVzKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGh5cGhlbmF0ZShuYW1lKSArIFwiOiBcIiArIHZhbHVlW25hbWVdO1xuICAgICAgfVxuICAgICAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoKSB7XG4gICAgICAgIGZvciAobmFtZSBpbiBvYmopIHtcbiAgICAgICAgICBwcm9wID0gdHlwZW9mIGVsZW1bY2FtZWxpemUobmFtZSldICE9PSAndW5kZWZpbmVkJyA/IGNhbWVsaXplKG5hbWUpIDogaHlwaGVuYXRlKG5hbWUpO1xuICAgICAgICAgIHZhbHVlID0gb2JqW25hbWVdO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAvLyBTZXRcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnc3R5bGUnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKG1hcFN0eWxlcykuam9pbihcIjsgXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHB4LmluZGV4T2YocHJvcCkgPj0gMCA/IHJvdW5kKHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShwcm9wLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAvLyBHZXRcbiAgICAgICAgICAgIHJlc3VsdCA9IGVsZW0uZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICBcbiAgICBjc3MgPSBmdW5jdGlvbihlbGVtLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgdmFyIG1hcCA9IHt9LCBjc3NUZXh0ID0gbnVsbDtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbWFwID0gbmFtZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIG1hcFtuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgY3NzVGV4dCA9IE9iamVjdC5rZXlzKG1hcCkubWFwKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGh5cGhlbmF0ZShuYW1lKSArIFwiOiBcIiArIG1hcFtuYW1lXTtcbiAgICAgIH0pLmpvaW4oXCI7IFwiKTtcbiAgICAgIGlmIChjc3NUZXh0ICYmIGNzc1RleHQubGVuZ3RoKSB7XG4gICAgICAgIGVsZW0uc3R5bGUuY3NzVGV4dCA9IGVsZW0uc3R5bGUuY3NzVGV4dCArIGNzc1RleHQ7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW0uc3R5bGVbbmFtZV0gfHwgd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbiAgICB9LFxuICAgIFxuICAgIGFkZENsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgICBlbGVtLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICB9LFxuICAgIFxuICAgIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgICByZXR1cm4gZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgICB9LFxuICAgIFxuICAgIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICB9LFxuICAgIFxuICAgIHRvZ2dsZUNsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgICBlbGVtLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIEdldHMgYSBwYWlyIG9mIGJlemllciBjb250cm9sIHBvaW50c1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5MFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5MVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5MlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0XG4gICAgICovXG4gICAgZ2V0Q29udHJvbFBvaW50cyA9IGZ1bmN0aW9uKCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCB0ICkge1xuICAgICAgdCA9IHR5cGVvZiB0ID09PSAnbnVtYmVyJyA/IHQgOiAwLjU7XG4gICAgICB2YXJcbiAgICAgICAgZDAxID0gc3FydCggcG93KCB4MSAtIHgwLCAyICkgKyBwb3coIHkxIC0geTAsIDIgKSApLFxuICAgICAgICBkMTIgPSBzcXJ0KCBwb3coIHgyIC0geDEsIDIgKSArIHBvdyggeTIgLSB5MSwgMiApICksXG4gICAgICAgIGZhID0gdCAqIGQwMSAvICggZDAxICsgZDEyICksICAgLy8gc2NhbGluZyBmYWN0b3IgZm9yIHRyaWFuZ2xlIFRhXG4gICAgICAgIGZiID0gdCAqIGQxMiAvICggZDAxICsgZDEyICksICAgLy8gZGl0dG8gZm9yIFRiLCBzaW1wbGlmaWVzIHRvIGZiPXQtZmFcbiAgICAgICAgcDF4ID0geDEgLSBmYSAqICggeDIgLSB4MCApLCAgICAvLyB4Mi14MCBpcyB0aGUgd2lkdGggb2YgdHJpYW5nbGUgVFxuICAgICAgICBwMXkgPSB5MSAtIGZhICogKCB5MiAtIHkwICksICAgIC8vIHkyLXkwIGlzIHRoZSBoZWlnaHQgb2YgVFxuICAgICAgICBwMnggPSB4MSArIGZiICogKCB4MiAtIHgwICksXG4gICAgICAgIHAyeSA9IHkxICsgZmIgKiAoIHkyIC0geTAgKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHAxOiB7eDogcDF4LCB5OiBwMXl9LCBcbiAgICAgICAgcDI6IHt4OiBwMngsIHk6IHAyeX1cbiAgICAgIH07XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplcyBwb2ludHMgYXMgc3ZnIHBhdGggZGVmaW5pdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBvaW50c1xuICAgICAqL1xuICAgIGdldFBhdGggPSBmdW5jdGlvbiggcG9pbnRzICkge1xuICAgICAgcmV0dXJuIHBvaW50cy5tYXAoZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHBvaW50LnggKyBcIixcIiArIHBvaW50Lnk7XG4gICAgICB9KS5qb2luKFwiIFwiKTtcbiAgICB9LFxuICBcbiAgXG4gICAgLyoqXG4gICAgICogVmlzdWFsaXN0IHF1ZXJ5IGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgX3YgPSBmdW5jdGlvbihzZWxlY3Rvciwgd2lkdGgsIGhlaWdodCwgYXR0cnMpIHtcbiAgICAgIHZhciBhcmcsIGksIHMsIHcsIGgsIGEsIHNldDtcbiAgICAgIGZvciAoaSA9IDAsIGFyZzsgYXJnID0gYXJndW1lbnRzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8IHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnICYmICFpc05hTihwYXJzZUZsb2F0KGFyZykpKSB7XG4gICAgICAgICAgLy8gTnVtZXJpY1xuICAgICAgICAgIGFyZyA9IHR5cGVvZiBhcmcgPT09ICdudW1iZXInID8gcGFyc2VGbG9hdChhcmcpICsgXCJweFwiIDogYXJnO1xuICAgICAgICAgIGlmICh0eXBlb2YgdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGggPSBhcmc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHcgPSBhcmc7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZy5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgLy8gUGxhaW4gb2JqZWN0XG4gICAgICAgICAgYSA9IGFyZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFdmVyeXRoaW5nIGVsc2UgbWF5IGJlIGEgc2VsZWN0b3JcbiAgICAgICAgICBzID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZXQgPSBzIGluc3RhbmNlb2YgVmlzdWFsaXN0ID8gcyA6IG5ldyBWaXN1YWxpc3Qocyk7XG4gICAgICBzZXQuYXR0cihleHRlbmQodHJ1ZSwgYSB8fCB7fSwge1xuICAgICAgICB3aWR0aDogdywgXG4gICAgICAgIGhlaWdodDogaFxuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIHNldDtcbiAgICB9O1xuXG4gIC8qKlxuICAgKiBWaXN1YWxpc3QgQ2xhc3NcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFZpc3VhbGlzdChzZWxlY3Rvcikge1xuICAgIHZhciBzZXQgPSBudWxsLCBlbGVtLCByZXN1bHQsIGksIHN2ZztcbiAgICAvLyBDb2xsZWN0IGNvbnN0cnVjdG9yIGFyZ3NcbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0JyAmJiBzZWxlY3Rvci5uYW1lc3BhY2VVUkkgPT09IFNWR19OQU1FU1BBQ0VfVVJJKSB7XG4gICAgICAvLyBFeGlzdGluZyBFbGVtZW50XG4gICAgICBzZXQgPSBbc2VsZWN0b3JdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gU2VsZWN0b3JcbiAgICAgIHJlc3VsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgZm9yIChpID0gMCwgZWxlbTsgZWxlbSA9IHJlc3VsdFtpXTsgaSsrKSB7XG4gICAgICAgIGlmIChlbGVtLm5hbWVzcGFjZVVSSSA9PT0gU1ZHX05BTUVTUEFDRV9VUkkgKSB7XG4gICAgICAgICAgc2V0ID0gc2V0IHx8IFtdO1xuICAgICAgICAgIHNldC5wdXNoKGVsZW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghc2V0KSB7XG4gICAgICBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05BTUVTUEFDRV9VUkksICdzdmcnKTtcbiAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ4bWxuc1wiLCBTVkdfTkFNRVNQQUNFX1VSSSk7XG4gICAgICBzZXQgPSBbc3ZnXTtcbiAgICB9XG4gICAgdGhpcy5wdXNoLmFwcGx5KHRoaXMsIHNldCB8fCBbXSk7XG4gIH1cbiAgXG4gIFZpc3VhbGlzdC5wcm90b3R5cGUgPSBbXTtcbiAgXG4gIC8vIFN0YXRpYyBtZXRob2RzXG4gIF92LmV4dGVuZCA9IGV4dGVuZDtcbiAgX3YuYXR0ciA9IGF0dHI7XG4gIF92LmNzcyA9IGNzcztcbiAgXG4gIC8vIFBsdWdpbiBBUElcbiAgX3YuZm4gPSBWaXN1YWxpc3QucHJvdG90eXBlO1xuICBcbiAgLyoqXG4gICAqIEV4dGVuZHMgdmlzdWFsaXN0IHByb3RvdHlwZVxuICAgKiBAcGFyYW0ge0FycmF5fSBtZXRob2RzXG4gICAqL1xuICBfdi5mbi5leHRlbmQgPSBmdW5jdGlvbiggbWV0aG9kcyApIHtcbiAgICBmb3IgKHZhciB4IGluIG1ldGhvZHMpIHtcbiAgICAgIFZpc3VhbGlzdC5wcm90b3R5cGVbeF0gPSBtZXRob2RzW3hdO1xuICAgIH1cbiAgfTtcbiAgXG4gIC8vIFByaXZhdGUgQ29tcG9uZW50c1xuICBcbiAgLyoqXG4gICAqIERyYXcgYmFzaWMgc2hhcGVzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0YWdOYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAqIEBwYXJhbSB7QXJyYXl9IGNoaWxkcmVuIFxuICAgKi9cbiAgZnVuY3Rpb24gc2hhcGUodGFnTmFtZSwgcGFyYW1zLCBhdHRycywgY2hpbGRyZW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIF92KGVsZW0pLmFwcGVuZChzZWxmLmNyZWF0ZSh0YWdOYW1lLCBleHRlbmQodHJ1ZSwge30sIGF0dHJzLCByb3VuZChwYXJhbXMpKSkuYXBwZW5kKGNoaWxkcmVuKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8vIFB1YmxpYyBDb21wb25lbnRzXG4gIFxuICBfdi5mbi5leHRlbmQoe1xuICAgIFxuICAgIHNpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xuICAgIH0sXG4gICAgXG4gICAgdG9BcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdG9BcnJheSh0aGlzKTtcbiAgICB9LFxuICAgIFxuICAgIGdldDogZnVuY3Rpb24oIGluZGV4ICkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBpbmRleCAhPT0gJ3VuZGVmaW5lZCcgPyBpbmRleCA8IDAgPyB0aGlzW3RoaXMubGVuZ3RoIC0gaW5kZXhdIDogdGhpc1tpbmRleF0gOiB0aGlzLnRvQXJyYXkoKTtcbiAgICB9LFxuICAgIFxuICAgIGluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzWzBdICYmIHRvQXJyYXkodGhpc1swXS5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKHRoaXNbMF0pIHx8IC0xO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGUgc3BlY2lmaWVkIGNoaWxkIHRvIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gICAgICovXG4gICAgYXBwZW5kOiBmdW5jdGlvbiggY2hpbGQgKSB7XG4gICAgICBpZiAodGhpc1swXSkge1xuICAgICAgICBhcHBlbmQodGhpc1swXSwgY2hpbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoZSBjdXJyZW50IHNldCBvZiBlbGVtZW50cyB0byB0aGUgc3BlY2lmaWVkIHBhcmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuICAgICAqL1xuICAgIGFwcGVuZFRvOiBmdW5jdGlvbiggcGFyZW50ICkge1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIGFwcGVuZChwYXJlbnQsIGVsZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUHJlcGVuZHMgdGhlIHNwZWNpZmllZCBjaGlsZCB0byB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuICAgICAqL1xuICAgIHByZXBlbmQ6IGZ1bmN0aW9uKCBjaGlsZCApIHtcbiAgICAgIGlmICh0aGlzWzBdKSB7XG4gICAgICAgIHByZXBlbmQodGhpc1swXSwgY2hpbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQcmVwZW5kcyB0aGUgY3VycmVudCBzZXQgb2YgZWxlbWVudHMgdG8gdGhlIHNwZWNpZmllZCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2hpbGRcbiAgICAgKi9cbiAgICBwcmVwZW5kVG86IGZ1bmN0aW9uKCBwYXJlbnQgKSB7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICBwcmVwZW5kKHBhcmVudCwgZWxlbSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgaW4gdGhlIHNldCBvciByZW1vdmVzIHRoZSBzcGVjaWZpZWQgY2hpbGQgZnJvbSB0aGUgc2V0IG9mIG1hdGNoZWQgZWxlbWVudHMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiggY2hpbGQgKSB7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICByZW1vdmUoZWxlbSwgY2hpbGQpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgY2hpbGRyZW4gZnJvbSBlbGVtZW50cyBpbiB0aGUgc2V0XG4gICAgICovXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBlbGVtLnJlbW92ZUNoaWxkKGVsZW0uY2hpbGROb2Rlc1tpXSk7XG4gICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGFyZW50IG5vZGUgb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKi9cbiAgICBwYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXNbMF0gJiYgcGFyZW50KHRoaXNbMF0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgZm9yIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQgb2YgbWF0Y2hlZCBlbGVtZW50cyBvciBzZXQgb25lIG9yIG1vcmUgYXR0cmlidXRlcyBmb3IgZXZlcnkgbWF0Y2hlZCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gICAgICovXG4gICAgYXR0cjogZnVuY3Rpb24oIG5hbWUsIHZhbHVlICkge1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXM7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICB2YXIgcmV0ID0gYXR0cihlbGVtLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIGlmIChyZXQgIT09IG51bGwpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgYSBjb21wdXRlZCBzdHlsZSBwcm9wZXJ0eSBmb3IgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzIG9yIHNldCBvbmUgb3IgbW9yZSBDU1MgcHJvcGVydGllcyBmb3IgZXZlcnkgbWF0Y2hlZCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gICAgICovXG4gICAgY3NzOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcztcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIHZhciByZXQgPSBjc3MoZWxlbSwgbmFtZSwgdmFsdWUpO1xuICAgICAgICBpZiAocmV0ICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmV0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmZWQgdGFnbmFtZS5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGFnTmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24oIHRhZ05hbWUsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIF92KCh0aGlzWzBdICYmIHRoaXNbMF0ub3duZXJEb2N1bWVudCB8fCBkb2N1bWVudCkuY3JlYXRlRWxlbWVudE5TKHRoaXNbMF0gJiYgdGhpc1swXS5uYW1lc3BhY2VVUkkgfHwgU1ZHX05BTUVTUEFDRV9VUkksIHRhZ05hbWUpKS5hdHRyKGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldHMgb3Igc2V0cyB0aGUgd2lkdGggb24gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICAgICAqL1xuICAgIHdpZHRoOiBmdW5jdGlvbiggd2lkdGggKSB7XG4gICAgICAvL2NvbnNvbGUud2FybihcImRlcHJlY2F0ZWRcIik7XG4gICAgICBpZiAodHlwZW9mIHdpZHRoID09PSAndW5kZWZpbmVkJyAmJiB0aGlzWzBdKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgfVxuICAgICAgdGhpcy5hdHRyKCd3aWR0aCcsIHdpZHRoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0cyBvciBzZXRzIHRoZSBoZWlnaHQgb24gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcbiAgICAgKi9cbiAgICBoZWlnaHQ6IGZ1bmN0aW9uKCBoZWlnaHQgKSB7XG4gICAgICAvL2NvbnNvbGUud2FybihcImRlcHJlY2F0ZWRcIik7XG4gICAgICBpZiAodHlwZW9mIGhlaWdodCA9PT0gJ3VuZGVmaW5lZCcgJiYgdGhpc1swXSkge1xuICAgICAgICByZXR1cm4gdGhpc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICB9XG4gICAgICB0aGlzLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICovXG4gICAgYmJveDogZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgYiA9IHRoaXNbMF0gJiYgdGhpc1swXS5nZXRCQm94KCk7XG4gICAgICAgIGIgPSB7XG4gICAgICAgICAgeDogYi54LFxuICAgICAgICAgIHk6IGIueSxcbiAgICAgICAgICB3aWR0aDogYi53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IGIuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBiO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4ge3g6IDAsIHk6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDB9O1xuICAgICAgfSBcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyB0aGUgY29tcHV0ZWQgdGV4dCBsZW5ndGggb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldCBpZiBhcHBsaWNhYmxlLlxuICAgICAqL1xuICAgIGNvbXB1dGVkVGV4dExlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpc1swXSAmJiB0aGlzWzBdLmdldENvbXB1dGVkVGV4dExlbmd0aCgpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGdyb3VwIGxheWVyIG9uIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBnOiBmdW5jdGlvbiggYXR0cnMgKSB7XG4gICAgICB2YXIgZyA9IHRoaXMuY3JlYXRlKCdnJywgYXR0cnMpO1xuICAgICAgX3YodGhpc1swXSkuYXBwZW5kKGcpO1xuICAgICAgcmV0dXJuIGc7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIGNpcmNsZSBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGN4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGN5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBjaXJjbGU6IGZ1bmN0aW9uKCBjeCwgY3ksIHIsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgXCJjaXJjbGVcIiwge1xuICAgICAgICBjeDogY3gsIFxuICAgICAgICBjeTogY3ksIFxuICAgICAgICByOiByXG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhbiBlbGxpcHNlIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY3hcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY3lcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcnhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcnlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBlbGxpcHNlOiBmdW5jdGlvbiggY3gsIGN5LCByeCwgcnksIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgXCJlbGxpcHNlXCIsIHtcbiAgICAgICAgY3g6IGN4LCBcbiAgICAgICAgY3k6IGN5LCBcbiAgICAgICAgcng6IHJ4LFxuICAgICAgICByeTogcnlcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGEgcmVjdGFuZ2xlIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIHJlY3Q6IGZ1bmN0aW9uKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsIFwicmVjdFwiLCB7XG4gICAgICAgIHg6IHgsIFxuICAgICAgICB5OiB5LCBcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSBsaW5lIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geDFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geTFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geDJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geTJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBsaW5lOiBmdW5jdGlvbiggeDEsIHkxLCB4MiwgeTIsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgXCJsaW5lXCIsIHtcbiAgICAgICAgeDE6IHgxLFxuICAgICAgICB5MTogeTEsXG4gICAgICAgIHgyOiB4MixcbiAgICAgICAgeTI6IHkyXG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIHBvbHlnb24gb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBwb2x5Z29uOiBmdW5jdGlvbiggcG9pbnRzLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsICdwb2x5Z29uJywge1xuICAgICAgICBwb2ludHM6IGdldFBhdGgocG9pbnRzKVxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSBwb2x5Z29uIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgcG9seWxpbmU6IGZ1bmN0aW9uKCBwb2ludHMsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgJ3BvbHlsaW5lJywge1xuICAgICAgICBwb2ludHM6IGdldFBhdGgocG9pbnRzKVxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSBwYXRoIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIHBhdGg6IGZ1bmN0aW9uKCBkLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsICdwYXRoJywge2Q6IGR9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRleHQgb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgdGV4dDogZnVuY3Rpb24oIHgsIHksIHN0cmluZywgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCAndGV4dCcsIHtcbiAgICAgICAgeDogeCwgXG4gICAgICAgIHk6IHlcbiAgICAgIH0sIGF0dHJzLCBbKHRoaXNbMF0gJiYgdGhpc1swXS5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50KS5jcmVhdGVUZXh0Tm9kZShzdHJpbmcpXSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIGEgc21vb3RoIGdyYXBoIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBncmFwaDogZnVuY3Rpb24oIHBvaW50cywgb3B0aW9ucyApIHtcbiAgICAgIFxuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgXG4gICAgICAgIHZhclxuICAgICAgICAgIG9wdHMgPSBleHRlbmQoe1xuICAgICAgICAgICAgc21vb3RoOiBmYWxzZSwgXG4gICAgICAgICAgICB0ZW5zaW9uOiAwLjQsXG4gICAgICAgICAgICBhcHByb3hpbWF0ZTogdHJ1ZVxuICAgICAgICAgIH0sIG9wdGlvbnMpLFxuICAgICAgICAgIHQgPSAhaXNOYU4oIG9wdHMudGVuc2lvbiApID8gb3B0cy50ZW5zaW9uIDogMC41LFxuICAgICAgICAgIGVsID0gX3YoZWxlbSksIFxuICAgICAgICAgIHAsXG4gICAgICAgICAgaSxcbiAgICAgICAgICBjLFxuICAgICAgICAgIGQsXG4gICAgICAgICAgcDEsXG4gICAgICAgICAgcDIsXG4gICAgICAgICAgY3BzLFxuICAgICAgICAgIHBhdGggPSBlbC5jcmVhdGUoJ3BhdGgnKSxcbiAgICAgICAgICBwYXRoU3RyID0gXCJcIjtcbiAgICAgICAgICBcbiAgICAgICAgZWwuYXBwZW5kKHBhdGgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFvcHRzLnNtb290aCkge1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBwID0gcG9pbnRzW2ldO1xuICAgICAgICAgICAgcGF0aFN0cis9IGkgPiAwID8gXCJMXCIgOiBcIk1cIjtcbiAgICAgICAgICAgIHBhdGhTdHIrPSByb3VuZChwLngpICsgXCIgXCIgKyByb3VuZChwLnkpICsgXCIgXCI7XG4gICAgICAgICAgfSBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBTbW9vdGhcbiAgICAgICAgICBpZiAob3B0cy5hcHByb3hpbWF0ZSkge1xuICAgICAgICAgICAgcCA9IHBvaW50c1swXTtcbiAgICAgICAgICAgIHBhdGhTdHIrPSBcIk1cIiArIHJvdW5kKHAueCkgKyBcIiBcIiArIHJvdW5kKHAueSkgKyBcIiBcIjtcbiAgICAgICAgICAgIGZvciAoaSA9IDE7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYyA9IChwb2ludHNbaV0ueCArIHBvaW50c1tpICsgMV0ueCkgLyAyO1xuICAgICAgICAgICAgICAgIGQgPSAocG9pbnRzW2ldLnkgKyBwb2ludHNbaSArIDFdLnkpIC8gMjtcbiAgICAgICAgICAgICAgICBwYXRoU3RyKz0gXCJRXCIgKyByb3VuZChwb2ludHNbaV0ueCkgKyBcIiBcIiArIHJvdW5kKHBvaW50c1tpXS55KSArIFwiIFwiICsgYyArIFwiIFwiICsgZCArIFwiIFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0aFN0cis9IFwiVFwiICsgcm91bmQocG9pbnRzW2ldLngpICsgXCIgXCIgKyByb3VuZChwb2ludHNbaV0ueSkgKyBcIiBcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcCA9IHBvaW50c1swXTtcbiAgICAgICAgICAgIHBhdGhTdHIrPSBcIk1cIiArIHAueCArIFwiIFwiICsgcC55ICsgXCIgXCI7XG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrPTEpIHtcbiAgICAgICAgICAgICAgcCA9IHBvaW50c1tpIC0gMV07XG4gICAgICAgICAgICAgIHAxID0gcG9pbnRzW2ldO1xuICAgICAgICAgICAgICBwMiA9IHBvaW50c1tpICsgMV07XG4gICAgICAgICAgICAgIGNwcyA9IGdldENvbnRyb2xQb2ludHMocC54LCBwLnksIHAxLngsIHAxLnksIHAyLngsIHAyLnksIHQpO1xuICAgICAgICAgICAgICBwYXRoU3RyKz0gXCJDXCIgKyByb3VuZChjcHMucDEueCkgKyBcIiBcIiArIHJvdW5kKGNwcy5wMS55KSArIFwiIFwiICsgcm91bmQoY3BzLnAyLngpICsgXCIgXCIgKyByb3VuZChjcHMucDIueSkgKyBcIiBcIiArIHJvdW5kKHAyLngpICsgXCIgXCIgKyByb3VuZChwMi55KSArIFwiIFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0aFN0cis9IFwiVFwiICsgcm91bmQocG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXS54KSArIFwiIFwiICsgcm91bmQocG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXS55KSArIFwiIFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGVsZXRlIG9wdHMuc21vb3RoO1xuICAgICAgICBkZWxldGUgb3B0cy50ZW5zaW9uO1xuICAgICAgICBkZWxldGUgb3B0cy5hcHByb3hpbWF0ZTtcbiAgICAgICAgXG4gICAgICAgIHBhdGguYXR0cihleHRlbmQoe1xuICAgICAgICAgIGZpbGw6ICdub25lJ1xuICAgICAgICB9LCBvcHRzLCB7XG4gICAgICAgICAgZDogcGF0aFN0clxuICAgICAgICB9KSk7XG4gICAgICAgIFxuICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgYXJjKCkgbWV0aG9kIGNyZWF0ZXMgYW4gYXJjL2N1cnZlICh1c2VkIHRvIGNyZWF0ZSBjaXJjbGVzLCBvciBwYXJ0cyBvZiBjaXJjbGVzKS4gXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNBbmdsZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBlQW5nbGVcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNvdW50ZXJjbG9ja3dpc2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBhcmM6IGZ1bmN0aW9uKGN4LCBjeSwgciwgc0FuZ2xlLCBlQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UsIGF0dHJzKSB7XG4gICAgICBjb3VudGVyY2xvY2t3aXNlID0gdHlwZW9mIGNvdW50ZXJjbG9ja3dpc2UgPT09ICdib29sZWFuJyA/IGNvdW50ZXJjbG9ja3dpc2UgOiBmYWxzZTtcbiAgICAgIHZhclxuICAgICAgICBkID0gJ00gJyArIHJvdW5kKGN4KSArICcsICcgKyByb3VuZChjeSksXG4gICAgICAgIGN4cyxcbiAgICAgICAgY3lzLFxuICAgICAgICBjeGUsXG4gICAgICAgIGN5ZTtcbiAgICAgIGlmIChlQW5nbGUgLSBzQW5nbGUgPT09IE1hdGguUEkgKiAyKSB7XG4gICAgICAgIC8vIENpcmNsZVxuICAgICAgICBkKz0gJyBtIC0nICsgciArICcsIDAgYSAnICsgciArICcsJyArIHIgKyAnIDAgMSwwICcgKyAociAqIDIpICsgJywwIGEgJyArIHIgKyAnLCcgKyByICsgJyAwIDEsMCAtJyArIChyICogMikgKyAnLDAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3hzID0gcm91bmQoY3ggKyBjb3Moc0FuZ2xlKSAqIHIpO1xuICAgICAgICBjeXMgPSByb3VuZChjeSArIHNpbihzQW5nbGUpICogcik7XG4gICAgICAgIGN4ZSA9IHJvdW5kKGN4ICsgY29zKGVBbmdsZSkgKiByKTtcbiAgICAgICAgY3llID0gcm91bmQoY3kgKyBzaW4oZUFuZ2xlKSAqIHIpO1xuICAgICAgICBkKz0gXCIgTFwiICsgY3hzICsgXCIsXCIgKyBjeXMgK1xuICAgICAgICAgIFwiIEFcIiArIHIgKyBcIixcIiArIHIgKyBcIiAwIFwiICsgKGVBbmdsZSAtIHNBbmdsZSA+IFBJID8gMSA6IDApICsgXCIsXCIgKyAoY291bnRlcmNsb2Nrd2lzZSA/IDAgOiAxKSArXG4gICAgICAgICAgXCIgXCIgKyBjeGUgKyBcIixcIiArIGN5ZSArIFwiIFpcIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsIFwicGF0aFwiLCB7XG4gICAgICAgIGQ6IGRcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGV4dCBpbnRvIGEgYm91bmRpbmcgYm94IGJ5IHdyYXBwaW5nIGxpbmVzIGF0IHNwYWNlcy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0geFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB5XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHdpZHRoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGhlaWdodFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICB0ZXh0Ym94OiBmdW5jdGlvbiggeCwgeSwgd2lkdGgsIGhlaWdodCwgc3RyaW5nLCBhdHRycyApIHtcbiAgICAgIFxuICAgICAgdmFyIFxuICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgIFxuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgXG4gICAgICAgIHZhclxuICAgICAgICAgIF92ZWxlbSA9IF92KGVsZW0pLFxuICAgICAgICAgIGxpbmVzID0gd2lkdGggPyBbXSA6IFtzdHJpbmddLCBcbiAgICAgICAgICBsaW5lID0gW10sXG4gICAgICAgICAgbGVuZ3RoID0gMCxcbiAgICAgICAgICB3b3JkcyA9IHdpZHRoID8gc3RyaW5nLnNwbGl0KC9cXHMrLykgOiBbXSxcbiAgICAgICAgICB0ZXh0ID0gc2VsZi5jcmVhdGUoJ3RleHQnLCBleHRlbmQodHJ1ZSwge30sIGF0dHJzLCB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0pKSxcbiAgICAgICAgICB0ZXh0Tm9kZSxcbiAgICAgICAgICBsaW5lSGVpZ2h0ID0gcGFyc2VGbG9hdChfdmVsZW0uY3NzKCdsaW5lLWhlaWdodCcpKSxcbiAgICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoX3ZlbGVtLmNzcygnZm9udC1zaXplJykpLFxuICAgICAgICAgIHRleHRBbGlnbiA9IHRleHQuY3NzKCd0ZXh0LWFsaWduJyksXG4gICAgICAgICAgdHkgPSAwO1xuICAgICAgICBcbiAgICAgICAgX3ZlbGVtLmFwcGVuZCh0ZXh0KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAvLyBCcmVhayBsaW5lc1xuICAgICAgICAgIHRleHROb2RlID0gZWxlbS5vd25lckRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO1xuICAgICAgICAgIHRleHQuYXBwZW5kKHRleHROb2RlKTtcbiAgICAgICAgICB3b3Jkcy5mb3JFYWNoKGZ1bmN0aW9uKHdvcmQsIGluZGV4KSB7XG4gICAgICAgICAgICB0ZXh0Tm9kZS5kYXRhID0gbGluZS5qb2luKCcgJykgKyAnICcgKyB3b3JkO1xuICAgICAgICAgICAgbGVuZ3RoID0gdGV4dC5jb21wdXRlZFRleHRMZW5ndGgoKTtcbiAgICAgICAgICAgIGlmIChsZW5ndGggPiB3aWR0aCkge1xuICAgICAgICAgICAgICBsaW5lcy5wdXNoKGxpbmUuam9pbignICcpKTtcbiAgICAgICAgICAgICAgbGluZSA9IFt3b3JkXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxpbmUucHVzaCh3b3JkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gd29yZHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICBsaW5lcy5wdXNoKGxpbmUuam9pbignICcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0ZXh0LnJlbW92ZSh0ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFJlbmRlciBsaW5lc1xuICAgICAgICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUsIGluZGV4KSB7XG4gICAgICAgICAgdmFyIHRzcGFuLCBkeTtcbiAgICAgICAgICBpZiAoIWhlaWdodCB8fCB0eSArIHBhcnNlRmxvYXQobGluZUhlaWdodCkgPCBoZWlnaHQpIHtcbiAgICAgICAgICAgIGR5ID0gaW5kZXggPiAwID8gbGluZUhlaWdodCA6IGZvbnRTaXplIC0gMjtcbiAgICAgICAgICAgIHR5Kz0gZHk7XG4gICAgICAgICAgICB0c3BhbiA9IHNlbGYuY3JlYXRlKCd0c3BhbicsIHtkeTogZHl9KTtcbiAgICAgICAgICAgIHRleHQuYXBwZW5kKHRzcGFuKTtcbiAgICAgICAgICAgIHRzcGFuXG4gICAgICAgICAgICAgIC5hcHBlbmQoZWxlbS5vd25lckRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxpbmUpKVxuICAgICAgICAgICAgICAuYXR0cigneCcsIHBhcnNlSW50KHRleHQuYXR0cigneCcpLCB1bmRlZmluZWQpICsgKHdpZHRoIC0gdHNwYW4uY29tcHV0ZWRUZXh0TGVuZ3RoKCkpICogKHRleHRBbGlnbiA9PT0gJ2VuZCcgfHwgdGV4dEFsaWduID09PSAncmlnaHQnID8gMSA6IHRleHRBbGlnbiA9PT0gJ2NlbnRlcicgfHwgdGV4dEFsaWduID09PSAnbWlkZGxlJyA/IDAuNSA6IDApKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgYW4gdW5vcmRlcmVkIGxpc3QuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBsaXN0OiBmdW5jdGlvbiggeCwgeSwgaXRlbXMsIG9wdGlvbnMgKSB7XG4gICAgICByZXR1cm4gdGhpcy5saXN0Ym94KHgsIHksIDAsIDAsIGl0ZW1zLCBvcHRpb25zKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgYW4gdW5vcmRlcmVkIGxpc3QgaW50byB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBsaXN0Ym94OiBmdW5jdGlvbiggeCwgeSwgd2lkdGgsIGhlaWdodCwgaXRlbXMsIG9wdGlvbnMgKSB7XG4gICAgICBpdGVtcyA9IHRvQXJyYXkoaXRlbXMpLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycgPyB7bGFiZWw6IGl0ZW19IDogaXRlbTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIFxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7fSwge1xuICAgICAgICBob3Jpem9udGFsOiBmYWxzZSxcbiAgICAgICAgYnVsbGV0OiB7XG4gICAgICAgICAgc2hhcGU6ICdjaXJjbGUnXG4gICAgICAgIH1cbiAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgXG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHRvcCA9IHk7XG4gICAgICAgIFxuICAgICAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICBfdmVsZW0gPSBfdihlbGVtKSxcbiAgICAgICAgICAgIGl0ZW1PcHRzID0gZXh0ZW5kKHRydWUsIHt9LCBvcHRpb25zLCBpdGVtKSxcbiAgICAgICAgICAgIGhvcml6b250YWwgPSBpdGVtT3B0cy5ob3Jpem9udGFsLFxuICAgICAgICAgICAgc2hhcGUgPSBpdGVtT3B0cy5idWxsZXQuc2hhcGUsXG4gICAgICAgICAgICBsYWJlbCA9IGl0ZW1PcHRzLmxhYmVsLFxuICAgICAgICAgICAgYnVsbGV0QXR0cnMsXG4gICAgICAgICAgICBpdGVtTGF5ZXIgPSBfdmVsZW0uZygpLFxuICAgICAgICAgICAgbGluZUhlaWdodCA9IHBhcnNlRmxvYXQoX3ZlbGVtLmNzcygnbGluZS1oZWlnaHQnKSksXG4gICAgICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoX3ZlbGVtLmNzcygnZm9udC1zaXplJykpLFxuICAgICAgICAgICAgYnVsbGV0U2l6ZSA9IHJvdW5kKGZvbnRTaXplICogMC42NSksXG4gICAgICAgICAgICBzcGFjaW5nID0gbGluZUhlaWdodCAqIDAuMixcbiAgICAgICAgICAgIGl0ZW1XaWR0aCxcbiAgICAgICAgICAgIGl0ZW1IZWlnaHQ7XG4gICAgICAgICAgXG4gICAgICAgICAgZGVsZXRlIGl0ZW1PcHRzLmJ1bGxldC5zaGFwZTtcbiAgICAgICAgICBkZWxldGUgaXRlbU9wdHMuaG9yaXpvbnRhbDtcbiAgICAgICAgICBkZWxldGUgaXRlbU9wdHMubGFiZWw7XG4gICAgICAgICAgXG4gICAgICAgICAgYnVsbGV0QXR0cnMgPSBleHRlbmQodHJ1ZSwge30sIGl0ZW1PcHRzLCBpdGVtT3B0cy5idWxsZXQpOyBcbiAgICAgICAgICBcbiAgICAgICAgICBkZWxldGUgaXRlbU9wdHMuYnVsbGV0O1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChoZWlnaHQgJiYgeSArIGZvbnRTaXplID4gdG9wICsgaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlbmRlciBidWxsZXRcbiAgICAgICAgICBpZiAoc2hhcGUgPT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgICBpdGVtTGF5ZXIuY2lyY2xlKHggKyBidWxsZXRTaXplIC8gMiwgeSArIChmb250U2l6ZSAtIGJ1bGxldFNpemUpIC8gMiArIGJ1bGxldFNpemUgLyAyLCBidWxsZXRTaXplIC8gMiwgYnVsbGV0QXR0cnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtTGF5ZXIucmVjdCh4LCByb3VuZCh5KSArIChmb250U2l6ZSAtIGJ1bGxldFNpemUpIC8gMiwgYnVsbGV0U2l6ZSwgYnVsbGV0U2l6ZSwgYnVsbGV0QXR0cnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZW5kZXIgbGFiZWxcbiAgICAgICAgICBpdGVtTGF5ZXIudGV4dGJveCh4ICsgYnVsbGV0U2l6ZSArIHNwYWNpbmcsIHksIHdpZHRoID8gd2lkdGggLSBidWxsZXRTaXplIC0gc3BhY2luZyA6IDAsIGhlaWdodCA/IHRvcCArIGhlaWdodCAtIHkgOiAwLCBsYWJlbCwgaXRlbU9wdHMpO1xuICAgICAgICAgIFxuICAgICAgICAgIGl0ZW1XaWR0aCA9IE1hdGguY2VpbChpdGVtTGF5ZXIuYmJveCgpLndpZHRoICsgZm9udFNpemUpO1xuICAgICAgICAgIGl0ZW1IZWlnaHQgPSBNYXRoLnJvdW5kKGl0ZW1MYXllci5iYm94KCkuaGVpZ2h0ICsgKGxpbmVIZWlnaHQgLSBmb250U2l6ZSkpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICAgICAgICB4Kz0gaXRlbVdpZHRoO1xuICAgICAgICAgICAgaWYgKHdpZHRoICYmIHggPiB3aWR0aCkge1xuICAgICAgICAgICAgICB5Kz0gaXRlbUhlaWdodDtcbiAgICAgICAgICAgICAgeCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHkrPSBpdGVtSGVpZ2h0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcbiAgXG4gIHJldHVybiBfdjtcbiAgXG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IF92OyJdfQ==
