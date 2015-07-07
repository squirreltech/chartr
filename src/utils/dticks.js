var nticks = require('./nticks');

var
  
  daysInMonth = function(date) {
    return new Date(date.getYear(), date.getMonth() + 1, 0).getDate();
  },    
  
  dateDiff = (function() {
    
    var
      monthDiff = function(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth() + 1;
        return months <= 0 ? 0 : months;
      };
    
    return function(date1, date2, flags) {
      result = {};
      
      flags = typeof flags !== 'undefined' ? flags : 1 | 2 | 4 | 8 | 16 | 32;
      
      date1 = new Date(date1);
      date2 = new Date(date2);
      
      var
        t1 = date1.getTime(),
        t2 = date2.getTime(),
        tz1 = date2.getTimezoneOffset(),
        tz2 = date2.getTimezoneOffset(),
        years,
        months,
        days,
        hours,
        minutes;

      if (flags & 1 || flags & 2 || flags & 4) {
        months = monthDiff(date1, date2);
      }
      
      if (flags & 1) {
        years = Math.floor(months / 12);
        months = months - years * 12;
        result.years = years;
      }
      
      if (flags & 4) {
        if (flags & 2) {
          if (date2.getUTCDate() >= date1.getUTCDate()) {
            days = date2.getUTCDate() - date1.getUTCDate();
          } else {
            months--;
            days = date1.getUTCDate() - date2.getUTCDate() + daysInMonth(date1);
          }
        } else {
          days = (t2 - t1) / 1000 / 60 / 60 / 24;
        }
      }
      
      if (flags & 2) {
        result.months = months;
      }
      
      if (flags & 4) {
        result.days = Math.abs(Math.round(days));
      }
      
      if (flags & 8) {
        // Hours
        hours = (t2 - t1) / 1000 / 60 / 60;
        if (flags & 4) {
          hours = Math.round((t2 - t1) / 1000 / 60 / 60 / 24) * 24 - hours;
        }
        result.hours = Math.round(hours);
      }
      
      if (flags & 16) {
        // Minutes
        minutes = (t2 - t1) / 1000 / 60;
        if (flags & 8) {
          minutes = Math.round((t2 - t1) / 1000 / 60 / 60) * 60 - minutes;
        }
        result.minutes = Math.round(minutes);
      }
      
      if (flags & 32) {
        // Minutes
        seconds = (t2 - t1) / 1000;
        if (flags & 16) {
          seconds = Math.round((t2 - t1) / 1000 / 60) * 60 - seconds;
        }
        result.seconds = Math.round(seconds);
      }
      
      return result;
    };
  })(),
  
  dateTicks = function(min, max, count, outer) {

    // Defaults
    min = typeof min === "undefined" || isNaN(min) ? 0 : min;
    max = typeof max === "undefined" || isNaN(max)? 1 : max;
    count = typeof count !== "number" ? 10 : count;
    outer = typeof outer === "undefined" ? false : outer,
    ticks = [];
    
    min = new Date(min);
    max = new Date(max);
    
    if (min.getTime() === max.getTime()) {
      return [min, max];
    }
    
    var tickUnit = null;
    var o, v, f = 1, sf, sv;
    while(f <= 32 && (o = dateDiff(min, max, f))) {
      v = o[Object.keys(o)[0]];
      if (v < count || f === 1) {
        sf = f;
        sv = v;
        f*=2;
      } else {
        break;
      }
    }
    
    var diff = dateDiff(min, max);
    
    if (sf === 1) {
      // Year scale
      
      var yearMinDate = new Date("1/1/" + min.getFullYear());
      var yearMaxDate = new Date("1/1/" + max.getFullYear());
      
      var yearMinDiff = dateDiff(yearMinDate, min, 0 | 2).months / 12;
      var yearMaxDiff = dateDiff(yearMaxDate, max, 0 | 2).months / 12;
      
      var yearTicks = nticks(min.getFullYear() + yearMinDiff, max.getFullYear() + yearMaxDiff, count, outer);
      
      for (var i = 0; tick = yearTicks[i]; i++) {
        var decYear = tick;
        var intYear = Math.floor(decYear);
        var decMonth = (decYear - intYear) * 12;
        var intMonth = Math.floor(decMonth);
        var intDate = new Date(intYear, intMonth, 0);
        
        var decDay = (decMonth - intMonth) * daysInMonth(intDate);
        var intDay = Math.floor(decDay);
        var date = new Date("1/1/1970");
        date.setFullYear(intYear);
        date.setMonth(intMonth);
        date.setDate(intDay + 1);
        
        ticks[i] = date;
      }
      
      return ticks;
    } else {
      // Scale not supported currently
      console.warn("SCALE NOT SUPPORTED");
      return [];
    }
  };
  
module.exports = dateTicks;