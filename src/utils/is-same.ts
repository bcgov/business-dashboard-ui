import isEqual from 'lodash.isequal'
import omit from 'lodash.omit'

/**
 * Compares two objects while omitting specified properties from the comparison.
 * @param objA the first object to compare
 * @param objB the second object to compare
 * @param props an optional array of properties to omit during the comparison
 * @returns a boolean indicating a match of objects
 */
export const isSame = (objA: object, objB: object, props: string[] = []): boolean => {
  return isEqual({ ...omit(objA, props) }, { ...omit(objB, props) })
}
