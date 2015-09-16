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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2hhcnRyLmpzIiwic3JjL2NoYXJ0cy9DYXJ0ZXNpYW5DaGFydC5qcyIsInNyYy9jaGFydHMvYmFyY2hhcnQuanMiLCJzcmMvY2hhcnRzL2Jhc2VjaGFydC5qcyIsInNyYy9jaGFydHMvY2hhcnR3cmFwcGVyLmpzIiwic3JjL2NoYXJ0cy9jb2x1bW5jaGFydC5qcyIsInNyYy9jaGFydHMvbGluZWNoYXJ0LmpzIiwic3JjL2NoYXJ0cy9waWVjaGFydC5qcyIsInNyYy9jaGFydHMvdGFibGVjaGFydC5qcyIsInNyYy9jaGFydHMvdmlzdWFsY2hhcnQuanMiLCJzcmMvdXRpbHMvZGF0YXRhYmxlLmpzIiwic3JjL3V0aWxzL2R0aWNrcy5qcyIsInNyYy91dGlscy9udGlja3MuanMiLCJzcmMvdXRpbHMvcm91bmQuanMiLCJ2ZW5kb3IvZGZvcm1hdC9zcmMvZGZvcm1hdC5qcyIsInZlbmRvci9kZm9ybWF0L3NyYy9sb2NhbGVzL2FsbC5qcyIsInZlbmRvci9uZm9ybWF0L3NyYy9sb2NhbGVzL2FsbC5qcyIsInZlbmRvci9uZm9ybWF0L3NyYy9uZm9ybWF0LmpzIiwidmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3NUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKm1vZHVsZS5leHBvcnRzID0ge1xuICBQaWVDaGFydDogcmVxdWlyZSgnLi9jaGFydHMvcGllY2hhcnQnKSxcbiAgTGluZUNoYXJ0OiByZXF1aXJlKCcuL2NoYXJ0cy9saW5lY2hhcnQnKSxcbiAgQ29sdW1uQ2hhcnQ6IHJlcXVpcmUoJy4vY2hhcnRzL2NvbHVtbmNoYXJ0JyksXG4gIFZpc3VhbENoYXJ0OiByZXF1aXJlKCcuL2NoYXJ0cy92aXN1YWxjaGFydCcpLFxuICBDYXJ0ZXNpYW5DaGFydDogcmVxdWlyZSgnLi9jaGFydHMvY2FydGVzaWFuY2hhcnQnKSxcbiAgQ2hhcnRXcmFwcGVyOiByZXF1aXJlKCcuL2NoYXJ0cy9jaGFydHdyYXBwZXInKVxufTsqL1xuXG52YXIgQ2hhcnRXcmFwcGVyID0gcmVxdWlyZSgnLi9jaGFydHMvY2hhcnR3cmFwcGVyJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBDaGFydFdyYXBwZXIoZWxlbWVudCwgb3B0aW9ucyk7XG59O1xuIiwidmFyXG4gIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKSxcbiAgbmZvcm1hdCA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvbmZvcm1hdC9zcmMvbmZvcm1hdFwiKSxcbiAgZGZvcm1hdCA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvZGZvcm1hdC9zcmMvZGZvcm1hdFwiKSxcbiAgbnRpY2tzID0gcmVxdWlyZShcIi4uL3V0aWxzL250aWNrc1wiKSxcbiAgZHRpY2tzID0gcmVxdWlyZShcIi4uL3V0aWxzL2R0aWNrc1wiKSxcbiAgVmlzdWFsQ2hhcnQgPSByZXF1aXJlKCcuL3Zpc3VhbGNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIHRyaW1TZXQodmFsdWVzLCBjb3VudCkge1xuICAvLyBUcmltIGFycmF5IHRvIGNvdW50XG4gIHZhclxuICAgIG0gPSBNYXRoLnJvdW5kKHZhbHVlcy5sZW5ndGggLyBjb3VudCksXG4gICAgdHJpbW1lZCA9IFtdO1xuICBpZiAobSA+IDEpIHtcbiAgICB2YXIgdHJpbW1lZCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSAlIG0gPT09IDApIHtcbiAgICAgICAgdHJpbW1lZC5wdXNoKGRhdGFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJpbW1lZDtcbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufVxuXG5cbmZ1bmN0aW9uIENhcnRlc2lhbkNoYXJ0KCkge1xuICBWaXN1YWxDaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5DYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZpc3VhbENoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUsIHtcbiAgZGVmYXVsdHM6IF92LmV4dGVuZCh0cnVlLCB7fSwgVmlzdWFsQ2hhcnQucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gIH0pLFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHtcbiAgICBWaXN1YWxDaGFydC5wcm90b3R5cGUuX2NvbnN0cnVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIFZpc3VhbENoYXJ0LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB2YXJcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBlbGVtID0gdGhpcy5lbGVtZW50LFxuICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICBjaGFydExheWVyID0gdGhpcy5jaGFydExheWVyLFxuICAgICAgY2hhcnRCb3ggPSB0aGlzLmNoYXJ0Qm94LFxuICAgICAgY3cgPSBjaGFydEJveC53aWR0aCxcbiAgICAgIGNoID0gY2hhcnRCb3guaGVpZ2h0LFxuICAgICAgZ3JpZExheWVyID0gY2hhcnRMYXllci5nKHtzdHlsZToge2ZvbnRTaXplOiAnOTAlJ319KSxcbiAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXgsXG4gICAgICBjYXRlZ29yeVJhbmdlID0gdGhpcy5jYXRlZ29yeVJhbmdlLFxuICAgICAgY2F0ZWdvcnlGb3JtYXQgPSB0aGlzLmNhdGVnb3J5Rm9ybWF0LFxuICAgICAgY2F0ZWdvcnlUeXBlID0gdGhpcy5jYXRlZ29yeVR5cGUsXG4gICAgICBjYXRlZ29yeVRpY2tzID0gdGhpcy5jYXRlZ29yeVRpY2tzLFxuICAgICAgY2F0ZWdvcnlNaW4gPSBNYXRoLm1pbihjYXRlZ29yeVJhbmdlLm1pbiwgY2F0ZWdvcnlUaWNrc1swXSksXG4gICAgICBjYXRlZ29yeU1heCA9IE1hdGgubWF4KGNhdGVnb3J5UmFuZ2UubWF4LCBjYXRlZ29yeVRpY2tzW2NhdGVnb3J5VGlja3MubGVuZ3RoIC0gMV0pLFxuICAgICAgY2F0ZWdvcnlHcmlkTGluZXMgPSB0aGlzLmNhdGVnb3J5R3JpZExpbmVzLFxuICAgICAgdmFsdWVGb3JtYXQgPSB0aGlzLnZhbHVlRm9ybWF0LFxuICAgICAgdmFsdWVUeXBlID0gdGhpcy52YWx1ZVR5cGUsXG4gICAgICB2YWx1ZVRpY2tzID0gdGhpcy52YWx1ZVRpY2tzLFxuICAgICAgdmFsdWVSYW5nZSA9IHRoaXMudmFsdWVSYW5nZSxcbiAgICAgIHZhbHVlTWluID0gTWF0aC5taW4odmFsdWVSYW5nZS5taW4sIHZhbHVlVGlja3NbMF0pLFxuICAgICAgdmFsdWVNYXggPSBNYXRoLm1heCh2YWx1ZVJhbmdlLm1heCwgdmFsdWVUaWNrc1t2YWx1ZVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIHZhbHVlR3JpZExpbmVzID0gdGhpcy52YWx1ZUdyaWRMaW5lcyxcbiAgICAgIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmcgPSAxMyxcbiAgICAgIGxhYmVsVmVydGljYWxTcGFjaW5nID0gMTMsXG4gICAgICBmbGlwQXhlcyA9IHRoaXMuZmxpcEF4ZXMsXG4gICAgICBjbGlwQ2F0ZWdvcnlHcmlkID0gdGhpcy5jbGlwQ2F0ZWdvcnlHcmlkLFxuICAgICAgY2xpcFZhbHVlR3JpZCA9IHRoaXMuY2xpcFZhbHVlR3JpZCxcbiAgICAgIHRleHRDb2xvciA9IGNoYXJ0TGF5ZXIuY3NzKCdjb2xvcicpLCBcbiAgICAgIG11c3RSb3RhdGUsXG4gICAgICB0ZXh0cztcbiAgICAgIFxuICAgIG11c3RSb3RhdGUgPSBmYWxzZTtcbiAgICB0ZXh0cyA9IFtdO1xuICAgIFxuICAgIHZhciBwYXRoID0gXCJcIjtcbiAgICBjYXRlZ29yeVRpY2tzLmZvckVhY2goZnVuY3Rpb24odGljaywgaW5kZXgpIHtcbiAgICAgIHZhciB0aWNrQ29sb3IgPSBjYXRlZ29yeVR5cGUgPT09ICdudW1iZXInICYmIHRpY2sgPT09IDAgPyAwLjc1IDogMC4yNTtcbiAgICAgIHZhciB0aWNrV2lkdGggPSAoZmxpcEF4ZXMgPyBjaCA6IGN3KSAvIChjYXRlZ29yeVRpY2tzLmxlbmd0aCk7XG4gICAgICBcbiAgICAgIHZhciBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSA9ICh0aWNrIC0gY2F0ZWdvcnlNaW4pIC8gKGNhdGVnb3J5TWF4IC0gY2F0ZWdvcnlNaW4pO1xuICAgICAgXG4gICAgICB2YXIgeDE7XG4gICAgICBpZiAoZmxpcEF4ZXMpIHtcbiAgICAgICAgeDEgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNsaXBDYXRlZ29yeUdyaWQpIHtcbiAgICAgICAgICB4MSA9IHRpY2tXaWR0aCAvIDIgKyB0aWNrV2lkdGggKiBpbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4MSA9IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlICogY3c7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIHkxO1xuICAgICAgaWYgKGZsaXBBeGVzKSB7XG4gICAgICAgIGlmIChjbGlwQ2F0ZWdvcnlHcmlkKSB7XG4gICAgICAgICAgeTEgPSBjaCAtICh0aWNrV2lkdGggLyAyICsgdGlja1dpZHRoICogaW5kZXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHkxID0gY2ggLSBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSAqIGNoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB5MSA9IDA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciB4MiA9IGZsaXBBeGVzID8gY3cgOiB4MTtcbiAgICAgIHZhciB5MiA9IGZsaXBBeGVzID8geTEgOiBjaDtcbiAgICAgIFxuICAgICAgdmFyIGxpbmUgPSB7eDE6IE1hdGgucm91bmQoeDEpLCB5MTogTWF0aC5yb3VuZCh5MSksIHgyOiBNYXRoLnJvdW5kKHgyKSwgeTI6IE1hdGgucm91bmQoeTIpfTtcbiAgICAgIFxuICAgICAgaWYgKGNhdGVnb3J5R3JpZExpbmVzKSB7XG4gICAgICAgIFxuICAgICAgICAvL2dyaWRMYXllci5saW5lKGxpbmUueDEsIGxpbmUueTEsIGxpbmUueDIsIGxpbmUueTIsIHtzdHJva2U6ICdsaWdodGdyYXknLCBzdHJva2VPcGFjaXR5OiB0aWNrQ29sb3J9KTtcbiAgICAgICAgdmFyIGxpbmVQYXRoID0gXCJNIFwiICsgbGluZS54MSArIFwiIFwiICsgbGluZS55MSArIFwiIExcIiArIGxpbmUueDIgKyBcIiBcIiArIGxpbmUueTI7XG4gICAgICAgIGlmIChjYXRlZ29yeVR5cGUgPT09ICdudW1iZXInICYmIHRpY2sgPT09IDApIHtcbiAgICAgICAgICBncmlkTGF5ZXIucGF0aChsaW5lUGF0aCwge3N0cm9rZTogJ2xpZ2h0Z3JheScsIHN0cm9rZU9wYWNpdHk6IDAuNzV9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoKz0gbGluZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGxhYmVsO1xuICAgICAgaWYgKGNhdGVnb3J5VHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBsYWJlbCA9IG5mb3JtYXQodGljaywgY2F0ZWdvcnlGb3JtYXQucGF0dGVybiwgY2F0ZWdvcnlGb3JtYXQubG9jYWxlKTtcbiAgICAgIH0gZWxzZSBpZiAoY2F0ZWdvcnlUeXBlID09PSBcImRhdGVcIikge1xuICAgICAgICBsYWJlbCA9IGRmb3JtYXQodGljaywgY2F0ZWdvcnlGb3JtYXQucGF0dGVybiwgY2F0ZWdvcnlGb3JtYXQubG9jYWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVsID0gZGF0YVRhYmxlLmdldFZhbHVlKHRpY2ssIGNhdGVnb3J5SW5kZXgpO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgbGFiZWxYID0gZmxpcEF4ZXMgPyB4MSAtIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmcgOiB4MTtcbiAgICAgIHZhciBsYWJlbFkgPSBmbGlwQXhlcyA/IGNoIC0geTEgOiB5MiArIGxhYmVsVmVydGljYWxTcGFjaW5nO1xuICAgICAgXG4gICAgICB2YXIgbGFiZWxXaWR0aCA9IGZsaXBBeGVzID8gY2hhcnRCb3gueCAtIGxhYmVsSG9yaXpvbnRhbFNwYWNpbmcgOiB0aWNrV2lkdGg7XG4gICAgICB2YXIgdGV4dEFuY2hvciA9IGZsaXBBeGVzID8gJ2VuZCcgOiAnbWlkZGxlJzsgXG4gICAgICB2YXIgdGV4dCA9IGdyaWRMYXllci5jcmVhdGUoXCJ0ZXh0XCIsIHtcbiAgICAgICAgeDogTWF0aC5yb3VuZChsYWJlbFgpLCBcbiAgICAgICAgeTogTWF0aC5yb3VuZChsYWJlbFkpLFxuICAgICAgICBkeTogXCIwLjRlbVwiLFxuICAgICAgICB0ZXh0QW5jaG9yOiB0ZXh0QW5jaG9yXG4gICAgICB9KS5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGFiZWwpKTtcbiAgICAgIFxuICAgICAgdGV4dHMucHVzaCh0ZXh0KTtcbiAgICAgIFxuICAgICAgZ3JpZExheWVyLmFwcGVuZCh0ZXh0KTtcbiAgICAgIFxuICAgICAgaWYgKHRleHQuY29tcHV0ZWRUZXh0TGVuZ3RoKCkgPiBsYWJlbFdpZHRoKSB7XG4gICAgICAgIG11c3RSb3RhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgaWYgKG11c3RSb3RhdGUpIHtcbiAgICAgIHRleHRzLmZvckVhY2goZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgeCA9IHRleHQuYXR0cigneCcpO1xuICAgICAgICB2YXIgeSA9IHRleHQuYXR0cigneScpO1xuICAgICAgICB0ZXh0LmF0dHIoe1xuICAgICAgICAgIHRleHRBbmNob3I6ICdlbmQnLFxuICAgICAgICAgIHRyYW5zZm9ybTogXCJyb3RhdGUoLTMyIFwiICsgeCArIFwiLFwiICsgeSArIFwiKVwiXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIG11c3RSb3RhdGUgPSBmYWxzZTtcbiAgICB0ZXh0cyA9IFtdO1xuICAgIFxuICAgIFxuICAgIHZhbHVlVGlja3MuZm9yRWFjaChmdW5jdGlvbih0aWNrLCBpbmRleCkge1xuICAgICAgXG4gICAgICB2YXIgdGlja1dpZHRoID0gKGZsaXBBeGVzID8gY2hhcnRCb3guaGVpZ2h0IDogY2hhcnRCb3gud2lkdGgpIC8gKHZhbHVlVGlja3MubGVuZ3RoICsgMSk7XG4gICAgICB2YXIgdGlja0NvbG9yID0gdmFsdWVUeXBlID09PSAnbnVtYmVyJyAmJiB0aWNrID09PSAwID8gMC43NSA6IDAuMjU7XG4gICAgICBcbiAgICAgIHZhciBub3JtYWxpemVkVmFsdWUgPSAodGljayAtIHZhbHVlTWluKSAvICh2YWx1ZU1heCAtIHZhbHVlTWluKTtcbiAgICAgIHZhciB4MTtcbiAgICAgIFxuICAgICAgaWYgKGZsaXBBeGVzKSB7XG4gICAgICAgIGlmIChjbGlwVmFsdWVHcmlkKSB7XG4gICAgICAgICAgeDEgPSB0aWNrV2lkdGggKiAwLjUgKyB0aWNrV2lkdGggKiBpbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4MSA9IG5vcm1hbGl6ZWRWYWx1ZSAqIGNoYXJ0Qm94LndpZHRoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4MSA9IDA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciB5MTtcbiAgICAgIGlmIChmbGlwQXhlcykge1xuICAgICAgICB5MSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY2xpcFZhbHVlR3JpZCkge1xuICAgICAgICAgIHkxID0gdGlja1dpZHRoICogMC41ICsgdGlja1dpZHRoICogaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeTEgPSBjaGFydEJveC5oZWlnaHQgLSBub3JtYWxpemVkVmFsdWUgKiBjaGFydEJveC5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIHgyID0gZmxpcEF4ZXMgPyB4MSA6IGNoYXJ0Qm94LndpZHRoO1xuICAgICAgdmFyIHkyID0gZmxpcEF4ZXMgPyBjaGFydEJveC5oZWlnaHQgOiB5MTtcbiAgICAgIFxuICAgICAgdmFyIGxpbmUgPSB7eDE6IE1hdGgucm91bmQoeDEpLCB5MTogTWF0aC5yb3VuZCh5MSksIHgyOiBNYXRoLnJvdW5kKHgyKSwgeTI6IE1hdGgucm91bmQoeTIpfTtcbiAgICAgIFxuICAgICAgaWYgKHZhbHVlR3JpZExpbmVzKSB7XG4gICAgICAgIC8vZ3JpZExheWVyLmxpbmUobGluZS54MSwgbGluZS55MSwgbGluZS54MiwgbGluZS55Miwge3N0cm9rZTogJ2xpZ2h0Z3JheScsIHN0cm9rZU9wYWNpdHk6IHRpY2tDb2xvcn0pO1xuICAgICAgICB2YXIgbGluZVBhdGggPSBcIk0gXCIgKyBsaW5lLngxICsgXCIgXCIgKyBsaW5lLnkxICsgXCIgTFwiICsgbGluZS54MiArIFwiIFwiICsgbGluZS55MjtcbiAgICAgICAgaWYgKHZhbHVlVHlwZSA9PT0gJ251bWJlcicgJiYgdGljayA9PT0gMCkge1xuICAgICAgICAgIGdyaWRMYXllci5wYXRoKGxpbmVQYXRoLCB7c3Ryb2tlOiAnbGlnaHRncmF5Jywgc3Ryb2tlT3BhY2l0eTogMC43NX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhdGgrPSBsaW5lUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAodmFsdWVUeXBlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGxhYmVsID0gbmZvcm1hdCh0aWNrLCB2YWx1ZUZvcm1hdC5wYXR0ZXJuLCB2YWx1ZUZvcm1hdC5sb2NhbGUpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZVR5cGUgPT09IFwiZGF0ZVwiKSB7XG4gICAgICAgIGxhYmVsID0gZGZvcm1hdCh0aWNrLCB2YWx1ZUZvcm1hdC5wYXR0ZXJuLCB2YWx1ZUZvcm1hdC5sb2NhbGUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgbGFiZWxYID0gZmxpcEF4ZXMgPyB4MSA6IHgxIC0gbGFiZWxIb3Jpem9udGFsU3BhY2luZztcbiAgICAgIHZhciBsYWJlbFkgPSBmbGlwQXhlcyA/IHkyICsgbGFiZWxWZXJ0aWNhbFNwYWNpbmcgOiB5MTtcbiAgICAgIHZhciBsYWJlbFdpZHRoID0gZmxpcEF4ZXMgPyB0aWNrV2lkdGggOiBjaGFydEJveC54IC0gbGFiZWxIb3Jpem9udGFsU3BhY2luZztcbiAgICAgIHZhciB0ZXh0QW5jaG9yID0gZmxpcEF4ZXMgPyAnbWlkZGxlJyA6ICdlbmQnOyBcbiAgICAgIFxuICAgICAgdmFyIHRleHQgPSBncmlkTGF5ZXIuY3JlYXRlKFwidGV4dFwiLCB7XG4gICAgICAgIHg6IE1hdGgucm91bmQobGFiZWxYKSwgXG4gICAgICAgIHk6IE1hdGgucm91bmQobGFiZWxZKSxcbiAgICAgICAgZHk6IFwiMC40ZW1cIixcbiAgICAgICAgdGV4dEFuY2hvcjogdGV4dEFuY2hvclxuICAgICAgfSkuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxhYmVsKSk7XG4gICAgICBcbiAgICAgIGdyaWRMYXllci5hcHBlbmQodGV4dCk7XG4gICAgICBcbiAgICB9KTtcbiAgICBcbiAgICBncmlkTGF5ZXIucGF0aChwYXRoLCB7c3Ryb2tlOiAnbGlnaHRncmF5Jywgc3Ryb2tlT3BhY2l0eTogMC4yNX0pO1xuICAgIFxuICAgIGlmIChtdXN0Um90YXRlKSB7XG4gICAgICB0ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHggPSB0ZXh0LmF0dHIoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0ZXh0LmF0dHIoJ3knKTtcbiAgICAgICAgdGV4dC5hdHRyKHtcbiAgICAgICAgICB0ZXh0QW5jaG9yOiAnZW5kJyxcbiAgICAgICAgICB0cmFuc2Zvcm06IFwicm90YXRlKC0zMiBcIiArIHggKyBcIixcIiArIHkgKyBcIilcIlxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZSwge1xuICBjYXRlZ29yeUluZGV4OiB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfSxcbiAgY2F0ZWdvcnlUeXBlOiB7XG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhVGFibGUgJiYgdGhpcy5kYXRhVGFibGUuZ2V0Q29sdW1uVHlwZSh0aGlzLmNhdGVnb3J5SW5kZXgpO1xuICAgIH1cbiAgfSxcbiAgY2F0ZWdvcnlSYW5nZToge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZTtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgaWYgKGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKHRoaXMuY2F0ZWdvcnlJbmRleCkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogZGF0YVRhYmxlLmdldE51bWJlck9mUm93cygpIC0gMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVRhYmxlLmdldENvbHVtblJhbmdlKHRoaXMuY2F0ZWdvcnlJbmRleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIGNhdGVnb3J5Rm9ybWF0OiB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXgsXG4gICAgICAgIGNvbHVtblBhdHRlcm4gPSBkYXRhVGFibGUuZ2V0Q29sdW1uUGF0dGVybihjYXRlZ29yeUluZGV4KSxcbiAgICAgICAgY29sdW1uTG9jYWxlID0gZGF0YVRhYmxlLmdldENvbHVtbkxvY2FsZShjYXRlZ29yeUluZGV4KTtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgaWYgKGNvbHVtblBhdHRlcm4pIHtcbiAgICAgICAgICAvLyBQcmVmZXIgc2hvcnQgbmFtZXMgb24gc2NhbGVcbiAgICAgICAgICBjb2x1bW5QYXR0ZXJuLnJlcGxhY2UoL01NTU0vLCBcIk1NTVwiKTtcbiAgICAgICAgICBjb2x1bW5QYXR0ZXJuLnJlcGxhY2UoL2RkZGQvLCBcImRkZFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHBhdHRlcm46IGNvbHVtblBhdHRlcm4sXG4gICAgICAgICAgbG9jYWxlOiBjb2x1bW5Mb2NhbGVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgY2F0ZWdvcnlUaWNrczoge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyXG4gICAgICAgIHJhbmdlID0gdGhpcy5jYXRlZ29yeVJhbmdlLFxuICAgICAgICB0eXBlID0gdGhpcy5jYXRlZ29yeVR5cGUsXG4gICAgICAgIG1pbiA9IHJhbmdlLm1pbixcbiAgICAgICAgbWF4ID0gcmFuZ2UubWF4LFxuICAgICAgICBjb3VudCA9IE1hdGgubWluKDEwLCB0aGlzLmRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSksXG4gICAgICAgIG91dGVyID0gZmFsc2U7XG4gICAgICBpZiAodHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIG50aWNrcyhtaW4sIG1heCwgY291bnQsIG91dGVyKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgIHJldHVybiBkdGlja3MobWluLCBtYXgsIGNvdW50LCBvdXRlcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG1heCA9IHRoaXMuZGF0YVRhYmxlLmdldE51bWJlck9mUm93cygpIC0gMTtcbiAgICAgICAgcmV0dXJuIChBcnJheS5hcHBseShudWxsLCB7bGVuZ3RoOiB0aGlzLmRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKX0pLm1hcChOdW1iZXIuY2FsbCwgTnVtYmVyKSkubWFwKGZ1bmN0aW9uKHRpY2spIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0aWNrKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2YWx1ZVJhbmdlOiB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5kYXRhVGFibGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyXG4gICAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgICByZXN1bHQgPSB7fSxcbiAgICAgICAgY29sdW1uSW5kZXgsXG4gICAgICAgIGNhdGVnb3J5SW5kZXggPSB0aGlzLmNhdGVnb3J5SW5kZXgsXG4gICAgICAgIHJhbmdlO1xuICAgICAgaWYgKGRhdGFUYWJsZSkge1xuICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICBpZiAoY29sdW1uSW5kZXggIT09IGNhdGVnb3J5SW5kZXgpIHtcbiAgICAgICAgICAgIHJhbmdlID0gZGF0YVRhYmxlLmdldENvbHVtblJhbmdlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICAgIHJlc3VsdC5taW4gPSB0eXBlb2YgcmVzdWx0Lm1pbiA9PT0gJ3VuZGVmaW5lZCcgPyByYW5nZS5taW4gOiBNYXRoLm1pbihyZXN1bHQubWluLCByYW5nZS5taW4pO1xuICAgICAgICAgICAgcmVzdWx0Lm1heCA9IHR5cGVvZiByZXN1bHQubWF4ID09PSAndW5kZWZpbmVkJyA/IHJhbmdlLm1heCA6IE1hdGgubWF4KHJlc3VsdC5tYXgsIHJhbmdlLm1heCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH0sXG4gIHZhbHVlVHlwZToge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuZGF0YVRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhclxuICAgICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgICAgY2F0ZWdvcnlJbmRleCA9IHRoaXMuY2F0ZWdvcnlJbmRleDtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgaWYgKGNvbHVtbkluZGV4ICE9PSBjYXRlZ29yeUluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICB2YWx1ZUZvcm1hdDoge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIGNvbHVtbkluZGV4LFxuICAgICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgICB2YWx1ZVR5cGUgPSB0aGlzLnZhbHVlVHlwZTtcbiAgICAgICAgXG4gICAgICBpZiAoZGF0YVRhYmxlKSB7XG4gICAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICAgIGlmIChjb2x1bW5JbmRleCAhPT0gY2F0ZWdvcnlJbmRleCkge1xuICAgICAgICAgICAgdmFyIGNvbHVtblBhdHRlcm4gPSBkYXRhVGFibGUuZ2V0Q29sdW1uUGF0dGVybihjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICB2YXIgY29sdW1uTG9jYWxlID0gZGF0YVRhYmxlLmdldENvbHVtbkxvY2FsZShjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICBpZiAoY29sdW1uUGF0dGVybikge1xuICAgICAgICAgICAgICAvLyBQcmVmZXIgc2hvcnQgbmFtZXMgb24gc2NhbGVcbiAgICAgICAgICAgICAgY29sdW1uUGF0dGVybi5yZXBsYWNlKC9NTU1NLywgXCJNTU1cIik7XG4gICAgICAgICAgICAgIGNvbHVtblBhdHRlcm4ucmVwbGFjZSgvZGRkZC8sIFwiZGRkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgcGF0dGVybjogY29sdW1uUGF0dGVybixcbiAgICAgICAgICAgICAgbG9jYWxlOiBjb2x1bW5Mb2NhbGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICB2YWx1ZVRpY2tzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8qXG4gICAgICB2YXJcbiAgICAgICAgcmFuZ2UgPSB0aGlzLnZhbHVlUmFuZ2UsXG4gICAgICAgIHR5cGUgPSB0aGlzLnZhbHVlVHlwZSxcbiAgICAgICAgY291bnQgPSBNYXRoLm1pbigxMCwgdGhpcy5kYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCkpO1xuICAgICAgcmV0dXJuICh0eXBlID09PSAnbnVtYmVyJyA/IG50aWNrcyA6IHR5cGUgPT09ICdkYXRlJyA/IGR0aWNrcyA6IHN0aWNrcykocmFuZ2UubWluLCByYW5nZS5tYXgsIDYsIHRydWUpOyovXG4gICAgICB2YXJcbiAgICAgICAgcmFuZ2UgPSB0aGlzLnZhbHVlUmFuZ2UsXG4gICAgICAgIHR5cGUgPSB0aGlzLnZhbHVlVHlwZSxcbiAgICAgICAgbWluID0gcmFuZ2UubWluLFxuICAgICAgICBtYXggPSByYW5nZS5tYXgsXG4gICAgICAgIGNvdW50ID0gNSxcbiAgICAgICAgb3V0ZXIgPSB0cnVlO1xuICAgICAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBudGlja3MobWluLCBtYXgsIGNvdW50LCBvdXRlcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICByZXR1cm4gZHRpY2tzKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBtYXggPSB0aGlzLmRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSAtIDE7XG4gICAgICAgIHJldHVybiBudGlja3MoMCwgbWF4LCBNYXRoLm1pbihtYXggKyAxLCBjb3VudCksIG91dGVyKS5tYXAoZnVuY3Rpb24odGljaykge1xuICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRpY2spO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGxlZ2VuZEl0ZW1zOiB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhclxuICAgICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgICAgY29sb3JJbmRleCA9IDAsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICBsYWJlbDtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY2F0ZWdvcnlJbmRleCAhPT0gY29sdW1uSW5kZXgpIHtcbiAgICAgICAgICAgIGxhYmVsID0gZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCh7bGFiZWw6IGRhdGFUYWJsZS5nZXRDb2x1bW5MYWJlbChjb2x1bW5JbmRleCkgfHwgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWWFlaXCIuY2hhckF0KGNvbHVtbkluZGV4ICUgMjEpLCBidWxsZXQ6IHsgZmlsbDogb3B0aW9ucy5jb2xvcnNbY29sb3JJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF0gfSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbG9ySW5kZXgrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LFxuICBmbGlwQXhlczoge1xuICAgIHZhbHVlOiBmYWxzZSxcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9LFxuICBjbGlwQ2F0ZWdvcnlHcmlkOiB7XG4gICAgdmFsdWU6IGZhbHNlLFxuICAgIHdyaXRlYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0sXG4gIGNhdGVnb3J5R3JpZExpbmVzOiB7XG4gICAgdmFsdWU6IHRydWUsXG4gICAgd3JpdGVhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSxcbiAgY2xpcFZhbHVlR3JpZDoge1xuICAgIHZhbHVlOiBmYWxzZSxcbiAgICB3cml0ZWFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9LFxuICB2YWx1ZUdyaWRMaW5lczoge1xuICAgIHZhbHVlOiB0cnVlLFxuICAgIHdyaXRlYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYXJ0ZXNpYW5DaGFydDsiLCJ2YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xudmFyIG50aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9udGlja3NcIik7XG52YXIgZHRpY2tzID0gcmVxdWlyZShcIi4uL3V0aWxzL2R0aWNrc1wiKTtcbnZhciBDb2x1bW5DaGFydCA9IHJlcXVpcmUoJy4vY29sdW1uY2hhcnQnKTtcblxuZnVuY3Rpb24gQmFyQ2hhcnQoKSB7XG4gIENvbHVtbkNoYXJ0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbkJhckNoYXJ0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29sdW1uQ2hhcnQucHJvdG90eXBlKTtcblxuX3YuZXh0ZW5kKENvbHVtbkNoYXJ0LnByb3RvdHlwZSwge1xuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBDb2x1bW5DaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSlcbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhCYXJDaGFydC5wcm90b3R5cGUsIHtcbiAgZmxpcEF4ZXM6IHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXJDaGFydDsiLCJ2YXIgRGF0YVRhYmxlID0gcmVxdWlyZShcIi4uL3V0aWxzL2RhdGF0YWJsZVwiKTtcbnZhciBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIik7XG5cbmZ1bmN0aW9uIEJhc2VDaGFydChlbGVtZW50LCBvcHRpb25zKSB7XG4gIFxuICAvLyBDb25zdHJ1Y3QgQmFzZUNoYXJ0XG4gIHZhclxuICAgIGVsZW0gPSB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvciA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkgOiBlbGVtZW50LFxuICAgIG9wdHMgPSBfdi5leHRlbmQodHJ1ZSwgdGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUuZGVmYXVsdHMsIG9wdGlvbnMpLFxuICAgIGRhdGFUYWJsZSA9IERhdGFUYWJsZS5mcm9tQXJyYXkob3B0aW9ucy5kYXRhKTtcbiAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICBlbGVtZW50OiB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW0gPSBlbGVtZW50O1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHNldDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0cyA9IF92LmV4dGVuZCh0cnVlLCBvcHRzLCBvcHRpb25zKTtcbiAgICAgICAgZGF0YVRhYmxlID0gRGF0YVRhYmxlLmZyb21BcnJheShvcHRzLmRhdGEpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gb3B0cztcbiAgICAgIH1cbiAgICB9LFxuICAgIGRhdGFUYWJsZToge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGF0YVRhYmxlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIFxuICAvLyBjYWxsIGNvbnN0cnVjdFxuICB0aGlzLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgXG4gIC8vIFNldCBvcHRpb25zIGFuZCByZW5kZXIgY2hhcnRcbiAgdGhpcy5yZW5kZXIoKTtcbn1cblxuXG5fdi5leHRlbmQoQmFzZUNoYXJ0LnByb3RvdHlwZSwge1xuICBkZWZhdWx0czoge1xuICAgIC8qXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICBmb250U2l6ZTogJzEycHgnLFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBjb2xvcjogJyM4MTgzODYnXG4gICAgfSovXG4gIH0sXG4gIF9jb25zdHJ1Y3Q6IGZ1bmN0aW9uKCkge30sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gQ2xlYXJcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAvLyBBcHBseSBzdHlsZXNcbiAgICBfdi5jc3ModGhpcy5lbGVtZW50LCB0aGlzLm9wdGlvbnMuc3R5bGUpO1xuICB9XG59KTtcblxuICBcbm1vZHVsZS5leHBvcnRzID0gQmFzZUNoYXJ0OyIsInZhciBfdiA9IHJlcXVpcmUoXCIuLi8uLi92ZW5kb3IvdmlzdWFsaXN0L3NyYy92aXN1YWxpc3RcIik7XG52YXIgRGF0YVRhYmxlID0gcmVxdWlyZShcIi4uL3V0aWxzL2RhdGF0YWJsZVwiKTtcbnZhciBMaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVjaGFydCcpO1xudmFyIFBpZUNoYXJ0ID0gcmVxdWlyZSgnLi9waWVjaGFydCcpO1xudmFyIENvbHVtbkNoYXJ0ID0gcmVxdWlyZSgnLi9jb2x1bW5jaGFydCcpO1xudmFyIEJhckNoYXJ0ID0gcmVxdWlyZSgnLi9iYXJjaGFydCcpO1xudmFyIFRhYmxlQ2hhcnQgPSByZXF1aXJlKCcuL3RhYmxlY2hhcnQnKTtcblxuZnVuY3Rpb24gZ2V0Q2hhcnRUeXBlKGRhdGFUYWJsZSkge1xuICBcbiAgaWYgKGRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKSA+IDIwKSB7XG4gICAgcmV0dXJuIFwibGluZVwiO1xuICB9XG4gIFxuICByZXR1cm4gJ3BpZSc7XG59XG5cbmZ1bmN0aW9uIGdldENoYXJ0Q2xhc3ModHlwZSkge1xuICB2YXIgY2xheno7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgY2xhenogPSBMaW5lQ2hhcnQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwaWUnOlxuICAgICAgY2xhenogPSBQaWVDaGFydDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NvbHVtbic6XG4gICAgICBjbGF6eiA9IENvbHVtbkNoYXJ0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmFyJzpcbiAgICAgIGNsYXp6ID0gQmFyQ2hhcnQ7XG4gICAgICBicmVhaztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjbGF6eiA9IFRhYmxlQ2hhcnQ7XG4gICAgICBcbiAgfVxuICByZXR1cm4gY2xheno7XG59XG5cbmZ1bmN0aW9uIENoYXJ0V3JhcHBlcihlbGVtZW50LCBvcHRpb25zKSB7XG4gIFxuICB2YXJcbiAgICBjaGFydCxcbiAgICBvcHRzID0gX3YuZXh0ZW5kKHRydWUsIHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlLmRlZmF1bHRzKTtcbiAgICBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgIGNoYXJ0OiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJ0O1xuICAgICAgfVxuICAgIH0sXG4gICAgb3B0aW9uczoge1xuICAgICAgc2V0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBvcHRzID0gX3YuZXh0ZW5kKHRydWUsIG9wdHMsIG9wdGlvbnMpO1xuICAgICAgICB2YXIgZGF0YVRhYmxlID0gRGF0YVRhYmxlLmZyb21BcnJheShvcHRzLmRhdGEpO1xuICAgICAgICB2YXIgY2hhcnRUeXBlID0gb3B0cy50eXBlIHx8IGdldENoYXJ0VHlwZShkYXRhVGFibGUpO1xuICAgICAgICB2YXIgY2hhcnRDbGFzcyA9IGdldENoYXJ0Q2xhc3MoY2hhcnRUeXBlKTtcbiAgICAgICAgb3B0cy5kYXRhID0gZGF0YVRhYmxlO1xuICAgICAgICBpZiAoY2hhcnQgJiYgY2hhcnQuY29uc3RydWN0b3IgPT09IGNoYXJ0Q2xhc3MpIHtcbiAgICAgICAgICBjaGFydC5vcHRpb25zID0gb3B0cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFydCA9IG5ldyBjaGFydENsYXNzKGNoYXJ0ICYmIGNoYXJ0LmVsZW1lbnQgfHwgZWxlbWVudCwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgXG4gIHRoaXMuX2NvbnN0cnVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xufVxuXG5fdi5leHRlbmQoQ2hhcnRXcmFwcGVyLnByb3RvdHlwZSwge1xuICBkZWZhdWx0czoge1xuICB9LFxuICBfY29uc3RydWN0OiBmdW5jdGlvbigpIHt9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2hhcnQucmVuZGVyKCk7XG4gIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhDaGFydFdyYXBwZXIucHJvdG90eXBlLCB7XG4gIGVsZW1lbnQ6IHtcbiAgICBzZXQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuY2hhcnQuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcnQuZWxlbWVudDtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJ0V3JhcHBlcjsiLCJ2YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xudmFyIG50aWNrcyA9IHJlcXVpcmUoXCIuLi91dGlscy9udGlja3NcIik7XG52YXIgZHRpY2tzID0gcmVxdWlyZShcIi4uL3V0aWxzL2R0aWNrc1wiKTtcbnZhciBDYXJ0ZXNpYW5DaGFydCA9IHJlcXVpcmUoJy4vY2FydGVzaWFuY2hhcnQnKTtcblxuZnVuY3Rpb24gQ29sdW1uQ2hhcnQoKSB7XG4gIENhcnRlc2lhbkNoYXJ0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbkNvbHVtbkNoYXJ0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlKTtcblxuX3YuZXh0ZW5kKENvbHVtbkNoYXJ0LnByb3RvdHlwZSwge1xuICBkZWZhdWx0czogX3YuZXh0ZW5kKHRydWUsIHt9LCBDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgfSksXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgQ2FydGVzaWFuQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIFxuICAgIHZhclxuICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgY2hhcnRMYXllciA9IHRoaXMuY2hhcnRMYXllcixcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveCxcbiAgICAgIGNvbHVtbkluZGV4ID0gdGhpcy5jb2x1bW5JbmRleCxcbiAgICAgIHJvd0luZGV4ID0gMCxcbiAgICAgIHZhbHVlSW5kZXggPSAwLFxuICAgICAgdmFsdWVSYW5nZSA9IHRoaXMudmFsdWVSYW5nZSxcbiAgICAgIHZhbHVlVGlja3MgPSB0aGlzLnZhbHVlVGlja3MsXG4gICAgICB2YWx1ZU1pbiA9IE1hdGgubWluKHZhbHVlUmFuZ2UubWluLCB2YWx1ZVRpY2tzWzBdKSxcbiAgICAgIHZhbHVlTWF4ID0gTWF0aC5tYXgodmFsdWVSYW5nZS5tYXgsIHZhbHVlVGlja3NbdmFsdWVUaWNrcy5sZW5ndGggLSAxXSksXG4gICAgICBjYXRlZ29yeVR5cGUgPSB0aGlzLmNhdGVnb3J5VHlwZSxcbiAgICAgIGNhdGVnb3J5UmFuZ2UgPSB0aGlzLmNhdGVnb3J5UmFuZ2UsXG4gICAgICBjYXRlZ29yeVRpY2tzID0gdGhpcy5jYXRlZ29yeVRpY2tzLFxuICAgICAgY2F0ZWdvcnlJbmRleCA9IHRoaXMuY2F0ZWdvcnlJbmRleCxcbiAgICAgIGNhdGVnb3J5TWluID0gTWF0aC5taW4oY2F0ZWdvcnlSYW5nZS5taW4sIGNhdGVnb3J5VGlja3NbMF0pLFxuICAgICAgY2F0ZWdvcnlNYXggPSBNYXRoLm1heChjYXRlZ29yeVJhbmdlLm1heCwgY2F0ZWdvcnlUaWNrc1tjYXRlZ29yeVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIGZsaXBBeGVzID0gdGhpcy5mbGlwQXhlcyxcbiAgICAgIGdyYXBoTGF5ZXIsXG4gICAgICBwb2ludHMsXG4gICAgICB2YWx1ZSxcbiAgICAgIG5vcm1hbGl6ZWRWYWx1ZSxcbiAgICAgIGNhdGVnb3J5VmFsdWUsXG4gICAgICBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSxcbiAgICAgIHgsXG4gICAgICB5O1xuICAgICAgXG4gICAgdmFyIHJvd3MgPSBkYXRhVGFibGUuZ2V0U29ydGVkUm93cyhjYXRlZ29yeUluZGV4KTtcbiAgICBcbiAgICB2YXIgcmVjdFdpZHRoID0gY2hhcnRCb3gud2lkdGggLyAoZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpIC0gMSk7XG4gICAgdmFyIHRpY2tXaWR0aCA9IChmbGlwQXhlcyA/IGNoYXJ0Qm94LmhlaWdodCA6IGNoYXJ0Qm94LndpZHRoKSAvIHJvd3MubGVuZ3RoOyBcbiAgICB2YXIgY29sdW1uV2lkdGggPSBNYXRoLm1heCgxLCB0aWNrV2lkdGggLyBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCkpO1xuICAgIHZhciBjb2x1bW5TcGFjaW5nID0gY29sdW1uV2lkdGggKiAwLjI1O1xuICAgIHZhciBtID0gMTtcbiAgIFxuICAgIHZhciBzdW0gPSB7fTtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIFxuICAgIGdyYXBoTGF5ZXIgPSBjaGFydExheWVyLmcoe1xuICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcnNbdmFsdWVJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF1cbiAgICB9KTtcbiAgICBcbiAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCByb3dzLmxlbmd0aDsgcm93SW5kZXgrKykge1xuICAgICAgY291bnQrKztcbiAgICAgIHZhciBzdGVwID0gcm93SW5kZXggJSBtID09PSAwO1xuICAgICAgXG4gICAgICB2YXIgdmFsdWVJbmRleCA9IDA7XG4gICAgICBcbiAgICAgIFxuICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoY29sdW1uSW5kZXggIT09IGNhdGVnb3J5SW5kZXgpIHtcbiAgICAgICAgICBcbiAgICAgICAgICBjYXRlZ29yeVZhbHVlID0gY2F0ZWdvcnlUeXBlID09PSAnc3RyaW5nJyA/IHJvd0luZGV4IDogcm93c1tyb3dJbmRleF1bY2F0ZWdvcnlJbmRleF07XG4gICAgICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgPSAoY2F0ZWdvcnlWYWx1ZSAtIGNhdGVnb3J5TWluKSAvICggY2F0ZWdvcnlNYXggLSBjYXRlZ29yeU1pbik7XG4gICAgICBcbiAgICAgICAgICAvL1xuICAgICAgICAgIHBvaW50cyA9IFtdO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHJvd3Nbcm93SW5kZXhdW2NvbHVtbkluZGV4XTtcbiAgICAgICAgICBcbiAgICAgICAgICBzdW1bY29sdW1uSW5kZXhdID0gc3VtW2NvbHVtbkluZGV4XSB8fCAwO1xuICAgICAgICAgIHN1bVtjb2x1bW5JbmRleF0rPSB2YWx1ZTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBub3JtYWxpemVkVmFsdWUgPSAodmFsdWUgLSB2YWx1ZU1pbikgLyAodmFsdWVNYXggLSB2YWx1ZU1pbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBub3JtYWxpemVkVmFsdWVaZXJvID0gMDtcbiAgICAgICAgICAgIGlmICh2YWx1ZU1pbiA8IDAgJiYgdmFsdWVNYXggPiAwKSB7XG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZVplcm8gPSAoMCAtIHZhbHVlTWluKSAvICh2YWx1ZU1heCAtIHZhbHVlTWluKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWRDYXRlZ29yeVplcm8gPSAwO1xuICAgICAgICAgICAgaWYgKGNhdGVnb3J5TWluIDwgMCAmJiBjYXRlZ29yeU1heCA+IDApIHtcbiAgICAgICAgICAgICAgbm9ybWFsaXplZENhdGVnb3J5WmVybyA9ICgwIC0gY2F0ZWdvcnlNaW4pIC8gKGNhdGVnb3J5TWF4IC0gY2F0ZWdvcnlNaW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgdyA9IE1hdGgubWF4KDEsIGNvbHVtbldpZHRoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyp2YXIgeHYgPSBmbGlwQXhlcyA/IG5vcm1hbGl6ZWRWYWx1ZSA6IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlO1xuICAgICAgICAgICAgdmFyIHl2ID0gZmxpcEF4ZXMgPyBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSA6IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHp2ID0gZmxpcEF4ZXMgPyBub3JtYWxpemVkQ2F0ZWdvcnlaZXJvIDogbm9ybWFsaXplZFZhbHVlWmVybztcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB4diA9IG5vcm1hbGl6ZWRDYXRlZ29yeVZhbHVlO1xuICAgICAgICAgICAgdmFyIHl2ID0gbm9ybWFsaXplZFZhbHVlO1xuICAgICAgICAgICAgdmFyIHp2ID0gbm9ybWFsaXplZFZhbHVlWmVybztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGN3ID0gZmxpcEF4ZXMgPyBjaGFydEJveC53aWR0aCA6IGNoYXJ0Qm94LndpZHRoIC0gdGlja1dpZHRoO1xuICAgICAgICAgICAgdmFyIGNoID0gZmxpcEF4ZXMgPyBjaGFydEJveC5oZWlnaHQgLSB0aWNrV2lkdGggOiBjaGFydEJveC5oZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBvID0gY29sdW1uV2lkdGggLyAyICsgdmFsdWVJbmRleCAqIGNvbHVtbldpZHRoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgb3ggPSBmbGlwQXhlcyA/IDAgOiBvO1xuICAgICAgICAgICAgdmFyIG95ID0gZmxpcEF4ZXMgPyBvIDogMDtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB4ID0geHYgKiBjdyArIG94O1xuICAgICAgICAgICAgeSA9IHl2ICogY2ggKyBveTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgeCA9IHh2ICogY3cgKyBveDtcbiAgICAgICAgICAgIHZhciB5ID0gY2ggLSB5diAqIGNoICsgb3k7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGggPSB5diAqIGNoO1xuICAgICAgICAgICBcbiAgICAgICAgICAgIC8vaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICB5ID0gY2ggLSB6diAqIGNoO1xuICAgICAgICAgICAgICBoID0gKHp2IC0geXYpICogY2g7XG4gICAgICAgICAgICAvKn0gZWxzZSBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICBoID0gaCAtIHp2ICogY2g7XG4gICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZmxpcEF4ZXMpIHtcbiAgICAgICAgICAgICAgaCA9IHc7XG4gICAgICAgICAgICAgIHcgPSAoeXYgLSB6dikgKiBjdztcbiAgICAgICAgICAgICAgeCA9IHp2ICogY3c7XG4gICAgICAgICAgICAgIHkgPSB4diAqIGNoICsgb3k7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBcbiAgICAgICAgICAgICAgeDEgPSBNYXRoLnJvdW5kKHgpLFxuICAgICAgICAgICAgICB5MSA9IE1hdGgucm91bmQoeSksXG4gICAgICAgICAgICAgIHgyID0gTWF0aC5yb3VuZCh4KSArIE1hdGgucm91bmQodyksXG4gICAgICAgICAgICAgIHkyID0gTWF0aC5yb3VuZCh5KSArIE1hdGgucm91bmQoaCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdyYXBoTGF5ZXIucGF0aCgnTScgKyB4MSArJywnICsgeTEgKyAnICcgKyB4MiArICcsJyArIHkxICsgJyAnICsgeDIgKyAnLCcgKyB5MiArICcgJyArIHgxICsgJywnICsgeTIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2dyYXBoTGF5ZXIuY2lyY2xlKHgxLCB5MSwgMTAsIHtmaWxsOiAncmVkJ30pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICBncmFwaExheWVyLmdyYXBoKHBvaW50cywge1xuICAgICAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcnNbdmFsdWVJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF0sXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDEuNVxuICAgICAgICB9KTtcbiAgICAgICAgKi9cbiAgICAgICBcbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdGVwKSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgICBzdW0gPSB7fTtcbiAgICB9XG4gIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhDb2x1bW5DaGFydC5wcm90b3R5cGUsIHtcbiAgY2xpcENhdGVnb3J5R3JpZDoge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0sXG4gIGNhdGVnb3J5R3JpZExpbmVzOiB7XG4gICAgdmFsdWU6IGZhbHNlXG4gIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ2hhcnQ7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcblxudmFyIENhcnRlc2lhbkNoYXJ0ID0gcmVxdWlyZSgnLi9DYXJ0ZXNpYW5DaGFydCcpO1xuXG5mdW5jdGlvbiBMaW5lQ2hhcnQoKSB7XG4gIENhcnRlc2lhbkNoYXJ0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbkxpbmVDaGFydC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChMaW5lQ2hhcnQucHJvdG90eXBlLCB7XG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIENhcnRlc2lhbkNoYXJ0LnByb3RvdHlwZS5kZWZhdWx0cywge1xuICB9KSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBcbiAgICBDYXJ0ZXNpYW5DaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgXG4gICAgdmFyXG4gICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBjaGFydExheWVyID0gdGhpcy5jaGFydExheWVyLFxuICAgICAgY2hhcnRCb3ggPSB0aGlzLmNoYXJ0Qm94LFxuICAgICAgY29sdW1uSW5kZXggPSB0aGlzLmNvbHVtbkluZGV4LFxuICAgICAgcm93SW5kZXggPSAwLFxuICAgICAgdmFsdWVJbmRleCA9IDAsXG4gICAgICB2YWx1ZVJhbmdlID0gdGhpcy52YWx1ZVJhbmdlLFxuICAgICAgdmFsdWVUaWNrcyA9IHRoaXMudmFsdWVUaWNrcyxcbiAgICAgIHZhbHVlTWluID0gTWF0aC5taW4odmFsdWVSYW5nZS5taW4sIHZhbHVlVGlja3NbMF0pLFxuICAgICAgdmFsdWVNYXggPSBNYXRoLm1heCh2YWx1ZVJhbmdlLm1heCwgdmFsdWVUaWNrc1t2YWx1ZVRpY2tzLmxlbmd0aCAtIDFdKSxcbiAgICAgIGNhdGVnb3J5VHlwZSA9IHRoaXMuY2F0ZWdvcnlUeXBlLFxuICAgICAgY2F0ZWdvcnlSYW5nZSA9IHRoaXMuY2F0ZWdvcnlSYW5nZSxcbiAgICAgIGNhdGVnb3J5VGlja3MgPSB0aGlzLmNhdGVnb3J5VGlja3MsXG4gICAgICBjYXRlZ29yeUluZGV4ID0gdGhpcy5jYXRlZ29yeUluZGV4LFxuICAgICAgY2F0ZWdvcnlNaW4gPSBNYXRoLm1pbihjYXRlZ29yeVJhbmdlLm1pbiwgY2F0ZWdvcnlUaWNrc1swXSksXG4gICAgICBjYXRlZ29yeU1heCA9IE1hdGgubWF4KGNhdGVnb3J5UmFuZ2UubWF4LCBjYXRlZ29yeVRpY2tzW2NhdGVnb3J5VGlja3MubGVuZ3RoIC0gMV0pLFxuICAgICAgZmxpcEF4ZXMgPSB0aGlzLmZsaXBBeGVzLFxuICAgICAgZ3JhcGhMYXllciA9IGNoYXJ0TGF5ZXIuZygpLFxuICAgICAgcG9pbnRzLFxuICAgICAgdmFsdWUsXG4gICAgICBub3JtYWxpemVkVmFsdWUsXG4gICAgICBjYXRlZ29yeVZhbHVlLFxuICAgICAgbm9ybWFsaXplZENhdGVnb3J5VmFsdWUsXG4gICAgICB4LFxuICAgICAgeTtcbiAgICAgIFxuICAgIHZhciByb3dzID0gZGF0YVRhYmxlLmdldFNvcnRlZFJvd3MoY2F0ZWdvcnlJbmRleCk7XG4gICAgXG4gICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICBpZiAoY29sdW1uSW5kZXggIT09IGNhdGVnb3J5SW5kZXgpIHtcbiAgICAgICAgcG9pbnRzID0gW107XG4gICAgICAgIFxuICAgICAgICAvL2ZvciAocm93SW5kZXggPSAwOyByb3dJbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKTsgcm93SW5kZXgrKykge1xuICAgICAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCByb3dzLmxlbmd0aDsgcm93SW5kZXgrKykge1xuICAgICAgICAgIFxuICAgICAgICAgIHZhbHVlID0gcm93c1tyb3dJbmRleF1bY29sdW1uSW5kZXhdO1xuICAgICAgICAgIC8vdmFsdWUgPSBkYXRhVGFibGUuZ2V0VmFsdWUocm93SW5kZXgsIGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBjYXRlZ29yeVZhbHVlID0gY2F0ZWdvcnlUeXBlID09PSAnc3RyaW5nJyA/IHJvd0luZGV4IDogcm93c1tyb3dJbmRleF1bY2F0ZWdvcnlJbmRleF07XG4gICAgICAgICAgLy9jYXRlZ29yeVZhbHVlID0gY2F0ZWdvcnlUeXBlID09PSAnc3RyaW5nJyA/IHJvd0luZGV4IDogZGF0YVRhYmxlLmdldFZhbHVlKHJvd0luZGV4LCBjYXRlZ29yeUluZGV4KTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZSA9IChjYXRlZ29yeVZhbHVlIC0gY2F0ZWdvcnlNaW4pIC8gKCBjYXRlZ29yeU1heCAtIGNhdGVnb3J5TWluKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9ICh2YWx1ZSAtIHZhbHVlTWluKSAvICh2YWx1ZU1heCAtIHZhbHVlTWluKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHh2ID0gZmxpcEF4ZXMgPyBub3JtYWxpemVkVmFsdWUgOiBub3JtYWxpemVkQ2F0ZWdvcnlWYWx1ZTtcbiAgICAgICAgICAgIHZhciB5diA9IGZsaXBBeGVzID8gbm9ybWFsaXplZENhdGVnb3J5VmFsdWUgOiBub3JtYWxpemVkVmFsdWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHggPSBNYXRoLnJvdW5kKHh2ICogY2hhcnRCb3gud2lkdGgpO1xuICAgICAgICAgICAgeSA9IE1hdGgucm91bmQoY2hhcnRCb3guaGVpZ2h0IC0geXYgKiBjaGFydEJveC5oZWlnaHQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwb2ludHMucHVzaCh7eDogeCwgeTogeX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZ3JhcGhMYXllci5ncmFwaChwb2ludHMsIHtcbiAgICAgICAgICBzbW9vdGg6IG9wdGlvbnMuc21vb3RoLFxuICAgICAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcnNbdmFsdWVJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF0sXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDEuNVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVDaGFydDsiLCJ2YXJcbiAgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpLFxuICBuZm9ybWF0ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci9uZm9ybWF0L3NyYy9uZm9ybWF0XCIpLFxuICBkZm9ybWF0ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci9kZm9ybWF0L3NyYy9kZm9ybWF0XCIpLFxuICByb3VuZCA9IHJlcXVpcmUoJy4uL3V0aWxzL3JvdW5kJyksXG4gIFZpc3VhbENoYXJ0ID0gcmVxdWlyZSgnLi92aXN1YWxjaGFydCcpO1xuXG5mdW5jdGlvbiBQaWVDaGFydCgpIHtcbiAgVmlzdWFsQ2hhcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuUGllQ2hhcnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaXN1YWxDaGFydC5wcm90b3R5cGUpO1xuXG5fdi5leHRlbmQoUGllQ2hhcnQucHJvdG90eXBlLCB7XG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIFZpc3VhbENoYXJ0LnByb3RvdHlwZS5kZWZhdWx0cywge1xuICB9KSxcbiAgX2NvbnN0cnVjdDogZnVuY3Rpb24oKSB7XG4gICAgVmlzdWFsQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBWaXN1YWxDaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIFxuICAgIHZhclxuICAgICAgbGFiZWxGb250U2l6ZSA9IDExLFxuICAgICAgbGFiZWxEaXN0YW5jZSA9IGxhYmVsRm9udFNpemUgKyBsYWJlbEZvbnRTaXplICogMC43NSxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBlbGVtID0gdGhpcy5lbGVtZW50LFxuICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICBjaGFydExheWVyID0gdGhpcy5jaGFydExheWVyLFxuICAgICAgZ3JpZExheWVyID0gY2hhcnRMYXllci5nKHtcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBmb250U2l6ZTogbGFiZWxGb250U2l6ZSArIFwicHhcIlxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveCxcbiAgICAgIHJvd0luZGV4LFxuICAgICAgY29sdW1uSW5kZXgsXG4gICAgICBjb2x1bW5UeXBlLFxuICAgICAgdHlwZSA9IGdldFR5cGVPZkRhdGEoZGF0YVRhYmxlKSxcbiAgICAgIHBpZXMgPSBbXSxcbiAgICAgIHBpZSxcbiAgICAgIHRvdGFsID0gMCxcbiAgICAgIGxhYmVsLFxuICAgICAgdmFsdWUsXG4gICAgICBmb3JtYXR0ZWRWYWx1ZSxcbiAgICAgIHBhdHRlcm4sXG4gICAgICBsb2NhbGUsXG4gICAgICBpbmRleCxcbiAgICAgIHBhZGRpbmcgPSBsYWJlbERpc3RhbmNlICogMC43NSxcbiAgICAgIC8vcGFkZGluZyA9IDMwLFxuICAgICAgeSA9IHBhZGRpbmcsXG4gICAgICByID0gKE1hdGgubWluKGNoYXJ0Qm94LndpZHRoLCBjaGFydEJveC5oZWlnaHQpIC0gcGFkZGluZyAqIDIgKSAvIDIsXG4gICAgICB4ID0gY2hhcnRCb3gud2lkdGggLyAyIC0gcixcbiAgICAgIHAgPSAwLFxuICAgICAgZyxcbiAgICAgIGEsXG4gICAgICBheCxcbiAgICAgIGF5LFxuICAgICAgc0FuZ2xlLFxuICAgICAgZUFuZ2xlO1xuICAgICAgXG4gICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgIC8vIENvbHVtbiBiYXNlZCB2YWx1ZXNcbiAgICAgIGZvciAoY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKTsgY29sdW1uSW5kZXgrKykge1xuICAgICAgICBjb2x1bW5UeXBlID0gZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpO1xuICAgICAgICBpZiAoY29sdW1uVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB2YWx1ZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5BdmVyYWdlKGNvbHVtbkluZGV4KTtcbiAgICAgICAgICBwYXR0ZXJuID0gZGF0YVRhYmxlLmdldENvbHVtblBhdHRlcm4oY29sdW1uSW5kZXgpO1xuICAgICAgICAgIGxvY2FsZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5Mb2NhbGUoY29sdW1uSW5kZXgpO1xuICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gbmZvcm1hdCh2YWx1ZSwgcGF0dGVybiwgbG9jYWxlKTtcbiAgICAgICAgICBwaWVzLnB1c2goe3Y6IHZhbHVlLCBmOiBmb3JtYXR0ZWRWYWx1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJvdyBiYXNlZCB2YWx1ZXNcbiAgICAgIGZvciAocm93SW5kZXggPSAwOyByb3dJbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKTsgcm93SW5kZXgrKykge1xuICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICBjb2x1bW5UeXBlID0gZGF0YVRhYmxlLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpO1xuICAgICAgICAgIGlmIChjb2x1bW5UeXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgLy8gTnVtZXJpYyB2YWx1ZVxuICAgICAgICAgICAgdmFsdWUgPSBkYXRhVGFibGUuZ2V0VmFsdWUocm93SW5kZXgsIGNvbHVtbkluZGV4KTtcbiAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gZGF0YVRhYmxlLmdldEZvcm1hdHRlZFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICAgICAgICBwaWVzLnB1c2goe3Y6IHZhbHVlLCBmOiBmb3JtYXR0ZWRWYWx1ZX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8vIFN1bSB1cCB0b3RhbFxuICAgIGZvciAodmFyIGkgPSAwOyBwaWUgPSBwaWVzW2ldOyBpKyspIHtcbiAgICAgIHRvdGFsKz0gcGllLnY7XG4gICAgfTtcbiAgICBcbiAgICAvLyBEcmF3IGJhY2tncm91bmRcbiAgICBjaGFydExheWVyLmNpcmNsZSh4ICsgciwgeSArIHIsIHIsIHtcbiAgICAgIGZpbGw6ICdsaWdodGdyYXknXG4gICAgfSk7XG4gICAgXG4gICAgLy8gUmVuZGVyIHBpZXMgYW5kIGxhYmVsc1xuICAgIGZvciAoaW5kZXggPSAwOyBwaWUgPSBwaWVzW2luZGV4XTsgaW5kZXgrKykge1xuICAgICAgXG4gICAgICAvLyBSZW5kZXIgcGllXG4gICAgICBzQW5nbGUgPSBwICogTWF0aC5QSSAqIDIgLSBNYXRoLlBJIC8gMjtcbiAgICAgIHAgPSBwaWUucCA9IHAgKyBwaWUudiAvIHRvdGFsO1xuICAgICAgXG4gICAgICBlQW5nbGUgPSBwICogTWF0aC5QSSAqIDIgLSBNYXRoLlBJIC8gMjtcbiAgICAgIFxuICAgICAgY2hhcnRMYXllci5nKHtmaWxsOiBvcHRpb25zLmNvbG9yc1tpbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF19KS5hcmMoeCArIHIsIHkgKyByLCByLCBzQW5nbGUsIGVBbmdsZSwgMSk7XG4gICAgICBcbiAgICAgIC8vIFJlbmRlciBsYWJlbFxuICAgICAgYSA9IHNBbmdsZSArIChlQW5nbGUgLSBzQW5nbGUpIC8gMjtcbiAgICAgIGF4ID0gciArIE1hdGguY29zKGEpICogKHIgKyBsYWJlbERpc3RhbmNlKTtcbiAgICAgIGF5ID0gciArIE1hdGguc2luKGEpICogKHIgKyBsYWJlbERpc3RhbmNlKTtcbiAgICAgIFxuICAgICAgZ3JpZExheWVyLnRleHQoeCArIGF4LCB5ICsgYXksIHBpZS5mLCB7dGV4dEFuY2hvcjogJ21pZGRsZScsIGR4OiAnMC4xZW0nLCBkeTogJzAuN2VtJ30pO1xuICAgICAgXG4gICAgfVxuICAgIFxuICB9XG59KTtcblxuZnVuY3Rpb24gZ2V0VHlwZU9mRGF0YShkYXRhVGFibGUpIHtcbiAgLy8gRGV0ZWN0IHR5cGUgb2YgZGF0YVxuICB2YXIgY29sdW1uVHlwZTtcbiAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgY29sdW1uVHlwZSA9IGRhdGFUYWJsZS5nZXRDb2x1bW5UeXBlKGNvbHVtbkluZGV4KTtcbiAgICBpZiAoY29sdW1uVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMDtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUGllQ2hhcnQucHJvdG90eXBlLCB7XG4gIFxuICBsZWdlbmRJdGVtczoge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXJcbiAgICAgICAgZGF0YVRhYmxlID0gdGhpcy5kYXRhVGFibGUsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICByb3dJbmRleCxcbiAgICAgICAgY29sdW1uSW5kZXgsXG4gICAgICAgIHZhbHVlSW5kZXggPSAwLFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdHlwZSA9IGdldFR5cGVPZkRhdGEoZGF0YVRhYmxlKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgaWYgKGRhdGFUYWJsZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gMCkge1xuICAgICAgICAgIC8vIENvbHVtbiBiYXNlZCB2YWx1ZXNcbiAgICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICAgIGlmIChkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtsYWJlbDogZGF0YVRhYmxlLmdldENvbHVtbkxhYmVsKGNvbHVtbkluZGV4KSwgYnVsbGV0OiB7IGZpbGw6IG9wdGlvbnMuY29sb3JzW3ZhbHVlSW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdIH0gfSk7XG4gICAgICAgICAgICAgIHZhbHVlSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gUm93IGJhc2VkIHZhbHVlc1xuICAgICAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZSb3dzKCk7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgICAgIGlmIChkYXRhVGFibGUuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIC8vIExhYmVsXG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogZGF0YVRhYmxlLmdldEZvcm1hdHRlZFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCkgfHwgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWWFlaXCIuY2hhckF0KHJvd0luZGV4ICUgMjEpLFxuICAgICAgICAgICAgICAgIGJ1bGxldDoge1xuICAgICAgICAgICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcnNbdmFsdWVJbmRleCAlIG9wdGlvbnMuY29sb3JzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB2YWx1ZUluZGV4Kys7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgXG4gICAgfVxuICB9XG4gIFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGllQ2hhcnQ7IiwidmFyIF92ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci92aXN1YWxpc3Qvc3JjL3Zpc3VhbGlzdFwiKTtcblxudmFyIEJhc2VDaGFydCA9IHJlcXVpcmUoJy4vYmFzZWNoYXJ0Jyk7XG5cbmZ1bmN0aW9uIFRhYmxlQ2hhcnQoKSB7XG4gIEJhc2VDaGFydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5UYWJsZUNoYXJ0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChUYWJsZUNoYXJ0LnByb3RvdHlwZSwge1xuICBcbiAgZGVmYXVsdHM6IF92LmV4dGVuZCh0cnVlLCB7fSwgQmFzZUNoYXJ0LnByb3RvdHlwZS5kZWZhdWx0cywge1xuICB9KSxcbiAgXG4gIF9jb25zdHJ1Y3Q6IGZ1bmN0aW9uKCkge1xuICAgIEJhc2VDaGFydC5wcm90b3R5cGUuX2NvbnN0cnVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFJlbmRlciBsYXllclxuICAgIEJhc2VDaGFydC5wcm90b3R5cGUucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyXG4gICAgICBlbGVtZW50ID0gdGhpcy5lbGVtZW50LFxuICAgICAgbGF5ZXIgPSBfdigpLFxuICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgIGRhdGFUYWJsZSA9IHRoaXMuZGF0YVRhYmxlLFxuICAgICAgY29sdW1uSW5kZXgsXG4gICAgICByb3dJbmRleCxcbiAgICAgIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCxcbiAgICAgIHRhYmxlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyksXG4gICAgICBjYXB0aW9uID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2NhcHRpb24nKSxcbiAgICAgIHRoZWFkID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RoZWFkJyksXG4gICAgICB0Ym9keSA9IGRvYy5jcmVhdGVFbGVtZW50KCd0Ym9keScpLFxuICAgICAgdHIsIHRoLCB0ZCxcbiAgICAgIGV2ZW47XG4gICAgICBcbiAgICAgIC8vIFJlbmRlciBodG1sXG4gICAgICBcbiAgICBfdi5jc3ModGFibGUsIHtcbiAgICAgIGZvbnRTaXplOiAnMTJweCcsXG4gICAgICBib3JkZXJDb2xsYXBzZTogXCJjb2xsYXBzZVwiLFxuICAgICAgYm9yZGVyOiBcIjFweCBzb2xpZCAjZWZlZmVmXCIsXG4gICAgICBtYXJnaW5Cb3R0b206ICcxLjVlbScsXG4gICAgICB3aWR0aDogJzYwMHB4JyxcbiAgICAgIG1heFdpZHRoOiAnMTAwJScsXG4gICAgICBkaXNwbGF5OiAndGFibGUnLFxuICAgICAgdGFibGVMYXlvdXQ6ICdmaXhlZCdcbiAgICB9KTtcbiAgICBcbiAgICBjYXB0aW9uLmlubmVySFRNTCA9IG9wdGlvbnMudGl0bGUgfHwgXCJUYWJsZUNoYXJ0XCI7XG4gICAgXG4gICAgX3YuY3NzKGNhcHRpb24sIHtcbiAgICAgIGZvbnRTaXplOiBcIjEyMCVcIixcbiAgICAgIGNvbG9yOiAnaW5oZXJpdCcsXG4gICAgICB0ZXh0QWxpZ246ICdsZWZ0J1xuICAgIH0pO1xuICAgIFxuICAgIHRhYmxlLmFwcGVuZENoaWxkKGNhcHRpb24pO1xuICAgIC8qX3YuY3NzKHRoZWFkLCB7XG4gICAgICB3aWR0aDogJzEwMCUnXG4gICAgfSk7XG4gICAgX3YuY3NzKHRib2R5LCB7XG4gICAgICB3aWR0aDogJzEwMCUnXG4gICAgfSk7Ki9cbiAgICBcbiAgICBcbiAgICB0YWJsZS5hcHBlbmRDaGlsZCh0aGVhZCk7XG4gICAgXG4gICAgLy8gQ29sdW1uIHRpdGxlc1xuICAgIHZhciBoYXNDb2x1bW5MYWJlbHMgPSBmYWxzZTsgXG4gICAgdHIgPSBkb2MuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgIHRoID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgICB2YXIgbGFiZWwgPSBkYXRhVGFibGUuZ2V0Q29sdW1uTGFiZWwoY29sdW1uSW5kZXgpO1xuICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgIGhhc0NvbHVtbkxhYmVscyA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aC5pbm5lckhUTUwgPSBsYWJlbDtcbiAgICAgIF92LmNzcyh0aCwge1xuICAgICAgICAvL3dpZHRoOiAxMDAgLyBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCkgKyBcIiVcIixcbiAgICAgICAgYm9yZGVyOiBcIjFweCBzb2xpZCAjZGZkZmRmXCIsXG4gICAgICAgIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2VmZWZlZicsXG4gICAgICAgIHdvcmRXcmFwOiAnYnJlYWstd29yZCcsXG4gICAgICAgIHBhZGRpbmc6ICc1cHgnXG4gICAgICB9KTtcbiAgICAgIHRyLmFwcGVuZENoaWxkKHRoKTtcbiAgICB9XG4gICAgaWYgKGhhc0NvbHVtbkxhYmVscykge1xuICAgICAgdGhlYWQuYXBwZW5kQ2hpbGQodHIpO1xuICAgIH1cbiAgICBcbiAgICAvLyBSb3dzXG4gICAgdGFibGUuYXBwZW5kQ2hpbGQodGJvZHkpO1xuICAgIGZvciAocm93SW5kZXggPSAwOyByb3dJbmRleCA8IGRhdGFUYWJsZS5nZXROdW1iZXJPZlJvd3MoKTsgcm93SW5kZXgrKykge1xuICAgICAgZXZlbiA9IHJvd0luZGV4ICUgMjtcbiAgICAgIHRyID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG4gICAgICBmb3IgKGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBkYXRhVGFibGUuZ2V0TnVtYmVyT2ZDb2x1bW5zKCk7IGNvbHVtbkluZGV4KyspIHtcbiAgICAgICAgdGQgPSBkb2MuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgdGQuaW5uZXJIVE1MID0gZGF0YVRhYmxlLmdldEZvcm1hdHRlZFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICAgIF92LmNzcyh0ZCwge1xuICAgICAgICAgIC8vd2lkdGg6IDEwMCAvIGRhdGFUYWJsZS5nZXROdW1iZXJPZkNvbHVtbnMoKSArIFwiJVwiLFxuICAgICAgICAgIGJvcmRlcjogXCIxcHggc29saWQgI2VmZWZlZlwiLFxuICAgICAgICAgIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGV2ZW4gPyAnI2ZhZmFmYScgOiAnJyxcbiAgICAgICAgICB3b3JkV3JhcDogJ2JyZWFrLXdvcmQnLFxuICAgICAgICAgIHBhZGRpbmc6ICc1cHgnXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpO1xuICAgICAgfVxuICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpO1xuICAgIH1cbiAgICBcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICBcbiAgICBcbiAgICAvLyBSZW5kZXIgU1ZHIExheWVyIHVzaW5nIGEgZm9yZWlnbiBvYmplY3RcbiAgICAvKlxuICAgIGxheWVyXG4gICAgICAuY2xlYXIoKVxuICAgICAgLmF0dHIoe1xuICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW86IFwieE1pZFlNaWQgbWVldFwiLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBoZWlnaHQ6IDQwMFxuICAgICAgfSk7XG5cbiAgICB2YXIgZm9yZWlnbiA9IGxheWVyXG4gICAgICAuY3JlYXRlKCdmb3JlaWduT2JqZWN0Jywge1xuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBoZWlnaHQ6IDQwMFxuICAgICAgfSk7XG4gICAgICBcbiAgICB2YXIgYm9keSA9IGVsZW1lbnQub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCAnYm9keScpO1xuICAgIGZvcmVpZ24uYXR0cigncmVxdWlyZWQtZXh0ZW5zaW9ucycsIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiKTtcbiAgICBsYXllci5hcHBlbmQoZm9yZWlnbik7XG4gICAgZm9yZWlnbi5hcHBlbmQoYm9keSk7XG4gICAgXG4gICAgYm9keS5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIFxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQobGF5ZXJbMF0pO1xuICAgICovXG4gIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhUYWJsZUNoYXJ0LnByb3RvdHlwZSwge1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFibGVDaGFydDsiLCJ2YXIgX3YgPSByZXF1aXJlKFwiLi4vLi4vdmVuZG9yL3Zpc3VhbGlzdC9zcmMvdmlzdWFsaXN0XCIpO1xuXG52YXJcbiAgQmFzZUNoYXJ0ID0gcmVxdWlyZSgnLi9iYXNlY2hhcnQnKSxcbiAgcm91bmQgPSByZXF1aXJlKCcuLi91dGlscy9yb3VuZCcpO1xuXG5mdW5jdGlvbiBWaXN1YWxDaGFydCgpIHtcbiAgQmFzZUNoYXJ0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cblZpc3VhbENoYXJ0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUNoYXJ0LnByb3RvdHlwZSk7XG5cbl92LmV4dGVuZChWaXN1YWxDaGFydC5wcm90b3R5cGUsIHtcbiAgXG4gIGRlZmF1bHRzOiBfdi5leHRlbmQodHJ1ZSwge30sIEJhc2VDaGFydC5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICAvL2NvbG9yczogWyduYXZ5JywgJ21hcm9vbicsICdvbGl2ZScsICd0ZWFsJywgJ2Jyb3duJywgJ2dyZWVuJywgJ2JsdWUnLCAncHVycGxlJywgJ29yYW5nZScsICd2aW9sZXQnLCAnY3lhbicsICdmdWNoc2lhJywgJ3llbGxvdycsICdsaW1lJywgJ2FxdWEnLCAncmVkJ10sXG4gICAgLy9jb2xvcnM6IFwiIzI4N0NDRSwjOTYzQTc0LCM0OEUzODcsI0U1QTA2OSwjNTBGMkY3LCNGNTVBNDQsIzczNzM3M1wiLnNwbGl0KC9bXFxzLF0rLyksXG4gICAgY29sb3JzOiBcIiMyMzYyYzUsI2ZmNzUxOCwjMTJjMGEzLCNjN2RhZjgsI2ZmZDExOCwjZjUxNzMxLCM4QWY0NmMsI0M1MTM4QlwiLnNwbGl0KC9bXFxzLF0rLyksXG4gICAgbGVnZW5kOiAndG9wJ1xuICB9KSxcbiAgXG4gIF9jb25zdHJ1Y3Q6IGZ1bmN0aW9uKCkge1xuICBcbiAgICBCYXNlQ2hhcnQucHJvdG90eXBlLl9jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB2YXJcbiAgICAgIGxheWVyID0gX3YoKSxcbiAgICAgIGNoYXJ0TGF5ZXIgPSBsYXllci5jcmVhdGUoJ2cnKTtcbiAgICAgICAgXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbGF5ZXI6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjaGFydExheWVyOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXJ0TGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZW5kZXIgbGF5ZXJcbiAgICBCYXNlQ2hhcnQucHJvdG90eXBlLnJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHZhclxuICAgICAgd2lkdGggPSA2MDAsXG4gICAgICBoZWlnaHQgPSA0MDAsXG4gICAgICBzcGFjaW5nID0gNyxcbiAgICAgIFxuICAgICAgZWxlbSA9IHRoaXMuZWxlbWVudCxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgIGxheWVyID0gdGhpcy5sYXllcixcbiAgICAgIGNoYXJ0TGF5ZXIgPSB0aGlzLmNoYXJ0TGF5ZXIsXG5cbiAgICAgIGNoYXJ0Qm94LFxuICAgICAgXG4gICAgICB0aXRsZUxheWVyLFxuICAgICAgdGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8IFwiXCIsXG4gICAgICBcbiAgICAgIGxlZ2VuZEl0ZW1zID0gdGhpcy5sZWdlbmRJdGVtcyxcbiAgICAgIGxlZ2VuZExheWVyLFxuICAgICAgbGVnZW5kQm94ID0ge307XG4gICAgICAvKlxuICAgICAgX3YuY3NzKGVsZW0sIHtcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgIG1heFdpZHRoOiB3aWR0aCArIFwicHhcIixcbiAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHQgKyBcInB4XCIsXG4gICAgICAgIC8vcGFkZGluZ1RvcDogKCh3aWR0aCAvIGhlaWdodCkgKyAxMDApICsgXCIlXCIsXG4gICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICB9KTsqL1xuXG4gICAgICAvLyBSZW5kZXIgbGF5ZXJcbiAgICAgIGVsZW0uYXBwZW5kQ2hpbGQobGF5ZXJbMF0pO1xuICAgICAgbGF5ZXJcbiAgICAgICAgLmNsZWFyKClcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICAgICAgLyp3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIiwqL1xuICAgICAgICAgIC8vaGVpZ2h0OiBcImF1dG9cIixcbiAgICAgICAgICAvL3dpZHRoOiB3aWR0aCArIFwicHhcIixcbiAgICAgICAgICAvL2hlaWdodDogaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICAgIC8vaGVpZ2h0OiBoZWlnaHQgKyBcInB4XCIsXG4gICAgICAgICAgXG4gICAgICAgICAgLy9oZWlnaHQ6IGhlaWdodCArIFwicHhcIixcbiAgICAgICAgICAvKlxuICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICBoZWlnaHQ6IFwiYXV0b1wiLFxuICAgICAgICAgICovXG4gICAgICAgICAgLy9oZWlnaHQ6IFwiYXV0b1wiLFxuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICBmaWxsOiBfdi5jc3MoZWxlbSwgJ2NvbG9yJyksIFxuICAgICAgICAgICAgLypwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsKi9cbiAgICAgICAgICAgIC8vd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgLy9oZWlnaHQ6IFwiYXV0b1wiLFxuICAgICAgICAgICAgLy9tYXhIZWlnaHQ6IGhlaWdodCArIFwicHhcIixcbiAgICAgICAgICAgIG1heFdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIG1heEhlaWdodDogaGVpZ2h0ICsgXCJweFwiLFxuICAgICAgICAgICAgaGVpZ2h0OiBcImF1dG9cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmlld0JveDogXCIwIDAgXCIgKyA2MDAgKyBcIiBcIiArIDQwMCxcbiAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgIC8vcHJlc2VydmVBc3BlY3RSYXRpbzogXCJub25lXCJcbiAgICAgICAgICAvL3ByZXNlcnZlQXNwZWN0UmF0aW86IFwieE1pbllNaW4gbWVldFwiXG4gICAgICAgIH0pO1xuICAgICAgXG4gICAgICAvL21heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogNDAwcHg7IGhlaWdodDogYXV0bztcbiAgICAgIC8vbGF5ZXIuYXR0cignc3R5bGUnLCBsYXllclswXS5zdHlsZS5jc3NUZXh0ICsgJyBoZWlnaHQ6JyArIGhlaWdodCArICdweFxcXFwnKTtcbiAgICAgIFxuICAgICAgLypcbiAgICAgIGNvbnNvbGUubG9nKGxheWVyLmF0dHIoJ3dpZHRoJyksIGxheWVyLmF0dHIoJ2hlaWdodCcpKTtcbiAgICAgIGNvbnNvbGUubG9nKGxheWVyLmF0dHIoJ3N0eWxlJykpO1xuICAgICAgY29uc29sZS5sb2cobGF5ZXIuYXR0cigndmlld0JveCcpKTtcbiAgICAgIGNvbnNvbGUubG9nKGxheWVyLmF0dHIoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nKSk7XG4gICAgICAqL1xuICAgICBcbiAgICAgIGNoYXJ0Qm94ID0gdGhpcy5jaGFydEJveDtcbiAgICAgIHZhciBsYXllclJlY3QgPSB0aGlzLmxheWVyWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgXG4gICAgICBcbiAgICAgIHZhciB0ZXh0Q29sb3IgPSBsYXllci5jc3MoJ2NvbG9yJyk7XG4gICAgICAvLyBSZW5kZXIgdGl0bGVcbiAgICAgIHRpdGxlTGF5ZXIgPSBsYXllci5nKCk7XG4gICAgICB0aXRsZUxheWVyXG4gICAgICAgIC50ZXh0KDAsIC0yLCB0aXRsZSwge3N0eWxlOiB7Zm9udFNpemU6ICcxMjAlJ30sIHRleHRBbmNob3I6ICdzdGFydCd9KVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgXCJ0cmFuc2xhdGUoXCIgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LngpICsgXCIsXCIgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnkgLSBzcGFjaW5nKSArIFwiKVwiKTtcbiAgICAgIFxuICAgICAgaWYgKHRoaXMubGVnZW5kSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIGxlZ2VuZExheWVyID0gbGF5ZXIuZygpO1xuICAgICAgICAvLyBSZW5kZXIgbGVnZW5kXG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5sZWdlbmQpIHtcbiAgICAgICAgICBjYXNlICd0b3AnOiBcbiAgICAgICAgICAgIGxlZ2VuZExheWVyXG4gICAgICAgICAgICAgIC5saXN0Ym94KDAsIDAsIGNoYXJ0Qm94LndpZHRoLCAwLCBsZWdlbmRJdGVtcywge2hvcml6b250YWw6IHRydWUsIGZpbGw6IHRleHRDb2xvcn0pXG4gICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LngpICsgJywnICsgTWF0aC5mbG9vcihjaGFydEJveC55IC0gc3BhY2luZyAqIDIgLSBsZWdlbmRMYXllci5iYm94KCkuaGVpZ2h0KSArICcpJyk7XG4gICAgICAgICAgICB0aXRsZUxheWVyXG4gICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBcInRyYW5zbGF0ZShcIiArIE1hdGguZmxvb3IoY2hhcnRCb3gueCkgKyBcIixcIiArIE1hdGguZmxvb3IoY2hhcnRCb3gueSAtIHNwYWNpbmcgKiAzIC0gbGVnZW5kTGF5ZXIuYmJveCgpLmhlaWdodCkgKyBcIilcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdib3R0b20nOiBcbiAgICAgICAgICAgIGxlZ2VuZExheWVyXG4gICAgICAgICAgICAgIC5saXN0Ym94KDAsIDAsIGNoYXJ0Qm94LndpZHRoLCAwLCBsZWdlbmRJdGVtcywge2hvcml6b250YWw6IHRydWUsIGZpbGw6IHRleHRDb2xvcn0pXG4gICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnggKyBzcGFjaW5nKSArICcsJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueSArIGNoYXJ0Qm94LmhlaWdodCArIHNwYWNpbmcpICsgJyknKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xlZnQnOiBcbiAgICAgICAgICAgIGxlZ2VuZExheWVyXG4gICAgICAgICAgICAgIC5saXN0Ym94KDAsIDAsIGNoYXJ0Qm94LndpZHRoLCAwLCBsZWdlbmRJdGVtcywge2ZpbGw6IHRleHRDb2xvcn0pXG4gICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnggKyBzcGFjaW5nKSArICcsJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueSArIHNwYWNpbmcpICsgJyknKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIGxlZ2VuZExheWVyXG4gICAgICAgICAgICAgIC5saXN0Ym94KDAsIDAsIGxheWVyUmVjdC53aWR0aCAtIChjaGFydEJveC54ICsgY2hhcnRCb3gud2lkdGgpIC0gc3BhY2luZyAqIDIsIDAsIGxlZ2VuZEl0ZW1zLCB7ZmlsbDogdGV4dENvbG9yfSlcbiAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIE1hdGguZmxvb3IoY2hhcnRCb3gueCArIGNoYXJ0Qm94LndpZHRoICsgc3BhY2luZykgKyAnLCcgKyBNYXRoLmZsb29yKGNoYXJ0Qm94LnkpICsgJyknKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIFxuICAgIC8vIEFkZCBjaGFydCBsYXllclxuICAgIGNoYXJ0TGF5ZXIuY2xlYXIoKTtcbiAgICBsYXllci5hcHBlbmQoY2hhcnRMYXllcik7XG4gIFxuICAgIC8vbGF5ZXIucmVjdChjaGFydEJveC54LCBjaGFydEJveC55LCBjaGFydEJveC53aWR0aCwgY2hhcnRCb3guaGVpZ2h0LCB7c3R5bGU6IFwiZmlsbDp0cmFuc3BhcmVudDtzdHJva2U6YmxhY2s7c3Ryb2tlLXdpZHRoOjE7b3BhY2l0eTowLjVcIn0pO1xuICAgIGNoYXJ0TGF5ZXIuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY2hhcnRCb3gueCArICcsJyArIGNoYXJ0Qm94LnkgKyAnKScpO1xuICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVmlzdWFsQ2hhcnQucHJvdG90eXBlLCB7XG4gIGNoYXJ0Qm94OiB7XG4gICAgd3JpdGVhYmxlOiBmYWxzZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmxheWVyKSB7XG4gICAgICAgIHJldHVybiB7eDogMCwgeTogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07XG4gICAgICB9XG4gICAgICB2YXJcbiAgICAgICAgcyA9IDAuNixcbiAgICAgICAgLy9yZWN0ID0gdGhpcy5sYXllciAmJiB0aGlzLmxheWVyWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2aWV3Qm94ID0gdGhpcy5sYXllci5hdHRyKCd2aWV3Qm94Jykuc3BsaXQoXCIgXCIpLFxuICAgICAgICB3ID0gcm91bmQodmlld0JveFsyXSksXG4gICAgICAgIGggPSByb3VuZCh2aWV3Qm94WzNdKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHJvdW5kKHcgKiAoMSAtIHMpIC8gMiksXG4gICAgICAgIHk6IHJvdW5kKGggKiAoMSAtIHMpIC8gMiksXG4gICAgICAgIHdpZHRoOiB3ICogcyxcbiAgICAgICAgaGVpZ2h0OiBoICogc1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIGxlZ2VuZEl0ZW1zOiB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhclxuICAgICAgICBkYXRhVGFibGUgPSB0aGlzLmRhdGFUYWJsZSxcbiAgICAgICAgY29sb3JJbmRleCA9IDAsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuICAgICAgICBsYWJlbDtcbiAgICAgIGlmIChkYXRhVGFibGUpIHtcbiAgICAgICAgZm9yIChjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgZGF0YVRhYmxlLmdldE51bWJlck9mQ29sdW1ucygpOyBjb2x1bW5JbmRleCsrKSB7XG4gICAgICAgICAgbGFiZWwgPSBkYXRhVGFibGUuZ2V0Q29sdW1uTGFiZWwoY29sdW1uSW5kZXgpO1xuICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goe2xhYmVsOiBsYWJlbCwgYnVsbGV0OiB7IGZpbGw6IG9wdGlvbnMuY29sb3JzW2NvbG9ySW5kZXggJSBvcHRpb25zLmNvbG9ycy5sZW5ndGhdIH0gfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbG9ySW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpc3VhbENoYXJ0OyIsInZhclxuICBuZm9ybWF0ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci9uZm9ybWF0L3NyYy9uZm9ybWF0XCIpLFxuICBkZm9ybWF0ID0gcmVxdWlyZShcIi4uLy4uL3ZlbmRvci9kZm9ybWF0L3NyYy9kZm9ybWF0XCIpO1xuXG5mdW5jdGlvbiBEYXRhVGFibGUoZGF0YSkge1xuICBcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBEYXRhVGFibGUpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICBcbiAgdmFyIFxuICAgIGNvbHMgPSBkYXRhICYmIGRhdGEuY29scyB8fCBbXSxcbiAgICByb3dzID0gZGF0YSAmJiBkYXRhLnJvd3MgfHwgW107XG4gIFxuICB0aGlzLmdldENvbHVtbklkID0gZnVuY3Rpb24oY29sdW1uSW5kZXgpIHtcbiAgICByZXR1cm4gY29sc1tjb2x1bW5JbmRleF0gJiYgY29sc1tjb2x1bW5JbmRleF0uaWQ7XG4gIH07XG4gIFxuICB0aGlzLmdldENvbHVtbkxhYmVsID0gZnVuY3Rpb24oY29sdW1uSW5kZXgpIHtcbiAgICByZXR1cm4gY29sc1tjb2x1bW5JbmRleF0gJiYgY29sc1tjb2x1bW5JbmRleF0ubGFiZWwgfHwgXCJcIjtcbiAgICAvL3JldHVybiBjb2xzW2NvbHVtbkluZGV4XSAmJiAoY29sc1tjb2x1bW5JbmRleF0ubGFiZWwgfHwgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWWFlaXCIuY2hhckF0KGNvbHVtbkluZGV4ICUgMjEpKTtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uVHlwZSA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4KSB7XG4gICAgcmV0dXJuIGNvbHNbY29sdW1uSW5kZXhdICYmIGNvbHNbY29sdW1uSW5kZXhdLnR5cGU7XG4gIH07XG4gIFxuICB0aGlzLmdldENvbHVtblBhdHRlcm4gPSBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgIHJldHVybiBjb2xzW2NvbHVtbkluZGV4XSAmJiBjb2xzW2NvbHVtbkluZGV4XS5wYXR0ZXJuO1xuICB9O1xuICBcbiAgdGhpcy5nZXRDb2x1bW5Mb2NhbGUgPSBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgIHJldHVybiBjb2xzW2NvbHVtbkluZGV4XSAmJiBjb2xzW2NvbHVtbkluZGV4XS5sb2NhbGU7XG4gIH07XG4gIFxuICB0aGlzLmdldENvbHVtblJhbmdlID0gZnVuY3Rpb24oY29sdW1uSW5kZXgsIHJvd0luZGV4U3RhcnQsIHJvd0luZGV4RW5kKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4ge21pbjogdGhpcy5nZXRWYWx1ZSgwLCBjb2x1bW5JbmRleCksIG1heDogdGhpcy5nZXRWYWx1ZSh0aGlzLmdldE51bWJlck9mUm93cygpIC0gMSwgY29sdW1uSW5kZXgpfTtcbiAgICB9XG4gICAgcm93SW5kZXhTdGFydCA9IHJvd0luZGV4U3RhcnQgPyByb3dJbmRleFN0YXJ0IDogMDtcbiAgICByb3dJbmRleEVuZCA9IHJvd0luZGV4RW5kID8gcm93SW5kZXhFbmQgOiB0aGlzLmdldE51bWJlck9mUm93cygpIC0gMTtcbiAgICB2YXIgdmFsdWUsIG1pbiA9IG51bGwsIG1heCA9IG51bGw7XG4gICAgZm9yIChyb3dJbmRleCA9IHJvd0luZGV4U3RhcnQ7IHJvd0luZGV4IDw9IHJvd0luZGV4RW5kOyByb3dJbmRleCsrKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUocm93SW5kZXgsIGNvbHVtbkluZGV4KTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLnZhbHVlT2YgJiYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgdmFsdWUpKSB7XG4gICAgICAgIG1pbiA9IG1pbiA9PT0gbnVsbCB8fCB2YWx1ZS52YWx1ZU9mKCkgPCBtaW4udmFsdWVPZigpID8gdmFsdWUgOiBtaW47XG4gICAgICAgIG1heCA9IG1heCA9PT0gbnVsbCB8fCB2YWx1ZS52YWx1ZU9mKCkgPiBtYXgudmFsdWVPZigpID8gdmFsdWUgOiBtYXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7bWluOiBtaW4sIG1heDogbWF4fTtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0Q29sdW1uQXZlcmFnZSA9IGZ1bmN0aW9uKGNvbHVtbkluZGV4LCByb3dJbmRleFN0YXJ0LCByb3dJbmRleEVuZCkge1xuICAgIHJvd0luZGV4U3RhcnQgPSByb3dJbmRleFN0YXJ0ID8gcm93SW5kZXhTdGFydCA6IDA7XG4gICAgcm93SW5kZXhFbmQgPSByb3dJbmRleEVuZCA/IHJvd0luZGV4RW5kIDogdGhpcy5nZXROdW1iZXJPZlJvd3MoKSAtIDE7XG4gICAgdmFyIGNvdW50ID0gcm93SW5kZXhFbmQgKyAxIC0gcm93SW5kZXhTdGFydCwgc3VtID0gMDtcbiAgICBmb3IgKHJvd0luZGV4ID0gcm93SW5kZXhTdGFydDsgcm93SW5kZXggPD0gcm93SW5kZXhFbmQ7IHJvd0luZGV4KyspIHtcbiAgICAgIHZhbHVlID0gdGhpcy5nZXRWYWx1ZShyb3dJbmRleCwgY29sdW1uSW5kZXgpO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZS52YWx1ZU9mKCkgPT09IFwic3RyaW5nXCIgJiYgIXZhbHVlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgc3VtKz0gdmFsdWUudmFsdWVPZigpO1xuICAgIH1cbiAgICB2YXIgYXZnID0gc3VtIC8gY291bnQ7XG4gICAgaWYgKHRoaXMuZ2V0Q29sdW1uVHlwZShjb2x1bW5JbmRleCkgPT09ICdkYXRlJykge1xuICAgICAgYXZnID0gbmV3IERhdGUoYXZnKTtcbiAgICB9XG4gICAgcmV0dXJuIGF2ZztcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0RGlzdGluY3RWYWx1ZXMgPSBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgIHZhclxuICAgICAgcm93SW5kZXg7XG4gICAgICB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCB0aGlzLmdldE51bWJlck9mUm93cygpOyByb3dJbmRleCsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKHJvd0luZGV4LCBjb2x1bW5JbmRleCk7XG4gICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG4gIFxuICB0aGlzLmdldFNvcnRlZFJvd3MgPSBmdW5jdGlvbihjb2x1bW5JbmRleCwgZGVzYykge1xuICAgIHZhclxuICAgICAgcmVzdWx0ID0gcm93cy5zbGljZSgpO1xuICAgIGlmICh0aGlzLmdldENvbHVtblR5cGUoY29sdW1uSW5kZXgpID09PSAnc3RyaW5nJykge1xuICAgICAgcmVzdWx0ID0gZGVzYyA/IHJlc3VsdC5yZXZlcnNlKCkgOiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgdmFyIGF2ID0gKHR5cGVvZiBhW2NvbHVtbkluZGV4XSA9PT0gJ29iamVjdCcgPyBhW2NvbHVtbkluZGV4XS52IDogYVtjb2x1bW5JbmRleF0pO1xuICAgICAgICB2YXIgYnYgPSAodHlwZW9mIGJbY29sdW1uSW5kZXhdID09PSAnb2JqZWN0JyA/IGJbY29sdW1uSW5kZXhdLnYgOiBiW2NvbHVtbkluZGV4XSk7XG4gICAgICAgIHZhciBzID0gYXYgPCBidiA/IC0xIDogYXYgPiBidiA/IDEgOiAwO1xuICAgICAgICByZXR1cm4gZGVzYyA/IHMgKiAtMSA6IHM7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICByZXR1cm4gcm93Lm1hcChmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgY2VsbCA9PT0gJ29iamVjdCcgPyBjZWxsLnYgOiBjZWxsO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG4gIFxuICB0aGlzLmdldFZhbHVlID0gZnVuY3Rpb24ocm93SW5kZXgsIGNvbHVtbkluZGV4KSB7XG4gICAgdmFyIGNlbGwgPSByb3dzW3Jvd0luZGV4XSAmJiByb3dzW3Jvd0luZGV4XVtjb2x1bW5JbmRleF07XG4gICAgcmV0dXJuIHR5cGVvZiBjZWxsID09PSAnb2JqZWN0JyA/IGNlbGwudiA6IGNlbGw7XG4gIH07XG4gIFxuICB0aGlzLmdldEZvcm1hdHRlZFZhbHVlID0gZnVuY3Rpb24ocm93SW5kZXgsIGNvbHVtbkluZGV4KSB7XG4gICAgdmFyIGNlbGwgPSByb3dzW3Jvd0luZGV4XVtjb2x1bW5JbmRleF07XG4gICAgcmV0dXJuIHR5cGVvZiBjZWxsID09PSAnb2JqZWN0JyA/IHR5cGVvZiBjZWxsLmYgIT09ICd1bmRlZmluZWQnID8gY2VsbC5mIDogY2VsbC52IDogY2VsbDtcbiAgfTtcbiAgXG4gIHRoaXMuZ2V0TnVtYmVyT2ZDb2x1bW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvbHMubGVuZ3RoO1xuICB9O1xuICBcbiAgdGhpcy5nZXROdW1iZXJPZlJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcm93cy5sZW5ndGg7XG4gIH07XG4gIFxuICB0aGlzLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2xzOiBjb2xzLCBcbiAgICAgIHJvd3M6IHJvd3NcbiAgICB9O1xuICB9O1xufVxuXG5EYXRhVGFibGUuZnJvbUpTT04gPSBmdW5jdGlvbihqc29uKSB7XG4gIC8qXG4gIHZhciByZXN1bHQgPSBuZXcgRGF0YVRhYmxlKCk7XG4gIChkYXRhLmNvbHMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24oY29sdW1uLCBjb2x1bW5JbmRleCkge1xuICAgIHJlc3VsdC5hZGRDb2x1bW4oY29sdW1uLnR5cGUsIGNvbHVtbi5sYWJlbCwgY29sdW1uLnBhdHRlcm4pO1xuICAgIChkYXRhLnJvd3MgfHwgW10pLmZvckVhY2goZnVuY3Rpb24ocm93LCByb3dJbmRleCkge1xuICAgICAgdmFyIGNlbGwgPSByb3dbY29sdW1uSW5kZXhdO1xuICAgICAgcmVzdWx0LnNldENlbGwocm93SW5kZXgsIGNvbHVtbkluZGV4LCBjZWxsLnYsIGNlbGwuZik7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0OyovXG4gIHJldHVybiBuZXcgRGF0YVRhYmxlKGpzb24pOyBcbn07XG5cblxuZnVuY3Rpb24gZGV0ZWN0Q29sdW1uVHlwZShzdHJpbmcpIHtcbiAgdmFyIGRhdGVWYWx1ZSA9IGRmb3JtYXQucGFyc2Uoc3RyaW5nKTtcbiAgdmFyIG51bVZhbHVlID0gbmZvcm1hdC5wYXJzZShzdHJpbmcpO1xuICBpZiAoIWlzTmFOKG5mb3JtYXQucGFyc2Uoc3RyaW5nKSkpIHtcbiAgICAvLyBOdW1iZXJcbiAgICByZXR1cm4gXCJudW1iZXJcIjtcbiAgfSBlbHNlIGlmIChkZm9ybWF0LnBhcnNlKHN0cmluZykpIHtcbiAgICByZXR1cm4gXCJkYXRlXCI7XG4gIH1cbiAgcmV0dXJuIFwic3RyaW5nXCI7XG59XG5cbkRhdGFUYWJsZS5mcm9tQXJyYXkgPSBmdW5jdGlvbihkYXRhLCBvcHRpb25zKSB7XG4gIFxuICBpZiAoZGF0YSBpbnN0YW5jZW9mIERhdGFUYWJsZSkge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG4gIFxuICBpZiAoZGF0YS5yb3dzIHx8IGRhdGEuY29scykge1xuICAgIHJldHVybiBuZXcgRGF0YVRhYmxlKGRhdGEpO1xuICB9XG4gIHZhciBjb2x1bW5EYXRhID0gW107XG4gIHZhciByb3dJbmRleCwgY29sdW1uSW5kZXg7XG4gIHZhciBmaXJzdFJvd0FzTGFiZWxzID0gZmFsc2U7XG4gIGRhdGEgPSBkYXRhLnNsaWNlKCk7XG4gIHZhciBsZW4gPSBNYXRoLm1pbigyLCBkYXRhLmxlbmd0aCk7XG4gIFxuICBcbiAgLy8gVHJpbSBlbXB0eSByb3dzXG4gIHZhciB0cmltbWVkID0gW107XG4gIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhLmxlbmd0aDsgcm93SW5kZXgrKyApIHtcbiAgICB2YXIgcm93ID0gZGF0YVtyb3dJbmRleF07XG4gICAgdmFyIGlzRW1wdHkgPSB0cnVlO1xuICAgIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCByb3cubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgICAgdmFyIGNlbGwgPSBkYXRhW3Jvd0luZGV4XVtjb2x1bW5JbmRleF07XG4gICAgICBpZiAoISh0eXBlb2YgY2VsbCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGNlbGwgPT09IG51bGwgfHwgY2VsbC5sZW5ndGggPT09IDApKSB7XG4gICAgICAgIGlzRW1wdHkgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc0VtcHR5KSB7XG4gICAgICB0cmltbWVkLnB1c2gocm93KTtcbiAgICB9XG4gIH1cbiAgZGF0YSA9IHRyaW1tZWQ7XG4gIFxuICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgbGVuOyByb3dJbmRleCsrICkge1xuICAgIHZhciByb3cgPSBkYXRhW3Jvd0luZGV4XTtcbiAgICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgcm93Lmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICAgIHZhciBjb2wgPSBjb2x1bW5EYXRhW2NvbHVtbkluZGV4XSA9IGNvbHVtbkRhdGFbY29sdW1uSW5kZXhdIHx8IHt9OyBcbiAgICAgIHZhciBmb3JtYXR0ZWRWYWx1ZSA9IHJvd1tjb2x1bW5JbmRleF07XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY29sdW1uVHlwZSA9IGRldGVjdENvbHVtblR5cGUoZm9ybWF0dGVkVmFsdWUpO1xuICAgICAgaWYgKGNvbHVtblR5cGUgPT09IFwic3RyaW5nXCIgJiYgcm93SW5kZXggPT09IDAgJiYgZm9ybWF0dGVkVmFsdWUpIHtcbiAgICAgICAgY29sLmxhYmVsID0gZm9ybWF0dGVkVmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICB2YXIgZmlyc3RSb3dBc0xhYmVscyA9IHRydWU7XG4gIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBjb2x1bW5EYXRhLmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICB2YXIgY2VsbDEgPSBkYXRhWzBdW2NvbHVtbkluZGV4XTtcbiAgICB2YXIgY2VsbDIgPSBkYXRhWzFdW2NvbHVtbkluZGV4XTtcbiAgICB2YXIgY29sdW1uVHlwZTEgPSBkZXRlY3RDb2x1bW5UeXBlKGNlbGwxKTtcbiAgICB2YXIgY29sdW1uVHlwZTIgPSBkZXRlY3RDb2x1bW5UeXBlKGNlbGwyKTtcbiAgICBpZiAoY29sdW1uVHlwZTEgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGZpcnN0Um93QXNMYWJlbHMgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgXG4gIGlmIChmaXJzdFJvd0FzTGFiZWxzKSB7XG4gICAgdmFyIGxhYmVsUm93ID0gZGF0YVswXTtcbiAgICBkYXRhLnNwbGljZSgwLCAxKTtcbiAgICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgY29sdW1uRGF0YS5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgICAgY29sLmxhYmVsID0gbGFiZWxSb3dbY29sdW1uSW5kZXhdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBjb2x1bW5JbmRleCA9IDA7IGNvbHVtbkluZGV4IDwgY29sdW1uRGF0YS5sZW5ndGg7IGNvbHVtbkluZGV4KysgKSB7XG4gICAgICAgdmFyIGNvbCA9IGNvbHVtbkRhdGFbY29sdW1uSW5kZXhdO1xuICAgICAgIGNvbC5sYWJlbCA9IFwiXCI7XG4gICAgfVxuICB9XG4gIFxuICAvLyBUcmltIGFycmF5IHRvIDEwMCByb3dzXG4gIGlmIChkYXRhLmxlbmd0aCA+IDEwMCkge1xuICAgIHZhciBtID0gTWF0aC5yb3VuZCgoZGF0YS5sZW5ndGggLSAyKSAvIDEwMCk7XG4gICAgaWYgKG0gPiAxKSB7XG4gICAgICB2YXIgdHJpbW1lZCA9IFtkYXRhWzBdXTtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgKGRhdGEubGVuZ3RoIC0gMik7IGkrKykge1xuICAgICAgICBpZiAoaSAlIG0gPT09IDApIHtcbiAgICAgICAgICB0cmltbWVkLnB1c2goZGF0YVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRyaW1tZWQucHVzaChkYXRhW2RhdGEubGVuZ3RoIC0gMV0pO1xuICAgICAgZGF0YSA9IHRyaW1tZWQ7XG4gICAgfVxuICB9XG4gIFxuICBcbiAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IGRhdGEubGVuZ3RoOyByb3dJbmRleCsrICkge1xuICAgIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBjb2x1bW5EYXRhLmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICAgIHZhciBjZWxsID0gZGF0YVtyb3dJbmRleF1bY29sdW1uSW5kZXhdO1xuICAgICAgdmFyIGNvbCA9IGNvbHVtbkRhdGFbY29sdW1uSW5kZXhdO1xuICAgICAgY29sLnZhbHVlID0gY29sLnZhbHVlIHx8IDA7XG4gICAgICB2YXIgbGVuZ3RoID0gY2VsbC50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgIGlmICghY29sLnZhbHVlIHx8IGxlbmd0aCA+IGNvbC52YWx1ZS50b1N0cmluZygpLmxlbmd0aCkge1xuICAgICAgICBjb2wudmFsdWUgPSBjZWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgLy8gRGV0ZWN0XG4gIGZvciAodmFyIGNvbHVtbkluZGV4ID0gMDsgY29sdW1uSW5kZXggPCBjb2x1bW5EYXRhLmxlbmd0aDsgY29sdW1uSW5kZXgrKyApIHtcbiAgICB2YXIgY29sID0gY29sdW1uRGF0YVtjb2x1bW5JbmRleF07XG4gICAgdmFyIGNvbHVtblR5cGUgPSBkZXRlY3RDb2x1bW5UeXBlKGNvbC52YWx1ZSk7XG4gICAgdmFyIGZvcm1hdCA9IG51bGwsIHZhbHVlID0gbnVsbDtcbiAgICB2YXIgdG9vbCA9IGNvbHVtblR5cGUgPT09IFwiZGF0ZVwiID8gZGZvcm1hdCA6IGNvbHVtblR5cGUgPT09IFwibnVtYmVyXCIgPyBuZm9ybWF0IDogbnVsbDtcbiAgICBpZiAodG9vbCkge1xuICAgICAgdmFsdWUgPSB0b29sLnBhcnNlKGNvbC52YWx1ZSk7XG4gICAgICBmb3JtYXQgPSB0b29sLmRldGVjdCh2YWx1ZSwgY29sLnZhbHVlKTtcbiAgICB9XG4gICAgZGVsZXRlIGNvbC52YWx1ZTtcbiAgICBjb2wudHlwZSA9IGNvbHVtblR5cGU7XG4gICAgY29sLnBhdHRlcm4gPSBmb3JtYXQgJiYgZm9ybWF0LnBhdHRlcm4gfHwgbnVsbDtcbiAgICBjb2wubG9jYWxlID0gZm9ybWF0ICYmIGZvcm1hdC5sb2NhbGUgfHwgbnVsbDtcbiAgfVxuXG4gIC8vIFBhcnNlXG4gIHZhciByb3dzID0gW107XG4gIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBkYXRhLmxlbmd0aDsgcm93SW5kZXgrKyApIHtcbiAgICB2YXIgcm93ID0gW107XG4gICAgZm9yICh2YXIgY29sdW1uSW5kZXggPSAwOyBjb2x1bW5JbmRleCA8IGNvbHVtbkRhdGEubGVuZ3RoOyBjb2x1bW5JbmRleCsrICkge1xuICAgICAgdmFyIGNvbCA9IGNvbHVtbkRhdGFbY29sdW1uSW5kZXhdO1xuICAgICAgdmFyIGNlbGwgPSBkYXRhW3Jvd0luZGV4XVtjb2x1bW5JbmRleF07XG4gICAgICB2YXIgY29sdW1uVHlwZSA9IGNvbC50eXBlO1xuICAgICAgXG4gICAgICBpZiAoY29sdW1uVHlwZSA9PT0gJ251bWJlcicgfHwgY29sdW1uVHlwZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgIHZhciB0b29sID0gY29sdW1uVHlwZSA9PT0gXCJkYXRlXCIgPyBkZm9ybWF0IDogY29sdW1uVHlwZSA9PT0gXCJudW1iZXJcIiA/IG5mb3JtYXQgOiBudWxsO1xuICAgICAgICBjZWxsID0ge1xuICAgICAgICAgIHY6IHRvb2wucGFyc2UoY2VsbCwgY29sLnBhdHRlcm4sIGNvbC5sb2NhbGUpLFxuICAgICAgICAgIGY6IGNlbGxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29sLnR5cGUgPSBjb2x1bW5UeXBlO1xuICAgICAgcm93W2NvbHVtbkluZGV4XSA9IGNlbGw7XG4gICAgfVxuICAgIHJvd3MucHVzaChyb3cpO1xuICB9XG4gIHJldHVybiBuZXcgRGF0YVRhYmxlKHtjb2xzOiBjb2x1bW5EYXRhLCByb3dzOiByb3dzfSk7XG59O1xuICBcbm1vZHVsZS5leHBvcnRzID0gRGF0YVRhYmxlOyIsInZhciBudGlja3MgPSByZXF1aXJlKCcuL250aWNrcycpO1xuXG52YXJcbiAgXG4gIGRheXNJbk1vbnRoID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCkuZ2V0RGF0ZSgpO1xuICB9LCAgICBcbiAgXG4gIGRhdGVEaWZmID0gKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIHZhclxuICAgICAgbW9udGhEaWZmID0gZnVuY3Rpb24oZDEsIGQyKSB7XG4gICAgICAgIHZhciBtb250aHM7XG4gICAgICAgIG1vbnRocyA9IChkMi5nZXRGdWxsWWVhcigpIC0gZDEuZ2V0RnVsbFllYXIoKSkgKiAxMjtcbiAgICAgICAgbW9udGhzIC09IGQxLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICBtb250aHMgKz0gZDIuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgIHJldHVybiBtb250aHMgPD0gMCA/IDAgOiBtb250aHM7XG4gICAgICB9O1xuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbihkYXRlMSwgZGF0ZTIsIGZsYWdzKSB7XG4gICAgICByZXN1bHQgPSB7fTtcbiAgICAgIFxuICAgICAgZmxhZ3MgPSB0eXBlb2YgZmxhZ3MgIT09ICd1bmRlZmluZWQnID8gZmxhZ3MgOiAxIHwgMiB8IDQgfCA4IHwgMTYgfCAzMjtcbiAgICAgIFxuICAgICAgZGF0ZTEgPSBuZXcgRGF0ZShkYXRlMSk7XG4gICAgICBkYXRlMiA9IG5ldyBEYXRlKGRhdGUyKTtcbiAgICAgIFxuICAgICAgdmFyXG4gICAgICAgIHQxID0gZGF0ZTEuZ2V0VGltZSgpLFxuICAgICAgICB0MiA9IGRhdGUyLmdldFRpbWUoKSxcbiAgICAgICAgdHoxID0gZGF0ZTIuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbiAgICAgICAgdHoyID0gZGF0ZTIuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbiAgICAgICAgeWVhcnMsXG4gICAgICAgIG1vbnRocyxcbiAgICAgICAgZGF5cyxcbiAgICAgICAgaG91cnMsXG4gICAgICAgIG1pbnV0ZXM7XG5cbiAgICAgIGlmIChmbGFncyAmIDEgfHwgZmxhZ3MgJiAyIHx8IGZsYWdzICYgNCkge1xuICAgICAgICBtb250aHMgPSBtb250aERpZmYoZGF0ZTEsIGRhdGUyKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgMSkge1xuICAgICAgICB5ZWFycyA9IE1hdGguZmxvb3IobW9udGhzIC8gMTIpO1xuICAgICAgICBtb250aHMgPSBtb250aHMgLSB5ZWFycyAqIDEyO1xuICAgICAgICByZXN1bHQueWVhcnMgPSB5ZWFycztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgNCkge1xuICAgICAgICBpZiAoZmxhZ3MgJiAyKSB7XG4gICAgICAgICAgaWYgKGRhdGUyLmdldFVUQ0RhdGUoKSA+PSBkYXRlMS5nZXRVVENEYXRlKCkpIHtcbiAgICAgICAgICAgIGRheXMgPSBkYXRlMi5nZXRVVENEYXRlKCkgLSBkYXRlMS5nZXRVVENEYXRlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vbnRocy0tO1xuICAgICAgICAgICAgZGF5cyA9IGRhdGUxLmdldFVUQ0RhdGUoKSAtIGRhdGUyLmdldFVUQ0RhdGUoKSArIGRheXNJbk1vbnRoKGRhdGUxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF5cyA9ICh0MiAtIHQxKSAvIDEwMDAgLyA2MCAvIDYwIC8gMjQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZsYWdzICYgMikge1xuICAgICAgICByZXN1bHQubW9udGhzID0gbW9udGhzO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoZmxhZ3MgJiA0KSB7XG4gICAgICAgIHJlc3VsdC5kYXlzID0gTWF0aC5hYnMoTWF0aC5yb3VuZChkYXlzKSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDgpIHtcbiAgICAgICAgLy8gSG91cnNcbiAgICAgICAgaG91cnMgPSAodDIgLSB0MSkgLyAxMDAwIC8gNjAgLyA2MDtcbiAgICAgICAgaWYgKGZsYWdzICYgNCkge1xuICAgICAgICAgIGhvdXJzID0gTWF0aC5yb3VuZCgodDIgLSB0MSkgLyAxMDAwIC8gNjAgLyA2MCAvIDI0KSAqIDI0IC0gaG91cnM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LmhvdXJzID0gTWF0aC5yb3VuZChob3Vycyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDE2KSB7XG4gICAgICAgIC8vIE1pbnV0ZXNcbiAgICAgICAgbWludXRlcyA9ICh0MiAtIHQxKSAvIDEwMDAgLyA2MDtcbiAgICAgICAgaWYgKGZsYWdzICYgOCkge1xuICAgICAgICAgIG1pbnV0ZXMgPSBNYXRoLnJvdW5kKCh0MiAtIHQxKSAvIDEwMDAgLyA2MCAvIDYwKSAqIDYwIC0gbWludXRlcztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQubWludXRlcyA9IE1hdGgucm91bmQobWludXRlcyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmbGFncyAmIDMyKSB7XG4gICAgICAgIC8vIE1pbnV0ZXNcbiAgICAgICAgc2Vjb25kcyA9ICh0MiAtIHQxKSAvIDEwMDA7XG4gICAgICAgIGlmIChmbGFncyAmIDE2KSB7XG4gICAgICAgICAgc2Vjb25kcyA9IE1hdGgucm91bmQoKHQyIC0gdDEpIC8gMTAwMCAvIDYwKSAqIDYwIC0gc2Vjb25kcztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQuc2Vjb25kcyA9IE1hdGgucm91bmQoc2Vjb25kcyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfSkoKSxcbiAgXG4gIGRhdGVUaWNrcyA9IGZ1bmN0aW9uKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpIHtcblxuICAgIC8vIERlZmF1bHRzXG4gICAgbWluID0gdHlwZW9mIG1pbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBpc05hTihtaW4pID8gMCA6IG1pbjtcbiAgICBtYXggPSB0eXBlb2YgbWF4ID09PSBcInVuZGVmaW5lZFwiIHx8IGlzTmFOKG1heCk/IDEgOiBtYXg7XG4gICAgY291bnQgPSB0eXBlb2YgY291bnQgIT09IFwibnVtYmVyXCIgPyAxMCA6IGNvdW50O1xuICAgIG91dGVyID0gdHlwZW9mIG91dGVyID09PSBcInVuZGVmaW5lZFwiID8gZmFsc2UgOiBvdXRlcixcbiAgICB0aWNrcyA9IFtdO1xuICAgIFxuICAgIG1pbiA9IG5ldyBEYXRlKG1pbik7XG4gICAgbWF4ID0gbmV3IERhdGUobWF4KTtcbiAgICBcbiAgICBpZiAobWluLmdldFRpbWUoKSA9PT0gbWF4LmdldFRpbWUoKSkge1xuICAgICAgcmV0dXJuIFttaW4sIG1heF07XG4gICAgfVxuICAgIFxuICAgIHZhciB0aWNrVW5pdCA9IG51bGw7XG4gICAgdmFyIG8sIHYsIGYgPSAxLCBzZiwgc3Y7XG4gICAgd2hpbGUoZiA8PSAzMiAmJiAobyA9IGRhdGVEaWZmKG1pbiwgbWF4LCBmKSkpIHtcbiAgICAgIHYgPSBvW09iamVjdC5rZXlzKG8pWzBdXTtcbiAgICAgIGlmICh2IDwgY291bnQgfHwgZiA9PT0gMSkge1xuICAgICAgICBzZiA9IGY7XG4gICAgICAgIHN2ID0gdjtcbiAgICAgICAgZio9MjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB2YXIgZGlmZiA9IGRhdGVEaWZmKG1pbiwgbWF4KTtcbiAgICBcbiAgICBpZiAoc2YgPT09IDEpIHtcbiAgICAgIC8vIFllYXIgc2NhbGVcbiAgICAgIFxuICAgICAgdmFyIHllYXJNaW5EYXRlID0gbmV3IERhdGUoXCIxLzEvXCIgKyBtaW4uZ2V0RnVsbFllYXIoKSk7XG4gICAgICB2YXIgeWVhck1heERhdGUgPSBuZXcgRGF0ZShcIjEvMS9cIiArIG1heC5nZXRGdWxsWWVhcigpKTtcbiAgICAgIFxuICAgICAgdmFyIHllYXJNaW5EaWZmID0gZGF0ZURpZmYoeWVhck1pbkRhdGUsIG1pbiwgMCB8IDIpLm1vbnRocyAvIDEyO1xuICAgICAgdmFyIHllYXJNYXhEaWZmID0gZGF0ZURpZmYoeWVhck1heERhdGUsIG1heCwgMCB8IDIpLm1vbnRocyAvIDEyO1xuICAgICAgXG4gICAgICB2YXIgeWVhclRpY2tzID0gbnRpY2tzKG1pbi5nZXRGdWxsWWVhcigpICsgeWVhck1pbkRpZmYsIG1heC5nZXRGdWxsWWVhcigpICsgeWVhck1heERpZmYsIGNvdW50LCBvdXRlcik7XG4gICAgICBcbiAgICAgIGZvciAodmFyIGkgPSAwOyB0aWNrID0geWVhclRpY2tzW2ldOyBpKyspIHtcbiAgICAgICAgdmFyIGRlY1llYXIgPSB0aWNrO1xuICAgICAgICB2YXIgaW50WWVhciA9IE1hdGguZmxvb3IoZGVjWWVhcik7XG4gICAgICAgIHZhciBkZWNNb250aCA9IChkZWNZZWFyIC0gaW50WWVhcikgKiAxMjtcbiAgICAgICAgdmFyIGludE1vbnRoID0gTWF0aC5mbG9vcihkZWNNb250aCk7XG4gICAgICAgIHZhciBpbnREYXRlID0gbmV3IERhdGUoaW50WWVhciwgaW50TW9udGgsIDApO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRlY0RheSA9IChkZWNNb250aCAtIGludE1vbnRoKSAqIGRheXNJbk1vbnRoKGludERhdGUpO1xuICAgICAgICB2YXIgaW50RGF5ID0gTWF0aC5mbG9vcihkZWNEYXkpO1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKFwiMS8xLzE5NzBcIik7XG4gICAgICAgIGRhdGUuc2V0RnVsbFllYXIoaW50WWVhcik7XG4gICAgICAgIGRhdGUuc2V0TW9udGgoaW50TW9udGgpO1xuICAgICAgICBkYXRlLnNldERhdGUoaW50RGF5ICsgMSk7XG4gICAgICAgIFxuICAgICAgICB0aWNrc1tpXSA9IGRhdGU7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiB0aWNrcztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2NhbGUgbm90IHN1cHBvcnRlZCBjdXJyZW50bHlcbiAgICAgIGNvbnNvbGUud2FybihcIlNDQUxFIE5PVCBTVVBQT1JURURcIik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9O1xuICBcbm1vZHVsZS5leHBvcnRzID0gZGF0ZVRpY2tzOyIsInZhciBsbjEwID0gTWF0aC5sb2coMTApO1xudmFyIGNhbGNTdGVwU2l6ZSA9IGZ1bmN0aW9uKHJhbmdlLCB0YXJnZXRTdGVwcylcbntcbiAgXG4gIC8vIGNhbGN1bGF0ZSBhbiBpbml0aWFsIGd1ZXNzIGF0IHN0ZXAgc2l6ZVxuICB2YXIgdGVtcFN0ZXAgPSByYW5nZSAvIHRhcmdldFN0ZXBzO1xuXG4gIC8vIGdldCB0aGUgbWFnbml0dWRlIG9mIHRoZSBzdGVwIHNpemVcbiAgdmFyIG1hZyA9IE1hdGguZmxvb3IoTWF0aC5sb2codGVtcFN0ZXApIC8gbG4xMCk7XG4gIHZhciBtYWdQb3cgPSBNYXRoLnBvdygxMCwgbWFnKTtcblxuICAvLyBjYWxjdWxhdGUgbW9zdCBzaWduaWZpY2FudCBkaWdpdCBvZiB0aGUgbmV3IHN0ZXAgc2l6ZVxuICB2YXIgbWFnTXNkID0gTWF0aC5yb3VuZCh0ZW1wU3RlcCAvIG1hZ1BvdyArIDAuNSk7XG5cbiAgLy8gcHJvbW90ZSB0aGUgTVNEIHRvIGVpdGhlciAxLCAyLCBvciA1XG4gIGlmIChtYWdNc2QgPiA1LjApXG4gICAgbWFnTXNkID0gMTAuMDtcbiAgZWxzZSBpZiAobWFnTXNkID4gMi4wKVxuICAgIG1hZ01zZCA9IDUuMDtcbiAgZWxzZSBpZiAobWFnTXNkID4gMS4wKVxuICAgIG1hZ01zZCA9IDIuMDtcblxuICByZXR1cm4gbWFnTXNkICogbWFnUG93O1xufTtcblxuXG52YXIgXG4gIG5pY2VGcmFjdGlvbiA9IGZ1bmN0aW9uKG51bWJlciwgcm91bmQpIHtcbiAgICBcbiAgICB2YXJcbiAgICAgIGxvZzEwID0gTWF0aC5sb2cobnVtYmVyKSAvIE1hdGgubG9nKDEwKSxcbiAgICAgIGV4cG9uZW50ID0gTWF0aC5mbG9vcihsb2cxMCksXG4gICAgICBmcmFjdGlvbiA9IG51bWJlciAvIE1hdGgucG93KDEwLCBleHBvbmVudCksXG4gICAgICByZXN1bHQ7XG5cbiAgICBpZiAocm91bmQpIHtcbiAgICAgIGlmIChmcmFjdGlvbiA8IDEuNSkge1xuICAgICAgICByZXN1bHQgPSAxO1xuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8IDMpIHtcbiAgICAgICAgcmVzdWx0ID0gMjtcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPCA3KSB7XG4gICAgICAgIHJlc3VsdCA9IDU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSAxMDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZyYWN0aW9uIDw9IDEpIHtcbiAgICAgICAgcmVzdWx0ID0gMTtcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gMikge1xuICAgICAgICByZXN1bHQgPSAyO1xuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSA1KSB7XG4gICAgICAgIHJlc3VsdCA9IDU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSAxMDtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdCAqIE1hdGgucG93KDEwLCBleHBvbmVudCk7XG4gIH0sXG4gIFxuICBudW1UaWNrcyA9IGZ1bmN0aW9uKG1pbiwgbWF4LCBjb3VudCwgb3V0ZXIpIHtcblxuICAgIGlmIChtaW4gPT09IG1heCkge1xuICAgICAgcmV0dXJuIFttYXhdO1xuICAgIH1cbiAgICAgICAgICBcbiAgICAvLyBEZWZhdWx0c1xuICAgIG1pbiA9IHR5cGVvZiBtaW4gPT09IFwidW5kZWZpbmVkXCIgfHwgaXNOYU4obWluKSA/IDAgOiBtaW47XG4gICAgbWF4ID0gdHlwZW9mIG1heCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBpc05hTihtYXgpID8gMSA6IG1heDtcbiAgICBjb3VudCA9IHR5cGVvZiBjb3VudCAhPT0gXCJudW1iZXJcIiA/IDEwIDogY291bnQ7XG4gICAgb3V0ZXIgPSB0eXBlb2Ygb3V0ZXIgPT09IFwidW5kZWZpbmVkXCIgPyBmYWxzZSA6IG91dGVyO1xuICAgIFxuICAgIHZhclxuICAgICAgZGlmZiA9IG1heCAtIG1pbixcbiAgICAgIC8vcmFuZ2UgPSBuaWNlRnJhY3Rpb24oZGlmZiksXG4gICAgICAvL2ludGVydmFsID0gbmljZUZyYWN0aW9uKHJhbmdlIC8gY291bnQpLFxuICAgICAgaW50ZXJ2YWwgPSBjYWxjU3RlcFNpemUoZGlmZiwgY291bnQpLFxuICAgICAgbm1pbiA9IG1pbiAtIG1pbiAlIGludGVydmFsLFxuICAgICAgbm1heCA9IG1heCAtIG1heCAlIGludGVydmFsLFxuICAgICAgc2l6ZSxcbiAgICAgIHRpY2tJdGVtcyA9IFtdLFxuICAgICAgdGlja1ZhbHVlLFxuICAgICAgaTtcbiAgXG4gICBpZiAob3V0ZXIpIHtcbiAgICAgICAgXG4gICAgICBpZiAobm1pbiA+IG1pbikge1xuICAgICAgICBubWluLT0gaW50ZXJ2YWw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChubWF4IDwgbWF4KSB7XG4gICAgICAgIG5tYXgrPSBpbnRlcnZhbDtcbiAgICAgIH1cbiAgICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIFxuICAgICAgaWYgKG5taW4gPCBtaW4pIHtcbiAgICAgICAgbm1pbis9IGludGVydmFsO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAobm1heCA+IG1heCkge1xuICAgICAgICBubWF4LT0gaW50ZXJ2YWw7XG4gICAgICB9XG4gICAgICBcbiAgICB9XG4gICAgXG4gICAgZm9yIChpID0gbm1pbjsgaSA8PSBubWF4OyBpKz1pbnRlcnZhbCkge1xuICAgICAgdGlja0l0ZW1zLnB1c2goaSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0aWNrSXRlbXM7XG4gIH07XG4gIFxubW9kdWxlLmV4cG9ydHMgPSBudW1UaWNrczsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJvdW5kKG51bSwgZGlnaXRzKSB7XG4gIGRpZ2l0cyA9IHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogMTtcbiAgdmFyIHZhbHVlID0gcGFyc2VGbG9hdChudW0pO1xuICBpZiAoIWlzTmFOKHZhbHVlKSAmJiBuZXcgU3RyaW5nKHZhbHVlKS5sZW5ndGggPT09IG5ldyBTdHJpbmcobnVtKS5sZW5ndGgpIHtcbiAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUudG9GaXhlZChkaWdpdHMpKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG51bTtcbn07IiwidmFyIGkxOG4gPSByZXF1aXJlKFwiLi9sb2NhbGVzL2FsbFwiKTtcblxuZnVuY3Rpb24gY2FydGVzaWFuUHJvZHVjdE9mKGFycmF5LCB1bmlxdWUpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbChhcnJheSwgZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciByZXQgPSBbXTtcbiAgICBhLmZvckVhY2goZnVuY3Rpb24oYSkge1xuICAgICAgYi5mb3JFYWNoKGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgaWYgKCF1bmlxdWUgfHwgYS5pbmRleE9mKGIpIDwgMCkge1xuICAgICAgICAgIHJldC5wdXNoKGEuY29uY2F0KFtiXSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9LCBbW11dKTtcbn1cblxuZnVuY3Rpb24gc29ydEJ5UmVsZXZhbmNlKGEsIGIpIHtcbiAgcmV0dXJuIGEucmVsZXZhbmNlID4gYi5yZWxldmFuY2UgPyAtMSA6IGEucmVsZXZhbmNlIDwgYi5yZWxldmFuY2UgPyAxIDogMDtcbn1cblxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xuICBzdHIgPSBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICBzdHIgPSBzdHIucmVwbGFjZSgvXFxzL2csIFwiXFxcXHNcIik7XG4gIHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIHBhZCggYSwgYiApIHtcbiAgcmV0dXJuICgxZTE1ICsgYSArIFwiXCIpLnNsaWNlKC1iKTtcbn1cblxuZnVuY3Rpb24gZ2V0TG9jYWxlRGF0YShsb2NhbGUpIHtcbiAgaWYgKGkxOG5bbG9jYWxlXSkge1xuICAgIHJldHVybiBpMThuW2xvY2FsZV07XG4gIH1cbiAgZm9yICh2YXIga2V5IGluIGkxOG4pIHtcbiAgICBpZiAoaTE4bltrZXldLmVxdWFscyAmJiBpMThuW2tleV0uZXF1YWxzLnNwbGl0KFwiLFwiKS5pbmRleE9mKGxvY2FsZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIGkxOG5ba2V5XTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExvY2FsZXMobG9jYWxlKSB7XG4gIHZhciBsb2NhbGVzID0gW107XG4gIE9iamVjdC5rZXlzKGkxOG4pLmZvckVhY2goZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgbG9jYWxlcy5wdXNoKGxvY2FsZSk7XG4gICAgbG9jYWxlcyA9IGxvY2FsZXMuY29uY2F0KGkxOG5bbG9jYWxlXS5lcXVhbHMgJiYgaTE4bltsb2NhbGVdLmVxdWFscy5zcGxpdCgvXFxzKixcXHMqLykgfHwgW10pO1xuICB9KTtcbiAgcmV0dXJuIGxvY2FsZXM7XG59XG5cbmZ1bmN0aW9uIGdldFJlcGxhY2VtZW50cyhsb2NhbGVEYXRhLCBkYXRlKSB7XG4gIHZhclxuICAgIHJlc3VsdCA9IHt9LFxuICAgIGQyID0gXCJcXFxcZHsyfVwiLFxuICAgIGQ0ID0gXCJcXFxcZHs0fVwiLFxuICAgIHdlZWtkYXlOYW1lcyA9IGxvY2FsZURhdGEud2Vla2RheSxcbiAgICBtb250aE5hbWVzID0gbG9jYWxlRGF0YS5tb250aCxcbiAgICBkYXkgPSBkYXRlID8gKGRhdGUuZ2V0RGF5KCkgLSAxICsgNykgJSA3IDogLTE7XG4gICAga2V5cyA9IFtcInl5eXlcIiwgXCJ5eVwiLCBcInlcIiwgXCJNTU1NXCIsIFwiTU1NXCIsIFwiTU1cIiwgXCJNXCIsIFwiZGRkZFwiLCBcImRkZFwiLCBcImRkXCIsIFwiZFwiLCBcIkhIXCIsIFwiSFwiLCBcImhoXCIsIFwiaFwiLCBcIm1tXCIsIFwibVwiLCBcInNzXCIsIFwic1wiLCBcInR0XCIsIFwidFwiXSxcbiAgICB2YWx1ZXMgPSBkYXRlID8gXG4gICAgICBbXG4gICAgICAgIC8vIFllYXJcbiAgICAgICAgZGF0ZS5nZXRGdWxsWWVhcigpLCBcbiAgICAgICAgcGFkKGRhdGUuZ2V0WWVhcigpLCAyKSwgXG4gICAgICAgIGRhdGUuZ2V0WWVhcigpLFxuICAgICAgICBcbiAgICAgICAgLy8gTW9udGhcbiAgICAgICAgbW9udGhOYW1lcy5sb25nW2RhdGUuZ2V0TW9udGgoKV0sIFxuICAgICAgICBtb250aE5hbWVzLnNob3J0W2RhdGUuZ2V0TW9udGgoKV0sIFxuICAgICAgICBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMiksXG4gICAgICAgIGRhdGUuZ2V0TW9udGgoKSArIDEsXG4gICAgICAgIFxuICAgICAgICAvLyBEYXlcbiAgICAgICAgd2Vla2RheU5hbWVzLmxvbmdbZGF5XSxcbiAgICAgICAgd2Vla2RheU5hbWVzLnNob3J0W2RheV0sXG4gICAgICAgIHBhZChkYXRlLmdldERhdGUoKSwgMiksXG4gICAgICAgIGRhdGUuZ2V0RGF0ZSgpLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91clxuICAgICAgICBkYXRlLmdldEhvdXJzKCksXG4gICAgICAgIHBhZChkYXRlLmdldEhvdXJzKCksIDIpLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91cjEyXG4gICAgICAgIHBhZChkYXRlLmdldEhvdXJzKCkgJSAxMiwgMiksXG4gICAgICAgIGRhdGUuZ2V0SG91cnMoKSAlIDEyLFxuICAgICAgICBcbiAgICAgICAgLy8gTWludXRlXG4gICAgICAgIHBhZChkYXRlLmdldE1pbnV0ZXMoKSwgMiksXG4gICAgICAgIGRhdGUuZ2V0TWludXRlcygpLFxuICAgICAgICBcbiAgICAgICAgLy8gU2Vjb25kXG4gICAgICAgIHBhZChkYXRlLmdldFNlY29uZHMoKSwgMiksXG4gICAgICAgIGRhdGUuZ2V0U2Vjb25kcygpLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91cjEyIERlc2lnbmF0b3JcbiAgICAgICAgZGF0ZS5nZXRIb3VycygpID49IDEyID8gXCJQTVwiIDogXCJBTVwiLFxuICAgICAgICAoZGF0ZS5nZXRIb3VycygpID49IDEyID8gXCJQTVwiIDogXCJBTVwiKS5zdWJzdHJpbmcoMCwgMSlcbiAgICAgIF0gOiBcbiAgICAgIFtcbiAgICAgICAgLy8gWWVhclxuICAgICAgICBkNCxcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gTW9udGhcbiAgICAgICAgbW9udGhOYW1lcy5sb25nLm1hcChlc2NhcGVSZWdFeHApLmpvaW4oXCJ8XCIpLFxuICAgICAgICBtb250aE5hbWVzLnNob3J0Lm1hcChlc2NhcGVSZWdFeHApLmpvaW4oXCJ8XCIpLFxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBEYXlcbiAgICAgICAgd2Vla2RheU5hbWVzLmxvbmcubWFwKGVzY2FwZVJlZ0V4cCkuam9pbihcInxcIiksXG4gICAgICAgIHdlZWtkYXlOYW1lcy5zaG9ydC5tYXAoZXNjYXBlUmVnRXhwKS5qb2luKFwifFwiKSxcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91clxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyMTJcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gTWludXRlXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIFNlY29uZFxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyMTIgRGVzaWduYXRvclxuICAgICAgICBcIkFNfFBNXCIsXG4gICAgICAgIFwiQXxQXCJcbiAgICAgICAgXG4gICAgICBdO1xuICAgIFxuICAgIFxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXksIGluZGV4KSB7XG4gICAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbaW5kZXhdO1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmb3JtYXQoZGF0ZSwgcGF0dGVybiwgbG9jYWxlKSB7XG4gICBcbiAgdmFyXG4gICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEobG9jYWxlIHx8ICdlbicpLFxuICAgIHBhdHRlcm4gPSBwYXR0ZXJuIHx8IGxvY2FsZURhdGEucGF0dGVybnNbMF0gfHwgXCJ5eXl5L01NL2RkIGhoOnNzIHR0XCIsXG4gICAgcmVwbGFjZW1lbnRzID0gZ2V0UmVwbGFjZW1lbnRzKGxvY2FsZURhdGEsIGRhdGUpLFxuICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIlxcXFxiKD86XCIgKyBPYmplY3Qua2V5cyhyZXBsYWNlbWVudHMpLmpvaW4oXCJ8XCIpICsgXCIpXFxcXGJcIiwgXCJnXCIpLFxuICAgIG1hdGNoLCBcbiAgICBpbmRleCA9IDAsXG4gICAgcmVzdWx0ID0gXCJcIjtcbiAgXG4gIHdoaWxlIChtYXRjaCA9IHJlZ2V4LmV4ZWMocGF0dGVybikpIHtcbiAgICByZXN1bHQrPSBwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCwgbWF0Y2guaW5kZXgpO1xuICAgIHJlc3VsdCs9IHJlcGxhY2VtZW50c1ttYXRjaF07XG4gICAgaW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgfVxuICByZXN1bHQrPSBwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHZhciBsb2NhbGVzID0gbG9jYWxlIGluc3RhbmNlb2YgQXJyYXkgPyBsb2NhbGUgOiBsb2NhbGUgPyBbbG9jYWxlXSA6IE9iamVjdC5rZXlzKGkxOG4pO1xuICB2YXIgZGF0ZSA9IG51bGw7XG4gIFxuICBsb2NhbGVzLmZvckVhY2goZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgXG4gICAgaWYgKGRhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgdmFyXG4gICAgICBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YShsb2NhbGUpLFxuICAgICAgcGFydHMgPSBnZXRSZXBsYWNlbWVudHMobG9jYWxlRGF0YSksXG4gICAgICBwYXR0ZXJuUmVnZXggPSBuZXcgUmVnRXhwKFwiXFxcXGIoXCIgKyBPYmplY3Qua2V5cyhwYXJ0cykuam9pbihcInxcIikgKyBcIilcIiArIFwiXFxcXGJcIiwgXCJnXCIpLFxuICAgICAgcGF0dGVybnMgPSBwYXR0ZXJuIGluc3RhbmNlb2YgQXJyYXkgPyBwYXR0ZXJuIDogcGF0dGVybiA/IFtwYXR0ZXJuXSA6IGxvY2FsZURhdGEucGF0dGVybnM7XG4gICAgICBcbiAgICBwYXR0ZXJucy5mb3JFYWNoKGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgICAgIFxuICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIFxuICAgICAgdmFyXG4gICAgICAgIGNhcHR1cmVzID0gW10sXG4gICAgICAgIG1hdGNoLFxuICAgICAgICBtYXRjaGVzLFxuICAgICAgICBob3VyMTJwbSxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBkYXRlUmVnZXggPSBcIlwiO1xuICAgICAgXG4gICAgICB3aGlsZSggbWF0Y2ggPSBwYXR0ZXJuUmVnZXguZXhlYyhwYXR0ZXJuKSApIHtcbiAgICAgICAgY2FwdHVyZXMucHVzaChtYXRjaFsxXSk7XG4gICAgICAgIGRhdGVSZWdleCs9IGVzY2FwZVJlZ0V4cChwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCwgbWF0Y2guaW5kZXgpKTtcbiAgICAgICAgZGF0ZVJlZ2V4Kz0gXCIoXCIgKyBwYXJ0c1tPYmplY3Qua2V5cyhwYXJ0cykuZmlsdGVyKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2hbMF0gPT09IHBhcnQ7XG4gICAgICAgIH0pWzBdXSArIFwiKVwiO1xuICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgZGF0ZVJlZ2V4Kz0gZXNjYXBlUmVnRXhwKHBhdHRlcm4uc3Vic3RyaW5nKGluZGV4KSk7XG4gICAgICBcbiAgICAgIG1hdGNoID0gKG5ldyBSZWdFeHAoZGF0ZVJlZ2V4KSkuZXhlYyhzdHJpbmcpO1xuICAgICAgXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKFwiMFwiKTtcbiAgICAgICAgbWF0Y2hlcyA9IG1hdGNoLnNsaWNlKDEpO1xuICAgICAgICBcbiAgICAgICAgaG91cjEycG0gPSAobWF0Y2hlcy5maWx0ZXIoZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIChjYXB0dXJlc1tpbmRleF0gPT09IFwidHRcIiB8fCBjYXB0dXJlc1tpbmRleF0gPT09IFwidFwiKSAmJiB2YWx1ZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSA9PT0gXCJQXCI7XG4gICAgICAgIH0pLmxlbmd0aCA+IDApO1xuICAgICAgICBcbiAgICAgICAgdmFyIHllYXIsIG1vbnRoLCBtb250aERheSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHM7XG4gICAgICAgIFxuICAgICAgICBtYXRjaGVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgdmFyIG51bWVyaWNWYWx1ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICBzd2l0Y2ggKGNhcHR1cmVzW2luZGV4XSkge1xuICAgICAgICAgICAgY2FzZSAneXl5eSc6IFxuICAgICAgICAgICAgICB5ZWFyID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ01NTU0nOlxuICAgICAgICAgICAgICBtb250aCA9IGxvY2FsZURhdGEubW9udGgubG9uZy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICAgICAgICBtb250aCA9IGxvY2FsZURhdGEubW9udGguc2hvcnQuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgICAgICAgIG1vbnRoID0gbnVtZXJpY1ZhbHVlIC0gMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZGRkJzpcbiAgICAgICAgICAgIGNhc2UgJ2RkZCc6XG4gICAgICAgICAgICAgIC8vIENhbm5vdCBkZXRlcm1pbmUgZGF0ZSBmcm9tIHdlZWtkYXlcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgbW9udGhEYXkgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgIGhvdXJzID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hoJzpcbiAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICBob3VycyA9IGhvdXIxMnBtID8gbnVtZXJpY1ZhbHVlICsgMTIgOiBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbW0nOlxuICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgIG1pbnV0ZXMgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3MnOlxuICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgIHNlY29uZHMgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoeWVhciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1vbnRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1vbnRoRGF5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldERhdGUobW9udGhEYXkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoaG91cnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0SG91cnMoaG91cnMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobWludXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoc2Vjb25kcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRTZWNvbmRzKHNlY29uZHMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIGlzTmFOKCBkYXRlLmdldFRpbWUoKSApICkge1xuICAgICAgICAgIGRhdGUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFZhbGlkXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgICBcbiAgICB9KTtcbiAgfSk7XG4gIFxuICBpZiAoZGF0ZSkge1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIFxuICByZXR1cm4gZGF0ZTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0KGRhdGUsIHN0cmluZykge1xuICB2YXJcbiAgICBsb2NhbGVzID0gT2JqZWN0LmtleXMoaTE4biksXG4gICAgcmVzdWx0TG9jYWxlUGF0dGVybnMgPSBbXTtcblxuICBsb2NhbGVzLmZvckVhY2goZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgXG4gICAgdmFyIFxuICAgICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEobG9jYWxlKSxcbiAgICAgIHJlcGxhY2VtZW50cyA9IGdldFJlcGxhY2VtZW50cyhsb2NhbGVEYXRhLCBkYXRlKSxcbiAgICAgIHZhbHVlcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VtZW50cykubWFwKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgICAgIHJldHVybiByZXBsYWNlbWVudHNbcGFydF0udG9TdHJpbmcoKTtcbiAgICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uKHBhcnQsIGluZGV4LCBzZWxmKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihwYXJ0KSA9PT0gaW5kZXg7XG4gICAgICAgIH0pLm1hcChlc2NhcGVSZWdFeHApLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdCh2YWx1ZSkpID8gXCJcXFxcYlwiICsgdmFsdWUgKyBcIlxcXFxiXCIgOiB2YWx1ZTtcbiAgICAgICAgfSksXG4gICAgICByZWdleCA9IG5ldyBSZWdFeHAodmFsdWVzLmpvaW4oXCJ8XCIpLCBcImdcIiksXG4gICAgICBtYXRjaCwgc3Vic3RyaW5nLCBpbmRleCA9IDAsXG4gICAgICBwYXR0ZXJuUGFydHMgPSBbXSxcbiAgICAgIHBhdHRlcm5QYXJ0c0luZGV4ID0gW10sXG4gICAgICBtYXRjaFJhbmsgPSAwLFxuICAgICAgbWF0Y2hlcyA9IFtdLFxuICAgICAgaG91cjEyID0gZmFsc2UsXG4gICAgICByZXN0ID0gXCJcIjtcbiAgICAgIFxuICAgICAgd2hpbGUgKG1hdGNoID0gcmVnZXguZXhlYyhzdHJpbmcpKSB7XG4gICAgICAgIGlmIChtYXRjaFswXSA9PT0gcmVwbGFjZW1lbnRzW1widHRcIl0udG9TdHJpbmcoKSkge1xuICAgICAgICAgIGhvdXIxMiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgbWF0Y2hlcy5wdXNoKG1hdGNoKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZm9yICh2YXIgbSA9IDA7IG0gPCBtYXRjaGVzLmxlbmd0aDsgbSsrKSB7XG4gICAgICAgIG1hdGNoID0gbWF0Y2hlc1ttXTtcbiAgICAgICAgc3Vic3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleCwgbWF0Y2guaW5kZXgpO1xuICAgICAgICBpZiAoc3Vic3RyaW5nKSB7XG4gICAgICAgICAgcmVzdCs9IHN1YnN0cmluZztcbiAgICAgICAgICBwYXR0ZXJuUGFydHMucHVzaChbcGF0dGVyblBhcnRzSW5kZXgubGVuZ3RoXSk7XG4gICAgICAgICAgcGF0dGVyblBhcnRzSW5kZXgucHVzaChzdWJzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXRjaGluZ1BhcnRzID0gW107XG4gICAgICAgIGZvciAodmFyIHBhcnQgaW4gcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgICAgaWYgKG1hdGNoWzBdID09PSByZXBsYWNlbWVudHNbcGFydF0udG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgaWYgKChwYXJ0ID09PSBcIkhIXCIgfHwgcGFydCA9PT0gXCJIXCIpICYmIGhvdXIxMikge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gcGF0dGVyblBhcnRzSW5kZXguaW5kZXhPZihwYXJ0KTtcbiAgICAgICAgICAgIGlmIChpIDwgMCkge1xuICAgICAgICAgICAgICBpID0gcGF0dGVyblBhcnRzSW5kZXgubGVuZ3RoO1xuICAgICAgICAgICAgICBwYXR0ZXJuUGFydHNJbmRleC5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hpbmdQYXJ0cy5wdXNoKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtYXRjaFJhbmsrPSAxIC8gbWF0Y2hpbmdQYXJ0cy5sZW5ndGg7XG4gICAgICAgIHBhdHRlcm5QYXJ0cy5wdXNoKG1hdGNoaW5nUGFydHMpO1xuICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgc3Vic3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleCk7XG4gICAgICByZXN0Kz0gc3Vic3RyaW5nO1xuICAgICAgXG4gICAgICBpZiAoc3Vic3RyaW5nKSB7XG4gICAgICAgIHBhdHRlcm5QYXJ0cy5wdXNoKFtwYXR0ZXJuUGFydHNJbmRleC5sZW5ndGhdKTtcbiAgICAgICAgcGF0dGVyblBhcnRzSW5kZXgucHVzaChzdWJzdHJpbmcpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXN1bHRMb2NhbGVQYXR0ZXJucy5wdXNoKHtcbiAgICAgICAgbG9jYWxlOiBsb2NhbGUsIFxuICAgICAgICBsb2NhbGVEYXRhOiBsb2NhbGVEYXRhLFxuICAgICAgICByZWxldmFuY2U6IG1hdGNoUmFuayArICgxIC0gcmVzdC5sZW5ndGggLyBzdHJpbmcubGVuZ3RoKSxcbiAgICAgICAgcGF0dGVybjoge1xuICAgICAgICAgIHBhcnRzOiBwYXR0ZXJuUGFydHMsXG4gICAgICAgICAgaW5kZXg6IHBhdHRlcm5QYXJ0c0luZGV4XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIFxuICB9KTtcbiAgXG4gIGlmICghcmVzdWx0TG9jYWxlUGF0dGVybnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHJlc3VsdExvY2FsZVBhdHRlcm5zLnNvcnQoc29ydEJ5UmVsZXZhbmNlKTtcbiAgXG4gIGlmICghcmVzdWx0TG9jYWxlUGF0dGVybnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHZhciByZWxldmFuY2UgPSByZXN1bHRMb2NhbGVQYXR0ZXJuc1swXS5yZWxldmFuY2U7XG4gIFxuICB2YXIgcmVzdWx0cyA9IHJlc3VsdExvY2FsZVBhdHRlcm5zLmZpbHRlcihmdW5jdGlvbihyZXN1bHREYXRhKSB7XG4gICAgcmV0dXJuIHJlc3VsdERhdGEucmVsZXZhbmNlID09PSByZWxldmFuY2U7IFxuICB9KS5tYXAoZnVuY3Rpb24ocmVzdWx0RGF0YSkge1xuICAgIFxuICAgIHZhclxuICAgICAgcGF0dGVybkRhdGEgPSByZXN1bHREYXRhLnBhdHRlcm4sXG4gICAgICBjb21iaW5hdGlvbnMgPSBjYXJ0ZXNpYW5Qcm9kdWN0T2YocGF0dGVybkRhdGEucGFydHMsIHRydWUpLFxuICAgICAgcGF0dGVybnMgPSBjb21iaW5hdGlvbnMubWFwKGZ1bmN0aW9uKGNvbWJpbmF0aW9uKSB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBjb21iaW5hdGlvbi5tYXAoZnVuY3Rpb24ocGFydEluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIHBhdHRlcm5EYXRhLmluZGV4W3BhcnRJbmRleF07XG4gICAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgICAgIHZhciByZWxldmFuY2UgPSByZXN1bHREYXRhLmxvY2FsZURhdGEucGF0dGVybnMuZmlsdGVyKGZ1bmN0aW9uKGxvY2FsZVBhdHRlcm4pIHtcbiAgICAgICAgICByZXR1cm4gc3RyaW5nLmluZGV4T2YobG9jYWxlUGF0dGVybikgPj0gMDtcbiAgICAgICAgfSkubGVuZ3RoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3Q6IHJlc3VsdERhdGEucmVzdCxcbiAgICAgICAgICBzdHJpbmc6IHN0cmluZyxcbiAgICAgICAgICByZWxldmFuY2U6IHJlbGV2YW5jZVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgXG4gICAgaWYgKCFwYXR0ZXJucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICBwYXR0ZXJucy5zb3J0KHNvcnRCeVJlbGV2YW5jZSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3Q6IHBhdHRlcm5zWzBdLnJlc3QsXG4gICAgICByZWxldmFuY2U6IHBhdHRlcm5zWzBdLnJlbGV2YW5jZSxcbiAgICAgIHBhdHRlcm46IHBhdHRlcm5zWzBdLnN0cmluZywgXG4gICAgICBsb2NhbGU6IHJlc3VsdERhdGEubG9jYWxlXG4gICAgfTtcbiAgfSk7XG4gIFxuICByZXN1bHRzLnNvcnQoc29ydEJ5UmVsZXZhbmNlKTtcbiAgXG4gIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdHRlcm46IHJlc3VsdHNbMF0ucGF0dGVybixcbiAgICAgIGxvY2FsZTogcmVzdWx0c1swXS5sb2NhbGVcbiAgICB9O1xuICB9XG59XG5cblxuZnVuY3Rpb24gZGZvcm1hdChkYXRlLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgcmV0dXJuIGZvcm1hdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5kZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgcmV0dXJuIHBhcnNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5kZm9ybWF0LmRldGVjdCA9IGZ1bmN0aW9uKGRhdGUsIHN0cmluZykge1xuICByZXR1cm4gZGV0ZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZGZvcm1hdDsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJlblwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkphbnVhcnlcIixcbiAgICAgICAgXCJGZWJydWFyeVwiLFxuICAgICAgICBcIk1hcmNoXCIsXG4gICAgICAgIFwiQXByaWxcIixcbiAgICAgICAgXCJNYXlcIixcbiAgICAgICAgXCJKdW5lXCIsXG4gICAgICAgIFwiSnVseVwiLFxuICAgICAgICBcIkF1Z3VzdFwiLFxuICAgICAgICBcIlNlcHRlbWJlclwiLFxuICAgICAgICBcIk9jdG9iZXJcIixcbiAgICAgICAgXCJOb3ZlbWJlclwiLFxuICAgICAgICBcIkRlY2VtYmVyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJKYW5cIixcbiAgICAgICAgXCJGZWJcIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJBcHJcIixcbiAgICAgICAgXCJNYXlcIixcbiAgICAgICAgXCJKdW5cIixcbiAgICAgICAgXCJKdWxcIixcbiAgICAgICAgXCJBdWdcIixcbiAgICAgICAgXCJTZXBcIixcbiAgICAgICAgXCJPY3RcIixcbiAgICAgICAgXCJOb3ZcIixcbiAgICAgICAgXCJEZWNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiTW9uZGF5XCIsXG4gICAgICAgIFwiVHVlc2RheVwiLFxuICAgICAgICBcIldlZG5lc2RheVwiLFxuICAgICAgICBcIlRodXJzZGF5XCIsXG4gICAgICAgIFwiRnJpZGF5XCIsXG4gICAgICAgIFwiU2F0dXJkYXlcIixcbiAgICAgICAgXCJTdW5kYXlcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIk1vblwiLFxuICAgICAgICBcIlR1ZVwiLFxuICAgICAgICBcIldlZFwiLFxuICAgICAgICBcIlRodVwiLFxuICAgICAgICBcIkZyaVwiLFxuICAgICAgICBcIlNhdFwiLFxuICAgICAgICBcIlN1blwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgTU1NTSBkZCwgeXl5eSwgaGg6bW06c3MgdHRcIixcbiAgICAgIFwiTU1NTSBkZCwgeXl5eSwgaGg6bW06c3MgdHRcIixcbiAgICAgIFwiTU1NIGRkLCB5eXl5LCBoaDptbTpzcyB0dFwiLFxuICAgICAgXCJNTS9kZC95eXl5LCBoaDptbSB0dFwiLFxuICAgICAgXCJkZGRkLCBNTU1NIGRkLCB5eXl5XCIsXG4gICAgICBcIk1NTU0gZGQsIHl5eXlcIixcbiAgICAgIFwiTU1NIGRkLCB5eXl5XCIsXG4gICAgICBcIk1NL2RkL3l5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcImhoOm1tOnNzIHR0XCIsXG4gICAgICBcImhoOm1tIHR0XCJcbiAgICBdXG4gIH0sXG4gIFwiZGVcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJKYW51YXJcIixcbiAgICAgICAgXCJGZWJydWFyXCIsXG4gICAgICAgIFwiTcOkcnpcIixcbiAgICAgICAgXCJBcHJpbFwiLFxuICAgICAgICBcIk1haVwiLFxuICAgICAgICBcIkp1bmlcIixcbiAgICAgICAgXCJKdWxpXCIsXG4gICAgICAgIFwiQXVndXN0XCIsXG4gICAgICAgIFwiU2VwdGVtYmVyXCIsXG4gICAgICAgIFwiT2t0b2JlclwiLFxuICAgICAgICBcIk5vdmVtYmVyXCIsXG4gICAgICAgIFwiRGV6ZW1iZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkphblwiLFxuICAgICAgICBcIkZlYlwiLFxuICAgICAgICBcIk3DpHJcIixcbiAgICAgICAgXCJBcHJcIixcbiAgICAgICAgXCJNYWlcIixcbiAgICAgICAgXCJKdW5cIixcbiAgICAgICAgXCJKdWxcIixcbiAgICAgICAgXCJBdWdcIixcbiAgICAgICAgXCJTZXBcIixcbiAgICAgICAgXCJPa3RcIixcbiAgICAgICAgXCJOb3ZcIixcbiAgICAgICAgXCJEZXpcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiTW9udGFnXCIsXG4gICAgICAgIFwiRGllbnN0YWdcIixcbiAgICAgICAgXCJNaXR0d29jaFwiLFxuICAgICAgICBcIkRvbm5lcnN0YWdcIixcbiAgICAgICAgXCJGcmVpdGFnXCIsXG4gICAgICAgIFwiU2Ftc3RhZ1wiLFxuICAgICAgICBcIlNvbm50YWdcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIk1vLlwiLFxuICAgICAgICBcIkRpLlwiLFxuICAgICAgICBcIk1pLlwiLFxuICAgICAgICBcIkRvLlwiLFxuICAgICAgICBcIkZyLlwiLFxuICAgICAgICBcIlNhLlwiLFxuICAgICAgICBcIlNvLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQuIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC4gTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLiBNTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkLiBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZC4gTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuTU0ueXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJmclwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImphbnZpZXJcIixcbiAgICAgICAgXCJmw6l2cmllclwiLFxuICAgICAgICBcIm1hcnNcIixcbiAgICAgICAgXCJhdnJpbFwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcImp1aW5cIixcbiAgICAgICAgXCJqdWlsbGV0XCIsXG4gICAgICAgIFwiYW/Du3RcIixcbiAgICAgICAgXCJzZXB0ZW1icmVcIixcbiAgICAgICAgXCJvY3RvYnJlXCIsXG4gICAgICAgIFwibm92ZW1icmVcIixcbiAgICAgICAgXCJkw6ljZW1icmVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImphbnYuXCIsXG4gICAgICAgIFwiZsOpdnIuXCIsXG4gICAgICAgIFwibWFyc1wiLFxuICAgICAgICBcImF2ci5cIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJqdWluXCIsXG4gICAgICAgIFwianVpbC5cIixcbiAgICAgICAgXCJhb8O7dFwiLFxuICAgICAgICBcInNlcHQuXCIsXG4gICAgICAgIFwib2N0LlwiLFxuICAgICAgICBcIm5vdi5cIixcbiAgICAgICAgXCJkw6ljLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJsdW5kaVwiLFxuICAgICAgICBcIm1hcmRpXCIsXG4gICAgICAgIFwibWVyY3JlZGlcIixcbiAgICAgICAgXCJqZXVkaVwiLFxuICAgICAgICBcInZlbmRyZWRpXCIsXG4gICAgICAgIFwic2FtZWRpXCIsXG4gICAgICAgIFwiZGltYW5jaGVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImx1bi5cIixcbiAgICAgICAgXCJtYXIuXCIsXG4gICAgICAgIFwibWVyLlwiLFxuICAgICAgICBcImpldS5cIixcbiAgICAgICAgXCJ2ZW4uXCIsXG4gICAgICAgIFwic2FtLlwiLFxuICAgICAgICBcImRpbS5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTS95eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImVzXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiRW5lcm9cIixcbiAgICAgICAgXCJGZWJyZXJvXCIsXG4gICAgICAgIFwiTWFyem9cIixcbiAgICAgICAgXCJBYnJpbFwiLFxuICAgICAgICBcIk1heW9cIixcbiAgICAgICAgXCJKdW5pb1wiLFxuICAgICAgICBcIkp1bGlvXCIsXG4gICAgICAgIFwiQWdvc3RvXCIsXG4gICAgICAgIFwiU2VwdGllbWJyZVwiLFxuICAgICAgICBcIk9jdHVicmVcIixcbiAgICAgICAgXCJOb3ZpZW1icmVcIixcbiAgICAgICAgXCJEaWNpZW1icmVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkVuZS5cIixcbiAgICAgICAgXCJGZWIuXCIsXG4gICAgICAgIFwiTWFyLlwiLFxuICAgICAgICBcIkFici5cIixcbiAgICAgICAgXCJNYXkuXCIsXG4gICAgICAgIFwiSnVuLlwiLFxuICAgICAgICBcIkp1bC5cIixcbiAgICAgICAgXCJBZ28uXCIsXG4gICAgICAgIFwiU2VwdC5cIixcbiAgICAgICAgXCJPY3QuXCIsXG4gICAgICAgIFwiTm92LlwiLFxuICAgICAgICBcIkRpYy5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibHVuZXNcIixcbiAgICAgICAgXCJtYXJ0ZXNcIixcbiAgICAgICAgXCJtacOpcmNvbGVzXCIsXG4gICAgICAgIFwianVldmVzXCIsXG4gICAgICAgIFwidmllcm5lc1wiLFxuICAgICAgICBcInPDoWJhZG9cIixcbiAgICAgICAgXCJkb21pbmdvXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJsdW4uXCIsXG4gICAgICAgIFwibWFyLlwiLFxuICAgICAgICBcIm1pw6kuXCIsXG4gICAgICAgIFwianVlLlwiLFxuICAgICAgICBcInZpZS5cIixcbiAgICAgICAgXCJzw6FiLlwiLFxuICAgICAgICBcImRvbS5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIGRlIE1NTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBkZSBNTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgZGUgTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZCBkZSBNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQgZGUgTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkIGRlIE1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcIk1NTSBkZSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiaXRcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJHZW5uYWlvXCIsXG4gICAgICAgIFwiRmViYnJhaW9cIixcbiAgICAgICAgXCJNYXJ6b1wiLFxuICAgICAgICBcIkFwcmlsZVwiLFxuICAgICAgICBcIk1hZ2dpb1wiLFxuICAgICAgICBcIkdpdWdub1wiLFxuICAgICAgICBcIkx1Z2xpb1wiLFxuICAgICAgICBcIkFnb3N0b1wiLFxuICAgICAgICBcIlNldHRlbWJyZVwiLFxuICAgICAgICBcIk90dG9icmVcIixcbiAgICAgICAgXCJOb3ZlbWJyZVwiLFxuICAgICAgICBcIkRpY2VtYnJlXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJnZW5cIixcbiAgICAgICAgXCJmZWJcIixcbiAgICAgICAgXCJtYXJcIixcbiAgICAgICAgXCJhcHJcIixcbiAgICAgICAgXCJtYWdcIixcbiAgICAgICAgXCJnaXVcIixcbiAgICAgICAgXCJsdWdcIixcbiAgICAgICAgXCJhZ29cIixcbiAgICAgICAgXCJzZXRcIixcbiAgICAgICAgXCJvdHRcIixcbiAgICAgICAgXCJub3ZcIixcbiAgICAgICAgXCJkaWNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibHVuZWTDrFwiLFxuICAgICAgICBcIm1hcnRlZMOsXCIsXG4gICAgICAgIFwibWVyY29sZWTDrFwiLFxuICAgICAgICBcImdpb3ZlZMOsXCIsXG4gICAgICAgIFwidmVuZXJkw6xcIixcbiAgICAgICAgXCJzYWJhdG9cIixcbiAgICAgICAgXCJkb21lbmljYVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwibHVuXCIsXG4gICAgICAgIFwibWFyXCIsXG4gICAgICAgIFwibWVyXCIsXG4gICAgICAgIFwiZ2lvXCIsXG4gICAgICAgIFwidmVuXCIsXG4gICAgICAgIFwic2FiXCIsXG4gICAgICAgIFwiZG9tXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU1NL3l5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQvTU1NL3l5eXlcIixcbiAgICAgIFwiZGQvTU0veXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJubFwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImphbnVhcmlcIixcbiAgICAgICAgXCJmZWJydWFyaVwiLFxuICAgICAgICBcIm1hYXJ0XCIsXG4gICAgICAgIFwiYXByaWxcIixcbiAgICAgICAgXCJtZWlcIixcbiAgICAgICAgXCJqdW5pXCIsXG4gICAgICAgIFwianVsaVwiLFxuICAgICAgICBcImF1Z3VzdHVzXCIsXG4gICAgICAgIFwic2VwdGVtYmVyXCIsXG4gICAgICAgIFwib2t0b2JlclwiLFxuICAgICAgICBcIm5vdmVtYmVyXCIsXG4gICAgICAgIFwiZGVjZW1iZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImphblwiLFxuICAgICAgICBcImZlYlwiLFxuICAgICAgICBcIm1ydFwiLFxuICAgICAgICBcImFwclwiLFxuICAgICAgICBcIm1laVwiLFxuICAgICAgICBcImp1blwiLFxuICAgICAgICBcImp1bFwiLFxuICAgICAgICBcImF1Z1wiLFxuICAgICAgICBcInNlcFwiLFxuICAgICAgICBcIm9rdFwiLFxuICAgICAgICBcIm5vdlwiLFxuICAgICAgICBcImRlY1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJtYWFuZGFnXCIsXG4gICAgICAgIFwiZGluc2RhZ1wiLFxuICAgICAgICBcIndvZW5zZGFnXCIsXG4gICAgICAgIFwiZG9uZGVyZGFnXCIsXG4gICAgICAgIFwidnJpamRhZ1wiLFxuICAgICAgICBcInphdGVyZGFnXCIsXG4gICAgICAgIFwiem9uZGFnXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJtYVwiLFxuICAgICAgICBcImRpXCIsXG4gICAgICAgIFwid29cIixcbiAgICAgICAgXCJkb1wiLFxuICAgICAgICBcInZyXCIsXG4gICAgICAgIFwiemFcIixcbiAgICAgICAgXCJ6b1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLU1NLXl5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkLU1NLXl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwidHJcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJPY2FrXCIsXG4gICAgICAgIFwixZ51YmF0XCIsXG4gICAgICAgIFwiTWFydFwiLFxuICAgICAgICBcIk5pc2FuXCIsXG4gICAgICAgIFwiTWF5xLFzXCIsXG4gICAgICAgIFwiSGF6aXJhblwiLFxuICAgICAgICBcIlRlbW11elwiLFxuICAgICAgICBcIkHEn3VzdG9zXCIsXG4gICAgICAgIFwiRXlsw7xsXCIsXG4gICAgICAgIFwiRWtpbVwiLFxuICAgICAgICBcIkthc8SxbVwiLFxuICAgICAgICBcIkFyYWzEsWtcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIk9jYVwiLFxuICAgICAgICBcIsWedWJcIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJOaXNcIixcbiAgICAgICAgXCJNYXlcIixcbiAgICAgICAgXCJIYXpcIixcbiAgICAgICAgXCJUZW1cIixcbiAgICAgICAgXCJBxJ91XCIsXG4gICAgICAgIFwiRXlsXCIsXG4gICAgICAgIFwiRWtpXCIsXG4gICAgICAgIFwiS2FzXCIsXG4gICAgICAgIFwiQXJhXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIlBhemFydGVzaVwiLFxuICAgICAgICBcIlNhbMSxXCIsXG4gICAgICAgIFwiw4dhcsWfYW1iYVwiLFxuICAgICAgICBcIlBlcsWfZW1iZVwiLFxuICAgICAgICBcIkN1bWFcIixcbiAgICAgICAgXCJDdW1hcnRlc2lcIixcbiAgICAgICAgXCJQYXphclwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiUHp0XCIsXG4gICAgICAgIFwiU2FsXCIsXG4gICAgICAgIFwiw4dhclwiLFxuICAgICAgICBcIlBlclwiLFxuICAgICAgICBcIkN1bVwiLFxuICAgICAgICBcIkNtdFwiLFxuICAgICAgICBcIlBhelwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGQgTU1NTSB5eXl5IGRkZGQgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLk1NLnl5eXkgSEg6bW1cIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IGRkZGRcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkLk1NLnl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiYnJcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJHZW52ZXJcIixcbiAgICAgICAgXCJDyrxod2V2cmVyXCIsXG4gICAgICAgIFwiTWV1cnpoXCIsXG4gICAgICAgIFwiRWJyZWxcIixcbiAgICAgICAgXCJNYWVcIixcbiAgICAgICAgXCJNZXpoZXZlblwiLFxuICAgICAgICBcIkdvdWVyZVwiLFxuICAgICAgICBcIkVvc3RcIixcbiAgICAgICAgXCJHd2VuZ29sb1wiLFxuICAgICAgICBcIkhlcmVcIixcbiAgICAgICAgXCJEdVwiLFxuICAgICAgICBcIktlcnp1XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJHZW5cIixcbiAgICAgICAgXCJDyrxod2VcIixcbiAgICAgICAgXCJNZXVyXCIsXG4gICAgICAgIFwiRWJyXCIsXG4gICAgICAgIFwiTWFlXCIsXG4gICAgICAgIFwiTWV6aFwiLFxuICAgICAgICBcIkdvdWVcIixcbiAgICAgICAgXCJFb3N0XCIsXG4gICAgICAgIFwiR3dlblwiLFxuICAgICAgICBcIkhlcmVcIixcbiAgICAgICAgXCJEdVwiLFxuICAgICAgICBcIktlclwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJMdW5cIixcbiAgICAgICAgXCJNZXVyemhcIixcbiAgICAgICAgXCJNZXJjyrxoZXJcIixcbiAgICAgICAgXCJZYW91XCIsXG4gICAgICAgIFwiR3dlbmVyXCIsXG4gICAgICAgIFwiU2Fkb3JuXCIsXG4gICAgICAgIFwiU3VsXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJsdW5cIixcbiAgICAgICAgXCJtZXUuXCIsXG4gICAgICAgIFwibWVyLlwiLFxuICAgICAgICBcInlhb3VcIixcbiAgICAgICAgXCJnd2UuXCIsXG4gICAgICAgIFwic2FkLlwiLFxuICAgICAgICBcInN1bFwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwieXl5eSBNTU1NIGRkLCBkZGRkIEhIOm1tOnNzXCIsXG4gICAgICBcInl5eXkgTU1NTSBkZCBISDptbTpzc1wiLFxuICAgICAgXCJ5eXl5IE1NTSBkZCBISDptbTpzc1wiLFxuICAgICAgXCJ5eXl5LU1NLWRkIEhIOm1tXCIsXG4gICAgICBcInl5eXkgTU1NTSBkZCwgZGRkZFwiLFxuICAgICAgXCJ5eXl5IE1NTU0gZGRcIixcbiAgICAgIFwieXl5eSBNTU0gZGRcIixcbiAgICAgIFwieXl5eS1NTS1kZFwiLFxuICAgICAgXCJ5eXl5IE1NTU1cIixcbiAgICAgIFwieXl5eSBNTU1cIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJwdFwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImphbmVpcm9cIixcbiAgICAgICAgXCJmZXZlcmVpcm9cIixcbiAgICAgICAgXCJtYXLDp29cIixcbiAgICAgICAgXCJhYnJpbFwiLFxuICAgICAgICBcIm1haW9cIixcbiAgICAgICAgXCJqdW5ob1wiLFxuICAgICAgICBcImp1bGhvXCIsXG4gICAgICAgIFwiYWdvc3RvXCIsXG4gICAgICAgIFwic2V0ZW1icm9cIixcbiAgICAgICAgXCJvdXR1YnJvXCIsXG4gICAgICAgIFwibm92ZW1icm9cIixcbiAgICAgICAgXCJkZXplbWJyb1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiamFuXCIsXG4gICAgICAgIFwiZmV2XCIsXG4gICAgICAgIFwibWFyXCIsXG4gICAgICAgIFwiYWJyXCIsXG4gICAgICAgIFwibWFpXCIsXG4gICAgICAgIFwianVuXCIsXG4gICAgICAgIFwianVsXCIsXG4gICAgICAgIFwiYWdvXCIsXG4gICAgICAgIFwic2V0XCIsXG4gICAgICAgIFwib3V0XCIsXG4gICAgICAgIFwibm92XCIsXG4gICAgICAgIFwiZGV6XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcInNlZ3VuZGEtZmVpcmFcIixcbiAgICAgICAgXCJ0ZXLDp2EtZmVpcmFcIixcbiAgICAgICAgXCJxdWFydGEtZmVpcmFcIixcbiAgICAgICAgXCJxdWludGEtZmVpcmFcIixcbiAgICAgICAgXCJzZXh0YS1mZWlyYVwiLFxuICAgICAgICBcInPDoWJhZG9cIixcbiAgICAgICAgXCJkb21pbmdvXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJzZWdcIixcbiAgICAgICAgXCJ0ZXJcIixcbiAgICAgICAgXCJxdWFcIixcbiAgICAgICAgXCJxdWlcIixcbiAgICAgICAgXCJzZXhcIixcbiAgICAgICAgXCJzw6FiXCIsXG4gICAgICAgIFwiZG9tXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBkZSBNTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgZGUgTU1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIGRlIE1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NL3l5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgZGUgTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkIGRlIE1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZCBkZSBNTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJNTU0gZGUgeXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImJnXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi0Y/QvdGD0LDRgNC4XCIsXG4gICAgICAgIFwi0YTQtdCy0YDRg9Cw0YDQuFwiLFxuICAgICAgICBcItC80LDRgNGCXCIsXG4gICAgICAgIFwi0LDQv9GA0LjQu1wiLFxuICAgICAgICBcItC80LDQuVwiLFxuICAgICAgICBcItGO0L3QuFwiLFxuICAgICAgICBcItGO0LvQuFwiLFxuICAgICAgICBcItCw0LLQs9GD0YHRglwiLFxuICAgICAgICBcItGB0LXQv9GC0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC+0LrRgtC+0LzQstGA0LhcIixcbiAgICAgICAgXCLQvdC+0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC00LXQutC10LzQstGA0LhcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcItGP0L0uXCIsXG4gICAgICAgIFwi0YTQtdCy0YAuXCIsXG4gICAgICAgIFwi0LzQsNGA0YJcIixcbiAgICAgICAgXCLQsNC/0YAuXCIsXG4gICAgICAgIFwi0LzQsNC5XCIsXG4gICAgICAgIFwi0Y7QvdC4XCIsXG4gICAgICAgIFwi0Y7Qu9C4XCIsXG4gICAgICAgIFwi0LDQstCzLlwiLFxuICAgICAgICBcItGB0LXQv9GCLlwiLFxuICAgICAgICBcItC+0LrRgi5cIixcbiAgICAgICAgXCLQvdC+0LXQvC5cIixcbiAgICAgICAgXCLQtNC10LouXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcItC/0L7QvdC10LTQtdC70L3QuNC6XCIsXG4gICAgICAgIFwi0LLRgtC+0YDQvdC40LpcIixcbiAgICAgICAgXCLRgdGA0Y/QtNCwXCIsXG4gICAgICAgIFwi0YfQtdGC0LLRitGA0YLRitC6XCIsXG4gICAgICAgIFwi0L/QtdGC0YrQulwiLFxuICAgICAgICBcItGB0YrQsdC+0YLQsFwiLFxuICAgICAgICBcItC90LXQtNC10LvRj1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi0L/QvVwiLFxuICAgICAgICBcItCy0YJcIixcbiAgICAgICAgXCLRgdGAXCIsXG4gICAgICAgIFwi0YfRglwiLFxuICAgICAgICBcItC/0YJcIixcbiAgICAgICAgXCLRgdCxXCIsXG4gICAgICAgIFwi0L3QtFwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLiwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5INCzLiwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkg0LMuLCBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5INCzLiwgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkIE1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZC5NTS55eXl5INCzLlwiLFxuICAgICAgXCJNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcIk1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImluXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiSmFudWFyaVwiLFxuICAgICAgICBcIkZlYnJ1YXJpXCIsXG4gICAgICAgIFwiTWFyZXRcIixcbiAgICAgICAgXCJBcHJpbFwiLFxuICAgICAgICBcIk1laVwiLFxuICAgICAgICBcIkp1bmlcIixcbiAgICAgICAgXCJKdWxpXCIsXG4gICAgICAgIFwiQWd1c3R1c1wiLFxuICAgICAgICBcIlNlcHRlbWJlclwiLFxuICAgICAgICBcIk9rdG9iZXJcIixcbiAgICAgICAgXCJOb3ZlbWJlclwiLFxuICAgICAgICBcIkRlc2VtYmVyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJKYW5cIixcbiAgICAgICAgXCJGZWJcIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJBcHJcIixcbiAgICAgICAgXCJNZWlcIixcbiAgICAgICAgXCJKdW5cIixcbiAgICAgICAgXCJKdWxcIixcbiAgICAgICAgXCJBZ3RcIixcbiAgICAgICAgXCJTZXBcIixcbiAgICAgICAgXCJPa3RcIixcbiAgICAgICAgXCJOb3ZcIixcbiAgICAgICAgXCJEZXNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiU2VuaW5cIixcbiAgICAgICAgXCJTZWxhc2FcIixcbiAgICAgICAgXCJSYWJ1XCIsXG4gICAgICAgIFwiS2FtaXNcIixcbiAgICAgICAgXCJKdW1hdFwiLFxuICAgICAgICBcIlNhYnR1XCIsXG4gICAgICAgIFwiTWluZ2d1XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJTZW5cIixcbiAgICAgICAgXCJTZWxcIixcbiAgICAgICAgXCJSYWJcIixcbiAgICAgICAgXCJLYW1cIixcbiAgICAgICAgXCJKdW1cIixcbiAgICAgICAgXCJTYWJcIixcbiAgICAgICAgXCJNaW5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSBISC5tbS5zc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEgubW0uc3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkgSEgubW0uc3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISC5tbVwiLFxuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhILm1tLnNzXCIsXG4gICAgICBcIkhILm1tXCJcbiAgICBdXG4gIH0sXG4gIFwicm9cIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJpYW51YXJpZVwiLFxuICAgICAgICBcImZlYnJ1YXJpZVwiLFxuICAgICAgICBcIm1hcnRpZVwiLFxuICAgICAgICBcImFwcmlsaWVcIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJpdW5pZVwiLFxuICAgICAgICBcIml1bGllXCIsXG4gICAgICAgIFwiYXVndXN0XCIsXG4gICAgICAgIFwic2VwdGVtYnJpZVwiLFxuICAgICAgICBcIm9jdG9tYnJpZVwiLFxuICAgICAgICBcIm5vaWVtYnJpZVwiLFxuICAgICAgICBcImRlY2VtYnJpZVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiaWFuLlwiLFxuICAgICAgICBcImZlYi5cIixcbiAgICAgICAgXCJtYXIuXCIsXG4gICAgICAgIFwiYXByLlwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcIml1bi5cIixcbiAgICAgICAgXCJpdWwuXCIsXG4gICAgICAgIFwiYXVnLlwiLFxuICAgICAgICBcInNlcHQuXCIsXG4gICAgICAgIFwib2N0LlwiLFxuICAgICAgICBcIm5vdi5cIixcbiAgICAgICAgXCJkZWMuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImx1bmlcIixcbiAgICAgICAgXCJtYXLIm2lcIixcbiAgICAgICAgXCJtaWVyY3VyaVwiLFxuICAgICAgICBcImpvaVwiLFxuICAgICAgICBcInZpbmVyaVwiLFxuICAgICAgICBcInPDom1ixIN0xINcIixcbiAgICAgICAgXCJkdW1pbmljxINcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkx1blwiLFxuICAgICAgICBcIk1hclwiLFxuICAgICAgICBcIk1pZVwiLFxuICAgICAgICBcIkpvaVwiLFxuICAgICAgICBcIlZpblwiLFxuICAgICAgICBcIlPDom1cIixcbiAgICAgICAgXCJEdW1cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5LCBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuTU0ueXl5eSwgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC5NTS55eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcIm1rXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi0ZjQsNC90YPQsNGA0LhcIixcbiAgICAgICAgXCLRhNC10LLRgNGD0LDRgNC4XCIsXG4gICAgICAgIFwi0LzQsNGA0YJcIixcbiAgICAgICAgXCLQsNC/0YDQuNC7XCIsXG4gICAgICAgIFwi0LzQsNGYXCIsXG4gICAgICAgIFwi0ZjRg9C90LhcIixcbiAgICAgICAgXCLRmNGD0LvQuFwiLFxuICAgICAgICBcItCw0LLQs9GD0YHRglwiLFxuICAgICAgICBcItGB0LXQv9GC0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC+0LrRgtC+0LzQstGA0LhcIixcbiAgICAgICAgXCLQvdC+0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC00LXQutC10LzQstGA0LhcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcItGY0LDQvS5cIixcbiAgICAgICAgXCLRhNC10LIuXCIsXG4gICAgICAgIFwi0LzQsNGALlwiLFxuICAgICAgICBcItCw0L/RgC5cIixcbiAgICAgICAgXCLQvNCw0ZhcIixcbiAgICAgICAgXCLRmNGD0L0uXCIsXG4gICAgICAgIFwi0ZjRg9C7LlwiLFxuICAgICAgICBcItCw0LLQsy5cIixcbiAgICAgICAgXCLRgdC10L/Rgi5cIixcbiAgICAgICAgXCLQvtC60YIuXCIsXG4gICAgICAgIFwi0L3QvtC10LwuXCIsXG4gICAgICAgIFwi0LTQtdC6LlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLQv9C+0L3QtdC00LXQu9C90LjQulwiLFxuICAgICAgICBcItCy0YLQvtGA0L3QuNC6XCIsXG4gICAgICAgIFwi0YHRgNC10LTQsFwiLFxuICAgICAgICBcItGH0LXRgtCy0YDRgtC+0LpcIixcbiAgICAgICAgXCLQv9C10YLQvtC6XCIsXG4gICAgICAgIFwi0YHQsNCx0L7RgtCwXCIsXG4gICAgICAgIFwi0L3QtdC00LXQu9CwXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLQv9C+0L0uXCIsXG4gICAgICAgIFwi0LLRgi5cIixcbiAgICAgICAgXCLRgdGA0LUuXCIsXG4gICAgICAgIFwi0YfQtdGCLlwiLFxuICAgICAgICBcItC/0LXRgi5cIixcbiAgICAgICAgXCLRgdCw0LEuXCIsXG4gICAgICAgIFwi0L3QtdC0LlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLiBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkg0LMuIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5INCzLiBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZCBNTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQuTU0ueXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcIk1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcInRoXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi4Lih4LiB4Lij4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4LiB4Li44Lih4Lig4Liy4Lie4Lix4LiZ4LiY4LmMXCIsXG4gICAgICAgIFwi4Lih4Li14LiZ4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4LmA4Lih4Lip4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4Lie4Lik4Lip4Lig4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4Lih4Li04LiW4Li44LiZ4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4LiB4Lij4LiB4LiO4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4Liq4Li04LiH4Lir4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4LiB4Lix4LiZ4Lii4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4LiV4Li44Lil4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4Lie4Lik4Lio4LiI4Li04LiB4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4LiY4Lix4LiZ4Lin4Liy4LiE4LihXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLguKEu4LiELlwiLFxuICAgICAgICBcIuC4gS7guJ4uXCIsXG4gICAgICAgIFwi4Lih4Li1LuC4hC5cIixcbiAgICAgICAgXCLguYDguKEu4LiiLlwiLFxuICAgICAgICBcIuC4ni7guIQuXCIsXG4gICAgICAgIFwi4Lih4Li0LuC4oi5cIixcbiAgICAgICAgXCLguIEu4LiELlwiLFxuICAgICAgICBcIuC4qi7guIQuXCIsXG4gICAgICAgIFwi4LiBLuC4oi5cIixcbiAgICAgICAgXCLguJUu4LiELlwiLFxuICAgICAgICBcIuC4ni7guKIuXCIsXG4gICAgICAgIFwi4LiYLuC4hC5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi4Lin4Lix4LiZ4LiI4Lix4LiZ4LiX4Lij4LmMXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lit4Lix4LiH4LiE4Liy4LijXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lie4Li44LiYXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lie4Lik4Lir4Lix4Liq4Lia4LiU4Li1XCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lio4Li44LiB4Lij4LmMXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4LmA4Liq4Liy4Lij4LmMXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lit4Liy4LiX4Li04LiV4Lii4LmMXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLguIguXCIsXG4gICAgICAgIFwi4LitLlwiLFxuICAgICAgICBcIuC4ni5cIixcbiAgICAgICAgXCLguJ7guKQuXCIsXG4gICAgICAgIFwi4LioLlwiLFxuICAgICAgICBcIuC4qi5cIixcbiAgICAgICAgXCLguK3guLIuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkIGRkIE1NTU0gMjU0MyBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIDI1NDMgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIDI1NDMgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0vMjU0MyBISDptbVwiLFxuICAgICAgXCJkZGRkIGRkIE1NTU0gMjU0M1wiLFxuICAgICAgXCJkZCBNTU1NIDI1NDNcIixcbiAgICAgIFwiZGQgTU1NIDI1NDNcIixcbiAgICAgIFwiZGQvTU0vMjU0M1wiLFxuICAgICAgXCJNTU1NIDI1NDNcIixcbiAgICAgIFwiTU1NIDI1NDNcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJlblwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiLFwiLFxuICAgICAgXCIuXCIsXG4gICAgICAwLFxuICAgICAgXCJcIlxuICAgIF0sXG4gICAgXCJlcXVhbHNcIjogXCJ0aFwiXG4gIH0sXG4gIFwiZGVcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIi5cIixcbiAgICAgIFwiLFwiLFxuICAgICAgMCxcbiAgICAgIFwiIFwiXG4gICAgXSxcbiAgICBcImVxdWFsc1wiOiBcInJvXCJcbiAgfSxcbiAgXCJmclwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiIFwiLFxuICAgICAgXCIsXCIsXG4gICAgICAwLFxuICAgICAgXCIgXCJcbiAgICBdXG4gIH0sXG4gIFwiZXNcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIiBcIixcbiAgICAgIFwiLFwiLFxuICAgICAgMCxcbiAgICAgIFwiXCJcbiAgICBdLFxuICAgIFwiZXF1YWxzXCI6IFwiYnIsYmdcIlxuICB9LFxuICBcIml0XCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIuXCIsXG4gICAgICBcIixcIixcbiAgICAgIDAsXG4gICAgICBcIlwiXG4gICAgXSxcbiAgICBcImVxdWFsc1wiOiBcIm5sLHB0LGluLG1rXCJcbiAgfSxcbiAgXCJ0clwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiLlwiLFxuICAgICAgXCIsXCIsXG4gICAgICAxLFxuICAgICAgXCJcIlxuICAgIF1cbiAgfVxufTsiLCJ2YXIgaTE4biA9IHJlcXVpcmUoXCIuL2xvY2FsZXMvYWxsXCIpO1xuXG5cbi8vIFBhZCBSaWdodFxuZnVuY3Rpb24gcGFkUmlnaHQoIHN0cmluZywgbGVuZ3RoLCBjaGFyYWN0ZXIgKSB7XG4gIGlmIChzdHJpbmcubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0cmluZyArIEFycmF5KGxlbmd0aCAtIHN0cmluZy5sZW5ndGggKyAxKS5qb2luKGNoYXJhY3RlciB8fCBcIjBcIik7XG4gIH1cbiAgcmV0dXJuIHN0cmluZztcbn1cbiAgXG4vLyBQYWQgTGVmdFxuZnVuY3Rpb24gcGFkTGVmdCggc3RyaW5nLCBsZW5ndGgsIGNoYXJhY3RlciApIHtcbiAgaWYgKHN0cmluZy5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICByZXR1cm4gQXJyYXkobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCArIDEpLmpvaW4oY2hhcmFjdGVyIHx8IFwiMFwiKSArIHN0cmluZztcbiAgfVxuICByZXR1cm4gc3RybmdpO1xufVxuICBcbiAgXG5mdW5jdGlvbiB0b1ByZWNpc2lvbihuLCBzaWcpIHtcbiAgaWYgKG4gIT09IDApIHtcbiAgICB2YXIgbXVsdCA9IE1hdGgucG93KDEwLCBzaWcgLSBNYXRoLmZsb29yKE1hdGgubG9nKG4pIC8gTWF0aC5MTjEwKSAtIDEpO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG4gKiBtdWx0KSAvIG11bHQ7XG4gIH1cbiAgcmV0dXJuIG47XG59XG4gIFxuZnVuY3Rpb24gZ2V0TG9jYWxlRGF0YShsb2NhbGUpIHtcbiAgaWYgKGkxOG5bbG9jYWxlXSkge1xuICAgIHJldHVybiBpMThuW2xvY2FsZV07XG4gIH1cbiAgZm9yICh2YXIga2V5IGluIGkxOG4pIHtcbiAgICBpZiAoaTE4bltrZXldLmVxdWFscyAmJiBpMThuW2tleV0uZXF1YWxzLnNwbGl0KFwiLFwiKS5pbmRleE9mKGxvY2FsZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIGkxOG5ba2V5XTtcbiAgICB9XG4gIH07XG59XG4gIFxuICBcbnZhciBwYXR0ZXJuUmVnZXggPSBuZXcgUmVnRXhwKC9eXFxzKiglfFxcdyopPyhbIzBdKig/OigsKVsjMF0rKSopKD86KFxcLikoWyMwXSspKT8oJXxcXHcqKT9cXHMqJC8pO1xuICBcbiAgXG5mdW5jdGlvbiBmb3JtYXQobnVtYmVyLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZURhdGE7XG4gICBcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PT0gXCJzdHJpbmdcIiAmJiBhcmd1bWVudHNbaV0ubWF0Y2goL1thLXpdezJ9LykpIHtcbiAgICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGFyZ3VtZW50c1tpXSk7XG4gICAgICBhcmd1bWVudHNbaV0gPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdHRlcm4gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICB9XG4gICAgXG4gIGlmICghbG9jYWxlRGF0YSkge1xuICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKCdlbicpO1xuICB9IFxuICAgXG4gIHBhdHRlcm4gPSBwYXR0ZXJuIHx8IFwiIywjIyMuI1wiO1xuICAgXG4gIHZhclxuICAgIGFyZ3MgPSBsb2NhbGVEYXRhLmFyZ3MsXG4gICAgc3R5bGUgPSBcImRlY2ltYWxcIixcbiAgICB1c2VHcm91cGluZyA9IGZhbHNlLFxuICAgIGdyb3VwaW5nV2hpdGVzcGFjZSA9IFwiIFwiIHx8IFwiXFx1MDBBMFwiLFxuICAgIGdyb3VwaW5nU2VwYXJhdG9yID0gYXJnc1swXSxcbiAgICByYWRpeCA9IGFyZ3NbMV0sXG4gICAgbGVhZGluZ1VuaXQgPSBhcmdzWzJdLFxuICAgIHVuaXRTcGFjZSA9IGFyZ3NbM10gPyBcIlxcdTAwQTBcIiA6IFwiXCIsXG4gICAgbGVuZ3RoID0gbnVtYmVyLnRvU3RyaW5nKCkubGVuZ3RoLFxuICAgIHNpZ25pZmljYW50RGlnaXRzID0gLTE7XG4gICAgIFxuICAgICB2YXIgcGF0dGVybk1hdGNoID0gcGF0dGVyblJlZ2V4LmV4ZWMocGF0dGVybik7XG4gICAgIFxuICAgICB2YXIgaW50UGF0dGVyblN0cmluZyA9IHBhdHRlcm5NYXRjaCAmJiBwYXR0ZXJuTWF0Y2hbMl0ucmVwbGFjZSgvLC9nLCBcIlwiKSB8fCBcIlwiO1xuICAgICB2YXIgaW50UGFkTWF0Y2ggPSBpbnRQYXR0ZXJuU3RyaW5nID8gaW50UGF0dGVyblN0cmluZy5tYXRjaCgvXjAqLykgOiBudWxsO1xuICAgICBcbiAgICAgdmFyIGludFBhZExlbmd0aCA9IGludFBhZE1hdGNoID8gaW50UGFkTWF0Y2hbMF0ubGVuZ3RoIDogMDtcbiAgICAgXG4gICAgIHZhciBkZWNQYXR0ZXJuU3RyaW5nID0gcGF0dGVybk1hdGNoWzVdIHx8IFwiXCI7XG4gICAgIFxuICAgICB2YXIgZGVjUGFkTWF0Y2ggPSBkZWNQYXR0ZXJuU3RyaW5nID8gZGVjUGF0dGVyblN0cmluZy5tYXRjaCgvMCokLykgOiBudWxsO1xuICAgICB2YXIgZGVjUGFkTGVuZ3RoID0gZGVjUGFkTWF0Y2ggPyBkZWNQYWRNYXRjaFswXS5sZW5ndGggOiAwO1xuICAgICBcbiAgICAgdmFyIGZyYWN0aW9uRGlnaXRzID0gZGVjUGF0dGVyblN0cmluZy5sZW5ndGggfHwgMDtcbiAgICAgXG4gICAgIHZhciBzaWduaWZpY2FudEZyYWN0aW9uRGlnaXRzID0gZGVjUGF0dGVyblN0cmluZy5sZW5ndGggLSBkZWNQYWRMZW5ndGg7XG4gICAgIHZhciBzaWduaWZpY2FudERpZ2l0cyA9IChpbnRQYXR0ZXJuU3RyaW5nLmxlbmd0aCAtIGludFBhZExlbmd0aCkgKyBmcmFjdGlvbkRpZ2l0cztcbiAgICAgXG4gICAgIHZhciBpc05lZ2F0aXZlID0gbnVtYmVyIDwgMCA/IHRydWUgOiAwO1xuICAgICBcbiAgICAgbnVtYmVyID0gTWF0aC5hYnMobnVtYmVyKTtcbiAgICAgXG4gICAgIHN0eWxlID0gcGF0dGVybk1hdGNoWzFdIHx8IHBhdHRlcm5NYXRjaFtwYXR0ZXJuTWF0Y2gubGVuZ3RoIC0gMV0gPyBcInBlcmNlbnRcIiA6IHN0eWxlO1xuICAgICB1c2VHcm91cGluZyA9IHBhdHRlcm5NYXRjaFszXSA/IHRydWUgOiB1c2VHcm91cGluZztcbiAgICAgXG4gICAgIHVuaXQgPSBzdHlsZSA9PT0gXCJwZXJjZW50XCIgPyBcIiVcIiA6IHN0eWxlID09PSBcImN1cnJlbmN5XCIgPyBjdXJyZW5jeSA6IFwiXCI7XG4gICAgIFxuICAgICBzaWduaWZpY2FudERpZ2l0cyA9IE1hdGguZmxvb3IobnVtYmVyKS50b1N0cmluZygpLmxlbmd0aCArIGZyYWN0aW9uRGlnaXRzO1xuICAgICBpZiAoZnJhY3Rpb25EaWdpdHMgPiAwICYmIHNpZ25pZmljYW50RGlnaXRzID4gMCkge1xuICAgICAgIG51bWJlciA9IHBhcnNlRmxvYXQodG9QcmVjaXNpb24obnVtYmVyLCBzaWduaWZpY2FudERpZ2l0cykudG9TdHJpbmcoKSk7XG4gICAgIH1cbiAgICAgXG4gICAgIGlmIChzdHlsZSA9PT0gJ3BlcmNlbnQnKSB7XG4gICAgICAgbnVtYmVyID0gbnVtYmVyICogMTAwO1xuICAgICB9XG4gICAgIFxuICAgdmFyXG4gICAgIGludFZhbHVlID0gcGFyc2VJbnQobnVtYmVyKSxcbiAgICAgZGVjVmFsdWUgPSBwYXJzZUZsb2F0KChudW1iZXIgLSBpbnRWYWx1ZSkudG9QcmVjaXNpb24oMTIpKTtcbiAgIFxuICAgdmFyIGRlY1N0cmluZyA9IGRlY1ZhbHVlLnRvU3RyaW5nKCk7XG4gICBcbiAgIGRlY1N0cmluZyA9IGRlY1ZhbHVlLnRvRml4ZWQoZnJhY3Rpb25EaWdpdHMpO1xuICAgZGVjU3RyaW5nID0gZGVjU3RyaW5nLnJlcGxhY2UoL14wXFwuLywgXCJcIik7XG4gICBkZWNTdHJpbmcgPSBkZWNTdHJpbmcucmVwbGFjZSgvMCokLywgXCJcIik7XG4gICBkZWNTdHJpbmcgPSBkZWNTdHJpbmcgPyBkZWNTdHJpbmcgOiBmcmFjdGlvbkRpZ2l0cyA+IDAgPyBcIjBcIiA6IFwiXCI7XG4gICBcbiAgIGlmIChkZWNQYWRMZW5ndGgpIHtcbiAgICAgZGVjU3RyaW5nID0gcGFkUmlnaHQoZGVjU3RyaW5nLCBmcmFjdGlvbkRpZ2l0cywgXCIwXCIpO1xuICAgfVxuICAgXG4gICBpZiAoKGRlY1BhZExlbmd0aCB8fCBkZWNWYWx1ZSA+IDApICYmIGZyYWN0aW9uRGlnaXRzID4gMCkge1xuICAgICBkZWNTdHJpbmcgPSByYWRpeCArIGRlY1N0cmluZztcbiAgIH0gZWxzZSB7XG4gICAgIGRlY1N0cmluZyA9IFwiXCI7XG4gICAgIGludFZhbHVlID0gTWF0aC5yb3VuZChudW1iZXIpO1xuICAgfVxuICAgXG4gICB2YXIgaW50U3RyaW5nID0gaW50VmFsdWUudG9TdHJpbmcoKTtcbiAgIFxuICAgaWYgKGludFBhZExlbmd0aCA+IDApIHtcbiAgICAgaW50U3RyaW5nID0gcGFkTGVmdChpbnRTdHJpbmcsIGludFBhdHRlcm5TdHJpbmcubGVuZ3RoLCBcIjBcIik7XG4gICB9XG4gICBcbiAgIGlmICh1c2VHcm91cGluZykge1xuICAgICBpbnRTdHJpbmcgPSBpbnRTdHJpbmcucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgZ3JvdXBpbmdTZXBhcmF0b3IucmVwbGFjZSgvXFxzL2csIGdyb3VwaW5nV2hpdGVzcGFjZSkgfHwgXCIsXCIpO1xuICAgfVxuXG4gICB2YXIgbnVtU3RyaW5nID0gKGlzTmVnYXRpdmUgPyBcIi1cIiA6IFwiXCIpICsgaW50U3RyaW5nICsgZGVjU3RyaW5nO1xuICAgICBcbiAgIHJldHVybiB1bml0ID8gbGVhZGluZ1VuaXQgPyB1bml0ICsgdW5pdFNwYWNlICsgbnVtU3RyaW5nIDogbnVtU3RyaW5nICsgdW5pdFNwYWNlICsgdW5pdCA6IG51bVN0cmluZztcbiB9XG5cbmZ1bmN0aW9uIGlzTG9jYWxlKGxvY2FsZSkge1xuICByZXR1cm4gKHR5cGVvZiBsb2NhbGUgPT09IFwic3RyaW5nXCIgJiYgbG9jYWxlLm1hdGNoKC9bYS16XXsyfS8pKTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0KHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG5cbiAgdmFyIGlucHV0UGF0dGVybiA9IG51bGw7XG4gIGZvciAodmFyIGEgPSAxOyBhIDwgYXJndW1lbnRzLmxlbmd0aDsgYSsrKSB7XG4gICAgdmFyIGFyZyA9IGFyZ3VtZW50c1thXTtcbiAgICBpZiAoYXJnIGluc3RhbmNlb2YgQXJyYXkgfHwgaXNMb2NhbGUoYXJnKSkge1xuICAgICAgbG9jYWxlID0gYXJnO1xuICAgIH0gZWxzZSBpZiAoIWlucHV0UGF0dGVybikge1xuICAgICAgaW5wdXRQYXR0ZXJuID0gYXJnO1xuICAgIH1cbiAgfVxuICBwYXR0ZXJuID0gaW5wdXRQYXR0ZXJuO1xuICBcbiAgdmFyIGxvY2FsZXMgPSBsb2NhbGUgaW5zdGFuY2VvZiBBcnJheSA/IGxvY2FsZSA6IGxvY2FsZSA/IFtsb2NhbGVdIDogT2JqZWN0LmtleXMoaTE4bik7XG4gIFxuICB2YXIgcGF0dGVybk1hdGNoO1xuICB2YXIgcGF0dGVyblVuaXQ7XG4gICBcbiAgaWYgKHBhdHRlcm4pIHtcbiAgICBwYXR0ZXJuTWF0Y2ggPSBwYXR0ZXJuUmVnZXguZXhlYyhwYXR0ZXJuKTtcbiAgICBwYXR0ZXJuVW5pdCA9IHBhdHRlcm5NYXRjaCA/IHBhdHRlcm5NYXRjaFsxXSB8fCBwYXR0ZXJuTWF0Y2hbcGF0dGVybk1hdGNoLmxlbmd0aCAtIDFdIDogbnVsbDtcbiAgfVxuICBcbiAgdmFyIHJlc3VsdHMgPSBsb2NhbGVzLm1hcChmdW5jdGlvbihsb2NhbGUpIHtcbiAgICBcbiAgICAgdmFyIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gICAgIFxuICAgICB2YXIgcmVzdWx0ID0ge2xvY2FsZTogbG9jYWxlLCBwYXR0ZXJuOiBwYXR0ZXJuLCByZWxldmFuY2U6IDB9O1xuICAgICB2YXIgdmFsdWUgPSBOYU47XG4gICAgIFxuICAgICBpZiAobG9jYWxlRGF0YSkge1xuICAgICAgIHZhciBhcmdzID0gbG9jYWxlRGF0YS5hcmdzO1xuICAgICAgIFxuICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICBcbiAgICAgICAgIHZhciBudW1iZXJSZWdleFBhcnQgPSBcIihbXFwrLV0/XFxcXGQqKD86XCIgKyBhcmdzWzBdLnJlcGxhY2UoL1xcLi8sIFwiXFxcXC5cIikucmVwbGFjZSgvXFxzLywgXCJcXFxcc1wiKSArIFwiXFxcXGR7M30pKikoPzpcIiArIGFyZ3NbMV0ucmVwbGFjZSgvXFwuL2csIFwiXFxcXC5cIikgKyBcIihcXFxcZCopKT9cIjtcbiAgICAgICAgIHZhciBsZWFkaW5nVW5pdCA9IGFyZ3NbMl07XG4gICAgICAgICB2YXIgdW5pdFNwYWNlID0gYXJnc1szXTtcbiAgICAgICAgIHZhciB1bml0U3BhY2VSZWdleFBhcnQgPSBcIlwiICsgdW5pdFNwYWNlLnJlcGxhY2UoL1xccy8sIFwiXFxcXHNcIikgKyBcIlwiO1xuICAgICAgICAgdmFyIHVuaXRSZWdleFBhcnQgPSBcIiglfFtcXHcqXSlcIjtcbiAgICAgICAgIHZhciBudW1iZXJSZWdleCA9IG51bWJlclJlZ2V4UGFydCwgbWF0Y2hOdW1JbmRleCA9IDEsIG1hdGNoVW5pdEluZGV4ID0gMztcbiAgICAgICAgIFxuICAgICAgICAgdmFyIGRldGVjdGVkUGF0dGVybjtcbiAgICAgICAgIFxuICAgICAgICAgaWYgKGxlYWRpbmdVbml0KSB7XG4gICAgICAgICAgIG51bWJlclJlZ2V4ID0gXCIoPzpcIiArIHVuaXRSZWdleFBhcnQgKyB1bml0U3BhY2VSZWdleFBhcnQgKyBcIik/XCIgKyBudW1iZXJSZWdleFBhcnQ7XG4gICAgICAgICAgIG1hdGNoTnVtSW5kZXggPSAyO1xuICAgICAgICAgICBtYXRjaFVuaXRJbmRleCA9IDE7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICBudW1iZXJSZWdleCA9IG51bWJlclJlZ2V4UGFydCArIFwiKD86XCIgKyB1bml0U3BhY2VSZWdleFBhcnQgKyB1bml0UmVnZXhQYXJ0ICsgXCIpP1wiO1xuICAgICAgICAgfVxuICAgICAgICAgXG4gICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiXlxcXFxzKlwiICsgbnVtYmVyUmVnZXggKyBcIlxcXFxzKiRcIik7XG4gICAgICAgICB2YXIgbWF0Y2ggPSByZWdleC5leGVjKHN0cmluZyk7XG4gICAgICAgICBcbiAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgdmFyIGludFN0cmluZyA9IG1hdGNoW21hdGNoTnVtSW5kZXhdO1xuICAgICAgICAgICB2YXIgbm9ybWFsaXplZEludFN0cmluZyA9IGludFN0cmluZy5yZXBsYWNlKG5ldyBSZWdFeHAoYXJnc1swXS5yZXBsYWNlKC9cXC4vLCBcIlxcXFwuXCIpLnJlcGxhY2UoL1xccy8sIFwiXFxcXHNcIiksIFwiZ1wiKSwgXCJcIik7XG4gICAgICAgICAgIFxuICAgICAgICAgICB2YXIgZGVjU3RyaW5nID0gbWF0Y2hbbWF0Y2hOdW1JbmRleCArIDFdIHx8IFwiXCI7XG4gICAgICAgICAgIHZhciB1bml0TWF0Y2ggPSBtYXRjaFttYXRjaFVuaXRJbmRleF07XG4gICAgICAgICAgIFxuICAgICAgICAgICBpZiAocGF0dGVybiAmJiAoIXBhdHRlcm5Vbml0ICYmIHVuaXRNYXRjaCkpIHtcbiAgICAgICAgICAgICAvLyBJbnZhbGlkIGJlY2F1c2Ugb2YgdW5pdFxuICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdChub3JtYWxpemVkSW50U3RyaW5nICsgKGRlY1N0cmluZyA/IFwiLlwiICsgZGVjU3RyaW5nIDogXCJcIikpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgaWYgKHVuaXRNYXRjaCAmJiB1bml0TWF0Y2ggPT09IFwiJVwiKSB7XG4gICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KCh2YWx1ZSAvIDEwMCkudG9QcmVjaXNpb24oMTIpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgICAgcmVzdWx0LnJlbGV2YW5jZSA9IG1hdGNoLmZpbHRlcihmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgfSkubGVuZ3RoICogMTAgKyB2YWx1ZS50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgICAgICAgXG4gICAgICAgICAgIFxuICAgICAgICAgICB2YXIgZGV0ZWN0ZWRQYXR0ZXJuID0gXCJcIjtcbiAgICAgICAgICAgaWYgKCFwYXR0ZXJuKSB7XG4gICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuID0gXCIjXCI7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgaWYgKHZhbHVlID49IDEwMDAgJiYgaW50U3RyaW5nLmluZGV4T2YoYXJnc1swXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuID0gXCIjLCMjI1wiO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICBpZiAoZGVjU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuKz0gXCIuXCIgKyAobmV3IEFycmF5KGRlY1N0cmluZy5sZW5ndGggKyAxKSkuam9pbiggXCIjXCIgKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgaWYgKHVuaXRNYXRjaCAmJiB1bml0TWF0Y2ggPT09IFwiJVwiKSB7XG4gICAgICAgICAgICAgICBkZXRlY3RlZFBhdHRlcm4rPSBcIiVcIjtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgcmVzdWx0LnBhdHRlcm4gPSBkZXRlY3RlZFBhdHRlcm47XG4gICAgICAgICAgICAgXG4gICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICB9XG4gICAgICAgICBcbiAgICAgICB9XG4gICAgIH1cbiAgICAgcmVzdWx0LnZhbHVlID0gdmFsdWU7XG4gICAgIHJldHVybiByZXN1bHQ7XG4gICB9KS5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgIHJldHVybiAhaXNOYU4ocmVzdWx0LnZhbHVlKTtcbiAgIH0pO1xuICAgXG4gICAvLyBVbmlxdWUgdmFsdWVzXG4gICB2YXIgZmlsdGVyZWRWYWx1ZXMgPSBbXTtcbiAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgaWYgKGZpbHRlcmVkVmFsdWVzLmluZGV4T2YocmVzdWx0LnZhbHVlKSA8IDApIHtcbiAgICAgICBmaWx0ZXJlZFZhbHVlcy5wdXNoKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgfVxuICAgfSk7XG4gICByZXN1bHRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICByZXR1cm4gYS5yZWxldmFuY2UgPCBiLnJlbGV2YW5jZTtcbiAgIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5cblxuLyogSW50ZXJmYWNlICovXG5mdW5jdGlvbiBuZm9ybWF0KG51bWJlciwgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHJldHVybiBmb3JtYXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiBcbm5mb3JtYXQucGFyc2UgPSBmdW5jdGlvbihzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuICByZXR1cm4gZGV0ZWN0LmNhbGwodGhpcywgc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9KVswXTtcbn07XG5cbm5mb3JtYXQuZGV0ZWN0ID0gZnVuY3Rpb24obnVtYmVyLCBzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuICBpZiAodHlwZW9mIG51bWJlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBDYW5ub3QgYWNjdXJhdGVseSBkZXRlcm1pbmUgcGF0dGVybiBhbmQgbG9jYWxlXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGRldGVjdC5jYWxsKHRoaXMsIHN0cmluZywgcGF0dGVybiwgbG9jYWxlKS5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBudW1iZXIgIT09ICdudW1iZXInIHx8IHJlc3VsdC52YWx1ZSA9PT0gbnVtYmVyO1xuICB9KS5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2FsZTogcmVzdWx0LmxvY2FsZSxcbiAgICAgIHBhdHRlcm46IHJlc3VsdC5wYXR0ZXJuXG4gICAgfTtcbiAgfSlbMF07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbmZvcm1hdDsiLCJ2YXIgX3YgPSAoZnVuY3Rpb24oKSB7XG4gIFxuICBcbiAgdmFyIFxuICAgIFNWR19OQU1FU1BBQ0VfVVJJID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICAgIE1BVEggPSBNYXRoLFxuICAgIFBJID0gTUFUSC5QSSxcbiAgICBjb3MgPSBNQVRILmNvcyxcbiAgICBzaW4gPSBNQVRILnNpbixcbiAgICBzcXJ0ID0gTUFUSC5zcXJ0LFxuICAgIHBvdyA9IE1BVEgucG93LFxuICAgIGZsb29yID0gTUFUSC5mbG9vcixcbiAgXG4gICAgLyoqXG4gICAgICogUm91bmRzIGEgbnVtYmVyIHRvIHByZWNpc2lvblxuICAgICAqLyBcbiAgICByb3VuZCA9IGZ1bmN0aW9uKG51bSwgZGlnaXRzKSB7XG4gICAgICBkaWdpdHMgPSB0eXBlb2YgZGlnaXRzID09PSAnbnVtYmVyJyA/IGRpZ2l0cyA6IDE7XG4gICAgICBpZiAodHlwZW9mIG51bSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yICh2YXIgeCBpbiBudW0pIHtcbiAgICAgICAgICBudW1beF0gPSByb3VuZChudW1beF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBY3R1YWxseSByb3VuZCBudW1iZXJcbiAgICAgICAgdmFyIHZhbHVlID0gcGFyc2VGbG9hdChudW0pO1xuICAgICAgICBpZiAoIWlzTmFOKHZhbHVlKSAmJiBuZXcgU3RyaW5nKHZhbHVlKS5sZW5ndGggPT09IG5ldyBTdHJpbmcobnVtKS5sZW5ndGgpIHtcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUudG9GaXhlZChkaWdpdHMpKTtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudW07XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogQ2FtZWxpemUgYSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gICAgICovIFxuICAgIGNhbWVsaXplID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhY2hlID0ge307XG4gICAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBjYWNoZVtzdHJpbmddID0gY2FjaGVbc3RyaW5nXSB8fCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oXFwtW2Etel0pL2csIGZ1bmN0aW9uKCQxKXtyZXR1cm4gJDEudG9VcHBlckNhc2UoKS5yZXBsYWNlKCctJywnJyk7fSk7XG4gICAgICAgIH0pKCk7XG4gICAgICB9O1xuICAgIH0pKCksXG4gIFxuICAgIC8qKlxuICAgICAqIEh5cGhlbmF0ZSBhIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAgICAgKi9cbiAgICBoeXBoZW5hdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2FjaGUgPSB7fTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlW3N0cmluZ10gPSBjYWNoZVtzdHJpbmddIHx8IChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oJDEpe3JldHVybiBcIi1cIiskMS50b0xvd2VyQ2FzZSgpO30pO1xuICAgICAgICB9KSgpO1xuICAgICAgfTtcbiAgICB9KSgpLFxuICBcbiAgICAvKipcbiAgICAgKiBFeHRlbmRzIGFuIG9iamVjdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gdHJ1ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXN0aW5hdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VcbiAgICAgKi9cbiAgICBleHRlbmQgPSBmdW5jdGlvbihkZWVwLCBkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cywgaSA9IHR5cGVvZiBkZWVwID09PSAnYm9vbGVhbicgPyAyIDogMSwgZGVzdCA9IGFyZ3VtZW50c1tpIC0gMV0sIHNyYywgcHJvcCwgdmFsdWU7XG4gICAgICBmb3IgKDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3JjID0gYXJnc1tpXTtcbiAgICAgICAgZm9yIChwcm9wIGluIHNyYykge1xuICAgICAgICAgIHZhbHVlID0gc3JjW3Byb3BdO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgIGRlc3RbcHJvcF0gPSBkZXN0W3Byb3BdIHx8IHt9O1xuICAgICAgICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgICAgICAgIGV4dGVuZCh0cnVlLCBkZXN0W3Byb3BdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlc3RbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkZXN0O1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdG8gQXJyYXlcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRydWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVzdGluYXRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlXG4gICAgICovXG4gICAgdG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgXG4gICAgICAvL3JldHVybiBvYmogJiYgKG9iai5sZW5ndGggJiYgW10uc2xpY2UuY2FsbChvYmopIHx8IFtvYmpdKTtcbiAgICAgIFxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgbCA9IG9iaiAmJiBvYmoubGVuZ3RoIHx8IDAsIGksIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAob2JqW2ldKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2gob2JqW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCAmJiByZXN1bHQgfHwgW29ial07XG4gICAgfSxcbiAgICBcbiAgICAvLyBET00gTWFuaXB1bGF0aW9uXG4gICAgXG4gICAgcGFyZW50ID0gZnVuY3Rpb24oZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0ucGFyZW50Tm9kZTtcbiAgICB9LFxuICAgIFxuICAgIGFwcGVuZCA9IGZ1bmN0aW9uKCBwYXJlbnQsIGNoaWxkICkge1xuICAgICAgcGFyZW50ID0gcGFyZW50ICYmIHBhcmVudFswXSB8fCBwYXJlbnQ7XG4gICAgICBpZiAocGFyZW50ICYmIHBhcmVudC5hcHBlbmRDaGlsZCkge1xuICAgICAgICB0b0FycmF5KGNoaWxkKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBwcmVwZW5kID0gZnVuY3Rpb24oIHBhcmVudCwgY2hpbGQgKSB7XG4gICAgICBwYXJlbnQgPSBwYXJlbnRbMF0gfHwgcGFyZW50O1xuICAgICAgdG9BcnJheShjaGlsZCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBwYXJlbnQuZmlyc3RDaGlsZCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIHJlbW92ZSA9IGZ1bmN0aW9uKCBlbGVtLCBjaGlsZCApIHtcbiAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICB0b0FycmF5KGNoaWxkKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgZWxlbS5yZW1vdmVDaGlsZChjaGlsZCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChlbGVtLnBhcmVudE5vZGUpIHtcbiAgICAgICAgZWxlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgaHRtbCA9IGZ1bmN0aW9uKGVsZW0sIHN0cmluZykge1xuICAgICAgaWYgKHN0cmluZykge1xuICAgICAgICBlbGVtLmlubmVySFRNTCA9IHN0cmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbGVtLmlubmVySFRNTDtcbiAgICB9LFxuICAgIFxuICAgIHRleHQgPSBmdW5jdGlvbihlbGVtKSB7XG4gICAgICByZXR1cm4gZWxlbS50ZXh0Q29udGVudDtcbiAgICB9LFxuICAgIFxuICAgIGF0dHIgPSBmdW5jdGlvbiAoZWxlbSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZhciByZXN1bHQgPSBudWxsLCBvYmogPSB7fSwgcHJvcCwgcHggPSBbJ3gnLCAneScsICdkeCcsICdkeScsICdjeCcsICdjeSddO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvYmogPSBuYW1lO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBvYmpbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG1hcFN0eWxlcyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBoeXBoZW5hdGUobmFtZSkgKyBcIjogXCIgKyB2YWx1ZVtuYW1lXTtcbiAgICAgIH1cbiAgICAgIGlmIChPYmplY3Qua2V5cyhvYmopLmxlbmd0aCkge1xuICAgICAgICBmb3IgKG5hbWUgaW4gb2JqKSB7XG4gICAgICAgICAgcHJvcCA9IHR5cGVvZiBlbGVtW2NhbWVsaXplKG5hbWUpXSAhPT0gJ3VuZGVmaW5lZCcgPyBjYW1lbGl6ZShuYW1lKSA6IGh5cGhlbmF0ZShuYW1lKTtcbiAgICAgICAgICB2YWx1ZSA9IG9ialtuYW1lXTtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gU2V0XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChtYXBTdHlsZXMpLmpvaW4oXCI7IFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBweC5pbmRleE9mKHByb3ApID49IDAgPyByb3VuZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUocHJvcCwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgLy8gR2V0XG4gICAgICAgICAgICByZXN1bHQgPSBlbGVtLmdldEF0dHJpYnV0ZShwcm9wKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgXG4gICAgY3NzID0gZnVuY3Rpb24oZWxlbSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZhciBtYXAgPSB7fSwgY3NzVGV4dCA9IG51bGw7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1hcCA9IG5hbWU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBtYXBbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGNzc1RleHQgPSBPYmplY3Qua2V5cyhtYXApLm1hcChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBoeXBoZW5hdGUobmFtZSkgKyBcIjogXCIgKyBtYXBbbmFtZV07XG4gICAgICB9KS5qb2luKFwiOyBcIik7XG4gICAgICBpZiAoY3NzVGV4dCAmJiBjc3NUZXh0Lmxlbmd0aCkge1xuICAgICAgICBlbGVtLnN0eWxlLmNzc1RleHQgPSBlbGVtLnN0eWxlLmNzc1RleHQgKyBjc3NUZXh0O1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbGVtLnN0eWxlW25hbWVdIHx8IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0sIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG4gICAgfSxcbiAgICBcbiAgICBhZGRDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gICAgfSxcbiAgICBcbiAgICBoYXNDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG4gICAgfSxcbiAgICBcbiAgICByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgfSxcbiAgICBcbiAgICB0b2dnbGVDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICAgICAgZWxlbS5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBHZXRzIGEgcGFpciBvZiBiZXppZXIgY29udHJvbCBwb2ludHNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geDBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geTBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geDFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geTFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geDJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geTJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdFxuICAgICAqL1xuICAgIGdldENvbnRyb2xQb2ludHMgPSBmdW5jdGlvbiggeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgdCApIHtcbiAgICAgIHQgPSB0eXBlb2YgdCA9PT0gJ251bWJlcicgPyB0IDogMC41O1xuICAgICAgdmFyXG4gICAgICAgIGQwMSA9IHNxcnQoIHBvdyggeDEgLSB4MCwgMiApICsgcG93KCB5MSAtIHkwLCAyICkgKSxcbiAgICAgICAgZDEyID0gc3FydCggcG93KCB4MiAtIHgxLCAyICkgKyBwb3coIHkyIC0geTEsIDIgKSApLFxuICAgICAgICBmYSA9IHQgKiBkMDEgLyAoIGQwMSArIGQxMiApLCAgIC8vIHNjYWxpbmcgZmFjdG9yIGZvciB0cmlhbmdsZSBUYVxuICAgICAgICBmYiA9IHQgKiBkMTIgLyAoIGQwMSArIGQxMiApLCAgIC8vIGRpdHRvIGZvciBUYiwgc2ltcGxpZmllcyB0byBmYj10LWZhXG4gICAgICAgIHAxeCA9IHgxIC0gZmEgKiAoIHgyIC0geDAgKSwgICAgLy8geDIteDAgaXMgdGhlIHdpZHRoIG9mIHRyaWFuZ2xlIFRcbiAgICAgICAgcDF5ID0geTEgLSBmYSAqICggeTIgLSB5MCApLCAgICAvLyB5Mi15MCBpcyB0aGUgaGVpZ2h0IG9mIFRcbiAgICAgICAgcDJ4ID0geDEgKyBmYiAqICggeDIgLSB4MCApLFxuICAgICAgICBwMnkgPSB5MSArIGZiICogKCB5MiAtIHkwICk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwMToge3g6IHAxeCwgeTogcDF5fSwgXG4gICAgICAgIHAyOiB7eDogcDJ4LCB5OiBwMnl9XG4gICAgICB9O1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIFNlcmlhbGl6ZXMgcG9pbnRzIGFzIHN2ZyBwYXRoIGRlZmluaXRpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwb2ludHNcbiAgICAgKi9cbiAgICBnZXRQYXRoID0gZnVuY3Rpb24oIHBvaW50cyApIHtcbiAgICAgIHJldHVybiBwb2ludHMubWFwKGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICAgIHJldHVybiBwb2ludC54ICsgXCIsXCIgKyBwb2ludC55O1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfSxcbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIFZpc3VhbGlzdCBxdWVyeSBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIF92ID0gZnVuY3Rpb24oc2VsZWN0b3IsIHdpZHRoLCBoZWlnaHQsIGF0dHJzKSB7XG4gICAgICB2YXIgYXJnLCBpLCBzLCB3LCBoLCBhLCBzZXQ7XG4gICAgICBmb3IgKGkgPSAwLCBhcmc7IGFyZyA9IGFyZ3VtZW50c1tpXTsgaSsrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyAmJiAhaXNOYU4ocGFyc2VGbG9hdChhcmcpKSkge1xuICAgICAgICAgIC8vIE51bWVyaWNcbiAgICAgICAgICBhcmcgPSB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyA/IHBhcnNlRmxvYXQoYXJnKSArIFwicHhcIiA6IGFyZztcbiAgICAgICAgICBpZiAodHlwZW9mIHcgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBoID0gYXJnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ID0gYXJnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgIC8vIFBsYWluIG9iamVjdFxuICAgICAgICAgIGEgPSBhcmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRXZlcnl0aGluZyBlbHNlIG1heSBiZSBhIHNlbGVjdG9yXG4gICAgICAgICAgcyA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0ID0gcyBpbnN0YW5jZW9mIFZpc3VhbGlzdCA/IHMgOiBuZXcgVmlzdWFsaXN0KHMpO1xuICAgICAgc2V0LmF0dHIoZXh0ZW5kKHRydWUsIGEgfHwge30sIHtcbiAgICAgICAgd2lkdGg6IHcsIFxuICAgICAgICBoZWlnaHQ6IGhcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBzZXQ7XG4gICAgfTtcblxuICAvKipcbiAgICogVmlzdWFsaXN0IENsYXNzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICAgKi9cblxuICBmdW5jdGlvbiBWaXN1YWxpc3Qoc2VsZWN0b3IpIHtcbiAgICB2YXIgc2V0ID0gbnVsbCwgZWxlbSwgcmVzdWx0LCBpLCBzdmc7XG4gICAgLy8gQ29sbGVjdCBjb25zdHJ1Y3RvciBhcmdzXG4gICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ29iamVjdCcgJiYgc2VsZWN0b3IubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFX1VSSSkge1xuICAgICAgLy8gRXhpc3RpbmcgRWxlbWVudFxuICAgICAgc2V0ID0gW3NlbGVjdG9yXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFNlbGVjdG9yXG4gICAgICByZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgIGZvciAoaSA9IDAsIGVsZW07IGVsZW0gPSByZXN1bHRbaV07IGkrKykge1xuICAgICAgICBpZiAoZWxlbS5uYW1lc3BhY2VVUkkgPT09IFNWR19OQU1FU1BBQ0VfVVJJICkge1xuICAgICAgICAgIHNldCA9IHNldCB8fCBbXTtcbiAgICAgICAgICBzZXQucHVzaChlbGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXNldCkge1xuICAgICAgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OQU1FU1BBQ0VfVVJJLCAnc3ZnJyk7XG4gICAgICBzdmcuc2V0QXR0cmlidXRlKFwieG1sbnNcIiwgU1ZHX05BTUVTUEFDRV9VUkkpO1xuICAgICAgc2V0ID0gW3N2Z107XG4gICAgfVxuICAgIHRoaXMucHVzaC5hcHBseSh0aGlzLCBzZXQgfHwgW10pO1xuICB9XG4gIFxuICBWaXN1YWxpc3QucHJvdG90eXBlID0gW107XG4gIFxuICAvLyBTdGF0aWMgbWV0aG9kc1xuICBfdi5leHRlbmQgPSBleHRlbmQ7XG4gIF92LmF0dHIgPSBhdHRyO1xuICBfdi5jc3MgPSBjc3M7XG4gIFxuICAvLyBQbHVnaW4gQVBJXG4gIF92LmZuID0gVmlzdWFsaXN0LnByb3RvdHlwZTtcbiAgXG4gIC8qKlxuICAgKiBFeHRlbmRzIHZpc3VhbGlzdCBwcm90b3R5cGVcbiAgICogQHBhcmFtIHtBcnJheX0gbWV0aG9kc1xuICAgKi9cbiAgX3YuZm4uZXh0ZW5kID0gZnVuY3Rpb24oIG1ldGhvZHMgKSB7XG4gICAgZm9yICh2YXIgeCBpbiBtZXRob2RzKSB7XG4gICAgICBWaXN1YWxpc3QucHJvdG90eXBlW3hdID0gbWV0aG9kc1t4XTtcbiAgICB9XG4gIH07XG4gIFxuICAvLyBQcml2YXRlIENvbXBvbmVudHNcbiAgXG4gIC8qKlxuICAgKiBEcmF3IGJhc2ljIHNoYXBlc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdGFnTmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgKiBAcGFyYW0ge0FycmF5fSBjaGlsZHJlbiBcbiAgICovXG4gIGZ1bmN0aW9uIHNoYXBlKHRhZ05hbWUsIHBhcmFtcywgYXR0cnMsIGNoaWxkcmVuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICBfdihlbGVtKS5hcHBlbmQoc2VsZi5jcmVhdGUodGFnTmFtZSwgZXh0ZW5kKHRydWUsIHt9LCBhdHRycywgcm91bmQocGFyYW1zKSkpLmFwcGVuZChjaGlsZHJlbikpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICAvLyBQdWJsaWMgQ29tcG9uZW50c1xuICBcbiAgX3YuZm4uZXh0ZW5kKHtcbiAgICBcbiAgICBzaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgICB9LFxuICAgIFxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRvQXJyYXkodGhpcyk7XG4gICAgfSxcbiAgICBcbiAgICBnZXQ6IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgIHJldHVybiB0eXBlb2YgaW5kZXggIT09ICd1bmRlZmluZWQnID8gaW5kZXggPCAwID8gdGhpc1t0aGlzLmxlbmd0aCAtIGluZGV4XSA6IHRoaXNbaW5kZXhdIDogdGhpcy50b0FycmF5KCk7XG4gICAgfSxcbiAgICBcbiAgICBpbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpc1swXSAmJiB0b0FycmF5KHRoaXNbMF0ucGFyZW50Tm9kZS5jaGlsZHJlbikuaW5kZXhPZih0aGlzWzBdKSB8fCAtMTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgdGhlIHNwZWNpZmllZCBjaGlsZCB0byB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24oIGNoaWxkICkge1xuICAgICAgaWYgKHRoaXNbMF0pIHtcbiAgICAgICAgYXBwZW5kKHRoaXNbMF0sIGNoaWxkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGUgY3VycmVudCBzZXQgb2YgZWxlbWVudHMgdG8gdGhlIHNwZWNpZmllZCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2hpbGRcbiAgICAgKi9cbiAgICBhcHBlbmRUbzogZnVuY3Rpb24oIHBhcmVudCApIHtcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICBhcHBlbmQocGFyZW50LCBlbGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFByZXBlbmRzIHRoZSBzcGVjaWZpZWQgY2hpbGQgdG8gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2hpbGRcbiAgICAgKi9cbiAgICBwcmVwZW5kOiBmdW5jdGlvbiggY2hpbGQgKSB7XG4gICAgICBpZiAodGhpc1swXSkge1xuICAgICAgICBwcmVwZW5kKHRoaXNbMF0sIGNoaWxkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUHJlcGVuZHMgdGhlIGN1cnJlbnQgc2V0IG9mIGVsZW1lbnRzIHRvIHRoZSBzcGVjaWZpZWQgcGFyZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gICAgICovXG4gICAgcHJlcGVuZFRvOiBmdW5jdGlvbiggcGFyZW50ICkge1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgcHJlcGVuZChwYXJlbnQsIGVsZW0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGVsZW1lbnRzIGluIHRoZSBzZXQgb3IgcmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGNoaWxkIGZyb20gdGhlIHNldCBvZiBtYXRjaGVkIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24oIGNoaWxkICkge1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgcmVtb3ZlKGVsZW0sIGNoaWxkKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGNoaWxkcmVuIGZyb20gZWxlbWVudHMgaW4gdGhlIHNldFxuICAgICAqL1xuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZWxlbS5yZW1vdmVDaGlsZChlbGVtLmNoaWxkTm9kZXNbaV0pO1xuICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBhcmVudCBub2RlIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICovXG4gICAgcGFyZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzWzBdICYmIHBhcmVudCh0aGlzWzBdKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdmFsdWUgb2YgYW4gYXR0cmlidXRlIGZvciB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0IG9mIG1hdGNoZWQgZWxlbWVudHMgb3Igc2V0IG9uZSBvciBtb3JlIGF0dHJpYnV0ZXMgZm9yIGV2ZXJ5IG1hdGNoZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICAgICAqL1xuICAgIGF0dHI6IGZ1bmN0aW9uKCBuYW1lLCB2YWx1ZSApIHtcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzO1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgdmFyIHJldCA9IGF0dHIoZWxlbSwgbmFtZSwgdmFsdWUpO1xuICAgICAgICBpZiAocmV0ICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmV0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGEgY29tcHV0ZWQgc3R5bGUgcHJvcGVydHkgZm9yIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQgb2YgbWF0Y2hlZCBlbGVtZW50cyBvciBzZXQgb25lIG9yIG1vcmUgQ1NTIHByb3BlcnRpZXMgZm9yIGV2ZXJ5IG1hdGNoZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICAgICAqL1xuICAgIGNzczogZnVuY3Rpb24oIG5hbWUsIHZhbHVlICkge1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXM7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICB2YXIgcmV0ID0gY3NzKGVsZW0sIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgaWYgKHJldCAhPT0gbnVsbCkge1xuICAgICAgICAgIHJlc3VsdCA9IHJldDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmVkIHRhZ25hbWUuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCB0YWdOYW1lLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBfdigodGhpc1swXSAmJiB0aGlzWzBdLm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQpLmNyZWF0ZUVsZW1lbnROUyh0aGlzWzBdICYmIHRoaXNbMF0ubmFtZXNwYWNlVVJJIHx8IFNWR19OQU1FU1BBQ0VfVVJJLCB0YWdOYW1lKSkuYXR0cihhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXRzIG9yIHNldHMgdGhlIHdpZHRoIG9uIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gd2lkdGhcbiAgICAgKi9cbiAgICB3aWR0aDogZnVuY3Rpb24oIHdpZHRoICkge1xuICAgICAgLy9jb25zb2xlLndhcm4oXCJkZXByZWNhdGVkXCIpO1xuICAgICAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ3VuZGVmaW5lZCcgJiYgdGhpc1swXSkge1xuICAgICAgICByZXR1cm4gdGhpc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXR0cignd2lkdGgnLCB3aWR0aCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldHMgb3Igc2V0cyB0aGUgaGVpZ2h0IG9uIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0XG4gICAgICovXG4gICAgaGVpZ2h0OiBmdW5jdGlvbiggaGVpZ2h0ICkge1xuICAgICAgLy9jb25zb2xlLndhcm4oXCJkZXByZWNhdGVkXCIpO1xuICAgICAgaWYgKHR5cGVvZiBoZWlnaHQgPT09ICd1bmRlZmluZWQnICYmIHRoaXNbMF0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgdGhpcy5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqL1xuICAgIGJib3g6IGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGIgPSB0aGlzWzBdICYmIHRoaXNbMF0uZ2V0QkJveCgpO1xuICAgICAgICBiID0ge1xuICAgICAgICAgIHg6IGIueCxcbiAgICAgICAgICB5OiBiLnksXG4gICAgICAgICAgd2lkdGg6IGIud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBiLmhlaWdodFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHt4OiAwLCB5OiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwfTtcbiAgICAgIH0gXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIGNvbXB1dGVkIHRleHQgbGVuZ3RoIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXQgaWYgYXBwbGljYWJsZS5cbiAgICAgKi9cbiAgICBjb21wdXRlZFRleHRMZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBncm91cCBsYXllciBvbiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgZzogZnVuY3Rpb24oIGF0dHJzICkge1xuICAgICAgdmFyIGcgPSB0aGlzLmNyZWF0ZSgnZycsIGF0dHJzKTtcbiAgICAgIF92KHRoaXNbMF0pLmFwcGVuZChnKTtcbiAgICAgIHJldHVybiBnO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSBjaXJjbGUgb24gZXZlcnkgZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBjeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgY2lyY2xlOiBmdW5jdGlvbiggY3gsIGN5LCByLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsIFwiY2lyY2xlXCIsIHtcbiAgICAgICAgY3g6IGN4LCBcbiAgICAgICAgY3k6IGN5LCBcbiAgICAgICAgcjogclxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYW4gZWxsaXBzZSBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGN4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGN5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJ4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJ5XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgZWxsaXBzZTogZnVuY3Rpb24oIGN4LCBjeSwgcngsIHJ5LCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsIFwiZWxsaXBzZVwiLCB7XG4gICAgICAgIGN4OiBjeCwgXG4gICAgICAgIGN5OiBjeSwgXG4gICAgICAgIHJ4OiByeCxcbiAgICAgICAgcnk6IHJ5XG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIHJlY3RhbmdsZSBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICByZWN0OiBmdW5jdGlvbiggeCwgeSwgd2lkdGgsIGhlaWdodCwgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCBcInJlY3RcIiwge1xuICAgICAgICB4OiB4LCBcbiAgICAgICAgeTogeSwgXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGEgbGluZSBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHgxXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkxXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHgyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgbGluZTogZnVuY3Rpb24oIHgxLCB5MSwgeDIsIHkyLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsIFwibGluZVwiLCB7XG4gICAgICAgIHgxOiB4MSxcbiAgICAgICAgeTE6IHkxLFxuICAgICAgICB4MjogeDIsXG4gICAgICAgIHkyOiB5MlxuICAgICAgfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSBwb2x5Z29uIG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgcG9seWdvbjogZnVuY3Rpb24oIHBvaW50cywgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCAncG9seWdvbicsIHtcbiAgICAgICAgcG9pbnRzOiBnZXRQYXRoKHBvaW50cylcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGEgcG9seWdvbiBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIHBvbHlsaW5lOiBmdW5jdGlvbiggcG9pbnRzLCBhdHRycyApIHtcbiAgICAgIHJldHVybiBzaGFwZS5jYWxsKHRoaXMsICdwb2x5bGluZScsIHtcbiAgICAgICAgcG9pbnRzOiBnZXRQYXRoKHBvaW50cylcbiAgICAgIH0sIGF0dHJzKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERyYXdzIGEgcGF0aCBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgKi9cbiAgICBwYXRoOiBmdW5jdGlvbiggZCwgYXR0cnMgKSB7XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCAncGF0aCcsIHtkOiBkfSwgYXR0cnMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0ZXh0IG9uIGV2ZXJ5IGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAqL1xuICAgIHRleHQ6IGZ1bmN0aW9uKCB4LCB5LCBzdHJpbmcsIGF0dHJzICkge1xuICAgICAgcmV0dXJuIHNoYXBlLmNhbGwodGhpcywgJ3RleHQnLCB7XG4gICAgICAgIHg6IHgsIFxuICAgICAgICB5OiB5XG4gICAgICB9LCBhdHRycywgWyh0aGlzWzBdICYmIHRoaXNbMF0ub3duZXJEb2N1bWVudCB8fCBkb2N1bWVudCkuY3JlYXRlVGV4dE5vZGUoc3RyaW5nKV0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVuZGVycyBhIHNtb290aCBncmFwaCBvbiBldmVyeSBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICovXG4gICAgZ3JhcGg6IGZ1bmN0aW9uKCBwb2ludHMsIG9wdGlvbnMgKSB7XG4gICAgICBcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIFxuICAgICAgICB2YXJcbiAgICAgICAgICBvcHRzID0gZXh0ZW5kKHtcbiAgICAgICAgICAgIHNtb290aDogZmFsc2UsIFxuICAgICAgICAgICAgdGVuc2lvbjogMC40LFxuICAgICAgICAgICAgYXBwcm94aW1hdGU6IHRydWVcbiAgICAgICAgICB9LCBvcHRpb25zKSxcbiAgICAgICAgICB0ID0gIWlzTmFOKCBvcHRzLnRlbnNpb24gKSA/IG9wdHMudGVuc2lvbiA6IDAuNSxcbiAgICAgICAgICBlbCA9IF92KGVsZW0pLCBcbiAgICAgICAgICBwLFxuICAgICAgICAgIGksXG4gICAgICAgICAgYyxcbiAgICAgICAgICBkLFxuICAgICAgICAgIHAxLFxuICAgICAgICAgIHAyLFxuICAgICAgICAgIGNwcyxcbiAgICAgICAgICBwYXRoID0gZWwuY3JlYXRlKCdwYXRoJyksXG4gICAgICAgICAgcGF0aFN0ciA9IFwiXCI7XG4gICAgICAgICAgXG4gICAgICAgIGVsLmFwcGVuZChwYXRoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghb3B0cy5zbW9vdGgpIHtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgcCA9IHBvaW50c1tpXTtcbiAgICAgICAgICAgIHBhdGhTdHIrPSBpID4gMCA/IFwiTFwiIDogXCJNXCI7XG4gICAgICAgICAgICBwYXRoU3RyKz0gcm91bmQocC54KSArIFwiIFwiICsgcm91bmQocC55KSArIFwiIFwiO1xuICAgICAgICAgIH0gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gU21vb3RoXG4gICAgICAgICAgaWYgKG9wdHMuYXBwcm94aW1hdGUpIHtcbiAgICAgICAgICAgIHAgPSBwb2ludHNbMF07XG4gICAgICAgICAgICBwYXRoU3RyKz0gXCJNXCIgKyByb3VuZChwLngpICsgXCIgXCIgKyByb3VuZChwLnkpICsgXCIgXCI7XG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGMgPSAocG9pbnRzW2ldLnggKyBwb2ludHNbaSArIDFdLngpIC8gMjtcbiAgICAgICAgICAgICAgICBkID0gKHBvaW50c1tpXS55ICsgcG9pbnRzW2kgKyAxXS55KSAvIDI7XG4gICAgICAgICAgICAgICAgcGF0aFN0cis9IFwiUVwiICsgcm91bmQocG9pbnRzW2ldLngpICsgXCIgXCIgKyByb3VuZChwb2ludHNbaV0ueSkgKyBcIiBcIiArIGMgKyBcIiBcIiArIGQgKyBcIiBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGhTdHIrPSBcIlRcIiArIHJvdW5kKHBvaW50c1tpXS54KSArIFwiIFwiICsgcm91bmQocG9pbnRzW2ldLnkpICsgXCIgXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHAgPSBwb2ludHNbMF07XG4gICAgICAgICAgICBwYXRoU3RyKz0gXCJNXCIgKyBwLnggKyBcIiBcIiArIHAueSArIFwiIFwiO1xuICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKz0xKSB7XG4gICAgICAgICAgICAgIHAgPSBwb2ludHNbaSAtIDFdO1xuICAgICAgICAgICAgICBwMSA9IHBvaW50c1tpXTtcbiAgICAgICAgICAgICAgcDIgPSBwb2ludHNbaSArIDFdO1xuICAgICAgICAgICAgICBjcHMgPSBnZXRDb250cm9sUG9pbnRzKHAueCwgcC55LCBwMS54LCBwMS55LCBwMi54LCBwMi55LCB0KTtcbiAgICAgICAgICAgICAgcGF0aFN0cis9IFwiQ1wiICsgcm91bmQoY3BzLnAxLngpICsgXCIgXCIgKyByb3VuZChjcHMucDEueSkgKyBcIiBcIiArIHJvdW5kKGNwcy5wMi54KSArIFwiIFwiICsgcm91bmQoY3BzLnAyLnkpICsgXCIgXCIgKyByb3VuZChwMi54KSArIFwiIFwiICsgcm91bmQocDIueSkgKyBcIiBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGhTdHIrPSBcIlRcIiArIHJvdW5kKHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0ueCkgKyBcIiBcIiArIHJvdW5kKHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0ueSkgKyBcIiBcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRlbGV0ZSBvcHRzLnNtb290aDtcbiAgICAgICAgZGVsZXRlIG9wdHMudGVuc2lvbjtcbiAgICAgICAgZGVsZXRlIG9wdHMuYXBwcm94aW1hdGU7XG4gICAgICAgIFxuICAgICAgICBwYXRoLmF0dHIoZXh0ZW5kKHtcbiAgICAgICAgICBmaWxsOiAnbm9uZSdcbiAgICAgICAgfSwgb3B0cywge1xuICAgICAgICAgIGQ6IHBhdGhTdHJcbiAgICAgICAgfSkpO1xuICAgICAgICBcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIGFyYygpIG1ldGhvZCBjcmVhdGVzIGFuIGFyYy9jdXJ2ZSAodXNlZCB0byBjcmVhdGUgY2lyY2xlcywgb3IgcGFydHMgb2YgY2lyY2xlcykuIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzQW5nbGVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZUFuZ2xlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBjb3VudGVyY2xvY2t3aXNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgYXJjOiBmdW5jdGlvbihjeCwgY3ksIHIsIHNBbmdsZSwgZUFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlLCBhdHRycykge1xuICAgICAgY291bnRlcmNsb2Nrd2lzZSA9IHR5cGVvZiBjb3VudGVyY2xvY2t3aXNlID09PSAnYm9vbGVhbicgPyBjb3VudGVyY2xvY2t3aXNlIDogZmFsc2U7XG4gICAgICB2YXJcbiAgICAgICAgZCA9ICdNICcgKyByb3VuZChjeCkgKyAnLCAnICsgcm91bmQoY3kpLFxuICAgICAgICBjeHMsXG4gICAgICAgIGN5cyxcbiAgICAgICAgY3hlLFxuICAgICAgICBjeWU7XG4gICAgICBpZiAoZUFuZ2xlIC0gc0FuZ2xlID09PSBNYXRoLlBJICogMikge1xuICAgICAgICAvLyBDaXJjbGVcbiAgICAgICAgZCs9ICcgbSAtJyArIHIgKyAnLCAwIGEgJyArIHIgKyAnLCcgKyByICsgJyAwIDEsMCAnICsgKHIgKiAyKSArICcsMCBhICcgKyByICsgJywnICsgciArICcgMCAxLDAgLScgKyAociAqIDIpICsgJywwJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN4cyA9IHJvdW5kKGN4ICsgY29zKHNBbmdsZSkgKiByKTtcbiAgICAgICAgY3lzID0gcm91bmQoY3kgKyBzaW4oc0FuZ2xlKSAqIHIpO1xuICAgICAgICBjeGUgPSByb3VuZChjeCArIGNvcyhlQW5nbGUpICogcik7XG4gICAgICAgIGN5ZSA9IHJvdW5kKGN5ICsgc2luKGVBbmdsZSkgKiByKTtcbiAgICAgICAgZCs9IFwiIExcIiArIGN4cyArIFwiLFwiICsgY3lzICtcbiAgICAgICAgICBcIiBBXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCBcIiArIChlQW5nbGUgLSBzQW5nbGUgPiBQSSA/IDEgOiAwKSArIFwiLFwiICsgKGNvdW50ZXJjbG9ja3dpc2UgPyAwIDogMSkgK1xuICAgICAgICAgIFwiIFwiICsgY3hlICsgXCIsXCIgKyBjeWUgKyBcIiBaXCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2hhcGUuY2FsbCh0aGlzLCBcInBhdGhcIiwge1xuICAgICAgICBkOiBkXG4gICAgICB9LCBhdHRycyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRleHQgaW50byBhIGJvdW5kaW5nIGJveCBieSB3cmFwcGluZyBsaW5lcyBhdCBzcGFjZXMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHhcbiAgICAgKiBAcGFyYW0ge09iamVjdH0geVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB3aWR0aFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RyaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICovXG4gICAgdGV4dGJveDogZnVuY3Rpb24oIHgsIHksIHdpZHRoLCBoZWlnaHQsIHN0cmluZywgYXR0cnMgKSB7XG4gICAgICBcbiAgICAgIHZhciBcbiAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICBcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIFxuICAgICAgICB2YXJcbiAgICAgICAgICBfdmVsZW0gPSBfdihlbGVtKSxcbiAgICAgICAgICBsaW5lcyA9IHdpZHRoID8gW10gOiBbc3RyaW5nXSwgXG4gICAgICAgICAgbGluZSA9IFtdLFxuICAgICAgICAgIGxlbmd0aCA9IDAsXG4gICAgICAgICAgd29yZHMgPSB3aWR0aCA/IHN0cmluZy5zcGxpdCgvXFxzKy8pIDogW10sXG4gICAgICAgICAgdGV4dCA9IHNlbGYuY3JlYXRlKCd0ZXh0JywgZXh0ZW5kKHRydWUsIHt9LCBhdHRycywge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9KSksXG4gICAgICAgICAgdGV4dE5vZGUsXG4gICAgICAgICAgbGluZUhlaWdodCA9IHBhcnNlRmxvYXQoX3ZlbGVtLmNzcygnbGluZS1oZWlnaHQnKSksXG4gICAgICAgICAgZm9udFNpemUgPSBwYXJzZUZsb2F0KF92ZWxlbS5jc3MoJ2ZvbnQtc2l6ZScpKSxcbiAgICAgICAgICB0ZXh0QWxpZ24gPSB0ZXh0LmNzcygndGV4dC1hbGlnbicpLFxuICAgICAgICAgIHR5ID0gMDtcbiAgICAgICAgXG4gICAgICAgIF92ZWxlbS5hcHBlbmQodGV4dCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgLy8gQnJlYWsgbGluZXNcbiAgICAgICAgICB0ZXh0Tm9kZSA9IGVsZW0ub3duZXJEb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtcbiAgICAgICAgICB0ZXh0LmFwcGVuZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgd29yZHMuZm9yRWFjaChmdW5jdGlvbih3b3JkLCBpbmRleCkge1xuICAgICAgICAgICAgdGV4dE5vZGUuZGF0YSA9IGxpbmUuam9pbignICcpICsgJyAnICsgd29yZDtcbiAgICAgICAgICAgIGxlbmd0aCA9IHRleHQuY29tcHV0ZWRUZXh0TGVuZ3RoKCk7XG4gICAgICAgICAgICBpZiAobGVuZ3RoID4gd2lkdGgpIHtcbiAgICAgICAgICAgICAgbGluZXMucHVzaChsaW5lLmpvaW4oJyAnKSk7XG4gICAgICAgICAgICAgIGxpbmUgPSBbd29yZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsaW5lLnB1c2god29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IHdvcmRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgbGluZXMucHVzaChsaW5lLmpvaW4oJyAnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGV4dC5yZW1vdmUodGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBSZW5kZXIgbGluZXNcbiAgICAgICAgbGluZXMuZm9yRWFjaChmdW5jdGlvbihsaW5lLCBpbmRleCkge1xuICAgICAgICAgIHZhciB0c3BhbiwgZHk7XG4gICAgICAgICAgaWYgKCFoZWlnaHQgfHwgdHkgKyBwYXJzZUZsb2F0KGxpbmVIZWlnaHQpIDwgaGVpZ2h0KSB7XG4gICAgICAgICAgICBkeSA9IGluZGV4ID4gMCA/IGxpbmVIZWlnaHQgOiBmb250U2l6ZSAtIDI7XG4gICAgICAgICAgICB0eSs9IGR5O1xuICAgICAgICAgICAgdHNwYW4gPSBzZWxmLmNyZWF0ZSgndHNwYW4nLCB7ZHk6IGR5fSk7XG4gICAgICAgICAgICB0ZXh0LmFwcGVuZCh0c3Bhbik7XG4gICAgICAgICAgICB0c3BhblxuICAgICAgICAgICAgICAuYXBwZW5kKGVsZW0ub3duZXJEb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsaW5lKSlcbiAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBwYXJzZUludCh0ZXh0LmF0dHIoJ3gnKSwgdW5kZWZpbmVkKSArICh3aWR0aCAtIHRzcGFuLmNvbXB1dGVkVGV4dExlbmd0aCgpKSAqICh0ZXh0QWxpZ24gPT09ICdlbmQnIHx8IHRleHRBbGlnbiA9PT0gJ3JpZ2h0JyA/IDEgOiB0ZXh0QWxpZ24gPT09ICdjZW50ZXInIHx8IHRleHRBbGlnbiA9PT0gJ21pZGRsZScgPyAwLjUgOiAwKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIGFuIHVub3JkZXJlZCBsaXN0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICovXG4gICAgbGlzdDogZnVuY3Rpb24oIHgsIHksIGl0ZW1zLCBvcHRpb25zICkge1xuICAgICAgcmV0dXJuIHRoaXMubGlzdGJveCh4LCB5LCAwLCAwLCBpdGVtcywgb3B0aW9ucyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIGFuIHVub3JkZXJlZCBsaXN0IGludG8gdGhlIHNwZWNpZmllZCBib3VuZHMuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICovXG4gICAgbGlzdGJveDogZnVuY3Rpb24oIHgsIHksIHdpZHRoLCBoZWlnaHQsIGl0ZW1zLCBvcHRpb25zICkge1xuICAgICAgaXRlbXMgPSB0b0FycmF5KGl0ZW1zKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnID8ge2xhYmVsOiBpdGVtfSA6IGl0ZW07XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoe30sIHtcbiAgICAgICAgaG9yaXpvbnRhbDogZmFsc2UsXG4gICAgICAgIGJ1bGxldDoge1xuICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJ1xuICAgICAgICB9XG4gICAgICB9LCBvcHRpb25zKTtcbiAgICAgIFxuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB0b3AgPSB5O1xuICAgICAgICBcbiAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgIFxuICAgICAgICAgIHZhclxuICAgICAgICAgICAgX3ZlbGVtID0gX3YoZWxlbSksXG4gICAgICAgICAgICBpdGVtT3B0cyA9IGV4dGVuZCh0cnVlLCB7fSwgb3B0aW9ucywgaXRlbSksXG4gICAgICAgICAgICBob3Jpem9udGFsID0gaXRlbU9wdHMuaG9yaXpvbnRhbCxcbiAgICAgICAgICAgIHNoYXBlID0gaXRlbU9wdHMuYnVsbGV0LnNoYXBlLFxuICAgICAgICAgICAgbGFiZWwgPSBpdGVtT3B0cy5sYWJlbCxcbiAgICAgICAgICAgIGJ1bGxldEF0dHJzLFxuICAgICAgICAgICAgaXRlbUxheWVyID0gX3ZlbGVtLmcoKSxcbiAgICAgICAgICAgIGxpbmVIZWlnaHQgPSBwYXJzZUZsb2F0KF92ZWxlbS5jc3MoJ2xpbmUtaGVpZ2h0JykpLFxuICAgICAgICAgICAgZm9udFNpemUgPSBwYXJzZUZsb2F0KF92ZWxlbS5jc3MoJ2ZvbnQtc2l6ZScpKSxcbiAgICAgICAgICAgIGJ1bGxldFNpemUgPSByb3VuZChmb250U2l6ZSAqIDAuNjUpLFxuICAgICAgICAgICAgc3BhY2luZyA9IGxpbmVIZWlnaHQgKiAwLjIsXG4gICAgICAgICAgICBpdGVtV2lkdGgsXG4gICAgICAgICAgICBpdGVtSGVpZ2h0O1xuICAgICAgICAgIFxuICAgICAgICAgIGRlbGV0ZSBpdGVtT3B0cy5idWxsZXQuc2hhcGU7XG4gICAgICAgICAgZGVsZXRlIGl0ZW1PcHRzLmhvcml6b250YWw7XG4gICAgICAgICAgZGVsZXRlIGl0ZW1PcHRzLmxhYmVsO1xuICAgICAgICAgIFxuICAgICAgICAgIGJ1bGxldEF0dHJzID0gZXh0ZW5kKHRydWUsIHt9LCBpdGVtT3B0cywgaXRlbU9wdHMuYnVsbGV0KTsgXG4gICAgICAgICAgXG4gICAgICAgICAgZGVsZXRlIGl0ZW1PcHRzLmJ1bGxldDtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoaGVpZ2h0ICYmIHkgKyBmb250U2l6ZSA+IHRvcCArIGhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZW5kZXIgYnVsbGV0XG4gICAgICAgICAgaWYgKHNoYXBlID09PSAnY2lyY2xlJykge1xuICAgICAgICAgICAgaXRlbUxheWVyLmNpcmNsZSh4ICsgYnVsbGV0U2l6ZSAvIDIsIHkgKyAoZm9udFNpemUgLSBidWxsZXRTaXplKSAvIDIgKyBidWxsZXRTaXplIC8gMiwgYnVsbGV0U2l6ZSAvIDIsIGJ1bGxldEF0dHJzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbUxheWVyLnJlY3QoeCwgcm91bmQoeSkgKyAoZm9udFNpemUgLSBidWxsZXRTaXplKSAvIDIsIGJ1bGxldFNpemUsIGJ1bGxldFNpemUsIGJ1bGxldEF0dHJzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gUmVuZGVyIGxhYmVsXG4gICAgICAgICAgaXRlbUxheWVyLnRleHRib3goeCArIGJ1bGxldFNpemUgKyBzcGFjaW5nLCB5LCB3aWR0aCA/IHdpZHRoIC0gYnVsbGV0U2l6ZSAtIHNwYWNpbmcgOiAwLCBoZWlnaHQgPyB0b3AgKyBoZWlnaHQgLSB5IDogMCwgbGFiZWwsIGl0ZW1PcHRzKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpdGVtV2lkdGggPSBNYXRoLmNlaWwoaXRlbUxheWVyLmJib3goKS53aWR0aCArIGZvbnRTaXplKTtcbiAgICAgICAgICBpdGVtSGVpZ2h0ID0gTWF0aC5yb3VuZChpdGVtTGF5ZXIuYmJveCgpLmhlaWdodCArIChsaW5lSGVpZ2h0IC0gZm9udFNpemUpKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoaG9yaXpvbnRhbCkge1xuICAgICAgICAgICAgeCs9IGl0ZW1XaWR0aDtcbiAgICAgICAgICAgIGlmICh3aWR0aCAmJiB4ID4gd2lkdGgpIHtcbiAgICAgICAgICAgICAgeSs9IGl0ZW1IZWlnaHQ7XG4gICAgICAgICAgICAgIHggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB5Kz0gaXRlbUhlaWdodDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG4gIFxuICByZXR1cm4gX3Y7XG4gIFxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBfdjsiXX0=
