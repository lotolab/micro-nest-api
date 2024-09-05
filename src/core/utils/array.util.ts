/**
 *
 * @param a
 * @param b
 * @returns number
 */
export function compareSortnoASC(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 *
 * @param a
 * @param b
 * @returns
 */
export function compareSortnoDESC(a, b) {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}
