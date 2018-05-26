import { Keyword } from '../../shared';

/**
 * Returns a list of objects containing keywords associated with miniboss posts
 * 
 * While creating keywords, Always omit the last 's' on the end of a keyword.
 * Example: 'grass' > 'gras'.
 * 
 * Keywords should all be lowercased
 */
export const minibossKeywords: Keyword[] = [
  {  // adds '#' to pure number strings
    match: /^[0-9]+$/,
    value: '#',
    action: str => str
  },
  {  // Links Pedros patreon
    match: 'patreon',
    value: 'a'
  },
  {
    match: /^(firearm[ ./-]*design|gun|rifle)$/,
    value: '#68'
  },
  {
    match: 'shield',
    value: '#66'
  },
  {
    match: /^((3\/4(ths?)?[ ./-]*)?(building|house))$/,
    value: '#65'
  },
  {
    match: 'interior',
    value: '#60'
  },
  {
    match: 'damage',
    value: '#59'
  },
  {  // Links to any vegetation tutorial (provided they stay consistent with their naming (which they don't))
    match: /^veg([ei]tati?on)?[ ./(-]*(tut(orial)?[ ./()-]*)?(p((ar)?t)?)?[ ./()-]*([0-9]+)\)*/,
    value: 'Vegetation ',
    action: (str, match) => match[7] > 2 ? `(part ${match[7]})` : `tutorial - part ${match[7]}`
  },
  {
    match: /^(leaf|leave|moss|palm[ ./-]*tree)$/,
    value: '#57'
  },
  {
    match: /^9[ ./-]*slice$/,
    value: '#52'
  },
  {
    match: /^1[ ./]*bit$/,
    value: '#51'
  },
  {
    match: 'air',
    value: '#50'
  },
  {
    match: 'planet',
    value: '#49'
  },
  {
    match: /^(sel(ective)?[ ./-]*out(line)?|outline)$/,
    value: '#47'
  },
  {
    match: '4 leg',
    value: '#46'
  },
  {
    match: 'light',
    value: '#45'
  },
  {
    match: /^(clothe?|banner|flag)$/,
    value: '#42'
  },
  {
    match: 'gore',
    value: '#41'
  },
  {
    match: 'dirt',
    value: '#40'
  },
  {
    match: 'projectile',
    value: '#38'
  },
  {
    match: 'sword',
    value: '#35'
  },
  {
    match: 'gras',
    value: '#32'
  },
  {
    match: 'bird',
    value: '#29'
  },
  {
    match: 'thrust',
    value: '#25'
  },
  {
    match: 'particle',
    value: '#18'
  },
  {
    match: /^(sub[ .-/]*pixel)$/,
    value: '#17'
  },
  {
    match: 'tree',
    value: '#13'
  },
  {
    match: 'liquid',
    value: '#10'
  },
  {
    match: /^(rule|tip|basic)$/,
    value: '#5'
  },
  {
    match: 'run cycle',
    value: '#4'
  },
  {
    match: 'punch',
    value: '#2'
  },
  {
    match: 'reflection',
    value: '#1'
  }
];
