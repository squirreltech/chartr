(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dformat = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var i18n = require("./locales/all");

function cartesianProductOf(array, unique) {
  return Array.prototype.reduce.call(array, function(a, b) {
    var ret = [];
    a.forEach(function(a) {
      b.forEach(function(b) {
        if (!unique || a.indexOf(b) < 0) {
          ret.push(a.concat([b]));
        }
      });
    });
    return ret;
  }, [[]]);
}

function sortByRelevance(a, b) {
  return a.relevance > b.relevance ? -1 : a.relevance < b.relevance ? 1 : 0;
}

function escapeRegExp(str) {
  str = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  str = str.replace(/\s/g, "\\s");
  return str;
}

function pad( a, b ) {
  return (1e15 + a + "").slice(-b);
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

function getLocales(locale) {
  var locales = [];
  Object.keys(i18n).forEach(function(locale) {
    locales.push(locale);
    locales = locales.concat(i18n[locale].equals && i18n[locale].equals.split(/\s*,\s*/) || []);
  });
  return locales;
}

function getReplacements(localeData, date) {
  var
    result = {},
    d2 = "\\d{2}",
    d4 = "\\d{4}",
    weekdayNames = localeData.weekday,
    monthNames = localeData.month,
    day = date ? (date.getDay() - 1 + 7) % 7 : -1;
    keys = ["yyyy", "yy", "y", "MMMM", "MMM", "MM", "M", "dddd", "ddd", "dd", "d", "HH", "H", "hh", "h", "mm", "m", "ss", "s", "tt", "t"],
    values = date ? 
      [
        // Year
        date.getFullYear(), 
        pad(date.getYear(), 2), 
        date.getYear(),
        
        // Month
        monthNames.long[date.getMonth()], 
        monthNames.short[date.getMonth()], 
        pad(date.getMonth() + 1, 2),
        date.getMonth() + 1,
        
        // Day
        weekdayNames.long[day],
        weekdayNames.short[day],
        pad(date.getDate(), 2),
        date.getDate(),
        
        // Hour
        date.getHours(),
        pad(date.getHours(), 2),
        
        // Hour12
        pad(date.getHours() % 12, 2),
        date.getHours() % 12,
        
        // Minute
        pad(date.getMinutes(), 2),
        date.getMinutes(),
        
        // Second
        pad(date.getSeconds(), 2),
        date.getSeconds(),
        
        // Hour12 Designator
        date.getHours() >= 12 ? "PM" : "AM",
        (date.getHours() >= 12 ? "PM" : "AM").substring(0, 1)
      ] : 
      [
        // Year
        d4,
        d2,
        d2,
        
        // Month
        monthNames.long.map(escapeRegExp).join("|"),
        monthNames.short.map(escapeRegExp).join("|"),
        d2,
        d2,
        
        // Day
        weekdayNames.long.map(escapeRegExp).join("|"),
        weekdayNames.short.map(escapeRegExp).join("|"),
        d2,
        d2,
        
        // Hour
        d2,
        d2,
        
        // Hour12
        d2,
        d2,
        
        // Minute
        d2,
        d2,
        
        // Second
        d2,
        d2,
        
        // Hour12 Designator
        "AM|PM",
        "A|P"
        
      ];
    
    
    keys.forEach(function(key, index) {
      var value = values[index];
      result[key] = value;
    });
    
    return result;
}

function format(date, pattern, locale) {
   
  var
    localeData = getLocaleData(locale || 'en'),
    pattern = pattern || localeData.patterns[0] || "yyyy/MM/dd hh:ss tt",
    replacements = getReplacements(localeData, date),
    regex = new RegExp("\\b(?:" + Object.keys(replacements).join("|") + ")\\b", "g"),
    match, 
    index = 0,
    result = "";
  
  while (match = regex.exec(pattern)) {
    result+= pattern.substring(index, match.index);
    result+= replacements[match];
    index = match.index + match[0].length;
  }
  result+= pattern.substring(index);
  return result;
}

function parse(string, pattern, locale) {
  var locales = locale instanceof Array ? locale : locale ? [locale] : Object.keys(i18n);
  var date = null;
  
  locales.forEach(function(locale) {
    
    if (date) {
      return;
    }
    
    var
      localeData = getLocaleData(locale),
      parts = getReplacements(localeData),
      patternRegex = new RegExp("\\b(" + Object.keys(parts).join("|") + ")" + "\\b", "g"),
      patterns = pattern instanceof Array ? pattern : pattern ? [pattern] : localeData.patterns;
      
    patterns.forEach(function(pattern) {
      
      if (date) {
        return;
      }
    
      var
        captures = [],
        match,
        matches,
        hour12pm,
        index = 0,
        dateRegex = "";
      
      while( match = patternRegex.exec(pattern) ) {
        captures.push(match[1]);
        dateRegex+= escapeRegExp(pattern.substring(index, match.index));
        dateRegex+= "(" + parts[Object.keys(parts).filter(function(part) {
          return match[0] === part;
        })[0]] + ")";
        index = match.index + match[0].length;
      }
      dateRegex+= escapeRegExp(pattern.substring(index));
      
      match = (new RegExp(dateRegex)).exec(string);
      
      if (match) {
        date = new Date("0");
        matches = match.slice(1);
        
        hour12pm = (matches.filter(function(value, index) {
          return (captures[index] === "tt" || captures[index] === "t") && value.substring(0, 1).toUpperCase() === "P";
        }).length > 0);
        
        var year, month, monthDay, hours, minutes, seconds;
        
        matches.forEach(function(value, index) {
          var numericValue = parseInt(value);
          switch (captures[index]) {
            case 'yyyy': 
              year = numericValue;
              break;
            case 'MMMM':
              month = localeData.month.long.indexOf(value);
              break;
            case 'MMM':
              month = localeData.month.short.indexOf(value);
              break;
            case 'MM':
            case 'M':
              month = numericValue - 1;
              break;
            case 'dddd':
            case 'ddd':
              // Cannot determine date from weekday
              break;
            case 'dd':
            case 'd':
              monthDay = numericValue;
              break;
            case 'HH':
            case 'H':
              hours = numericValue;
              break;
            case 'hh':
            case 'h':
              hours = hour12pm ? numericValue + 12 : numericValue;
              break;
            case 'mm':
            case 'm':
              minutes = numericValue;
              break;
            case 'ss':
            case 's':
              seconds = numericValue;
              break;
          }
        });
        
        if (year !== undefined) {
          date.setFullYear(year);
        }
        
        if (month !== undefined) {
          date.setMonth(month);
        }
        
        if (monthDay !== undefined) {
          date.setDate(monthDay);
        }
        
        if (hours !== undefined) {
          date.setHours(hours);
        }
        
        if (minutes !== undefined) {
          date.setMinutes(minutes);
        }
        
        if (seconds !== undefined) {
          date.setSeconds(seconds);
        }
        
        if ( isNaN( date.getTime() ) ) {
          date = null;
        } else {
          // Valid
        }
        
      }
      
    });
  });
  
  if (date) {
    return date;
  }
  
  return date;
}

function detect(date, string) {
  var
    locales = Object.keys(i18n),
    resultLocalePatterns = [];

  locales.forEach(function(locale) {
    
    var 
      localeData = getLocaleData(locale),
      replacements = getReplacements(localeData, date),
      values = Object.keys(replacements).map(function(part){
          return replacements[part].toString();
        }).filter(function(part, index, self) {
          return self.indexOf(part) === index;
        }).map(escapeRegExp).map(function(value) {
          return !isNaN(parseFloat(value)) ? "\\b" + value + "\\b" : value;
        }),
      regex = new RegExp(values.join("|"), "g"),
      match, substring, index = 0,
      patternParts = [],
      patternPartsIndex = [],
      matchRank = 0,
      matches = [],
      hour12 = false,
      rest = "";
      
      while (match = regex.exec(string)) {
        if (match[0] === replacements["tt"].toString()) {
          hour12 = true;
        }
        matches.push(match);
      }
      
      for (var m = 0; m < matches.length; m++) {
        match = matches[m];
        substring = string.substring(index, match.index);
        if (substring) {
          rest+= substring;
          patternParts.push([patternPartsIndex.length]);
          patternPartsIndex.push(substring);
        }
        var matchingParts = [];
        for (var part in replacements) {
          if (match[0] === replacements[part].toString()) {
            if ((part === "HH" || part === "H") && hour12) {
              continue;
            }
            var i = patternPartsIndex.indexOf(part);
            if (i < 0) {
              i = patternPartsIndex.length;
              patternPartsIndex.push(part);
            }
            matchingParts.push(i);
          }
        }
        matchRank+= 1 / matchingParts.length;
        patternParts.push(matchingParts);
        index = match.index + match[0].length;
      }
      substring = string.substring(index);
      rest+= substring;
      
      if (substring) {
        patternParts.push([patternPartsIndex.length]);
        patternPartsIndex.push(substring);
      }
      
      resultLocalePatterns.push({
        locale: locale, 
        localeData: localeData,
        relevance: matchRank + (1 - rest.length / string.length),
        pattern: {
          parts: patternParts,
          index: patternPartsIndex
        }
      });
    
  });
  
  if (!resultLocalePatterns.length) {
    return null;
  }
  
  resultLocalePatterns.sort(sortByRelevance);
  
  if (!resultLocalePatterns.length) {
    return null;
  }
  
  var relevance = resultLocalePatterns[0].relevance;
  
  var results = resultLocalePatterns.filter(function(resultData) {
    return resultData.relevance === relevance; 
  }).map(function(resultData) {
    
    var
      patternData = resultData.pattern,
      combinations = cartesianProductOf(patternData.parts, true),
      patterns = combinations.map(function(combination) {
        var string = combination.map(function(partIndex) {
          return patternData.index[partIndex];
        }).join("");
        var relevance = resultData.localeData.patterns.filter(function(localePattern) {
          return string.indexOf(localePattern) >= 0;
        }).length;
        return {
          rest: resultData.rest,
          string: string,
          relevance: relevance
        };
      });
    
    if (!patterns.length) {
      return null;
    }
    
    patterns.sort(sortByRelevance);
    
    return {
      rest: patterns[0].rest,
      relevance: patterns[0].relevance,
      pattern: patterns[0].string, 
      locale: resultData.locale
    };
  });
  
  results.sort(sortByRelevance);
  
  if (results[0]) {
    return {
      pattern: results[0].pattern,
      locale: results[0].locale
    };
  }
}


function dformat(date, pattern, locale) {
  return format.apply(this, arguments);
}

dformat.parse = function(string, pattern, locale) {
  return parse.apply(this, arguments);
};

dformat.detect = function(date, string) {
  return detect.apply(this, arguments);
};


module.exports = dformat;
},{"./locales/all":2}],2:[function(require,module,exports){
module.exports = {
  "en": {
    "month": {
      "long": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      "short": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]
    },
    "weekday": {
      "long": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "short": [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ]
    },
    "patterns": [
      "dddd, MMMM dd, yyyy, hh:mm:ss tt",
      "MMMM dd, yyyy, hh:mm:ss tt",
      "MMM dd, yyyy, hh:mm:ss tt",
      "MM/dd/yyyy, hh:mm tt",
      "dddd, MMMM dd, yyyy",
      "MMMM dd, yyyy",
      "MMM dd, yyyy",
      "MM/dd/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "hh:mm:ss tt",
      "hh:mm tt"
    ]
  },
  "de": {
    "month": {
      "long": [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
      ],
      "short": [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez"
      ]
    },
    "weekday": {
      "long": [
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
        "Sonntag"
      ],
      "short": [
        "Mo.",
        "Di.",
        "Mi.",
        "Do.",
        "Fr.",
        "Sa.",
        "So."
      ]
    },
    "patterns": [
      "dddd, dd. MMMM yyyy HH:mm:ss",
      "dd. MMMM yyyy HH:mm:ss",
      "dd. MMM yyyy HH:mm:ss",
      "dd.MM.yyyy HH:mm",
      "dddd, dd. MMMM yyyy",
      "dd. MMMM yyyy",
      "dd. MMM yyyy",
      "dd.MM.yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "fr": {
    "month": {
      "long": [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
      ],
      "short": [
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juil.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc."
      ]
    },
    "weekday": {
      "long": [
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi",
        "dimanche"
      ],
      "short": [
        "lun.",
        "mar.",
        "mer.",
        "jeu.",
        "ven.",
        "sam.",
        "dim."
      ]
    },
    "patterns": [
      "dddd dd MMMM yyyy HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd MMM yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd/MM/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "es": {
    "month": {
      "long": [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ],
      "short": [
        "Ene.",
        "Feb.",
        "Mar.",
        "Abr.",
        "May.",
        "Jun.",
        "Jul.",
        "Ago.",
        "Sept.",
        "Oct.",
        "Nov.",
        "Dic."
      ]
    },
    "weekday": {
      "long": [
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
        "domingo"
      ],
      "short": [
        "lun.",
        "mar.",
        "mié.",
        "jue.",
        "vie.",
        "sáb.",
        "dom."
      ]
    },
    "patterns": [
      "dddd, dd de MMMM de yyyy HH:mm:ss",
      "dd de MMMM de yyyy HH:mm:ss",
      "dd de MMM de yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd, dd de MMMM de yyyy",
      "dd de MMMM de yyyy",
      "dd de MMM de yyyy",
      "dd/MM/yyyy",
      "MMMM de yyyy",
      "MMM de yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "it": {
    "month": {
      "long": [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre"
      ],
      "short": [
        "gen",
        "feb",
        "mar",
        "apr",
        "mag",
        "giu",
        "lug",
        "ago",
        "set",
        "ott",
        "nov",
        "dic"
      ]
    },
    "weekday": {
      "long": [
        "lunedì",
        "martedì",
        "mercoledì",
        "giovedì",
        "venerdì",
        "sabato",
        "domenica"
      ],
      "short": [
        "lun",
        "mar",
        "mer",
        "gio",
        "ven",
        "sab",
        "dom"
      ]
    },
    "patterns": [
      "dddd dd MMMM yyyy HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd/MMM/yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd/MMM/yyyy",
      "dd/MM/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "nl": {
    "month": {
      "long": [
        "januari",
        "februari",
        "maart",
        "april",
        "mei",
        "juni",
        "juli",
        "augustus",
        "september",
        "oktober",
        "november",
        "december"
      ],
      "short": [
        "jan",
        "feb",
        "mrt",
        "apr",
        "mei",
        "jun",
        "jul",
        "aug",
        "sep",
        "okt",
        "nov",
        "dec"
      ]
    },
    "weekday": {
      "long": [
        "maandag",
        "dinsdag",
        "woensdag",
        "donderdag",
        "vrijdag",
        "zaterdag",
        "zondag"
      ],
      "short": [
        "ma",
        "di",
        "wo",
        "do",
        "vr",
        "za",
        "zo"
      ]
    },
    "patterns": [
      "dddd dd MMMM yyyy HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd MMM yyyy HH:mm:ss",
      "dd-MM-yyyy HH:mm",
      "dddd dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd-MM-yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "tr": {
    "month": {
      "long": [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık"
      ],
      "short": [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara"
      ]
    },
    "weekday": {
      "long": [
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
        "Pazar"
      ],
      "short": [
        "Pzt",
        "Sal",
        "Çar",
        "Per",
        "Cum",
        "Cmt",
        "Paz"
      ]
    },
    "patterns": [
      "dd MMMM yyyy dddd HH:mm:ss",
      "dd MMMM yyyy HH:mm:ss",
      "dd MMM yyyy HH:mm:ss",
      "dd.MM.yyyy HH:mm",
      "dd MMMM yyyy dddd",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd.MM.yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "br": {
    "month": {
      "long": [
        "Genver",
        "Cʼhwevrer",
        "Meurzh",
        "Ebrel",
        "Mae",
        "Mezheven",
        "Gouere",
        "Eost",
        "Gwengolo",
        "Here",
        "Du",
        "Kerzu"
      ],
      "short": [
        "Gen",
        "Cʼhwe",
        "Meur",
        "Ebr",
        "Mae",
        "Mezh",
        "Goue",
        "Eost",
        "Gwen",
        "Here",
        "Du",
        "Ker"
      ]
    },
    "weekday": {
      "long": [
        "Lun",
        "Meurzh",
        "Mercʼher",
        "Yaou",
        "Gwener",
        "Sadorn",
        "Sul"
      ],
      "short": [
        "lun",
        "meu.",
        "mer.",
        "yaou",
        "gwe.",
        "sad.",
        "sul"
      ]
    },
    "patterns": [
      "yyyy MMMM dd, dddd HH:mm:ss",
      "yyyy MMMM dd HH:mm:ss",
      "yyyy MMM dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
      "yyyy MMMM dd, dddd",
      "yyyy MMMM dd",
      "yyyy MMM dd",
      "yyyy-MM-dd",
      "yyyy MMMM",
      "yyyy MMM",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "pt": {
    "month": {
      "long": [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
      ],
      "short": [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez"
      ]
    },
    "weekday": {
      "long": [
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado",
        "domingo"
      ],
      "short": [
        "seg",
        "ter",
        "qua",
        "qui",
        "sex",
        "sáb",
        "dom"
      ]
    },
    "patterns": [
      "dddd, dd de MMMM de yyyy HH:mm:ss",
      "dd de MMMM de yyyy HH:mm:ss",
      "dd de MMM de yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "dddd, dd de MMMM de yyyy",
      "dd de MMMM de yyyy",
      "dd de MMM de yyyy",
      "dd/MM/yyyy",
      "MMMM de yyyy",
      "MMM de yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "bg": {
    "month": {
      "long": [
        "януари",
        "февруари",
        "март",
        "април",
        "май",
        "юни",
        "юли",
        "август",
        "септември",
        "октомври",
        "ноември",
        "декември"
      ],
      "short": [
        "ян.",
        "февр.",
        "март",
        "апр.",
        "май",
        "юни",
        "юли",
        "авг.",
        "септ.",
        "окт.",
        "ноем.",
        "дек."
      ]
    },
    "weekday": {
      "long": [
        "понеделник",
        "вторник",
        "сряда",
        "четвъртък",
        "петък",
        "събота",
        "неделя"
      ],
      "short": [
        "пн",
        "вт",
        "ср",
        "чт",
        "пт",
        "сб",
        "нд"
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy г., HH:mm:ss",
      "dd MMMM yyyy г., HH:mm:ss",
      "dd MMM yyyy г., HH:mm:ss",
      "dd.MM.yyyy г., HH:mm",
      "dddd, dd MMMM yyyy г.",
      "dd MMMM yyyy г.",
      "dd MMM yyyy г.",
      "dd.MM.yyyy г.",
      "MMMM yyyy г.",
      "MMM yyyy г.",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "in": {
    "month": {
      "long": [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
      ],
      "short": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agt",
        "Sep",
        "Okt",
        "Nov",
        "Des"
      ]
    },
    "weekday": {
      "long": [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu"
      ],
      "short": [
        "Sen",
        "Sel",
        "Rab",
        "Kam",
        "Jum",
        "Sab",
        "Min"
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy HH.mm.ss",
      "dd MMMM yyyy HH.mm.ss",
      "dd MMM yyyy HH.mm.ss",
      "dd/MM/yyyy HH.mm",
      "dddd, dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd/MM/yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH.mm.ss",
      "HH.mm"
    ]
  },
  "ro": {
    "month": {
      "long": [
        "ianuarie",
        "februarie",
        "martie",
        "aprilie",
        "mai",
        "iunie",
        "iulie",
        "august",
        "septembrie",
        "octombrie",
        "noiembrie",
        "decembrie"
      ],
      "short": [
        "ian.",
        "feb.",
        "mar.",
        "apr.",
        "mai",
        "iun.",
        "iul.",
        "aug.",
        "sept.",
        "oct.",
        "nov.",
        "dec."
      ]
    },
    "weekday": {
      "long": [
        "luni",
        "marți",
        "miercuri",
        "joi",
        "vineri",
        "sâmbătă",
        "duminică"
      ],
      "short": [
        "Lun",
        "Mar",
        "Mie",
        "Joi",
        "Vin",
        "Sâm",
        "Dum"
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy, HH:mm:ss",
      "dd MMMM yyyy, HH:mm:ss",
      "dd MMM yyyy, HH:mm:ss",
      "dd.MM.yyyy, HH:mm",
      "dddd, dd MMMM yyyy",
      "dd MMMM yyyy",
      "dd MMM yyyy",
      "dd.MM.yyyy",
      "MMMM yyyy",
      "MMM yyyy",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "mk": {
    "month": {
      "long": [
        "јануари",
        "февруари",
        "март",
        "април",
        "мај",
        "јуни",
        "јули",
        "август",
        "септември",
        "октомври",
        "ноември",
        "декември"
      ],
      "short": [
        "јан.",
        "фев.",
        "мар.",
        "апр.",
        "мај",
        "јун.",
        "јул.",
        "авг.",
        "септ.",
        "окт.",
        "ноем.",
        "дек."
      ]
    },
    "weekday": {
      "long": [
        "понеделник",
        "вторник",
        "среда",
        "четврток",
        "петок",
        "сабота",
        "недела"
      ],
      "short": [
        "пон.",
        "вт.",
        "сре.",
        "чет.",
        "пет.",
        "саб.",
        "нед."
      ]
    },
    "patterns": [
      "dddd, dd MMMM yyyy г. HH:mm:ss",
      "dd MMMM yyyy г. HH:mm:ss",
      "dd MMM yyyy г. HH:mm:ss",
      "dd.MM.yyyy HH:mm",
      "dddd, dd MMMM yyyy г.",
      "dd MMMM yyyy г.",
      "dd MMM yyyy г.",
      "dd.MM.yyyy",
      "MMMM yyyy г.",
      "MMM yyyy г.",
      "HH:mm:ss",
      "HH:mm"
    ]
  },
  "th": {
    "month": {
      "long": [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม"
      ],
      "short": [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค."
      ]
    },
    "weekday": {
      "long": [
        "วันจันทร์",
        "วันอังคาร",
        "วันพุธ",
        "วันพฤหัสบดี",
        "วันศุกร์",
        "วันเสาร์",
        "วันอาทิตย์"
      ],
      "short": [
        "จ.",
        "อ.",
        "พ.",
        "พฤ.",
        "ศ.",
        "ส.",
        "อา."
      ]
    },
    "patterns": [
      "dddd dd MMMM 2543 HH:mm:ss",
      "dd MMMM 2543 HH:mm:ss",
      "dd MMM 2543 HH:mm:ss",
      "dd/MM/2543 HH:mm",
      "dddd dd MMMM 2543",
      "dd MMMM 2543",
      "dd MMM 2543",
      "dd/MM/2543",
      "MMMM 2543",
      "MMM 2543",
      "HH:mm:ss",
      "HH:mm"
    ]
  }
};
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGZvcm1hdC5qcyIsInNyYy9sb2NhbGVzL2FsbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGkxOG4gPSByZXF1aXJlKFwiLi9sb2NhbGVzL2FsbFwiKTtcblxuZnVuY3Rpb24gY2FydGVzaWFuUHJvZHVjdE9mKGFycmF5LCB1bmlxdWUpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbChhcnJheSwgZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciByZXQgPSBbXTtcbiAgICBhLmZvckVhY2goZnVuY3Rpb24oYSkge1xuICAgICAgYi5mb3JFYWNoKGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgaWYgKCF1bmlxdWUgfHwgYS5pbmRleE9mKGIpIDwgMCkge1xuICAgICAgICAgIHJldC5wdXNoKGEuY29uY2F0KFtiXSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9LCBbW11dKTtcbn1cblxuZnVuY3Rpb24gc29ydEJ5UmVsZXZhbmNlKGEsIGIpIHtcbiAgcmV0dXJuIGEucmVsZXZhbmNlID4gYi5yZWxldmFuY2UgPyAtMSA6IGEucmVsZXZhbmNlIDwgYi5yZWxldmFuY2UgPyAxIDogMDtcbn1cblxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xuICBzdHIgPSBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICBzdHIgPSBzdHIucmVwbGFjZSgvXFxzL2csIFwiXFxcXHNcIik7XG4gIHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIHBhZCggYSwgYiApIHtcbiAgcmV0dXJuICgxZTE1ICsgYSArIFwiXCIpLnNsaWNlKC1iKTtcbn1cblxuZnVuY3Rpb24gZ2V0TG9jYWxlRGF0YShsb2NhbGUpIHtcbiAgaWYgKGkxOG5bbG9jYWxlXSkge1xuICAgIHJldHVybiBpMThuW2xvY2FsZV07XG4gIH1cbiAgZm9yICh2YXIga2V5IGluIGkxOG4pIHtcbiAgICBpZiAoaTE4bltrZXldLmVxdWFscyAmJiBpMThuW2tleV0uZXF1YWxzLnNwbGl0KFwiLFwiKS5pbmRleE9mKGxvY2FsZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIGkxOG5ba2V5XTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExvY2FsZXMobG9jYWxlKSB7XG4gIHZhciBsb2NhbGVzID0gW107XG4gIE9iamVjdC5rZXlzKGkxOG4pLmZvckVhY2goZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgbG9jYWxlcy5wdXNoKGxvY2FsZSk7XG4gICAgbG9jYWxlcyA9IGxvY2FsZXMuY29uY2F0KGkxOG5bbG9jYWxlXS5lcXVhbHMgJiYgaTE4bltsb2NhbGVdLmVxdWFscy5zcGxpdCgvXFxzKixcXHMqLykgfHwgW10pO1xuICB9KTtcbiAgcmV0dXJuIGxvY2FsZXM7XG59XG5cbmZ1bmN0aW9uIGdldFJlcGxhY2VtZW50cyhsb2NhbGVEYXRhLCBkYXRlKSB7XG4gIHZhclxuICAgIHJlc3VsdCA9IHt9LFxuICAgIGQyID0gXCJcXFxcZHsyfVwiLFxuICAgIGQ0ID0gXCJcXFxcZHs0fVwiLFxuICAgIHdlZWtkYXlOYW1lcyA9IGxvY2FsZURhdGEud2Vla2RheSxcbiAgICBtb250aE5hbWVzID0gbG9jYWxlRGF0YS5tb250aCxcbiAgICBkYXkgPSBkYXRlID8gKGRhdGUuZ2V0RGF5KCkgLSAxICsgNykgJSA3IDogLTE7XG4gICAga2V5cyA9IFtcInl5eXlcIiwgXCJ5eVwiLCBcInlcIiwgXCJNTU1NXCIsIFwiTU1NXCIsIFwiTU1cIiwgXCJNXCIsIFwiZGRkZFwiLCBcImRkZFwiLCBcImRkXCIsIFwiZFwiLCBcIkhIXCIsIFwiSFwiLCBcImhoXCIsIFwiaFwiLCBcIm1tXCIsIFwibVwiLCBcInNzXCIsIFwic1wiLCBcInR0XCIsIFwidFwiXSxcbiAgICB2YWx1ZXMgPSBkYXRlID8gXG4gICAgICBbXG4gICAgICAgIC8vIFllYXJcbiAgICAgICAgZGF0ZS5nZXRGdWxsWWVhcigpLCBcbiAgICAgICAgcGFkKGRhdGUuZ2V0WWVhcigpLCAyKSwgXG4gICAgICAgIGRhdGUuZ2V0WWVhcigpLFxuICAgICAgICBcbiAgICAgICAgLy8gTW9udGhcbiAgICAgICAgbW9udGhOYW1lcy5sb25nW2RhdGUuZ2V0TW9udGgoKV0sIFxuICAgICAgICBtb250aE5hbWVzLnNob3J0W2RhdGUuZ2V0TW9udGgoKV0sIFxuICAgICAgICBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMiksXG4gICAgICAgIGRhdGUuZ2V0TW9udGgoKSArIDEsXG4gICAgICAgIFxuICAgICAgICAvLyBEYXlcbiAgICAgICAgd2Vla2RheU5hbWVzLmxvbmdbZGF5XSxcbiAgICAgICAgd2Vla2RheU5hbWVzLnNob3J0W2RheV0sXG4gICAgICAgIHBhZChkYXRlLmdldERhdGUoKSwgMiksXG4gICAgICAgIGRhdGUuZ2V0RGF0ZSgpLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91clxuICAgICAgICBkYXRlLmdldEhvdXJzKCksXG4gICAgICAgIHBhZChkYXRlLmdldEhvdXJzKCksIDIpLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91cjEyXG4gICAgICAgIHBhZChkYXRlLmdldEhvdXJzKCkgJSAxMiwgMiksXG4gICAgICAgIGRhdGUuZ2V0SG91cnMoKSAlIDEyLFxuICAgICAgICBcbiAgICAgICAgLy8gTWludXRlXG4gICAgICAgIHBhZChkYXRlLmdldE1pbnV0ZXMoKSwgMiksXG4gICAgICAgIGRhdGUuZ2V0TWludXRlcygpLFxuICAgICAgICBcbiAgICAgICAgLy8gU2Vjb25kXG4gICAgICAgIHBhZChkYXRlLmdldFNlY29uZHMoKSwgMiksXG4gICAgICAgIGRhdGUuZ2V0U2Vjb25kcygpLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91cjEyIERlc2lnbmF0b3JcbiAgICAgICAgZGF0ZS5nZXRIb3VycygpID49IDEyID8gXCJQTVwiIDogXCJBTVwiLFxuICAgICAgICAoZGF0ZS5nZXRIb3VycygpID49IDEyID8gXCJQTVwiIDogXCJBTVwiKS5zdWJzdHJpbmcoMCwgMSlcbiAgICAgIF0gOiBcbiAgICAgIFtcbiAgICAgICAgLy8gWWVhclxuICAgICAgICBkNCxcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gTW9udGhcbiAgICAgICAgbW9udGhOYW1lcy5sb25nLm1hcChlc2NhcGVSZWdFeHApLmpvaW4oXCJ8XCIpLFxuICAgICAgICBtb250aE5hbWVzLnNob3J0Lm1hcChlc2NhcGVSZWdFeHApLmpvaW4oXCJ8XCIpLFxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBEYXlcbiAgICAgICAgd2Vla2RheU5hbWVzLmxvbmcubWFwKGVzY2FwZVJlZ0V4cCkuam9pbihcInxcIiksXG4gICAgICAgIHdlZWtkYXlOYW1lcy5zaG9ydC5tYXAoZXNjYXBlUmVnRXhwKS5qb2luKFwifFwiKSxcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gSG91clxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyMTJcbiAgICAgICAgZDIsXG4gICAgICAgIGQyLFxuICAgICAgICBcbiAgICAgICAgLy8gTWludXRlXG4gICAgICAgIGQyLFxuICAgICAgICBkMixcbiAgICAgICAgXG4gICAgICAgIC8vIFNlY29uZFxuICAgICAgICBkMixcbiAgICAgICAgZDIsXG4gICAgICAgIFxuICAgICAgICAvLyBIb3VyMTIgRGVzaWduYXRvclxuICAgICAgICBcIkFNfFBNXCIsXG4gICAgICAgIFwiQXxQXCJcbiAgICAgICAgXG4gICAgICBdO1xuICAgIFxuICAgIFxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXksIGluZGV4KSB7XG4gICAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbaW5kZXhdO1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmb3JtYXQoZGF0ZSwgcGF0dGVybiwgbG9jYWxlKSB7XG4gICBcbiAgdmFyXG4gICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEobG9jYWxlIHx8ICdlbicpLFxuICAgIHBhdHRlcm4gPSBwYXR0ZXJuIHx8IGxvY2FsZURhdGEucGF0dGVybnNbMF0gfHwgXCJ5eXl5L01NL2RkIGhoOnNzIHR0XCIsXG4gICAgcmVwbGFjZW1lbnRzID0gZ2V0UmVwbGFjZW1lbnRzKGxvY2FsZURhdGEsIGRhdGUpLFxuICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIlxcXFxiKD86XCIgKyBPYmplY3Qua2V5cyhyZXBsYWNlbWVudHMpLmpvaW4oXCJ8XCIpICsgXCIpXFxcXGJcIiwgXCJnXCIpLFxuICAgIG1hdGNoLCBcbiAgICBpbmRleCA9IDAsXG4gICAgcmVzdWx0ID0gXCJcIjtcbiAgXG4gIHdoaWxlIChtYXRjaCA9IHJlZ2V4LmV4ZWMocGF0dGVybikpIHtcbiAgICByZXN1bHQrPSBwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCwgbWF0Y2guaW5kZXgpO1xuICAgIHJlc3VsdCs9IHJlcGxhY2VtZW50c1ttYXRjaF07XG4gICAgaW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgfVxuICByZXN1bHQrPSBwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHN0cmluZywgcGF0dGVybiwgbG9jYWxlKSB7XG4gIHZhciBsb2NhbGVzID0gbG9jYWxlIGluc3RhbmNlb2YgQXJyYXkgPyBsb2NhbGUgOiBsb2NhbGUgPyBbbG9jYWxlXSA6IE9iamVjdC5rZXlzKGkxOG4pO1xuICB2YXIgZGF0ZSA9IG51bGw7XG4gIFxuICBsb2NhbGVzLmZvckVhY2goZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgXG4gICAgaWYgKGRhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgdmFyXG4gICAgICBsb2NhbGVEYXRhID0gZ2V0TG9jYWxlRGF0YShsb2NhbGUpLFxuICAgICAgcGFydHMgPSBnZXRSZXBsYWNlbWVudHMobG9jYWxlRGF0YSksXG4gICAgICBwYXR0ZXJuUmVnZXggPSBuZXcgUmVnRXhwKFwiXFxcXGIoXCIgKyBPYmplY3Qua2V5cyhwYXJ0cykuam9pbihcInxcIikgKyBcIilcIiArIFwiXFxcXGJcIiwgXCJnXCIpLFxuICAgICAgcGF0dGVybnMgPSBwYXR0ZXJuIGluc3RhbmNlb2YgQXJyYXkgPyBwYXR0ZXJuIDogcGF0dGVybiA/IFtwYXR0ZXJuXSA6IGxvY2FsZURhdGEucGF0dGVybnM7XG4gICAgICBcbiAgICBwYXR0ZXJucy5mb3JFYWNoKGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgICAgIFxuICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIFxuICAgICAgdmFyXG4gICAgICAgIGNhcHR1cmVzID0gW10sXG4gICAgICAgIG1hdGNoLFxuICAgICAgICBtYXRjaGVzLFxuICAgICAgICBob3VyMTJwbSxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBkYXRlUmVnZXggPSBcIlwiO1xuICAgICAgXG4gICAgICB3aGlsZSggbWF0Y2ggPSBwYXR0ZXJuUmVnZXguZXhlYyhwYXR0ZXJuKSApIHtcbiAgICAgICAgY2FwdHVyZXMucHVzaChtYXRjaFsxXSk7XG4gICAgICAgIGRhdGVSZWdleCs9IGVzY2FwZVJlZ0V4cChwYXR0ZXJuLnN1YnN0cmluZyhpbmRleCwgbWF0Y2guaW5kZXgpKTtcbiAgICAgICAgZGF0ZVJlZ2V4Kz0gXCIoXCIgKyBwYXJ0c1tPYmplY3Qua2V5cyhwYXJ0cykuZmlsdGVyKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2hbMF0gPT09IHBhcnQ7XG4gICAgICAgIH0pWzBdXSArIFwiKVwiO1xuICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgZGF0ZVJlZ2V4Kz0gZXNjYXBlUmVnRXhwKHBhdHRlcm4uc3Vic3RyaW5nKGluZGV4KSk7XG4gICAgICBcbiAgICAgIG1hdGNoID0gKG5ldyBSZWdFeHAoZGF0ZVJlZ2V4KSkuZXhlYyhzdHJpbmcpO1xuICAgICAgXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKFwiMFwiKTtcbiAgICAgICAgbWF0Y2hlcyA9IG1hdGNoLnNsaWNlKDEpO1xuICAgICAgICBcbiAgICAgICAgaG91cjEycG0gPSAobWF0Y2hlcy5maWx0ZXIoZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIChjYXB0dXJlc1tpbmRleF0gPT09IFwidHRcIiB8fCBjYXB0dXJlc1tpbmRleF0gPT09IFwidFwiKSAmJiB2YWx1ZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSA9PT0gXCJQXCI7XG4gICAgICAgIH0pLmxlbmd0aCA+IDApO1xuICAgICAgICBcbiAgICAgICAgdmFyIHllYXIsIG1vbnRoLCBtb250aERheSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHM7XG4gICAgICAgIFxuICAgICAgICBtYXRjaGVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgdmFyIG51bWVyaWNWYWx1ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICBzd2l0Y2ggKGNhcHR1cmVzW2luZGV4XSkge1xuICAgICAgICAgICAgY2FzZSAneXl5eSc6IFxuICAgICAgICAgICAgICB5ZWFyID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ01NTU0nOlxuICAgICAgICAgICAgICBtb250aCA9IGxvY2FsZURhdGEubW9udGgubG9uZy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICAgICAgICBtb250aCA9IGxvY2FsZURhdGEubW9udGguc2hvcnQuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgICAgICAgIG1vbnRoID0gbnVtZXJpY1ZhbHVlIC0gMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZGRkJzpcbiAgICAgICAgICAgIGNhc2UgJ2RkZCc6XG4gICAgICAgICAgICAgIC8vIENhbm5vdCBkZXRlcm1pbmUgZGF0ZSBmcm9tIHdlZWtkYXlcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgbW9udGhEYXkgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgIGhvdXJzID0gbnVtZXJpY1ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hoJzpcbiAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICBob3VycyA9IGhvdXIxMnBtID8gbnVtZXJpY1ZhbHVlICsgMTIgOiBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbW0nOlxuICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgIG1pbnV0ZXMgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3MnOlxuICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgIHNlY29uZHMgPSBudW1lcmljVmFsdWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoeWVhciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1vbnRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldE1vbnRoKG1vbnRoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1vbnRoRGF5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRlLnNldERhdGUobW9udGhEYXkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoaG91cnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGUuc2V0SG91cnMoaG91cnMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobWludXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKG1pbnV0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoc2Vjb25kcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0ZS5zZXRTZWNvbmRzKHNlY29uZHMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIGlzTmFOKCBkYXRlLmdldFRpbWUoKSApICkge1xuICAgICAgICAgIGRhdGUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFZhbGlkXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgICBcbiAgICB9KTtcbiAgfSk7XG4gIFxuICBpZiAoZGF0ZSkge1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIFxuICByZXR1cm4gZGF0ZTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0KGRhdGUsIHN0cmluZykge1xuICB2YXJcbiAgICBsb2NhbGVzID0gT2JqZWN0LmtleXMoaTE4biksXG4gICAgcmVzdWx0TG9jYWxlUGF0dGVybnMgPSBbXTtcblxuICBsb2NhbGVzLmZvckVhY2goZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgXG4gICAgdmFyIFxuICAgICAgbG9jYWxlRGF0YSA9IGdldExvY2FsZURhdGEobG9jYWxlKSxcbiAgICAgIHJlcGxhY2VtZW50cyA9IGdldFJlcGxhY2VtZW50cyhsb2NhbGVEYXRhLCBkYXRlKSxcbiAgICAgIHZhbHVlcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VtZW50cykubWFwKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgICAgIHJldHVybiByZXBsYWNlbWVudHNbcGFydF0udG9TdHJpbmcoKTtcbiAgICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uKHBhcnQsIGluZGV4LCBzZWxmKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihwYXJ0KSA9PT0gaW5kZXg7XG4gICAgICAgIH0pLm1hcChlc2NhcGVSZWdFeHApLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdCh2YWx1ZSkpID8gXCJcXFxcYlwiICsgdmFsdWUgKyBcIlxcXFxiXCIgOiB2YWx1ZTtcbiAgICAgICAgfSksXG4gICAgICByZWdleCA9IG5ldyBSZWdFeHAodmFsdWVzLmpvaW4oXCJ8XCIpLCBcImdcIiksXG4gICAgICBtYXRjaCwgc3Vic3RyaW5nLCBpbmRleCA9IDAsXG4gICAgICBwYXR0ZXJuUGFydHMgPSBbXSxcbiAgICAgIHBhdHRlcm5QYXJ0c0luZGV4ID0gW10sXG4gICAgICBtYXRjaFJhbmsgPSAwLFxuICAgICAgbWF0Y2hlcyA9IFtdLFxuICAgICAgaG91cjEyID0gZmFsc2UsXG4gICAgICByZXN0ID0gXCJcIjtcbiAgICAgIFxuICAgICAgd2hpbGUgKG1hdGNoID0gcmVnZXguZXhlYyhzdHJpbmcpKSB7XG4gICAgICAgIGlmIChtYXRjaFswXSA9PT0gcmVwbGFjZW1lbnRzW1widHRcIl0udG9TdHJpbmcoKSkge1xuICAgICAgICAgIGhvdXIxMiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgbWF0Y2hlcy5wdXNoKG1hdGNoKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZm9yICh2YXIgbSA9IDA7IG0gPCBtYXRjaGVzLmxlbmd0aDsgbSsrKSB7XG4gICAgICAgIG1hdGNoID0gbWF0Y2hlc1ttXTtcbiAgICAgICAgc3Vic3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleCwgbWF0Y2guaW5kZXgpO1xuICAgICAgICBpZiAoc3Vic3RyaW5nKSB7XG4gICAgICAgICAgcmVzdCs9IHN1YnN0cmluZztcbiAgICAgICAgICBwYXR0ZXJuUGFydHMucHVzaChbcGF0dGVyblBhcnRzSW5kZXgubGVuZ3RoXSk7XG4gICAgICAgICAgcGF0dGVyblBhcnRzSW5kZXgucHVzaChzdWJzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXRjaGluZ1BhcnRzID0gW107XG4gICAgICAgIGZvciAodmFyIHBhcnQgaW4gcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgICAgaWYgKG1hdGNoWzBdID09PSByZXBsYWNlbWVudHNbcGFydF0udG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgaWYgKChwYXJ0ID09PSBcIkhIXCIgfHwgcGFydCA9PT0gXCJIXCIpICYmIGhvdXIxMikge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gcGF0dGVyblBhcnRzSW5kZXguaW5kZXhPZihwYXJ0KTtcbiAgICAgICAgICAgIGlmIChpIDwgMCkge1xuICAgICAgICAgICAgICBpID0gcGF0dGVyblBhcnRzSW5kZXgubGVuZ3RoO1xuICAgICAgICAgICAgICBwYXR0ZXJuUGFydHNJbmRleC5wdXNoKHBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hpbmdQYXJ0cy5wdXNoKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtYXRjaFJhbmsrPSAxIC8gbWF0Y2hpbmdQYXJ0cy5sZW5ndGg7XG4gICAgICAgIHBhdHRlcm5QYXJ0cy5wdXNoKG1hdGNoaW5nUGFydHMpO1xuICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgc3Vic3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleCk7XG4gICAgICByZXN0Kz0gc3Vic3RyaW5nO1xuICAgICAgXG4gICAgICBpZiAoc3Vic3RyaW5nKSB7XG4gICAgICAgIHBhdHRlcm5QYXJ0cy5wdXNoKFtwYXR0ZXJuUGFydHNJbmRleC5sZW5ndGhdKTtcbiAgICAgICAgcGF0dGVyblBhcnRzSW5kZXgucHVzaChzdWJzdHJpbmcpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXN1bHRMb2NhbGVQYXR0ZXJucy5wdXNoKHtcbiAgICAgICAgbG9jYWxlOiBsb2NhbGUsIFxuICAgICAgICBsb2NhbGVEYXRhOiBsb2NhbGVEYXRhLFxuICAgICAgICByZWxldmFuY2U6IG1hdGNoUmFuayArICgxIC0gcmVzdC5sZW5ndGggLyBzdHJpbmcubGVuZ3RoKSxcbiAgICAgICAgcGF0dGVybjoge1xuICAgICAgICAgIHBhcnRzOiBwYXR0ZXJuUGFydHMsXG4gICAgICAgICAgaW5kZXg6IHBhdHRlcm5QYXJ0c0luZGV4XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIFxuICB9KTtcbiAgXG4gIGlmICghcmVzdWx0TG9jYWxlUGF0dGVybnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHJlc3VsdExvY2FsZVBhdHRlcm5zLnNvcnQoc29ydEJ5UmVsZXZhbmNlKTtcbiAgXG4gIGlmICghcmVzdWx0TG9jYWxlUGF0dGVybnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgXG4gIHZhciByZWxldmFuY2UgPSByZXN1bHRMb2NhbGVQYXR0ZXJuc1swXS5yZWxldmFuY2U7XG4gIFxuICB2YXIgcmVzdWx0cyA9IHJlc3VsdExvY2FsZVBhdHRlcm5zLmZpbHRlcihmdW5jdGlvbihyZXN1bHREYXRhKSB7XG4gICAgcmV0dXJuIHJlc3VsdERhdGEucmVsZXZhbmNlID09PSByZWxldmFuY2U7IFxuICB9KS5tYXAoZnVuY3Rpb24ocmVzdWx0RGF0YSkge1xuICAgIFxuICAgIHZhclxuICAgICAgcGF0dGVybkRhdGEgPSByZXN1bHREYXRhLnBhdHRlcm4sXG4gICAgICBjb21iaW5hdGlvbnMgPSBjYXJ0ZXNpYW5Qcm9kdWN0T2YocGF0dGVybkRhdGEucGFydHMsIHRydWUpLFxuICAgICAgcGF0dGVybnMgPSBjb21iaW5hdGlvbnMubWFwKGZ1bmN0aW9uKGNvbWJpbmF0aW9uKSB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBjb21iaW5hdGlvbi5tYXAoZnVuY3Rpb24ocGFydEluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIHBhdHRlcm5EYXRhLmluZGV4W3BhcnRJbmRleF07XG4gICAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgICAgIHZhciByZWxldmFuY2UgPSByZXN1bHREYXRhLmxvY2FsZURhdGEucGF0dGVybnMuZmlsdGVyKGZ1bmN0aW9uKGxvY2FsZVBhdHRlcm4pIHtcbiAgICAgICAgICByZXR1cm4gc3RyaW5nLmluZGV4T2YobG9jYWxlUGF0dGVybikgPj0gMDtcbiAgICAgICAgfSkubGVuZ3RoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3Q6IHJlc3VsdERhdGEucmVzdCxcbiAgICAgICAgICBzdHJpbmc6IHN0cmluZyxcbiAgICAgICAgICByZWxldmFuY2U6IHJlbGV2YW5jZVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgXG4gICAgaWYgKCFwYXR0ZXJucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBcbiAgICBwYXR0ZXJucy5zb3J0KHNvcnRCeVJlbGV2YW5jZSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3Q6IHBhdHRlcm5zWzBdLnJlc3QsXG4gICAgICByZWxldmFuY2U6IHBhdHRlcm5zWzBdLnJlbGV2YW5jZSxcbiAgICAgIHBhdHRlcm46IHBhdHRlcm5zWzBdLnN0cmluZywgXG4gICAgICBsb2NhbGU6IHJlc3VsdERhdGEubG9jYWxlXG4gICAgfTtcbiAgfSk7XG4gIFxuICByZXN1bHRzLnNvcnQoc29ydEJ5UmVsZXZhbmNlKTtcbiAgXG4gIGlmIChyZXN1bHRzWzBdKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdHRlcm46IHJlc3VsdHNbMF0ucGF0dGVybixcbiAgICAgIGxvY2FsZTogcmVzdWx0c1swXS5sb2NhbGVcbiAgICB9O1xuICB9XG59XG5cblxuZnVuY3Rpb24gZGZvcm1hdChkYXRlLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgcmV0dXJuIGZvcm1hdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5kZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nLCBwYXR0ZXJuLCBsb2NhbGUpIHtcbiAgcmV0dXJuIHBhcnNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5kZm9ybWF0LmRldGVjdCA9IGZ1bmN0aW9uKGRhdGUsIHN0cmluZykge1xuICByZXR1cm4gZGV0ZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZGZvcm1hdDsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJlblwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIkphbnVhcnlcIixcbiAgICAgICAgXCJGZWJydWFyeVwiLFxuICAgICAgICBcIk1hcmNoXCIsXG4gICAgICAgIFwiQXByaWxcIixcbiAgICAgICAgXCJNYXlcIixcbiAgICAgICAgXCJKdW5lXCIsXG4gICAgICAgIFwiSnVseVwiLFxuICAgICAgICBcIkF1Z3VzdFwiLFxuICAgICAgICBcIlNlcHRlbWJlclwiLFxuICAgICAgICBcIk9jdG9iZXJcIixcbiAgICAgICAgXCJOb3ZlbWJlclwiLFxuICAgICAgICBcIkRlY2VtYmVyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJKYW5cIixcbiAgICAgICAgXCJGZWJcIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJBcHJcIixcbiAgICAgICAgXCJNYXlcIixcbiAgICAgICAgXCJKdW5cIixcbiAgICAgICAgXCJKdWxcIixcbiAgICAgICAgXCJBdWdcIixcbiAgICAgICAgXCJTZXBcIixcbiAgICAgICAgXCJPY3RcIixcbiAgICAgICAgXCJOb3ZcIixcbiAgICAgICAgXCJEZWNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiTW9uZGF5XCIsXG4gICAgICAgIFwiVHVlc2RheVwiLFxuICAgICAgICBcIldlZG5lc2RheVwiLFxuICAgICAgICBcIlRodXJzZGF5XCIsXG4gICAgICAgIFwiRnJpZGF5XCIsXG4gICAgICAgIFwiU2F0dXJkYXlcIixcbiAgICAgICAgXCJTdW5kYXlcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIk1vblwiLFxuICAgICAgICBcIlR1ZVwiLFxuICAgICAgICBcIldlZFwiLFxuICAgICAgICBcIlRodVwiLFxuICAgICAgICBcIkZyaVwiLFxuICAgICAgICBcIlNhdFwiLFxuICAgICAgICBcIlN1blwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgTU1NTSBkZCwgeXl5eSwgaGg6bW06c3MgdHRcIixcbiAgICAgIFwiTU1NTSBkZCwgeXl5eSwgaGg6bW06c3MgdHRcIixcbiAgICAgIFwiTU1NIGRkLCB5eXl5LCBoaDptbTpzcyB0dFwiLFxuICAgICAgXCJNTS9kZC95eXl5LCBoaDptbSB0dFwiLFxuICAgICAgXCJkZGRkLCBNTU1NIGRkLCB5eXl5XCIsXG4gICAgICBcIk1NTU0gZGQsIHl5eXlcIixcbiAgICAgIFwiTU1NIGRkLCB5eXl5XCIsXG4gICAgICBcIk1NL2RkL3l5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcImhoOm1tOnNzIHR0XCIsXG4gICAgICBcImhoOm1tIHR0XCJcbiAgICBdXG4gIH0sXG4gIFwiZGVcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJKYW51YXJcIixcbiAgICAgICAgXCJGZWJydWFyXCIsXG4gICAgICAgIFwiTcOkcnpcIixcbiAgICAgICAgXCJBcHJpbFwiLFxuICAgICAgICBcIk1haVwiLFxuICAgICAgICBcIkp1bmlcIixcbiAgICAgICAgXCJKdWxpXCIsXG4gICAgICAgIFwiQXVndXN0XCIsXG4gICAgICAgIFwiU2VwdGVtYmVyXCIsXG4gICAgICAgIFwiT2t0b2JlclwiLFxuICAgICAgICBcIk5vdmVtYmVyXCIsXG4gICAgICAgIFwiRGV6ZW1iZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkphblwiLFxuICAgICAgICBcIkZlYlwiLFxuICAgICAgICBcIk3DpHJcIixcbiAgICAgICAgXCJBcHJcIixcbiAgICAgICAgXCJNYWlcIixcbiAgICAgICAgXCJKdW5cIixcbiAgICAgICAgXCJKdWxcIixcbiAgICAgICAgXCJBdWdcIixcbiAgICAgICAgXCJTZXBcIixcbiAgICAgICAgXCJPa3RcIixcbiAgICAgICAgXCJOb3ZcIixcbiAgICAgICAgXCJEZXpcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiTW9udGFnXCIsXG4gICAgICAgIFwiRGllbnN0YWdcIixcbiAgICAgICAgXCJNaXR0d29jaFwiLFxuICAgICAgICBcIkRvbm5lcnN0YWdcIixcbiAgICAgICAgXCJGcmVpdGFnXCIsXG4gICAgICAgIFwiU2Ftc3RhZ1wiLFxuICAgICAgICBcIlNvbm50YWdcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIk1vLlwiLFxuICAgICAgICBcIkRpLlwiLFxuICAgICAgICBcIk1pLlwiLFxuICAgICAgICBcIkRvLlwiLFxuICAgICAgICBcIkZyLlwiLFxuICAgICAgICBcIlNhLlwiLFxuICAgICAgICBcIlNvLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQuIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC4gTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLiBNTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkLiBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZC4gTU1NIHl5eXlcIixcbiAgICAgIFwiZGQuTU0ueXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJmclwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImphbnZpZXJcIixcbiAgICAgICAgXCJmw6l2cmllclwiLFxuICAgICAgICBcIm1hcnNcIixcbiAgICAgICAgXCJhdnJpbFwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcImp1aW5cIixcbiAgICAgICAgXCJqdWlsbGV0XCIsXG4gICAgICAgIFwiYW/Du3RcIixcbiAgICAgICAgXCJzZXB0ZW1icmVcIixcbiAgICAgICAgXCJvY3RvYnJlXCIsXG4gICAgICAgIFwibm92ZW1icmVcIixcbiAgICAgICAgXCJkw6ljZW1icmVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImphbnYuXCIsXG4gICAgICAgIFwiZsOpdnIuXCIsXG4gICAgICAgIFwibWFyc1wiLFxuICAgICAgICBcImF2ci5cIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJqdWluXCIsXG4gICAgICAgIFwianVpbC5cIixcbiAgICAgICAgXCJhb8O7dFwiLFxuICAgICAgICBcInNlcHQuXCIsXG4gICAgICAgIFwib2N0LlwiLFxuICAgICAgICBcIm5vdi5cIixcbiAgICAgICAgXCJkw6ljLlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJsdW5kaVwiLFxuICAgICAgICBcIm1hcmRpXCIsXG4gICAgICAgIFwibWVyY3JlZGlcIixcbiAgICAgICAgXCJqZXVkaVwiLFxuICAgICAgICBcInZlbmRyZWRpXCIsXG4gICAgICAgIFwic2FtZWRpXCIsXG4gICAgICAgIFwiZGltYW5jaGVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImx1bi5cIixcbiAgICAgICAgXCJtYXIuXCIsXG4gICAgICAgIFwibWVyLlwiLFxuICAgICAgICBcImpldS5cIixcbiAgICAgICAgXCJ2ZW4uXCIsXG4gICAgICAgIFwic2FtLlwiLFxuICAgICAgICBcImRpbS5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZC9NTS95eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImVzXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiRW5lcm9cIixcbiAgICAgICAgXCJGZWJyZXJvXCIsXG4gICAgICAgIFwiTWFyem9cIixcbiAgICAgICAgXCJBYnJpbFwiLFxuICAgICAgICBcIk1heW9cIixcbiAgICAgICAgXCJKdW5pb1wiLFxuICAgICAgICBcIkp1bGlvXCIsXG4gICAgICAgIFwiQWdvc3RvXCIsXG4gICAgICAgIFwiU2VwdGllbWJyZVwiLFxuICAgICAgICBcIk9jdHVicmVcIixcbiAgICAgICAgXCJOb3ZpZW1icmVcIixcbiAgICAgICAgXCJEaWNpZW1icmVcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkVuZS5cIixcbiAgICAgICAgXCJGZWIuXCIsXG4gICAgICAgIFwiTWFyLlwiLFxuICAgICAgICBcIkFici5cIixcbiAgICAgICAgXCJNYXkuXCIsXG4gICAgICAgIFwiSnVuLlwiLFxuICAgICAgICBcIkp1bC5cIixcbiAgICAgICAgXCJBZ28uXCIsXG4gICAgICAgIFwiU2VwdC5cIixcbiAgICAgICAgXCJPY3QuXCIsXG4gICAgICAgIFwiTm92LlwiLFxuICAgICAgICBcIkRpYy5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibHVuZXNcIixcbiAgICAgICAgXCJtYXJ0ZXNcIixcbiAgICAgICAgXCJtacOpcmNvbGVzXCIsXG4gICAgICAgIFwianVldmVzXCIsXG4gICAgICAgIFwidmllcm5lc1wiLFxuICAgICAgICBcInPDoWJhZG9cIixcbiAgICAgICAgXCJkb21pbmdvXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJsdW4uXCIsXG4gICAgICAgIFwibWFyLlwiLFxuICAgICAgICBcIm1pw6kuXCIsXG4gICAgICAgIFwianVlLlwiLFxuICAgICAgICBcInZpZS5cIixcbiAgICAgICAgXCJzw6FiLlwiLFxuICAgICAgICBcImRvbS5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIGRlIE1NTU0gZGUgeXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBkZSBNTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgZGUgTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkLCBkZCBkZSBNTU1NIGRlIHl5eXlcIixcbiAgICAgIFwiZGQgZGUgTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkIGRlIE1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcIk1NTSBkZSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiaXRcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJHZW5uYWlvXCIsXG4gICAgICAgIFwiRmViYnJhaW9cIixcbiAgICAgICAgXCJNYXJ6b1wiLFxuICAgICAgICBcIkFwcmlsZVwiLFxuICAgICAgICBcIk1hZ2dpb1wiLFxuICAgICAgICBcIkdpdWdub1wiLFxuICAgICAgICBcIkx1Z2xpb1wiLFxuICAgICAgICBcIkFnb3N0b1wiLFxuICAgICAgICBcIlNldHRlbWJyZVwiLFxuICAgICAgICBcIk90dG9icmVcIixcbiAgICAgICAgXCJOb3ZlbWJyZVwiLFxuICAgICAgICBcIkRpY2VtYnJlXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJnZW5cIixcbiAgICAgICAgXCJmZWJcIixcbiAgICAgICAgXCJtYXJcIixcbiAgICAgICAgXCJhcHJcIixcbiAgICAgICAgXCJtYWdcIixcbiAgICAgICAgXCJnaXVcIixcbiAgICAgICAgXCJsdWdcIixcbiAgICAgICAgXCJhZ29cIixcbiAgICAgICAgXCJzZXRcIixcbiAgICAgICAgXCJvdHRcIixcbiAgICAgICAgXCJub3ZcIixcbiAgICAgICAgXCJkaWNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwibHVuZWTDrFwiLFxuICAgICAgICBcIm1hcnRlZMOsXCIsXG4gICAgICAgIFwibWVyY29sZWTDrFwiLFxuICAgICAgICBcImdpb3ZlZMOsXCIsXG4gICAgICAgIFwidmVuZXJkw6xcIixcbiAgICAgICAgXCJzYWJhdG9cIixcbiAgICAgICAgXCJkb21lbmljYVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwibHVuXCIsXG4gICAgICAgIFwibWFyXCIsXG4gICAgICAgIFwibWVyXCIsXG4gICAgICAgIFwiZ2lvXCIsXG4gICAgICAgIFwidmVuXCIsXG4gICAgICAgIFwic2FiXCIsXG4gICAgICAgIFwiZG9tXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eSBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU1NL3l5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISDptbVwiLFxuICAgICAgXCJkZGRkIGRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQvTU1NL3l5eXlcIixcbiAgICAgIFwiZGQvTU0veXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXlcIixcbiAgICAgIFwiTU1NIHl5eXlcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJubFwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImphbnVhcmlcIixcbiAgICAgICAgXCJmZWJydWFyaVwiLFxuICAgICAgICBcIm1hYXJ0XCIsXG4gICAgICAgIFwiYXByaWxcIixcbiAgICAgICAgXCJtZWlcIixcbiAgICAgICAgXCJqdW5pXCIsXG4gICAgICAgIFwianVsaVwiLFxuICAgICAgICBcImF1Z3VzdHVzXCIsXG4gICAgICAgIFwic2VwdGVtYmVyXCIsXG4gICAgICAgIFwib2t0b2JlclwiLFxuICAgICAgICBcIm5vdmVtYmVyXCIsXG4gICAgICAgIFwiZGVjZW1iZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcImphblwiLFxuICAgICAgICBcImZlYlwiLFxuICAgICAgICBcIm1ydFwiLFxuICAgICAgICBcImFwclwiLFxuICAgICAgICBcIm1laVwiLFxuICAgICAgICBcImp1blwiLFxuICAgICAgICBcImp1bFwiLFxuICAgICAgICBcImF1Z1wiLFxuICAgICAgICBcInNlcFwiLFxuICAgICAgICBcIm9rdFwiLFxuICAgICAgICBcIm5vdlwiLFxuICAgICAgICBcImRlY1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJtYWFuZGFnXCIsXG4gICAgICAgIFwiZGluc2RhZ1wiLFxuICAgICAgICBcIndvZW5zZGFnXCIsXG4gICAgICAgIFwiZG9uZGVyZGFnXCIsXG4gICAgICAgIFwidnJpamRhZ1wiLFxuICAgICAgICBcInphdGVyZGFnXCIsXG4gICAgICAgIFwiem9uZGFnXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJtYVwiLFxuICAgICAgICBcImRpXCIsXG4gICAgICAgIFwid29cIixcbiAgICAgICAgXCJkb1wiLFxuICAgICAgICBcInZyXCIsXG4gICAgICAgIFwiemFcIixcbiAgICAgICAgXCJ6b1wiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLU1NLXl5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkLU1NLXl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwidHJcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJPY2FrXCIsXG4gICAgICAgIFwixZ51YmF0XCIsXG4gICAgICAgIFwiTWFydFwiLFxuICAgICAgICBcIk5pc2FuXCIsXG4gICAgICAgIFwiTWF5xLFzXCIsXG4gICAgICAgIFwiSGF6aXJhblwiLFxuICAgICAgICBcIlRlbW11elwiLFxuICAgICAgICBcIkHEn3VzdG9zXCIsXG4gICAgICAgIFwiRXlsw7xsXCIsXG4gICAgICAgIFwiRWtpbVwiLFxuICAgICAgICBcIkthc8SxbVwiLFxuICAgICAgICBcIkFyYWzEsWtcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIk9jYVwiLFxuICAgICAgICBcIsWedWJcIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJOaXNcIixcbiAgICAgICAgXCJNYXlcIixcbiAgICAgICAgXCJIYXpcIixcbiAgICAgICAgXCJUZW1cIixcbiAgICAgICAgXCJBxJ91XCIsXG4gICAgICAgIFwiRXlsXCIsXG4gICAgICAgIFwiRWtpXCIsXG4gICAgICAgIFwiS2FzXCIsXG4gICAgICAgIFwiQXJhXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcIlBhemFydGVzaVwiLFxuICAgICAgICBcIlNhbMSxXCIsXG4gICAgICAgIFwiw4dhcsWfYW1iYVwiLFxuICAgICAgICBcIlBlcsWfZW1iZVwiLFxuICAgICAgICBcIkN1bWFcIixcbiAgICAgICAgXCJDdW1hcnRlc2lcIixcbiAgICAgICAgXCJQYXphclwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiUHp0XCIsXG4gICAgICAgIFwiU2FsXCIsXG4gICAgICAgIFwiw4dhclwiLFxuICAgICAgICBcIlBlclwiLFxuICAgICAgICBcIkN1bVwiLFxuICAgICAgICBcIkNtdFwiLFxuICAgICAgICBcIlBhelwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGQgTU1NTSB5eXl5IGRkZGQgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkLk1NLnl5eXkgSEg6bW1cIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5IGRkZGRcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkLk1NLnl5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhIOm1tOnNzXCIsXG4gICAgICBcIkhIOm1tXCJcbiAgICBdXG4gIH0sXG4gIFwiYnJcIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJHZW52ZXJcIixcbiAgICAgICAgXCJDyrxod2V2cmVyXCIsXG4gICAgICAgIFwiTWV1cnpoXCIsXG4gICAgICAgIFwiRWJyZWxcIixcbiAgICAgICAgXCJNYWVcIixcbiAgICAgICAgXCJNZXpoZXZlblwiLFxuICAgICAgICBcIkdvdWVyZVwiLFxuICAgICAgICBcIkVvc3RcIixcbiAgICAgICAgXCJHd2VuZ29sb1wiLFxuICAgICAgICBcIkhlcmVcIixcbiAgICAgICAgXCJEdVwiLFxuICAgICAgICBcIktlcnp1XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJHZW5cIixcbiAgICAgICAgXCJDyrxod2VcIixcbiAgICAgICAgXCJNZXVyXCIsXG4gICAgICAgIFwiRWJyXCIsXG4gICAgICAgIFwiTWFlXCIsXG4gICAgICAgIFwiTWV6aFwiLFxuICAgICAgICBcIkdvdWVcIixcbiAgICAgICAgXCJFb3N0XCIsXG4gICAgICAgIFwiR3dlblwiLFxuICAgICAgICBcIkhlcmVcIixcbiAgICAgICAgXCJEdVwiLFxuICAgICAgICBcIktlclwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJMdW5cIixcbiAgICAgICAgXCJNZXVyemhcIixcbiAgICAgICAgXCJNZXJjyrxoZXJcIixcbiAgICAgICAgXCJZYW91XCIsXG4gICAgICAgIFwiR3dlbmVyXCIsXG4gICAgICAgIFwiU2Fkb3JuXCIsXG4gICAgICAgIFwiU3VsXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJsdW5cIixcbiAgICAgICAgXCJtZXUuXCIsXG4gICAgICAgIFwibWVyLlwiLFxuICAgICAgICBcInlhb3VcIixcbiAgICAgICAgXCJnd2UuXCIsXG4gICAgICAgIFwic2FkLlwiLFxuICAgICAgICBcInN1bFwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwieXl5eSBNTU1NIGRkLCBkZGRkIEhIOm1tOnNzXCIsXG4gICAgICBcInl5eXkgTU1NTSBkZCBISDptbTpzc1wiLFxuICAgICAgXCJ5eXl5IE1NTSBkZCBISDptbTpzc1wiLFxuICAgICAgXCJ5eXl5LU1NLWRkIEhIOm1tXCIsXG4gICAgICBcInl5eXkgTU1NTSBkZCwgZGRkZFwiLFxuICAgICAgXCJ5eXl5IE1NTU0gZGRcIixcbiAgICAgIFwieXl5eSBNTU0gZGRcIixcbiAgICAgIFwieXl5eS1NTS1kZFwiLFxuICAgICAgXCJ5eXl5IE1NTU1cIixcbiAgICAgIFwieXl5eSBNTU1cIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfSxcbiAgXCJwdFwiOiB7XG4gICAgXCJtb250aFwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImphbmVpcm9cIixcbiAgICAgICAgXCJmZXZlcmVpcm9cIixcbiAgICAgICAgXCJtYXLDp29cIixcbiAgICAgICAgXCJhYnJpbFwiLFxuICAgICAgICBcIm1haW9cIixcbiAgICAgICAgXCJqdW5ob1wiLFxuICAgICAgICBcImp1bGhvXCIsXG4gICAgICAgIFwiYWdvc3RvXCIsXG4gICAgICAgIFwic2V0ZW1icm9cIixcbiAgICAgICAgXCJvdXR1YnJvXCIsXG4gICAgICAgIFwibm92ZW1icm9cIixcbiAgICAgICAgXCJkZXplbWJyb1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiamFuXCIsXG4gICAgICAgIFwiZmV2XCIsXG4gICAgICAgIFwibWFyXCIsXG4gICAgICAgIFwiYWJyXCIsXG4gICAgICAgIFwibWFpXCIsXG4gICAgICAgIFwianVuXCIsXG4gICAgICAgIFwianVsXCIsXG4gICAgICAgIFwiYWdvXCIsXG4gICAgICAgIFwic2V0XCIsXG4gICAgICAgIFwib3V0XCIsXG4gICAgICAgIFwibm92XCIsXG4gICAgICAgIFwiZGV6XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcInNlZ3VuZGEtZmVpcmFcIixcbiAgICAgICAgXCJ0ZXLDp2EtZmVpcmFcIixcbiAgICAgICAgXCJxdWFydGEtZmVpcmFcIixcbiAgICAgICAgXCJxdWludGEtZmVpcmFcIixcbiAgICAgICAgXCJzZXh0YS1mZWlyYVwiLFxuICAgICAgICBcInPDoWJhZG9cIixcbiAgICAgICAgXCJkb21pbmdvXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJzZWdcIixcbiAgICAgICAgXCJ0ZXJcIixcbiAgICAgICAgXCJxdWFcIixcbiAgICAgICAgXCJxdWlcIixcbiAgICAgICAgXCJzZXhcIixcbiAgICAgICAgXCJzw6FiXCIsXG4gICAgICAgIFwiZG9tXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkLCBkZCBkZSBNTU1NIGRlIHl5eXkgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgZGUgTU1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkIGRlIE1NTSBkZSB5eXl5IEhIOm1tOnNzXCIsXG4gICAgICBcImRkL01NL3l5eXkgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgZGUgTU1NTSBkZSB5eXl5XCIsXG4gICAgICBcImRkIGRlIE1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZCBkZSBNTU0gZGUgeXl5eVwiLFxuICAgICAgXCJkZC9NTS95eXl5XCIsXG4gICAgICBcIk1NTU0gZGUgeXl5eVwiLFxuICAgICAgXCJNTU0gZGUgeXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImJnXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi0Y/QvdGD0LDRgNC4XCIsXG4gICAgICAgIFwi0YTQtdCy0YDRg9Cw0YDQuFwiLFxuICAgICAgICBcItC80LDRgNGCXCIsXG4gICAgICAgIFwi0LDQv9GA0LjQu1wiLFxuICAgICAgICBcItC80LDQuVwiLFxuICAgICAgICBcItGO0L3QuFwiLFxuICAgICAgICBcItGO0LvQuFwiLFxuICAgICAgICBcItCw0LLQs9GD0YHRglwiLFxuICAgICAgICBcItGB0LXQv9GC0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC+0LrRgtC+0LzQstGA0LhcIixcbiAgICAgICAgXCLQvdC+0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC00LXQutC10LzQstGA0LhcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcItGP0L0uXCIsXG4gICAgICAgIFwi0YTQtdCy0YAuXCIsXG4gICAgICAgIFwi0LzQsNGA0YJcIixcbiAgICAgICAgXCLQsNC/0YAuXCIsXG4gICAgICAgIFwi0LzQsNC5XCIsXG4gICAgICAgIFwi0Y7QvdC4XCIsXG4gICAgICAgIFwi0Y7Qu9C4XCIsXG4gICAgICAgIFwi0LDQstCzLlwiLFxuICAgICAgICBcItGB0LXQv9GCLlwiLFxuICAgICAgICBcItC+0LrRgi5cIixcbiAgICAgICAgXCLQvdC+0LXQvC5cIixcbiAgICAgICAgXCLQtNC10LouXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcItC/0L7QvdC10LTQtdC70L3QuNC6XCIsXG4gICAgICAgIFwi0LLRgtC+0YDQvdC40LpcIixcbiAgICAgICAgXCLRgdGA0Y/QtNCwXCIsXG4gICAgICAgIFwi0YfQtdGC0LLRitGA0YLRitC6XCIsXG4gICAgICAgIFwi0L/QtdGC0YrQulwiLFxuICAgICAgICBcItGB0YrQsdC+0YLQsFwiLFxuICAgICAgICBcItC90LXQtNC10LvRj1wiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwi0L/QvVwiLFxuICAgICAgICBcItCy0YJcIixcbiAgICAgICAgXCLRgdGAXCIsXG4gICAgICAgIFwi0YfRglwiLFxuICAgICAgICBcItC/0YJcIixcbiAgICAgICAgXCLRgdCxXCIsXG4gICAgICAgIFwi0L3QtFwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLiwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5INCzLiwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkg0LMuLCBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5INCzLiwgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcImRkIE1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZC5NTS55eXl5INCzLlwiLFxuICAgICAgXCJNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcIk1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcImluXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiSmFudWFyaVwiLFxuICAgICAgICBcIkZlYnJ1YXJpXCIsXG4gICAgICAgIFwiTWFyZXRcIixcbiAgICAgICAgXCJBcHJpbFwiLFxuICAgICAgICBcIk1laVwiLFxuICAgICAgICBcIkp1bmlcIixcbiAgICAgICAgXCJKdWxpXCIsXG4gICAgICAgIFwiQWd1c3R1c1wiLFxuICAgICAgICBcIlNlcHRlbWJlclwiLFxuICAgICAgICBcIk9rdG9iZXJcIixcbiAgICAgICAgXCJOb3ZlbWJlclwiLFxuICAgICAgICBcIkRlc2VtYmVyXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJKYW5cIixcbiAgICAgICAgXCJGZWJcIixcbiAgICAgICAgXCJNYXJcIixcbiAgICAgICAgXCJBcHJcIixcbiAgICAgICAgXCJNZWlcIixcbiAgICAgICAgXCJKdW5cIixcbiAgICAgICAgXCJKdWxcIixcbiAgICAgICAgXCJBZ3RcIixcbiAgICAgICAgXCJTZXBcIixcbiAgICAgICAgXCJPa3RcIixcbiAgICAgICAgXCJOb3ZcIixcbiAgICAgICAgXCJEZXNcIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwiU2VuaW5cIixcbiAgICAgICAgXCJTZWxhc2FcIixcbiAgICAgICAgXCJSYWJ1XCIsXG4gICAgICAgIFwiS2FtaXNcIixcbiAgICAgICAgXCJKdW1hdFwiLFxuICAgICAgICBcIlNhYnR1XCIsXG4gICAgICAgIFwiTWluZ2d1XCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCJTZW5cIixcbiAgICAgICAgXCJTZWxcIixcbiAgICAgICAgXCJSYWJcIixcbiAgICAgICAgXCJLYW1cIixcbiAgICAgICAgXCJKdW1cIixcbiAgICAgICAgXCJTYWJcIixcbiAgICAgICAgXCJNaW5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSBISC5tbS5zc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkgSEgubW0uc3NcIixcbiAgICAgIFwiZGQgTU1NIHl5eXkgSEgubW0uc3NcIixcbiAgICAgIFwiZGQvTU0veXl5eSBISC5tbVwiLFxuICAgICAgXCJkZGRkLCBkZCBNTU1NIHl5eXlcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTSB5eXl5XCIsXG4gICAgICBcImRkL01NL3l5eXlcIixcbiAgICAgIFwiTU1NTSB5eXl5XCIsXG4gICAgICBcIk1NTSB5eXl5XCIsXG4gICAgICBcIkhILm1tLnNzXCIsXG4gICAgICBcIkhILm1tXCJcbiAgICBdXG4gIH0sXG4gIFwicm9cIjoge1xuICAgIFwibW9udGhcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCJpYW51YXJpZVwiLFxuICAgICAgICBcImZlYnJ1YXJpZVwiLFxuICAgICAgICBcIm1hcnRpZVwiLFxuICAgICAgICBcImFwcmlsaWVcIixcbiAgICAgICAgXCJtYWlcIixcbiAgICAgICAgXCJpdW5pZVwiLFxuICAgICAgICBcIml1bGllXCIsXG4gICAgICAgIFwiYXVndXN0XCIsXG4gICAgICAgIFwic2VwdGVtYnJpZVwiLFxuICAgICAgICBcIm9jdG9tYnJpZVwiLFxuICAgICAgICBcIm5vaWVtYnJpZVwiLFxuICAgICAgICBcImRlY2VtYnJpZVwiXG4gICAgICBdLFxuICAgICAgXCJzaG9ydFwiOiBbXG4gICAgICAgIFwiaWFuLlwiLFxuICAgICAgICBcImZlYi5cIixcbiAgICAgICAgXCJtYXIuXCIsXG4gICAgICAgIFwiYXByLlwiLFxuICAgICAgICBcIm1haVwiLFxuICAgICAgICBcIml1bi5cIixcbiAgICAgICAgXCJpdWwuXCIsXG4gICAgICAgIFwiYXVnLlwiLFxuICAgICAgICBcInNlcHQuXCIsXG4gICAgICAgIFwib2N0LlwiLFxuICAgICAgICBcIm5vdi5cIixcbiAgICAgICAgXCJkZWMuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwid2Vla2RheVwiOiB7XG4gICAgICBcImxvbmdcIjogW1xuICAgICAgICBcImx1bmlcIixcbiAgICAgICAgXCJtYXLIm2lcIixcbiAgICAgICAgXCJtaWVyY3VyaVwiLFxuICAgICAgICBcImpvaVwiLFxuICAgICAgICBcInZpbmVyaVwiLFxuICAgICAgICBcInPDom1ixIN0xINcIixcbiAgICAgICAgXCJkdW1pbmljxINcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcIkx1blwiLFxuICAgICAgICBcIk1hclwiLFxuICAgICAgICBcIk1pZVwiLFxuICAgICAgICBcIkpvaVwiLFxuICAgICAgICBcIlZpblwiLFxuICAgICAgICBcIlPDom1cIixcbiAgICAgICAgXCJEdW1cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJwYXR0ZXJuc1wiOiBbXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5LCBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU0geXl5eSwgSEg6bW06c3NcIixcbiAgICAgIFwiZGQuTU0ueXl5eSwgSEg6bW1cIixcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5XCIsXG4gICAgICBcImRkIE1NTU0geXl5eVwiLFxuICAgICAgXCJkZCBNTU0geXl5eVwiLFxuICAgICAgXCJkZC5NTS55eXl5XCIsXG4gICAgICBcIk1NTU0geXl5eVwiLFxuICAgICAgXCJNTU0geXl5eVwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcIm1rXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi0ZjQsNC90YPQsNGA0LhcIixcbiAgICAgICAgXCLRhNC10LLRgNGD0LDRgNC4XCIsXG4gICAgICAgIFwi0LzQsNGA0YJcIixcbiAgICAgICAgXCLQsNC/0YDQuNC7XCIsXG4gICAgICAgIFwi0LzQsNGYXCIsXG4gICAgICAgIFwi0ZjRg9C90LhcIixcbiAgICAgICAgXCLRmNGD0LvQuFwiLFxuICAgICAgICBcItCw0LLQs9GD0YHRglwiLFxuICAgICAgICBcItGB0LXQv9GC0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC+0LrRgtC+0LzQstGA0LhcIixcbiAgICAgICAgXCLQvdC+0LXQvNCy0YDQuFwiLFxuICAgICAgICBcItC00LXQutC10LzQstGA0LhcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRcIjogW1xuICAgICAgICBcItGY0LDQvS5cIixcbiAgICAgICAgXCLRhNC10LIuXCIsXG4gICAgICAgIFwi0LzQsNGALlwiLFxuICAgICAgICBcItCw0L/RgC5cIixcbiAgICAgICAgXCLQvNCw0ZhcIixcbiAgICAgICAgXCLRmNGD0L0uXCIsXG4gICAgICAgIFwi0ZjRg9C7LlwiLFxuICAgICAgICBcItCw0LLQsy5cIixcbiAgICAgICAgXCLRgdC10L/Rgi5cIixcbiAgICAgICAgXCLQvtC60YIuXCIsXG4gICAgICAgIFwi0L3QvtC10LwuXCIsXG4gICAgICAgIFwi0LTQtdC6LlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcIndlZWtkYXlcIjoge1xuICAgICAgXCJsb25nXCI6IFtcbiAgICAgICAgXCLQv9C+0L3QtdC00LXQu9C90LjQulwiLFxuICAgICAgICBcItCy0YLQvtGA0L3QuNC6XCIsXG4gICAgICAgIFwi0YHRgNC10LTQsFwiLFxuICAgICAgICBcItGH0LXRgtCy0YDRgtC+0LpcIixcbiAgICAgICAgXCLQv9C10YLQvtC6XCIsXG4gICAgICAgIFwi0YHQsNCx0L7RgtCwXCIsXG4gICAgICAgIFwi0L3QtdC00LXQu9CwXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLQv9C+0L0uXCIsXG4gICAgICAgIFwi0LLRgi5cIixcbiAgICAgICAgXCLRgdGA0LUuXCIsXG4gICAgICAgIFwi0YfQtdGCLlwiLFxuICAgICAgICBcItC/0LXRgi5cIixcbiAgICAgICAgXCLRgdCw0LEuXCIsXG4gICAgICAgIFwi0L3QtdC0LlwiXG4gICAgICBdXG4gICAgfSxcbiAgICBcInBhdHRlcm5zXCI6IFtcbiAgICAgIFwiZGRkZCwgZGQgTU1NTSB5eXl5INCzLiBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIHl5eXkg0LMuIEhIOm1tOnNzXCIsXG4gICAgICBcImRkIE1NTSB5eXl5INCzLiBISDptbTpzc1wiLFxuICAgICAgXCJkZC5NTS55eXl5IEhIOm1tXCIsXG4gICAgICBcImRkZGQsIGRkIE1NTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQgTU1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJkZCBNTU0geXl5eSDQsy5cIixcbiAgICAgIFwiZGQuTU0ueXl5eVwiLFxuICAgICAgXCJNTU1NIHl5eXkg0LMuXCIsXG4gICAgICBcIk1NTSB5eXl5INCzLlwiLFxuICAgICAgXCJISDptbTpzc1wiLFxuICAgICAgXCJISDptbVwiXG4gICAgXVxuICB9LFxuICBcInRoXCI6IHtcbiAgICBcIm1vbnRoXCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi4Lih4LiB4Lij4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4LiB4Li44Lih4Lig4Liy4Lie4Lix4LiZ4LiY4LmMXCIsXG4gICAgICAgIFwi4Lih4Li14LiZ4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4LmA4Lih4Lip4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4Lie4Lik4Lip4Lig4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4Lih4Li04LiW4Li44LiZ4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4LiB4Lij4LiB4LiO4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4Liq4Li04LiH4Lir4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4LiB4Lix4LiZ4Lii4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4LiV4Li44Lil4Liy4LiE4LihXCIsXG4gICAgICAgIFwi4Lie4Lik4Lio4LiI4Li04LiB4Liy4Lii4LiZXCIsXG4gICAgICAgIFwi4LiY4Lix4LiZ4Lin4Liy4LiE4LihXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLguKEu4LiELlwiLFxuICAgICAgICBcIuC4gS7guJ4uXCIsXG4gICAgICAgIFwi4Lih4Li1LuC4hC5cIixcbiAgICAgICAgXCLguYDguKEu4LiiLlwiLFxuICAgICAgICBcIuC4ni7guIQuXCIsXG4gICAgICAgIFwi4Lih4Li0LuC4oi5cIixcbiAgICAgICAgXCLguIEu4LiELlwiLFxuICAgICAgICBcIuC4qi7guIQuXCIsXG4gICAgICAgIFwi4LiBLuC4oi5cIixcbiAgICAgICAgXCLguJUu4LiELlwiLFxuICAgICAgICBcIuC4ni7guKIuXCIsXG4gICAgICAgIFwi4LiYLuC4hC5cIlxuICAgICAgXVxuICAgIH0sXG4gICAgXCJ3ZWVrZGF5XCI6IHtcbiAgICAgIFwibG9uZ1wiOiBbXG4gICAgICAgIFwi4Lin4Lix4LiZ4LiI4Lix4LiZ4LiX4Lij4LmMXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lit4Lix4LiH4LiE4Liy4LijXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lie4Li44LiYXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lie4Lik4Lir4Lix4Liq4Lia4LiU4Li1XCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lio4Li44LiB4Lij4LmMXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4LmA4Liq4Liy4Lij4LmMXCIsXG4gICAgICAgIFwi4Lin4Lix4LiZ4Lit4Liy4LiX4Li04LiV4Lii4LmMXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0XCI6IFtcbiAgICAgICAgXCLguIguXCIsXG4gICAgICAgIFwi4LitLlwiLFxuICAgICAgICBcIuC4ni5cIixcbiAgICAgICAgXCLguJ7guKQuXCIsXG4gICAgICAgIFwi4LioLlwiLFxuICAgICAgICBcIuC4qi5cIixcbiAgICAgICAgXCLguK3guLIuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwicGF0dGVybnNcIjogW1xuICAgICAgXCJkZGRkIGRkIE1NTU0gMjU0MyBISDptbTpzc1wiLFxuICAgICAgXCJkZCBNTU1NIDI1NDMgSEg6bW06c3NcIixcbiAgICAgIFwiZGQgTU1NIDI1NDMgSEg6bW06c3NcIixcbiAgICAgIFwiZGQvTU0vMjU0MyBISDptbVwiLFxuICAgICAgXCJkZGRkIGRkIE1NTU0gMjU0M1wiLFxuICAgICAgXCJkZCBNTU1NIDI1NDNcIixcbiAgICAgIFwiZGQgTU1NIDI1NDNcIixcbiAgICAgIFwiZGQvTU0vMjU0M1wiLFxuICAgICAgXCJNTU1NIDI1NDNcIixcbiAgICAgIFwiTU1NIDI1NDNcIixcbiAgICAgIFwiSEg6bW06c3NcIixcbiAgICAgIFwiSEg6bW1cIlxuICAgIF1cbiAgfVxufTsiXX0=
