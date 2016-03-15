var ln10 = Math.log(10);
var calcStepSize = function(range, targetSteps)
{
  
  // calculate an initial guess at step size
  var tempStep = range / targetSteps;

  // get the magnitude of the step size
  var mag = Math.floor(Math.log(tempStep) / ln10);
  var magPow = Math.pow(10, mag);

  // calculate most significant digit of the new step size
  var magMsd = Math.round(tempStep / magPow + 0.5);

  // promote the MSD to either 1, 2, or 5
  if (magMsd > 5.0)
    magMsd = 10.0;
  else if (magMsd > 2.0)
    magMsd = 5.0;
  else if (magMsd > 1.0)
    magMsd = 2.0;

  return magMsd * magPow;
};


var 
  niceFraction = function(number, round) {
    
    var
      log10 = Math.log(number) / Math.log(10),
      exponent = Math.floor(log10),
      fraction = number / Math.pow(10, exponent),
      result;

    if (round) {
      if (fraction < 1.5) {
        result = 1;
      } else if (fraction < 3) {
        result = 2;
      } else if (fraction < 7) {
        result = 5;
      } else {
        result = 10;
      }
    } else {
      if (fraction <= 1) {
        result = 1;
      } else if (fraction <= 2) {
        result = 2;
      } else if (fraction <= 5) {
        result = 5;
      } else {
        result = 10;
      }
    }
    
    return result * Math.pow(10, exponent);
  },
  
  numTicks = function(min, max, count, outer) {

    if (min === max) {
      return [max];
    }
          
    // Defaults
    min = typeof min === "undefined" || isNaN(min) ? 0 : min;
    max = typeof max === "undefined" || isNaN(max) ? 1 : max;
    count = typeof count !== "number" ? 10 : count;
    outer = typeof outer === "undefined" ? false : outer;
    
    var
      diff = max - min;
      
    var 
      interval = calcStepSize(diff, count),
      nmin = min - min % interval,
      nmax = max - max % interval,
      size,
      tickItems = [],
      tickValue,
      i;
  
   if (outer) {
      
      if (nmin > min) {
        nmin-= interval;
      }
      
      if (nmax < max) {
        nmax+= interval;
      }
        
    } else {
      
      if (nmin < min) {
        nmin+= interval;
      }
      
      if (nmax > max) {
        nmax-= interval;
      }
      
    }
    
    for (i = nmin; i <= nmax; i+=interval) {
      tickItems.push(i);
    }
    
    return tickItems;
  };
  
module.exports = numTicks;