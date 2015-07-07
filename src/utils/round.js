module.exports = function round(num, digits) {
  digits = typeof digits === 'number' ? digits : 1;
  var value = parseFloat(num);
  if (!isNaN(value) && new String(value).length === new String(num).length) {
    value = parseFloat(value.toFixed(digits));
    return value;
  }
  return num;
};