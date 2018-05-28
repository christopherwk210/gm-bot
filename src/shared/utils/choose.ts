declare interface Array<T> {
  /**
   * Returns a random item from an array
   * @see {@link http://stackoverflow.com/a/4550514 }
   * @method
   */
  choose: () => T;
}

Array.prototype.choose = function(this: any[]) {
  return this[Math.floor(Math.random() * this.length)];
}
