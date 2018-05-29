/**
 * Convert a given string into PascalCase
 * @param str 
 */
export function stringToPascalCase(str: string) {
  return str.match(/[a-z]+/gi)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    })
    .join('');
}

/**
 * Convert a given string into kebab-case
 * @param str 
 */
export function stringToKebabCase(str: string) {
  return str.match(/[a-z]+/gi)
    .map(word => word.toLowerCase())
    .join('-');
}
