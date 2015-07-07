test("piechart", function(assert) {
  
  chartr('.piechart', {
    type: 'pie',
    title: 'Junk Food',
    data: [
      ['Pizza', 'Burger', 'Hot Dog'],
      ['45%', '39%', '28%']
    ]
  });
    
  assert.domEqual(
    $('.piechart'),
    $('<div class="piechart"><svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 600 400" style="fill: rgb(51, 51, 51); max-width: 100%; max-height: 400px; height: auto" font-family="Arial" font-size="12" height="400" width="600" xmlns="http://www.w3.org/2000/svg"><g transform="translate(120,45)"><text y="-2" x="0" text-anchor="start" style="font-size: 120%">Junk Food</text></g><g transform="translate(120,52)"><g><circle r="3.9" cy="6" cx="3.9" fill="#287CCE"></circle><text y="0" x="11.2" fill="rgb(51, 51, 51)"><tspan x="11" dy="10">Pizza</tspan></text></g><g><circle r="3.9" cy="6" cx="56.9" fill="#963A74"></circle><text y="0" x="64.2" fill="rgb(51, 51, 51)"><tspan x="64" dy="10">Burger</tspan></text></g><g><circle r="3.9" cy="6" cx="116.9" fill="#48E387"></circle><text y="0" x="124.2" fill="rgb(51, 51, 51)"><tspan x="124" dy="10">Hot Dog</tspan></text></g></g><g transform="translate(120,80)"><g style="font-size: 11px"><text y="82.1" x="298.9" dy="0.7em" dx="0.1em" text-anchor="middle">45%</text><text y="230.9" x="122.7" dy="0.7em" dx="0.1em" text-anchor="middle">39%</text><text y="31.7" x="91.7" dy="0.7em" dx="0.1em" text-anchor="middle">28%</text></g><circle r="105.6" cy="120" cx="180" fill="lightgray"></circle><g fill="#287CCE"><path d="M 180, 120 L180,14.4 A105.5625,105.5625 0 0,1 241.1,206.1 Z"></path></g><g fill="#963A74"><path d="M 180, 120 L241.1,206.1 A105.5625,105.5625 0 0,1 74.4,120 Z"></path></g><g fill="#48E387"><path d="M 180, 120 L74.4,120 A105.5625,105.5625 0 0,1 180,14.4 Z"></path></g></g></svg></div>'),
    'Markup should match the expected results'
  );
  
});

test("columnchart", function(assert) {
  
  chartr('.columnchart', {
    type: 'column',
    title: 'Junk Food',
    data: [
      ['Pizza', '46%'],
      ['Burger', '38%'],
      ['Hot Dog', '-14%']
    ]
  });
    
  assert.domEqual(
    $('.columnchart'),
    $('<div class="columnchart"><svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 600 400" style="fill: rgb(51, 51, 51); max-width: 100%; max-height: 400px; height: auto" font-family="Arial" font-size="12" height="400" width="600" xmlns="http://www.w3.org/2000/svg"><g transform="translate(120,73)"><text y="-2" x="0" text-anchor="start" style="font-size: 120%">Junk Food</text></g><g transform="translate(120,80)"><g style="font-size: 90%"><text text-anchor="middle" dy="0.4em" y="253" x="60">Pizza</text><text text-anchor="middle" dy="0.4em" y="253" x="180">Burger</text><text text-anchor="middle" dy="0.4em" y="253" x="300">Hot Dog</text><text text-anchor="end" dy="0.4em" y="240" x="-13">-20%</text><path d="M 0 180 L360 180" stroke-opacity="0.75" stroke="lightgray"></path><text text-anchor="end" dy="0.4em" y="180" x="-13">0%</text><text text-anchor="end" dy="0.4em" y="120" x="-13">20%</text><text text-anchor="end" dy="0.4em" y="60" x="-13">40%</text><text text-anchor="end" dy="0.4em" y="0" x="-13">60%</text><path d="M 0 240 L360 240M 0 120 L360 120M 0 60 L360 60M 0 0 L360 0" stroke-opacity="0.25" stroke="lightgray"></path></g><g fill="#287CCE"><path d="M30,180 90,180 90,42 30,42"></path><path d="M150,180 210,180 210,66 150,66"></path><path d="M270,180 330,180 330,222 270,222"></path></g></g></svg></div>'),
    'Markup should match the expected results'
  );
  
});

