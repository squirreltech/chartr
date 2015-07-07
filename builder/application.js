var
  welcomeFile = "junk_food.csv",
  pkgName = 'chartr',
  dataArray = [],
  $embedTypeOptions,
  cdn,
  embedCode = "";

function trimData(data) {
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
  return data;
}

function getScriptEmbed(options) {
  var cdn = getCDN();
  var json = JSON.stringify(options, null, 0);
  var id = "chartr-" + (new Date().getTime()).toString();
  var embed = "";
  embed+= "<script data-" + pkgName + "=\"" + id + "\">";
  embed+= "(function() {";
  embed+= "var s, d = document, m = document.querySelector(\"script[data-" + pkgName + "='" + id + "']\"),";
  embed+= "p = m.parentNode, r = function() {";
  embed+= "var e = d.createElement('div');";
  embed+= "p.insertBefore(e, m);";
  embed+= "p.removeChild(m);";
  embed+= "" + pkgName + "(e, " + json + ");";
  embed+= "};";
  // TODO: Test for existing script tags
  embed+= "if (typeof " + pkgName + " !== 'undefined') {";
  // Render immediately
  embed+= "r()";
  embed+= "} else {";
  // Load script
  embed+= "s = d.createElement('script');";
  embed+= "s.src = '" + cdn + "';";
  embed+= "d.documentElement.appendChild(s);";
  embed+= "s.onload = function() {";
  embed+= "r()";
  embed+= "}";
  embed+= "}";
  embed+= "})();";
  embed+= "</script>";
  return embed;
}
      
function renderChart() {
  
  var done = function(result) {
    var content = result.content;
    var type = result.type;
    var blob = new Blob([embedCode], {type: result.type + (result.type.match(/text/) ? ';charset=utf-8' : '')});
    var b = Number(blob.size);
    b = embedCode.length;
    var kb = b / 1000;
    $('#embed-size').html(kb.toFixed(2) + "kb");
  };
  
  $('#chart-view').html('');
  
  var chartOptions = $.extend($('#chart-options').formopts(), {
    data: dataArray,
  });
  
  // Clear
  $('#chart-view').html("");
  
  var embedOptions = $('#embed-options').formopts();
  var output = embedOptions.output;
  
  switch (output) {
    case 'script':
      embedCode = getScriptEmbed(chartOptions);
      $('#chart-view').html(embedCode);
      break;
    case 'image':
    case 'png':
    case 'html':
    
      chartr($('#chart-view')[0], chartOptions);
    
      var html = $.trim($('#chart-view').html());
    
      if (output === 'image' || output === 'png') {

        var svgURI = 'data:image/svg+xml;base64,' + btoa(html);
        var img = document.createElement('img');
        
        img.onerror = function() {
        };
        
        img.onload = function() {
          
          if (output === 'png') {
            var w = img.naturalWidth;
            var h = img.naturalHeight;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            canvas.width = w;
            canvas.height = h;
            
            var scaleFactor;
            
            // Optimize for Retina
            scaleFactor = 2;
            
            if (scaleFactor > 1) {
              canvas.width = canvas.width * scaleFactor;
              canvas.height = canvas.height * scaleFactor;
              // update the context for the new canvas scale
              ctx = canvas.getContext("2d");
            }
            ctx.mozImageSmoothingEnabled = true;
            ctx.imageSmoothingEnabled = true;
            ctx.fillStyle= "#ffffff"; // sets color
            ctx.fillRect(0, 0, canvas.width, canvas.height); 
            ctx.drawImage(img, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
            var base64URI = canvas.toDataURL("image/png", 1);
            img = document.createElement('img');
            img.onload = function() {
              $('#chart-view').html('');
              $('#chart-view').append(img);
              embedCode = $('#chart-view').html();
              done({type: 'image/png', content: base64URI});
            };
            img.style.maxWidth = "600px";
            img.style.height = "auto";
            img.src = base64URI;
          } else {
            $('#chart-view').html('');
            $('#chart-view').append(img);
            embedCode = $('#chart-view').html();
            done({type: 'image/svg+xml;base64', content: embedCode});
          }
        };
        img.src = svgURI;
        
      }
      
      if (output === 'html') {
        embedCode = $('#chart-view').html();
      } else {
        embedCode = null;
      }
      break;
    
  }
  
  if (embedCode) {
    done({type: 'text/html', content: embedCode});
  }
 
}

function humanize(string) {
  return string
    .replace(/.*\/|\.[^.]*$/g, '')
    .replace(/\.[^/.]+$/, "")
    .replace(/_/g, ' ')
    .replace(/(\w+)/g, function(match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
}

function getCDN() {
  // Path must be root-relative
  var host = window.location.protocol + "//" + window.location.host;
  // Resolve
  var path = window.location.pathname + $("script[src*='chartr']")[0].getAttribute('src', -1);
  var parts = [];
  path.split("/").forEach(function(item) {
    if (item === '..' && parts[parts.length - 1]) {
      parts.splice(parts.length - 1, 2);
    } else {
      parts.push(item);
    }
  });
  var cdn = host + parts.join("/");
  return cdn;
}

$(function() {
  
  console.info("Welcome to Chartbuilder");
  
  $.ajax({
    type: "GET",
    url: welcomeFile,
    dataType: "text",
    success: function(data) {
      Papa.parse(data, {
        complete: function(result) {
          dataArray = trimData(result.data);
          // Update title with humanized filename
          var title = humanize(welcomeFile.split("/").pop().split(".").shift());
          $("#chart-options [name=title]").val(title);
          renderChart();
        }
      });
    },
    error: function() {
      console.error("error loading file...");
    }
  });
 
  $embedTypeOptions = $('#embed-type').children();
  
  var formOpts = $('#embed-options').formopts();
 
  $('#embed-options').find('label').removeClass('active');
  $('#embed-options').find("input[value='" + formOpts.output + "']").parents('label').addClass('active');
  $('#chart-options, #embed-options').on('submit', function(e) {
    e.preventDefault();
  }).on('change', function() {
    renderChart();
  });
 
  $("select").selectpicker();
 
  $("input[name='data-source']").fileinput({
    browseClass: "btn btn-primary",
    showCaption: false,
    showRemove: false,
    showPreview: false,
    showUpload: false,
    allowedFileExtensions: ['csv'] 
  }).on('fileloaded', function(event, file, previewId, index, reader) {
    reader.onload = function(e) {
      var result = Papa.parse(reader.result);
      if (result.data) {
        dataArray = trimData(result.data);
        // Update title with humanized filename
        var title = humanize(file.name.split("/").pop().split(".").shift());
        $("#chart-options [name=title]").val(title);
        renderChart();
      }
    };
    reader.readAsText(file);
  });
  
  
  $('#show-embed').on('click', function(e) {
    window.prompt ("Copy to clipboard: Ctrl+C and press Enter", embedCode);
  });
  
});