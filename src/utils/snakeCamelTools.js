/**
 * Utility functions to convert JSON keys between snake_case and camelCase.
 * This is crucial for bridging Python (snake_case) APIs with JavaScript (camelCase) frontends.
 */

// Regex to convert snake_case_string to camelCaseString
const SNAKE_TO_CAMEL_REGEX = /([-_][a-z])/ig;

// Regex to convert camelCaseString to snake_case_string (insert underscore before capital letters)
const CAMEL_TO_SNAKE_REGEX = /([A-Z])/g;

/**
 * Converts a string from snake_case to camelCase.
 * e.g., 'user_id' -> 'userId'
 * @param {string} str - The snake_case string.
 * @returns {string} The camelCase string.
 */
function strToCamelCase(str) {
  if (typeof str !== 'string' || !str.includes('_')) {
    return str;
  }
  if (str === '_id') return str;

  return str.replace(SNAKE_TO_CAMEL_REGEX, $1 => $1.toUpperCase()
    .replace('-', '')
    .replace('_', ''));
}

/**
 * Converts a string from camelCase to snake_case.
 * e.g., 'userId' -> 'user_id'
 * @param {string} str - The camelCase string.
 * @returns {string} The snake_case string.
 */
export function strToSnakeCase(str) {
  if (typeof str !== 'string') {
    return str;
  }
  if (str === '_id') return str;

  // Insert underscore before capital letters and convert the result to lowercase
  return str.replace(CAMEL_TO_SNAKE_REGEX, (match, p1) => (str.indexOf(match) === 0 ? p1.toLowerCase() : `_${p1.toLowerCase()}`));
}

/**
 * Recursively converts all keys in a data structure (object or array)
 * from camelCase to snake_case.
 *
 * NOTE: This function assumes a helper function `toSnakeCase(key)` exists
 * to convert a single string key.
 */
export function camelToSnake(data) {
  if (Array.isArray(data)) {
    return data.map(item => camelToSnake(item));
  }

  if (data !== null && typeof data === 'object') {
    const newObject = {};
    const objectKeys = Object.keys(data);
    for (const key of objectKeys) {
      const newKey = strToSnakeCase(key);
      newObject[newKey] = camelToSnake(data[key]);
    }

    return newObject;
  }

  return data;
}

/**
 * Recursively converts all keys in a data structure (object or array)
 * from snake_case to camelCase.
 *
 * NOTE: This function assumes a helper function `strToCamelCase(key)` exists
 * to convert a single string key.
 */
export function snakeToCamel(data) {
  if (Array.isArray(data)) {
    return data.map(item => snakeToCamel(item));
  }

  if (data !== null && typeof data === 'object') {
    const newObject = {};
    const objectKeys = Object.keys(data);
    for (const key of objectKeys) {
      const newKey = strToCamelCase(key);
      newObject[newKey] = snakeToCamel(data[key]);
    }

    return newObject;
  }

  return data;
}
