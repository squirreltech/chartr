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