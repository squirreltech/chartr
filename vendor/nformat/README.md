# nformat

> Lightweight number formatting library.

## Locales

*en, th, de, ro, fr, es, br, bg, it, nl, pt, in, mk, tr*

## Usage

Include the library

```html
<script src="nformat.min.js"></script>
```

### Format

`nformat(number, pattern, locale)`


```js
var string = nformat(1234567.89, '#,###.##', 'fr');
console.log(string) // 1 234 567,89
```


### Parse

`nformat.parse(string, pattern, locale)`


```js
var number = nformat.parse('1 234 567,89', '#,###.#', 'fr');
console.log(number) // 1234567.89
```


### Detect

`nformat.detect(number, string)`

```js
var format = nformat.detect(1234567.89, '1 234 567,89');
console.log(format.pattern, format.locale) // #,###.## fr
```


## Pattern identifiers

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>0</td>
    <td>Digit</td>
  </tr>
  <tr>
    <td>#</td>
    <td>Digit, zero shows as absent</td>
  </tr>
  <tr>
    <td>.</td>
    <td>Decimal separator or monetary decimal separator</td>
  </tr>
  <tr>
    <td>-</td>
    <td>Minus sign</td>
  </tr>
  <tr>
    <td>,</td>
    <td>Grouping separator</td>
  </tr>
  <tr>
    <td>%</td>
    <td>Multiply by 100 and show as percentage </td>
  </tr>
</table>
