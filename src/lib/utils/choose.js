/**
 * Returns a random item from the given array
 * @param {Array<any>} a Any array of values
 */
module.exports = function(a) {
  if (!a) {
    return;
  }
  
  // http://stackoverflow.com/a/4550514
  let rand = a[Math.floor(Math.random() * a.length)];
  
  return rand;
};
