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