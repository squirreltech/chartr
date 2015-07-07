# Chartr
> Lightweight SVG Chart Library


* Renders slim and embedabble SVG-Code 
* Supports standard CSV array as input data
* Column types and locale format patterns are automatically detected and parsed from input data
* Less configuration, more fun!

[Demo](http://squirreltech.github.io/chartr)

## Usage

Include the library

```html
<script src="chartr.js"></script>
```


### PieChart


```html
<div class="piechart"></div>
```

```js
chartr('.piechart', {
  type: 'pie',
  title: 'Junk Food',
  data: [
    ['Pizza', 'Burger', 'Hot Dog'],
    ['46%', '39%', '28%']
  ]
}) 
```


### ColumnChart


```html
<div class="columnchart"></div>
```

```js
chartr('.columnchart', {
  type: 'column',
  title: 'Junk Food',
  data: [
    ['Pizza', '46%'],
    ['Burger', '38%'],
    ['Hot Dog', '-14%']
  ]
}) 
```

### BarChart


```html
<div class="barchart"></div>
```

```js
chartr('.barchart', {
  type: 'bar',
  title: 'Junk Food',
  data: [
    ['Pizza', '46%'],
    ['Burger', '38%'],
    ['Hot Dog', '-14%']
  ]
}) 
```


### LineChart


```html
<div class="linechart"></div>
```

```js
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
}) 
```

### TableChart


```html
<div class="tablechart"></div>
```

```js
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
}) 
```