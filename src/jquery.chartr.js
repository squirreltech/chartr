var
  lovechart = require('./chartr'),
  plugin = 'chartr';
  
module.exports = jQuery.fn[plugin] = function(options) {
  return this.each(function() {
    var instance = $(this).data(plugin);
    if (!instance) {
      instance = $(this).data(plugin, lovechart(this, options));
    } else {
      instance.options = options;
    }
    return $(this);
  });
};