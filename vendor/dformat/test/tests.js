var
  date = new Date("2015/01/05 23:12:44"),
  pattern = "yyyy-* *MM-dd ** *132ö adkj hh:mm:ss tt sfd MMMM",
  locale = "fr";

console.info("input: ", date, pattern, locale);

test("format", function(assert) {
  
  var formatted = dformat(date, pattern, locale);
  
  console.log("format: ", formatted);
  
  assert.equal(formatted, "2015-* *01-05 ** *132ö adkj 11:12:44 PM sfd janvier", "Value should match expected result");
  
});


test("parse", function(assert) {
  
  var formatted = dformat(date, pattern, locale);
  var parsed = dformat.parse(formatted, pattern, locale);
  
  console.log("parse: ", parsed);
  
  assert.equal(parsed.valueOf(), date.valueOf(), "Parsed date should match input date");
  
});

test("detected", function(assert) {
  
  var formatted = dformat(date, pattern, locale);
  var parsed = dformat.parse(formatted, pattern, locale);
  var detected = dformat.detect(date, formatted);
  
  console.log("detect: ", detected);
  
  assert.deepEqual([detected.pattern, detected.locale], [pattern, locale], "Detected pattern and locale should match the corresponding input values");
  
});
