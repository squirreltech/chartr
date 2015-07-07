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