(function($) {
  
  /**
   * reads form elements into an array 
   * @param form
   * @returns {Array}
   */
  function getFormArray(form) {
    
    var elements = form.elements;
    var options = [];
    
    for (var i = 0; i < elements.length; i++) {
      
      var elem = elements[i];
      
      var name = elem.name;
      
      if (!name) continue;
      
      var value = elem.value;
      
      switch (elem.type) {
      
        case 'checkbox': 
          value = elem.checked;
          break;
          
        case 'number':
          value = parseFloat(elem.value);
          break;
          
        case 'radio': 
          if (!elem.checked) continue;
          break;
      }
      
      var split = name.replace(/\]/g, '').split(/\[/); 
      
      var obj = options;
  
      var prop = name;
      for (var s = 0; s < split.length; s++) {
        prop = split[s];
        prop = !isNaN(parseInt(prop)) && isFinite(prop) ? parseInt(prop) : prop;
        if (split.length > 1 && s < split.length - 1) {
          if (!obj[prop]) {
            obj[prop] = [];
          }
          obj = obj[prop];
        }
      }
      obj[prop] = value;
    }
    
    return options;
  }
  
  
  function arrayToObject(array) {
    var result = array instanceof Array && array.length > 0 ? [] : {};
    for (var x in array) {
      var value = array[x];
      result[x] = typeof value == 'object' || value instanceof Array ? arrayToObject(array[x]) : array[x];
    }
    return result;
  }
  
  function getFormObject(form) {
    return arrayToObject(getFormArray(form));
  }
  
  function setFormObject(form, options) {
    // TODO: implement
  }
  
  $.fn['formopts'] = function(options) {
    var result = {};
    this.each(function() {
      result = $.extend(result, getFormObject(this));
    });
    return result;
  };
  
})(jQuery);