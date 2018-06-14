/**
 * Joins the array or function arguments array into a string.
 * @param {IArguments | string[]} array The array to join
 * @param {number} from The index from including.
 * @return {string}
 */
export function joinArrayFrom(array: IArguments | string[], from: number): string {
    let args = getSubArray(array, from);

    if (args.length > 0) {
        return args.join(" ");
    }
    return null;
}

/**
 * Gets a subset of the array or function arguments.
 * @param {IArguments | string[]} array The array to join
 * @param {number} from The index from including.
 * @return {string[]}
 */
export function getSubArray(array: IArguments | string[], from: number): string[] {
    let result: string[] = [];
    for (let i = from; i < array.length; i++) {
        result.push(array[i]);
    }
    return result;
}

/**
 * Same as {@link requireInterface} but returns a boolean instead of throwing an error.
 * @param actual The object to check.
 * @param expected The expected interface.
 * @return {boolean} If actual has all the expected attributes.
 */
export function requireInterfaceSafe(actual: any, expected: any): boolean {
    try {
        requireInterface(actual, expected);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * This method checks if an object has all the required attributes.
 * This method will throw an exception if one attribute of expected was not present in actual.
 * Nested attributes are also allowed. This does not check if type of the attribtute are correct, it only checks if they are present.
 * Examples:
 * requireInterface({a:1, b:"hey", c:true, d:"extra"}, {a:true, b:true, c:true}) => succeeds;
 * requireInterface({a:1, b:"hey", c:{c1:1, c2:2, c3:c3} },{a:true, b:true, c:true}) => succeeds;
 * requireInterface({a:1, b:"hey", c:"hey" },{a:true, b:true, d:true }) => fails;
 * requireInterface({a:1, b:"hey", c:"hey" },{a:true, b:true, c:{c1:true, c2:true, c3:true} }) => fails;
 * @param actual The object to check.
 * @param expected The expected interface.
 */
export function requireInterface(actual: any, expected: any) {
    (function requirePlugins(actual, expected) {
        for (let key in expected) {
            if (!expected.hasOwnProperty(key)) continue;
            let val = expected[key];
            if (!actual[key]) {
                throw new Error("Attribute" + key + " not present");
            }
            if (typeof val === "object") {
                requirePlugins(actual[key], expected[key]);
            }
        }
    })(actual, expected);
}

