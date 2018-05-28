/**
 * Returns a random item from the given array
 * @param a Any array of values
 * @see {@link http://stackoverflow.com/a/4550514}
 */
export function choose(a: any[]) {
  return a[Math.floor(Math.random() * a.length)];
};