test("barchart", function(assert) {
  
  chartr('.barchart', {
    type: 'bar',
    title: 'Junk Food',
    data: [
      ['Pizza', '46%'],
      ['Burger', '38%'],
      ['Hot Dog', '-14%']
    ]
  });
    
  assert.domEqual(
    $('.barchart'),
    $('<div class="barchart"><svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 600 400" style="fill: rgb(51, 51, 51); max-width: 100%; max-height: 400px; height: auto" font-family="Arial" font-size="12" height="400" width="600" xmlns="http://www.w3.org/2000/svg"><g transform="translate(120,73)"><text y="-2" x="0" text-anchor="start" style="font-size: 120%">Junk Food</text></g><g transform="translate(120,80)"><g style="font-size: 90%"><text text-anchor="end" dy="0.4em" y="40" x="-13">Pizza</text><text text-anchor="end" dy="0.4em" y="120" x="-13">Burger</text><text text-anchor="end" dy="0.4em" y="200" x="-13">Hot Dog</text><text text-anchor="middle" dy="0.4em" y="253" x="0">-20%</text><path d="M 90 0 L90 240" stroke-opacity="0.75" stroke="lightgray"></path><text text-anchor="middle" dy="0.4em" y="253" x="90">0%</text><text text-anchor="middle" dy="0.4em" y="253" x="180">20%</text><text text-anchor="middle" dy="0.4em" y="253" x="270">40%</text><text text-anchor="middle" dy="0.4em" y="253" x="360">60%</text><path d="M 0 0 L0 240M 180 0 L180 240M 270 0 L270 240M 360 0 L360 240" stroke-opacity="0.25" stroke="lightgray"></path></g><g fill="#287CCE"><path d="M90,20 297,20 297,60 90,60"></path><path d="M90,100 261,100 261,140 90,140"></path><path d="M90,180 27,180 27,220 90,220"></path></g></g></svg></div><div class="linechart"></div><div class="tablechart"></div>'),
    'Markup should match the expected results'
  );
  
});

test("linechart", function(assert) {
  
  chartr('.linechart', {
    type: 'line',
    title: 'Junk Food',
    legend: 'right',
    smooth: true,
    data: [
      ['Date', 'Pizza', 'Burger', 'Hot Dog'],
      ['April 2012', '20,030.32', '39,321.78', '54,179.12'],
      ['September 2012', '22,991.12', '32,754.32', '51,912.54'],
      ['January 2013', '28,298.67', '30,202.91', '47,874.08'],
      ['June 2013', '34,781.27', '22,661.13', '41,129.76'],
      ['March 2014', '39,122.88', '18,783.44', '46,957.54'],
      ['July 2015', '47,876.31', '16,121.98', '51,076.13'],
    ]
  });
    
  assert.domEqual(
    $('.linechart'),
    $('<div class="linechart"><svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 600 400" style="fill: rgb(51, 51, 51); max-width: 100%; max-height: 400px; height: auto" font-family="Arial" font-size="12" height="400" width="600" xmlns="http://www.w3.org/2000/svg"><g transform="translate(120,73)"><text y="-2" x="0" text-anchor="start" style="font-size: 120%">Junk Food</text></g><g transform="translate(487,80)"><g><circle r="3.9" cy="6" cx="3.9" fill="#287CCE"></circle><text y="0" x="11.2" fill="rgb(51, 51, 51)"><tspan x="11" dy="10">Pizza</tspan></text></g><g><circle r="3.9" cy="25" cx="3.9" fill="#963A74"></circle><text y="19" x="11.2" fill="rgb(51, 51, 51)"><tspan x="11" dy="10">Burger</tspan></text></g><g><circle r="3.9" cy="44" cx="3.9" fill="#48E387"></circle><text y="38" x="11.2" fill="rgb(51, 51, 51)"><tspan x="11" dy="10">Hot Dog</tspan></text></g></g><g transform="translate(120,80)"><g style="font-size: 90%"><text text-anchor="middle" dy="0.4em" y="253" x="83">January 2013</text><text text-anchor="middle" dy="0.4em" y="253" x="194">January 2014</text><text text-anchor="middle" dy="0.4em" y="253" x="305">January 2015</text><text text-anchor="end" dy="0.4em" y="240" x="-13">10,000</text><text text-anchor="end" dy="0.4em" y="192" x="-13">20,000</text><text text-anchor="end" dy="0.4em" y="144" x="-13">30,000</text><text text-anchor="end" dy="0.4em" y="96" x="-13">40,000</text><text text-anchor="end" dy="0.4em" y="48" x="-13">50,000</text><text text-anchor="end" dy="0.4em" y="0" x="-13">60,000</text><path d="M 83 0 L83 240M 194 0 L194 240M 305 0 L305 240M 0 240 L360 240M 0 192 L360 192M 0 144 L360 144M 0 96 L360 96M 0 48 L360 48M 0 0 L360 0" stroke-opacity="0.25" stroke="lightgray"></path></g><g><path d="M0 192 Q46 178 64.5 165 Q83 152 106 136.5 Q129 121 170.5 110.5 Q212 100 286 79 T360 58 " stroke-width="1.5" stroke="#287CCE" fill="none"></path><path d="M0 99 Q46 131 64.5 137 Q83 143 106 161 Q129 179 170.5 188.5 Q212 198 286 204.5 T360 211 " stroke-width="1.5" stroke="#963A74" fill="none"></path><path d="M0 28 Q46 39 64.5 48.5 Q83 58 106 74.5 Q129 91 170.5 77 Q212 63 286 53 T360 43 " stroke-width="1.5" stroke="#48E387" fill="none"></path></g></g></svg></div>'),
    'Markup should match the expected results'
  );
  
});

