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