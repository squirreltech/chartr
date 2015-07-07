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