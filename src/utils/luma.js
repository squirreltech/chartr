// http://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black 
function luma(color) {
  var r, g, b, c, rgb, result;
  var match = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (match) {
    r = parseFloat(match[1]);
    g = parseFloat(match[2]);
    b = parseFloat(match[3]);
  } else {
    c = color.replace(/^#/, '');      // strip #
    rgb = parseInt(c, 16);   // convert rrggbb to decimal
    r = (rgb >> 16) & 0xff;  // extract red
    g = (rgb >>  8) & 0xff;  // extract green
    b = (rgb >>  0) & 0xff;  // extract blue
  }
  result = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return result;
}

module.exports = luma;