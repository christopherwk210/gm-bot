
/**
 * Returns a list of objects containing keywords associated with palettes listed on lospec
 *
 * @arg {String|Regex} match Keyword(s) to match against
 * @arg {String} value Title of palette
 * @arg {Function} [action] Optional function call. Return value is concatinated onto value
 */
module.exports = [
  {
    match: /^en?d(es)?ga?-*([0-9]+)-*x?$/,
    value: 'Endesga-',
    action: (str, match) => match[2]
  },
  {
    match: /^dbs?-*8(-*col(or)?)?$/,
    value: 'DawnBringers-8-color'
  },
  {
    match: /^(aseprite-default|d(awn)?-*b(ringer)?-*([0-9]+))$/,
    value: 'DawnBringer-',
    action: (str, match) => match[4] || 32
  },
  {
    match: /^andrew-*ken?sler-*([0-9]+)$/,
    value: 'Andrew-Kensler-',
    action: (str, match) => match[1]
  },
  {
    match: /^(tony-?)?str(-?8)?$/,
    value: '!STR8'
  },
  {
    match: 'apple-2',
    value: 'apple-II'
  },
  {
    match: 'nyx-8',
    value: 'nyx8'
  },
  {
    match: 'nes',
    value: 'Nintendo-Entertainment-System'
  },
  {
    match: 'jmp',
    value: 'JMP-Japanese-Machine-Palette'
  },
  {
    match: /arcade(-standard|-29)?/,
    value: 'Arcade-Standard-29'
  }
];
