function PrivCache(object, prop, getters) {
  var
    validated,
    validate = function() {
      var value = typeof prop === 'function' ? prop : function() {
        return typeof object[prop] === 'function' ? object[prop].call(object) : object[prop];
      };
      if (validated !== value) {
        validated = value;
        // Invalid
        data = {};
      }
    };
    data;
  this.get = function(prop) {
    validate();
    return data[prop] = data[prop] !== null && data[prop] != undefined ? data[prop] : getters[prop].call(object);
  };
}

module.exports = function(object, prop, getters) {
  return new PrivCache(object, prop, getters);
};