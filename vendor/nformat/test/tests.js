var tn = "123.456";
var pn = nformat.parse(tn, 'de');
var dt = nformat.detect(pn, tn);
var hn = pn * 20;
console.info(nformat.detect(133.23, "133,23"));
console.log("detect: ", tn, pn, dt, nformat(hn, dt.pattern, dt.locale));
var
  number = 1234567.89,
  pattern = '#,###.#',
  locale = 'fr';
  
console.info("input: ", number, pattern, locale);

test("format", function(assert) {

  var formatted = nformat(number, pattern, locale);
  
  console.log("format: ", formatted);
  
  assert.equal(formatted, "1 234 567,9", "Formatted value should match expected results");
  
});

test("parse", function(assert) {
  
  var formatted = nformat(number, pattern, locale);
  var parsed =  nformat.parse(formatted, pattern);
  
  console.log("parse: ", parsed);
  
  assert.equal(parsed, number.toFixed(1), "Parsed value should match input value");
});

test("detect", function(assert) {
  
  var formatted = nformat(number, pattern, locale);
  var parsed =  nformat.parse(formatted, pattern);
  var detected = nformat.detect(parsed, formatted);
  
  console.log("detect: ", detected);
  
  assert.deepEqual( [detected.pattern, detected.locale], [pattern, locale], "Detected pattern and locale should match the corresponding input values");
});