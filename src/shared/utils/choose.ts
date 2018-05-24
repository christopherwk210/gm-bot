/**
 * Returns a random item from the given array
 * @param a Any array of values
 */
export function choose(a: any[]) {
  if (!a) {
    return;
  }
  
  // http://stackoverflow.com/a/4550514
  let rand = a[Math.floor(Math.random() * a.length)];
  
  return rand;
};
