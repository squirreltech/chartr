var
  _v = require("../../vendor/visualist/src/visualist"),
  nticks = require("../utils/nticks"),
  dticks = require("../utils/dticks"),
  luma = require("../utils/luma"),
  nformat = require("../../vendor/nformat/src/nformat"),
  CartesianChart = require('./cartesianchart');

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
      _this = this,
      stacked = this.stacked,
      dataTable = this.dataTable,
      options = this.options,
      chartLayer = this.chartLayer,
      chartBox = this.chartBox,
      columnIndex = this.columnIndex,
      rowIndex = 0,
      valueIndex = 0,
      valueRange = this.valueRange,
      //valueRange = dataTable.getColumnRange(this.valueIndices),
      valueTicks = this.valueTicks,
      valueMin = valueRange.min,
      valueMax = valueRange.max,
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
    
    var columnWidth = Math.min(50, stacked || this.valueIndices.length <= 1 ? tickWidth : Math.max(1, tickWidth / dataTable.getNumberOfColumns()));
    
    var m = 1;
   
    var currentNumberOfRows = 0;
    var currentTotals = [];

    graphLayer = chartLayer.g({
      //fill: options.colors[valueIndex % options.colors.length]
    });
    
    var normalizedValueZero = 0;
    if (valueMin < 0 && valueMax > 0) {
      normalizedValueZero = (0 - valueMin) / (valueMax - valueMin);
    }
    
    var normalizedCategoryZero = 0;
    if (categoryMin < 0 && categoryMax > 0) {
      normalizedCategoryZero = (0 - categoryMin) / (categoryMax - categoryMin);
    }
    
    for (rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      currentNumberOfRows++;
      var step = rowIndex % m === 0;
      
      // Loop through columns and add values to totals
      for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
        
        if (columnIndex !== categoryIndex) {
          
          var value = rows[rowIndex][columnIndex];
          currentTotals[columnIndex] = currentTotals[columnIndex] || 0;
          if (!isNaN(parseInt(value))) {
            currentTotals[columnIndex]+= value;
          }
        }
      }
      
      if (step) {
        
        // Actually render this step by taking average values of passed rows
        var posRowTotal = 0;
        var negRowTotal = 0;
        // Positive and negative sums of currently rendered columns in pixels
        var ysp = 0;
        var ysn = 0;
      
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
        
          if (columnIndex !== categoryIndex) {
            
            var value = currentTotals[columnIndex] / currentNumberOfRows;
            if (value >= 0) {
              posRowTotal+= value;
            } else {
              negRowTotal+= Math.abs(value);
            }
            
          }
        }
        
        var prv = (posRowTotal - valueMin) / (valueMax - valueMin);
        var nrv = (-negRowTotal - valueMin) / (valueMax - valueMin);
        
        var valueIndex = 0;
        
        categoryValue = categoryType === 'string' ? rowIndex : rows[rowIndex][categoryIndex];
        normalizedCategoryValue = (categoryValue - categoryMin) / ( categoryMax - categoryMin);
      
        // Loop through columns
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          
          if (columnIndex !== categoryIndex) {
            
            points = [];
            var value = currentTotals[columnIndex] / currentNumberOfRows;
            
            var w = columnWidth;
            
            normalizedValue = (value - valueMin) / (valueMax - valueMin);
            
            var xv = normalizedCategoryValue;
            var yv = normalizedValue;
            var zv = normalizedValueZero;
            
            var cw = flipAxes ? chartBox.width : chartBox.width - tickWidth;
            var ch = flipAxes ? chartBox.height - tickWidth : chartBox.height;
            
            // Calculate column offset
            var o = (stacked || this.valueIndices.length <= 1 ? (tickWidth - columnWidth) / 2 : columnWidth / 2 + valueIndex * columnWidth);
            var ox = flipAxes ? 0 : o;
            var oy = flipAxes ? o : 0;

            var x = xv * cw + ox;
            var y = ch - yv * ch + oy;
            
            var hv = zv - yv;
           
            var sv = zv;
            if (stacked) {
              if (value >= 0) {
                sv = prv + hv + ysp;
              } else {
                sv = zv - ysn;
              }
            }
            
            y = ch - sv * ch;
            h = hv * ch;
            
            if (value >= 0) {
              ysp+= hv;
            } else {
              ysn+= hv;
            }

            if (flipAxes) {
              h = w;
              w = (yv - sv) * cw;
              x = zv * cw;
              y = xv * ch + oy;
            }

            var 
              x1 = x,
              y1 = y,
              x2 = x + w,
              y2 = y + h,
              fill = options.colors[valueIndex % options.colors.length],
              textColor;
              
            graphLayer.path('M' + x1 +',' + y1 + ' ' + x2 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x1 + ',' + y2, {fill: fill});
            
            // Setup Label
            var label, format = _this.valueFormat;
            if (this.valueType === "number") {
              label = nformat(value, format.pattern, format.locale);
            } else if (this.valueType === "date") {
              label = dformat(value, format.pattern, format.locale);
            } else {
              label = value;
            }
            
            var text = graphLayer.create("text", {
              x: x + w / 2, 
              y: y + h / 2,
              dy: "0.4em",
              textAnchor: 'middle',
            }).append(document.createTextNode(label)).appendTo(graphLayer);
            
            var bounds = text.bbox();
            if (bounds.x < x1 || bounds.x + bounds.width > x2 || bounds.y < y2 || bounds.y + bounds.height > y1) {
              text.remove();
            } else {
              textColor = text.css('fill');
              var ld = luma(fill) - luma(textColor);
              if (ld < 92) {
                // If contrast is too small, use bright color
                text.css('fill', '#fff');
              }
            }
            
            valueIndex++;
            
          }
          
          
            
        }
        
        // Reset step
        currentNumberOfRows = 0;
        currentTotals = [];
        
      }
    }
  }
});

Object.defineProperties(ColumnChart.prototype, {
  clipCategoryGrid: {
    value: true
  },
  categoryGridLines: {
    value: false
  },
  stacked: {
    value: false
  },
  valueRange: {
    get: function() {
      if (!this.dataTable) {
        return;
      }
      var
        dataTable = this.dataTable,
        result = {min: 0, max: 0},
        columnIndex,
        categoryIndex = this.categoryIndex,
        range;
      if (dataTable) {
        for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
          if (columnIndex !== categoryIndex) {
            range = dataTable.getColumnRange(columnIndex);
            if (this.stacked) {
              result.min+= range.min < 0 ? range.min : 0;
              result.max+= range.max >= 0 ? range.max : 0;
            } else {
              result.min = typeof result.min === 'undefined' ? range.min : Math.min(result.min, range.min);
              result.max = typeof result.max === 'undefined' ? range.max : Math.max(result.max, range.max);
            }
          }
        };
      }
      return result;
    }
  },
  
});


module.exports = ColumnChart;