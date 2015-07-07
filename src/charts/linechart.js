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