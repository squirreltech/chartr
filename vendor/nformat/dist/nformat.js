(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.nformat = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  "en": {
    "args": [
      ",",
      ".",
      0,
      ""
    ],
    "equals": "th"
  },
  "de": {
    "args": [
      ".",
      ",",
      0,
      " "
    ],
    "equals": "ro"
  },
  "fr": {
    "args": [
      " ",
      ",",
      0,
      " "
    ]
  },
  "es": {
    "args": [
      " ",
      ",",
      0,
      ""
    ],
    "equals": "br,bg"
  },
  "it": {
    "args": [
      ".",
      ",",
      0,
      ""
    ],
    "equals": "nl,pt,in,mk"
  },
  "tr": {
    "args": [
      ".",
      ",",
      1,
      ""
    ]
  }
};
},{}],2:[function(require,module,exports){
var i18n = require("./locales/all");


// Pad Right
function padRight( string, length, character ) {
  if (string.length < length) {
    return string + Array(length - string.length + 1).join(character || "0");
  }
  return string;
}
  
// Pad Left
function padLeft( string, length, character ) {
  if (string.length < length) {
    return Array(length - string.length + 1).join(character || "0") + string;
  }
  return strngi;
}
  
  
function toPrecision(n, sig) {
  if (n !== 0) {
    var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
  }
  return n;
}
  
function getLocaleData(locale) {
  if (i18n[locale]) {
    return i18n[locale];
  }
  for (var key in i18n) {
    if (i18n[key].equals && i18n[key].equals.split(",").indexOf(locale) >= 0) {
      return i18n[key];
    }
  };
}
  
  
var patternRegex = new RegExp(/^\s*(%|\w*)?([#0]*(?:(,)[#0]+)*)(?:(\.)([#0]+))?(%|\w*)?\s*$/);
  
  
function format(number, pattern, locale) {
  var localeData;
   
  for (var i = 1; i < arguments.length; i++) {
    if (typeof arguments[i] === "string" && arguments[i].match(/[a-z]{2}/)) {
      localeData = getLocaleData(arguments[i]);
      arguments[i] = undefined;
    } else {
      pattern = arguments[i];
    }
  }
    
  if (!localeData) {
    localeData = getLocaleData('en');
  } 
   
  pattern = pattern || "#,###.#";
   
  var
    args = localeData.args,
    style = "decimal",
    useGrouping = false,
    groupingWhitespace = " " || "\u00A0",
    groupingSeparator = args[0],
    radix = args[1],
    leadingUnit = args[2],
    unitSpace = args[3] ? "\u00A0" : "",
    length = number.toString().length,
    significantDigits = -1;
     
     var patternMatch = patternRegex.exec(pattern);
     
     var intPatternString = patternMatch && patternMatch[2].replace(/,/g, "") || "";
     var intPadMatch = intPatternString ? intPatternString.match(/^0*/) : null;
     
     var intPadLength = intPadMatch ? intPadMatch[0].length : 0;
     
     var decPatternString = patternMatch[5] || "";
     
     var decPadMatch = decPatternString ? decPatternString.match(/0*$/) : null;
     var decPadLength = decPadMatch ? decPadMatch[0].length : 0;
     
     var fractionDigits = decPatternString.length || 0;
     
     var significantFractionDigits = decPatternString.length - decPadLength;
     var significantDigits = (intPatternString.length - intPadLength) + fractionDigits;
     
     var isNegative = number < 0 ? true : 0;
     
     number = Math.abs(number);
     
     style = patternMatch[1] || patternMatch[patternMatch.length - 1] ? "percent" : style;
     useGrouping = patternMatch[3] ? true : useGrouping;
     
     unit = style === "percent" ? "%" : style === "currency" ? currency : "";
     
     significantDigits = Math.floor(number).toString().length + fractionDigits;
     if (fractionDigits > 0 && significantDigits > 0) {
       number = parseFloat(toPrecision(number, significantDigits).toString());
     }
     
     if (style === 'percent') {
       number = number * 100;
     }
     
   var
     intValue = parseInt(number),
     decValue = parseFloat((number - intValue).toPrecision(12));
   
   var decString = decValue.toString();
   
   decString = decValue.toFixed(fractionDigits);
   decString = decString.replace(/^0\./, "");
   decString = decString.replace(/0*$/, "");
   decString = decString ? decString : fractionDigits > 0 ? "0" : "";
   
   if (decPadLength) {
     decString = padRight(decString, fractionDigits, "0");
   }
   
   if ((decPadLength || decValue > 0) && fractionDigits > 0) {
     decString = radix + decString;
   } else {
     decString = "";
     intValue = Math.round(number);
   }
   
   var intString = intValue.toString();
   
   if (intPadLength > 0) {
     intString = padLeft(intString, intPatternString.length, "0");
   }
   
   if (useGrouping) {
     intString = intString.replace(/\B(?=(\d{3})+(?!\d))/g, groupingSeparator.replace(/\s/g, groupingWhitespace) || ",");
   }

   var numString = (isNegative ? "-" : "") + intString + decString;
     
   return unit ? leadingUnit ? unit + unitSpace + numString : numString + unitSpace + unit : numString;
 }

function isLocale(locale) {
  return (typeof locale === "string" && locale.match(/[a-z]{2}/));
}

function detect(string, pattern, locale) {

  var inputPattern = null;
  for (var a = 1; a < arguments.length; a++) {
    var arg = arguments[a];
    if (arg instanceof Array || isLocale(arg)) {
      locale = arg;
    } else if (!inputPattern) {
      inputPattern = arg;
    }
  }
  pattern = inputPattern;
  
  var locales = locale instanceof Array ? locale : locale ? [locale] : Object.keys(i18n);
  
  var patternMatch;
  var patternUnit;
   
  if (pattern) {
    patternMatch = patternRegex.exec(pattern);
    patternUnit = patternMatch ? patternMatch[1] || patternMatch[patternMatch.length - 1] : null;
  }
  
  var results = locales.map(function(locale) {
    
     var localeData = getLocaleData(locale);
     
     var result = {locale: locale, pattern: pattern, relevance: 0};
     var value = NaN;
     
     if (localeData) {
       var args = localeData.args;
       
       if (args) {
         
         var numberRegexPart = "([\+-]?\\d*(?:" + args[0].replace(/\./, "\\.").replace(/\s/, "\\s") + "\\d{3})*)(?:" + args[1].replace(/\./g, "\\.") + "(\\d*))?";
         var leadingUnit = args[2];
         var unitSpace = args[3];
         var unitSpaceRegexPart = "" + unitSpace.replace(/\s/, "\\s") + "";
         var unitRegexPart = "(%|[\w*])";
         var numberRegex = numberRegexPart, matchNumIndex = 1, matchUnitIndex = 3;
         
         var detectedPattern;
         
         if (leadingUnit) {
           numberRegex = "(?:" + unitRegexPart + unitSpaceRegexPart + ")?" + numberRegexPart;
           matchNumIndex = 2;
           matchUnitIndex = 1;
         } else {
           numberRegex = numberRegexPart + "(?:" + unitSpaceRegexPart + unitRegexPart + ")?";
         }
         
         var regex = new RegExp("^\\s*" + numberRegex + "\\s*$");
         var match = regex.exec(string);
         
         if (match) {
           
           var intString = match[matchNumIndex];
           var normalizedIntString = intString.replace(new RegExp(args[0].replace(/\./, "\\.").replace(/\s/, "\\s"), "g"), "");
           
           var decString = match[matchNumIndex + 1] || "";
           var unitMatch = match[matchUnitIndex];
           
           if (pattern && (!patternUnit && unitMatch)) {
             // Invalid because of unit
             return result;
           }
           
           value = parseFloat(normalizedIntString + (decString ? "." + decString : ""));
           
           if (unitMatch && unitMatch === "%") {
             value = parseFloat((value / 100).toPrecision(12));
           }
           
           result.relevance = match.filter(function(match) {
             return match;
           }).length * 10 + value.toString().length;
           
           
           var detectedPattern = "";
           if (!pattern) {
             detectedPattern = "#";
             
             if (value >= 1000 && intString.indexOf(args[0]) >= 0) {
               detectedPattern = "#,###";
             }
             
             if (decString.length) {
               detectedPattern+= "." + (new Array(decString.length + 1)).join( "#" );
             }
             
             if (unitMatch && unitMatch === "%") {
               detectedPattern+= "%";
             }
             result.pattern = detectedPattern;
             
           }
           
         }
         
       }
     }
     result.value = value;
     return result;
   }).filter(function(result) {
     return !isNaN(result.value);
   });
   
   // Unique values
   var filteredValues = [];
   results = results.filter(function(result) {
     if (filteredValues.indexOf(result.value) < 0) {
       filteredValues.push(result.value);
       return result;
     }
   });
   results.sort(function(a, b) {
     return a.relevance < b.relevance;
   });

  return results;
}



/* Interface */
function nformat(number, pattern, locale) {
  return format.apply(this, arguments);
}
 
nformat.parse = function(string, pattern, locale) {
  return detect.call(this, string, pattern, locale).map(function(result) {
    return result.value;
  })[0];
};

nformat.detect = function(number, string, pattern, locale) {
  if (typeof number === 'undefined') {
    // Cannot accurately determine pattern and locale
    return null;
  }
  return detect.call(this, string, pattern, locale).filter(function(result) {
    return typeof number !== 'number' || result.value === number;
  }).map(function(result) {
    return {
      locale: result.locale,
      pattern: result.pattern
    };
  })[0];
};


module.exports = nformat;
},{"./locales/all":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbG9jYWxlcy9hbGwuanMiLCJzcmMvbmZvcm1hdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJlblwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiLFwiLFxuICAgICAgXCIuXCIsXG4gICAgICAwLFxuICAgICAgXCJcIlxuICAgIF0sXG4gICAgXCJlcXVhbHNcIjogXCJ0aFwiXG4gIH0sXG4gIFwiZGVcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIi5cIixcbiAgICAgIFwiLFwiLFxuICAgICAgMCxcbiAgICAgIFwiIFwiXG4gICAgXSxcbiAgICBcImVxdWFsc1wiOiBcInJvXCJcbiAgfSxcbiAgXCJmclwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiIFwiLFxuICAgICAgXCIsXCIsXG4gICAgICAwLFxuICAgICAgXCIgXCJcbiAgICBdXG4gIH0sXG4gIFwiZXNcIjoge1xuICAgIFwiYXJnc1wiOiBbXG4gICAgICBcIiBcIixcbiAgICAgIFwiLFwiLFxuICAgICAgMCxcbiAgICAgIFwiXCJcbiAgICBdLFxuICAgIFwiZXF1YWxzXCI6IFwiYnIsYmdcIlxuICB9LFxuICBcIml0XCI6IHtcbiAgICBcImFyZ3NcIjogW1xuICAgICAgXCIuXCIsXG4gICAgICBcIixcIixcbiAgICAgIDAsXG4gICAgICBcIlwiXG4gICAgXSxcbiAgICBcImVxdWFsc1wiOiBcIm5sLHB0LGluLG1rXCJcbiAgfSxcbiAgXCJ0clwiOiB7XG4gICAgXCJhcmdzXCI6IFtcbiAgICAgIFwiLlwiLFxuICAgICAgXCIsXCIsXG4gICAgICAxLFxuICAgICAgXCJcIlxuICAgIF1cbiAgfVxufTsiLCJ2YXIgaTE4biA9IHJlcXVpcmUoXCIuL2xvY2FsZXMvYWxsXCIpO1xuXG5cbi8vIFBhZCBSaWdodFxuZnVuY3Rpb24gcGFkUmlnaHQoIHN0cmluZywgbGVuZ3RoLCBjaGFyYWN0ZXIgKSB7XG4gIGlmIChzdHJpbmcubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0cmluZyArIEFycmF5KGxlbmd0aCAtIHN0cmluZy5sZW5ndGggKyAxKS5qb2luKGNoYXJhY3RlciB8fCBcIjBcIik7XG4gIH1cbiAgcmV0dXJuIHN0cmluZztcbn1cbiAgXG4vLyBQYWQgTGVmdFxuZnVuY3Rpb24gcGFkTGVmdCggc3RyaW5nLCBsZW5ndGgsIGNoYXJhY3RlciApIHtcbiAgaWYgKHN0cmluZy5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICByZXR1cm4gQXJyYXkobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCArIDEpLmpvaW4oY2hhcmFjdGVyIHx8IFwiMFwiKSArIHN0cmluZztcbiAgfVxuICByZXR1cm4gc3RybmdpO1xufVxuICBcbiAgXG5mdW5jdGlvbiB0b1ByZWNpc2lvbihuLCBzaWcpIHtcbiAgaWYgKG4gIT09IDApIHtcbiAgICB2YXIgbXVsdCA9IE1hdGgucG93KDEwLCBzaWcgLSBNYXRoLmZsb29yKE1hdGgubG9nKG4pIC8gTWF0aC5MTjEwKSAtIDEpO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG4gKiBtdWx0KSAvIG11bHQ7XG4gIH1cbiAgcmV0dXJuIG47XG59XG4gIFxuZnVuY3Rpb24gZ2V0TG9jYWxlRGF0YShsb2NhbGUpIHtcbiAgaWYgKGkxOG5bbG9jYWxlXSkge1xuICAgIHJldHVybiBpMThuW2xvY2FsZV07XG4gIH1cbiAgZm9yICh2YXIga2V5IGluIGkxOG4pIHtcbiAgICBpZiAoaTE4bltrZXldLmVxdWFscyAmJiBpMThuW2tleV0uZXF1YWxzLnNwbGl0KFwiLFwiKS5pbmRleE9mKGxvY2FsZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIGkxOG5ba2V5XTtcbiAgICB9XG4gIH07XG59XG4gIFxuICBcbnZhciBwYXR0ZXJuUmVnZXggPSBuZXcgUmVnRXhwKC9eXFxzKiglfFxcdyopPyhbIzBdKig/OigsKVsjMF0rKSopKD86KFxcLikoWyMwXSspKT8oJXxcXHcqKT9cXHMqJC8pO1xuICBcbiAgXG5mdW5jdGlvbiBmb3JtYXQobnVtYmVyLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZURhdGE7XG4gICBcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1tpXSA9PT0gXCJzdHJpbmdcIiAmJiBhcmd1bWVudHNbaV0ubWF0Y2goL1thLXpdezJ9LykpIHtcbiAgICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGFyZ3VtZW50c1tpXSk7XG4gICAgICBhcmd1bWVudHNbaV0gPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdHRlcm4gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICB9XG4gICAgXG4gIGlmICghbG9jYWxlRGF0YSkge1xuICAgIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKCdlbicpO1xuICB9IFxuICAgXG4gIHBhdHRlcm4gPSBwYXR0ZXJuIHx8IFwiIywjIyMuI1wiO1xuICAgXG4gIHZhclxuICAgIGFyZ3MgPSBsb2NhbGVEYXRhLmFyZ3MsXG4gICAgc3R5bGUgPSBcImRlY2ltYWxcIixcbiAgICB1c2VHcm91cGluZyA9IGZhbHNlLFxuICAgIGdyb3VwaW5nV2hpdGVzcGFjZSA9IFwiIFwiIHx8IFwiXFx1MDBBMFwiLFxuICAgIGdyb3VwaW5nU2VwYXJhdG9yID0gYXJnc1swXSxcbiAgICByYWRpeCA9IGFyZ3NbMV0sXG4gICAgbGVhZGluZ1VuaXQgPSBhcmdzWzJdLFxuICAgIHVuaXRTcGFjZSA9IGFyZ3NbM10gPyBcIlxcdTAwQTBcIiA6IFwiXCIsXG4gICAgbGVuZ3RoID0gbnVtYmVyLnRvU3RyaW5nKCkubGVuZ3RoLFxuICAgIHNpZ25pZmljYW50RGlnaXRzID0gLTE7XG4gICAgIFxuICAgICB2YXIgcGF0dGVybk1hdGNoID0gcGF0dGVyblJlZ2V4LmV4ZWMocGF0dGVybik7XG4gICAgIFxuICAgICB2YXIgaW50UGF0dGVyblN0cmluZyA9IHBhdHRlcm5NYXRjaCAmJiBwYXR0ZXJuTWF0Y2hbMl0ucmVwbGFjZSgvLC9nLCBcIlwiKSB8fCBcIlwiO1xuICAgICB2YXIgaW50UGFkTWF0Y2ggPSBpbnRQYXR0ZXJuU3RyaW5nID8gaW50UGF0dGVyblN0cmluZy5tYXRjaCgvXjAqLykgOiBudWxsO1xuICAgICBcbiAgICAgdmFyIGludFBhZExlbmd0aCA9IGludFBhZE1hdGNoID8gaW50UGFkTWF0Y2hbMF0ubGVuZ3RoIDogMDtcbiAgICAgXG4gICAgIHZhciBkZWNQYXR0ZXJuU3RyaW5nID0gcGF0dGVybk1hdGNoWzVdIHx8IFwiXCI7XG4gICAgIFxuICAgICB2YXIgZGVjUGFkTWF0Y2ggPSBkZWNQYXR0ZXJuU3RyaW5nID8gZGVjUGF0dGVyblN0cmluZy5tYXRjaCgvMCokLykgOiBudWxsO1xuICAgICB2YXIgZGVjUGFkTGVuZ3RoID0gZGVjUGFkTWF0Y2ggPyBkZWNQYWRNYXRjaFswXS5sZW5ndGggOiAwO1xuICAgICBcbiAgICAgdmFyIGZyYWN0aW9uRGlnaXRzID0gZGVjUGF0dGVyblN0cmluZy5sZW5ndGggfHwgMDtcbiAgICAgXG4gICAgIHZhciBzaWduaWZpY2FudEZyYWN0aW9uRGlnaXRzID0gZGVjUGF0dGVyblN0cmluZy5sZW5ndGggLSBkZWNQYWRMZW5ndGg7XG4gICAgIHZhciBzaWduaWZpY2FudERpZ2l0cyA9IChpbnRQYXR0ZXJuU3RyaW5nLmxlbmd0aCAtIGludFBhZExlbmd0aCkgKyBmcmFjdGlvbkRpZ2l0cztcbiAgICAgXG4gICAgIHZhciBpc05lZ2F0aXZlID0gbnVtYmVyIDwgMCA/IHRydWUgOiAwO1xuICAgICBcbiAgICAgbnVtYmVyID0gTWF0aC5hYnMobnVtYmVyKTtcbiAgICAgXG4gICAgIHN0eWxlID0gcGF0dGVybk1hdGNoWzFdIHx8IHBhdHRlcm5NYXRjaFtwYXR0ZXJuTWF0Y2gubGVuZ3RoIC0gMV0gPyBcInBlcmNlbnRcIiA6IHN0eWxlO1xuICAgICB1c2VHcm91cGluZyA9IHBhdHRlcm5NYXRjaFszXSA/IHRydWUgOiB1c2VHcm91cGluZztcbiAgICAgXG4gICAgIHVuaXQgPSBzdHlsZSA9PT0gXCJwZXJjZW50XCIgPyBcIiVcIiA6IHN0eWxlID09PSBcImN1cnJlbmN5XCIgPyBjdXJyZW5jeSA6IFwiXCI7XG4gICAgIFxuICAgICBzaWduaWZpY2FudERpZ2l0cyA9IE1hdGguZmxvb3IobnVtYmVyKS50b1N0cmluZygpLmxlbmd0aCArIGZyYWN0aW9uRGlnaXRzO1xuICAgICBpZiAoZnJhY3Rpb25EaWdpdHMgPiAwICYmIHNpZ25pZmljYW50RGlnaXRzID4gMCkge1xuICAgICAgIG51bWJlciA9IHBhcnNlRmxvYXQodG9QcmVjaXNpb24obnVtYmVyLCBzaWduaWZpY2FudERpZ2l0cykudG9TdHJpbmcoKSk7XG4gICAgIH1cbiAgICAgXG4gICAgIGlmIChzdHlsZSA9PT0gJ3BlcmNlbnQnKSB7XG4gICAgICAgbnVtYmVyID0gbnVtYmVyICogMTAwO1xuICAgICB9XG4gICAgIFxuICAgdmFyXG4gICAgIGludFZhbHVlID0gcGFyc2VJbnQobnVtYmVyKSxcbiAgICAgZGVjVmFsdWUgPSBwYXJzZUZsb2F0KChudW1iZXIgLSBpbnRWYWx1ZSkudG9QcmVjaXNpb24oMTIpKTtcbiAgIFxuICAgdmFyIGRlY1N0cmluZyA9IGRlY1ZhbHVlLnRvU3RyaW5nKCk7XG4gICBcbiAgIGRlY1N0cmluZyA9IGRlY1ZhbHVlLnRvRml4ZWQoZnJhY3Rpb25EaWdpdHMpO1xuICAgZGVjU3RyaW5nID0gZGVjU3RyaW5nLnJlcGxhY2UoL14wXFwuLywgXCJcIik7XG4gICBkZWNTdHJpbmcgPSBkZWNTdHJpbmcucmVwbGFjZSgvMCokLywgXCJcIik7XG4gICBkZWNTdHJpbmcgPSBkZWNTdHJpbmcgPyBkZWNTdHJpbmcgOiBmcmFjdGlvbkRpZ2l0cyA+IDAgPyBcIjBcIiA6IFwiXCI7XG4gICBcbiAgIGlmIChkZWNQYWRMZW5ndGgpIHtcbiAgICAgZGVjU3RyaW5nID0gcGFkUmlnaHQoZGVjU3RyaW5nLCBmcmFjdGlvbkRpZ2l0cywgXCIwXCIpO1xuICAgfVxuICAgXG4gICBpZiAoKGRlY1BhZExlbmd0aCB8fCBkZWNWYWx1ZSA+IDApICYmIGZyYWN0aW9uRGlnaXRzID4gMCkge1xuICAgICBkZWNTdHJpbmcgPSByYWRpeCArIGRlY1N0cmluZztcbiAgIH0gZWxzZSB7XG4gICAgIGRlY1N0cmluZyA9IFwiXCI7XG4gICAgIGludFZhbHVlID0gTWF0aC5yb3VuZChudW1iZXIpO1xuICAgfVxuICAgXG4gICB2YXIgaW50U3RyaW5nID0gaW50VmFsdWUudG9TdHJpbmcoKTtcbiAgIFxuICAgaWYgKGludFBhZExlbmd0aCA+IDApIHtcbiAgICAgaW50U3RyaW5nID0gcGFkTGVmdChpbnRTdHJpbmcsIGludFBhdHRlcm5TdHJpbmcubGVuZ3RoLCBcIjBcIik7XG4gICB9XG4gICBcbiAgIGlmICh1c2VHcm91cGluZykge1xuICAgICBpbnRTdHJpbmcgPSBpbnRTdHJpbmcucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgZ3JvdXBpbmdTZXBhcmF0b3IucmVwbGFjZSgvXFxzL2csIGdyb3VwaW5nV2hpdGVzcGFjZSkgfHwgXCIsXCIpO1xuICAgfVxuXG4gICB2YXIgbnVtU3RyaW5nID0gKGlzTmVnYXRpdmUgPyBcIi1cIiA6IFwiXCIpICsgaW50U3RyaW5nICsgZGVjU3RyaW5nO1xuICAgICBcbiAgIHJldHVybiB1bml0ID8gbGVhZGluZ1VuaXQgPyB1bml0ICsgdW5pdFNwYWNlICsgbnVtU3RyaW5nIDogbnVtU3RyaW5nICsgdW5pdFNwYWNlICsgdW5pdCA6IG51bVN0cmluZztcbiB9XG5cbmZ1bmN0aW9uIGlzTG9jYWxlKGxvY2FsZSkge1xuICByZXR1cm4gKHR5cGVvZiBsb2NhbGUgPT09IFwic3RyaW5nXCIgJiYgbG9jYWxlLm1hdGNoKC9bYS16XXsyfS8pKTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0KHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG5cbiAgdmFyIGlucHV0UGF0dGVybiA9IG51bGw7XG4gIGZvciAodmFyIGEgPSAxOyBhIDwgYXJndW1lbnRzLmxlbmd0aDsgYSsrKSB7XG4gICAgdmFyIGFyZyA9IGFyZ3VtZW50c1thXTtcbiAgICBpZiAoYXJnIGluc3RhbmNlb2YgQXJyYXkgfHwgaXNMb2NhbGUoYXJnKSkge1xuICAgICAgbG9jYWxlID0gYXJnO1xuICAgIH0gZWxzZSBpZiAoIWlucHV0UGF0dGVybikge1xuICAgICAgaW5wdXRQYXR0ZXJuID0gYXJnO1xuICAgIH1cbiAgfVxuICBwYXR0ZXJuID0gaW5wdXRQYXR0ZXJuO1xuICBcbiAgdmFyIGxvY2FsZXMgPSBsb2NhbGUgaW5zdGFuY2VvZiBBcnJheSA/IGxvY2FsZSA6IGxvY2FsZSA/IFtsb2NhbGVdIDogT2JqZWN0LmtleXMoaTE4bik7XG4gIFxuICB2YXIgcGF0dGVybk1hdGNoO1xuICB2YXIgcGF0dGVyblVuaXQ7XG4gICBcbiAgaWYgKHBhdHRlcm4pIHtcbiAgICBwYXR0ZXJuTWF0Y2ggPSBwYXR0ZXJuUmVnZXguZXhlYyhwYXR0ZXJuKTtcbiAgICBwYXR0ZXJuVW5pdCA9IHBhdHRlcm5NYXRjaCA/IHBhdHRlcm5NYXRjaFsxXSB8fCBwYXR0ZXJuTWF0Y2hbcGF0dGVybk1hdGNoLmxlbmd0aCAtIDFdIDogbnVsbDtcbiAgfVxuICBcbiAgdmFyIHJlc3VsdHMgPSBsb2NhbGVzLm1hcChmdW5jdGlvbihsb2NhbGUpIHtcbiAgICBcbiAgICAgdmFyIGxvY2FsZURhdGEgPSBnZXRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gICAgIFxuICAgICB2YXIgcmVzdWx0ID0ge2xvY2FsZTogbG9jYWxlLCBwYXR0ZXJuOiBwYXR0ZXJuLCByZWxldmFuY2U6IDB9O1xuICAgICB2YXIgdmFsdWUgPSBOYU47XG4gICAgIFxuICAgICBpZiAobG9jYWxlRGF0YSkge1xuICAgICAgIHZhciBhcmdzID0gbG9jYWxlRGF0YS5hcmdzO1xuICAgICAgIFxuICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICBcbiAgICAgICAgIHZhciBudW1iZXJSZWdleFBhcnQgPSBcIihbXFwrLV0/XFxcXGQqKD86XCIgKyBhcmdzWzBdLnJlcGxhY2UoL1xcLi8sIFwiXFxcXC5cIikucmVwbGFjZSgvXFxzLywgXCJcXFxcc1wiKSArIFwiXFxcXGR7M30pKikoPzpcIiArIGFyZ3NbMV0ucmVwbGFjZSgvXFwuL2csIFwiXFxcXC5cIikgKyBcIihcXFxcZCopKT9cIjtcbiAgICAgICAgIHZhciBsZWFkaW5nVW5pdCA9IGFyZ3NbMl07XG4gICAgICAgICB2YXIgdW5pdFNwYWNlID0gYXJnc1szXTtcbiAgICAgICAgIHZhciB1bml0U3BhY2VSZWdleFBhcnQgPSBcIlwiICsgdW5pdFNwYWNlLnJlcGxhY2UoL1xccy8sIFwiXFxcXHNcIikgKyBcIlwiO1xuICAgICAgICAgdmFyIHVuaXRSZWdleFBhcnQgPSBcIiglfFtcXHcqXSlcIjtcbiAgICAgICAgIHZhciBudW1iZXJSZWdleCA9IG51bWJlclJlZ2V4UGFydCwgbWF0Y2hOdW1JbmRleCA9IDEsIG1hdGNoVW5pdEluZGV4ID0gMztcbiAgICAgICAgIFxuICAgICAgICAgdmFyIGRldGVjdGVkUGF0dGVybjtcbiAgICAgICAgIFxuICAgICAgICAgaWYgKGxlYWRpbmdVbml0KSB7XG4gICAgICAgICAgIG51bWJlclJlZ2V4ID0gXCIoPzpcIiArIHVuaXRSZWdleFBhcnQgKyB1bml0U3BhY2VSZWdleFBhcnQgKyBcIik/XCIgKyBudW1iZXJSZWdleFBhcnQ7XG4gICAgICAgICAgIG1hdGNoTnVtSW5kZXggPSAyO1xuICAgICAgICAgICBtYXRjaFVuaXRJbmRleCA9IDE7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICBudW1iZXJSZWdleCA9IG51bWJlclJlZ2V4UGFydCArIFwiKD86XCIgKyB1bml0U3BhY2VSZWdleFBhcnQgKyB1bml0UmVnZXhQYXJ0ICsgXCIpP1wiO1xuICAgICAgICAgfVxuICAgICAgICAgXG4gICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiXlxcXFxzKlwiICsgbnVtYmVyUmVnZXggKyBcIlxcXFxzKiRcIik7XG4gICAgICAgICB2YXIgbWF0Y2ggPSByZWdleC5leGVjKHN0cmluZyk7XG4gICAgICAgICBcbiAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgdmFyIGludFN0cmluZyA9IG1hdGNoW21hdGNoTnVtSW5kZXhdO1xuICAgICAgICAgICB2YXIgbm9ybWFsaXplZEludFN0cmluZyA9IGludFN0cmluZy5yZXBsYWNlKG5ldyBSZWdFeHAoYXJnc1swXS5yZXBsYWNlKC9cXC4vLCBcIlxcXFwuXCIpLnJlcGxhY2UoL1xccy8sIFwiXFxcXHNcIiksIFwiZ1wiKSwgXCJcIik7XG4gICAgICAgICAgIFxuICAgICAgICAgICB2YXIgZGVjU3RyaW5nID0gbWF0Y2hbbWF0Y2hOdW1JbmRleCArIDFdIHx8IFwiXCI7XG4gICAgICAgICAgIHZhciB1bml0TWF0Y2ggPSBtYXRjaFttYXRjaFVuaXRJbmRleF07XG4gICAgICAgICAgIFxuICAgICAgICAgICBpZiAocGF0dGVybiAmJiAoIXBhdHRlcm5Vbml0ICYmIHVuaXRNYXRjaCkpIHtcbiAgICAgICAgICAgICAvLyBJbnZhbGlkIGJlY2F1c2Ugb2YgdW5pdFxuICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdChub3JtYWxpemVkSW50U3RyaW5nICsgKGRlY1N0cmluZyA/IFwiLlwiICsgZGVjU3RyaW5nIDogXCJcIikpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgaWYgKHVuaXRNYXRjaCAmJiB1bml0TWF0Y2ggPT09IFwiJVwiKSB7XG4gICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KCh2YWx1ZSAvIDEwMCkudG9QcmVjaXNpb24oMTIpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgICAgcmVzdWx0LnJlbGV2YW5jZSA9IG1hdGNoLmZpbHRlcihmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgfSkubGVuZ3RoICogMTAgKyB2YWx1ZS50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgICAgICAgXG4gICAgICAgICAgIFxuICAgICAgICAgICB2YXIgZGV0ZWN0ZWRQYXR0ZXJuID0gXCJcIjtcbiAgICAgICAgICAgaWYgKCFwYXR0ZXJuKSB7XG4gICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuID0gXCIjXCI7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgaWYgKHZhbHVlID49IDEwMDAgJiYgaW50U3RyaW5nLmluZGV4T2YoYXJnc1swXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuID0gXCIjLCMjI1wiO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICBpZiAoZGVjU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgZGV0ZWN0ZWRQYXR0ZXJuKz0gXCIuXCIgKyAobmV3IEFycmF5KGRlY1N0cmluZy5sZW5ndGggKyAxKSkuam9pbiggXCIjXCIgKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgaWYgKHVuaXRNYXRjaCAmJiB1bml0TWF0Y2ggPT09IFwiJVwiKSB7XG4gICAgICAgICAgICAgICBkZXRlY3RlZFBhdHRlcm4rPSBcIiVcIjtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgcmVzdWx0LnBhdHRlcm4gPSBkZXRlY3RlZFBhdHRlcm47XG4gICAgICAgICAgICAgXG4gICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICB9XG4gICAgICAgICBcbiAgICAgICB9XG4gICAgIH1cbiAgICAgcmVzdWx0LnZhbHVlID0gdmFsdWU7XG4gICAgIHJldHVybiByZXN1bHQ7XG4gICB9KS5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgIHJldHVybiAhaXNOYU4ocmVzdWx0LnZhbHVlKTtcbiAgIH0pO1xuICAgXG4gICAvLyBVbmlxdWUgdmFsdWVzXG4gICB2YXIgZmlsdGVyZWRWYWx1ZXMgPSBbXTtcbiAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgaWYgKGZpbHRlcmVkVmFsdWVzLmluZGV4T2YocmVzdWx0LnZhbHVlKSA8IDApIHtcbiAgICAgICBmaWx0ZXJlZFZhbHVlcy5wdXNoKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgfVxuICAgfSk7XG4gICByZXN1bHRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICByZXR1cm4gYS5yZWxldmFuY2UgPCBiLnJlbGV2YW5jZTtcbiAgIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5cblxuLyogSW50ZXJmYWNlICovXG5mdW5jdGlvbiBuZm9ybWF0KG51bWJlciwgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHJldHVybiBmb3JtYXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiBcbm5mb3JtYXQucGFyc2UgPSBmdW5jdGlvbihzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuICByZXR1cm4gZGV0ZWN0LmNhbGwodGhpcywgc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9KVswXTtcbn07XG5cbm5mb3JtYXQuZGV0ZWN0ID0gZnVuY3Rpb24obnVtYmVyLCBzdHJpbmcsIHBhdHRlcm4sIGxvY2FsZSkge1xuICBpZiAodHlwZW9mIG51bWJlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBDYW5ub3QgYWNjdXJhdGVseSBkZXRlcm1pbmUgcGF0dGVybiBhbmQgbG9jYWxlXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGRldGVjdC5jYWxsKHRoaXMsIHN0cmluZywgcGF0dGVybiwgbG9jYWxlKS5maWx0ZXIoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBudW1iZXIgIT09ICdudW1iZXInIHx8IHJlc3VsdC52YWx1ZSA9PT0gbnVtYmVyO1xuICB9KS5tYXAoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2FsZTogcmVzdWx0LmxvY2FsZSxcbiAgICAgIHBhdHRlcm46IHJlc3VsdC5wYXR0ZXJuXG4gICAgfTtcbiAgfSlbMF07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbmZvcm1hdDsiXX0=