test("tablechart", function(assert) {
  
  chartr('.tablechart', {
    type: 'table',
    title: 'Junk Food',
    data: [
      ['Date', 'Pizza', 'Burger', 'Hot Dog'],
      ['April 2012', '20,030.32', '39,321.78', '54,179.12'],
      ['September 2012', '22,991.12', '32,754.32', '51,912.54'],
      ['January 2013', '28,298.67', '30,202.91', '47,874.08'],
      ['June 2013', '34,781.27', '22,661.13', '41,129.76'],
      ['March 2014', '39,122.88', '18,783.44', '46,957.54'],
      ['July 2015', '47,876.31', '16,121.98', '51,076.13'],
    ]
  });
    
  assert.domEqual(
    $('.tablechart'),
    $('<div class="tablechart"><table style="font-size: 12px; border-collapse: collapse; border: 1px solid rgb(239, 239, 239); margin-bottom: 1.5em; width: 600px; max-width: 100%; display: table; table-layout: fixed;"><caption style="font-size: 120%; color: inherit; text-align: left;">Junk Food</caption><thead><tr><th style="border: 1px solid rgb(223, 223, 223); text-align: center; background-color: rgb(239, 239, 239); word-wrap: break-word; padding: 5px;">Date</th><th style="border: 1px solid rgb(223, 223, 223); text-align: center; background-color: rgb(239, 239, 239); word-wrap: break-word; padding: 5px;">Pizza</th><th style="border: 1px solid rgb(223, 223, 223); text-align: center; background-color: rgb(239, 239, 239); word-wrap: break-word; padding: 5px;">Burger</th><th style="border: 1px solid rgb(223, 223, 223); text-align: center; background-color: rgb(239, 239, 239); word-wrap: break-word; padding: 5px;">Hot Dog</th></tr></thead><tbody><tr><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">April 2012</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">20,030.32</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">39,321.78</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">54,179.12</td></tr><tr><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">September 2012</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">22,991.12</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">32,754.32</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">51,912.54</td></tr><tr><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">January 2013</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">28,298.67</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">30,202.91</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">47,874.08</td></tr><tr><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">June 2013</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">34,781.27</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">22,661.13</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">41,129.76</td></tr><tr><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">March 2014</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">39,122.88</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">18,783.44</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; word-wrap: break-word; padding: 5px;">46,957.54</td></tr><tr><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">July 2015</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">47,876.31</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">16,121.98</td><td style="border: 1px solid rgb(239, 239, 239); text-align: center; background-color: rgb(250, 250, 250); word-wrap: break-word; padding: 5px;">51,076.13</td></tr></tbody></table></div>'),
    'Markup should match the expected results'
  );
  
});
