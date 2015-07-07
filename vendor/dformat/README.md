# dformat

> Lightweight date formatting library.

## Locales

*en, de, fr, es, it, nl, tr, br, pt, bg, in, ro, mk, th*

## Usage

Include the library

```html
<script src="dformat.min.js"></script>
```

### Format

`dformat(date, pattern, locale)`

```js
var string = dformat(new Date('2015/09/17'), 'dd MMMM yyyy', 'fr');
console.log(string) // 17 septembre 2015
```


### Parse

`dformat(date, pattern, locale)`

```js
var date = dformat.parse('17 septembre 2015', 'dd MMMM yyyy', 'fr');
console.log(date.toString()) // Thu Sep 17 2015 00:00:00 GMT+0200 (CEST)
```

### Detect

`dformat(date, pattern, locale)`

```js
var format = dformat.detect(new Date('2015/09/17'), '17 septembre 2015');
console.log(format.pattern, format.locale) // dd MMMM yyyy fr
```

## Pattern identifiers

<table>
  <tr>
    <th>Pattern</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>yyyy</td>
    <td>Year with century</td>
  </tr>
  <tr>
    <td>yy</td>
    <td>Year without a century (00..99)</td>
  </tr>
  <tr>
    <td>MMMM</td>
    <td>The full month name ("January")</td>
  </tr>
  <tr>
    <td>MMM</td>
    <td>The abbreviated month name ("Jan")</td>
  </tr>
  <tr>
    <td>MM</td>
    <td>Month of the year (01..12)</td>
  </tr>
  <tr>
    <td>M</td>
    <td>Month of the year, blank-padded (1..31)</td>
  </tr>
  <tr>
    <td>dddd</td>
    <td>The full weekday name ("Sunday")</td>
  </tr>
  <tr>
    <td>ddd</td>
    <td>The abbreviated weekday name ("Sun")</td>
  </tr>
  <tr>
    <td>dd</td>
    <td>Day of the month (01..31)</td>
  </tr>
  <tr>
    <td>d</td>
    <td>Day of month, blank-padded (1..31)</td>
  </tr>
  <tr>
    <td>HH</td>
    <td>Hour of the day, 24-hour clock (00..23)</td>
  </tr>
  <tr>
    <td>H</td>
    <td>Hour of the day, 24-hour clock, blank-padded (0..23)</td>
  </tr>
  <tr>
    <td>hh</td>
    <td>Hour of the day, 12-hour clock (01..12)</td>
  </tr>
  <tr>
    <td>h</td>
    <td>Hour of the day, 12-hour clock, blank-padded (1..12)</td>
  </tr>
  <tr>
    <td>mm</td>
    <td>Minute of the hour (00..59)</td>
  </tr>
  <tr>
    <td>m</td>
    <td>Minute of the hour, blank-padded (0..59)</td>
  </tr>
  <tr>
    <td>ss</td>
    <td>Second of the minute (00..59)</td>
  </tr>
  <tr>
    <td>s</td>
    <td>Second of the minute, blank-padded (0..59)</td>
  </tr>
  <tr>
    <td>tt</td>
    <td>Meridian indicator ("AM" or "PM")</td>
  </tr>
  <tr>
    <td>t</td>
    <td>Meridian indicator, short notation ("A" or "P")</td>
  </tr>
  
</table>
  
  