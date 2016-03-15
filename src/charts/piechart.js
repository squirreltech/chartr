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
        // Select numbers, exclude category axis
        if (dataTable.getColumnType(columnIndex) === 'number' && (!hasColumnLabels(dataTable) || dataTable.getColumnLabel(columnIndex))) {
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

function hasColumnLabels(dataTable) {
  // Column based values
  for (columnIndex = 0; columnIndex < dataTable.getNumberOfColumns(); columnIndex++) {
    if (dataTable.getColumnType(columnIndex) === 'number') {
      return true;
    }
  }
  return false;
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
            if (dataTable.getColumnType(columnIndex) === 'number' && (!hasColumnLabels(dataTable) || dataTable.getColumnLabel(columnIndex))) {
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