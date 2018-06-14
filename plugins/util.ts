import {MineflayerBot} from "../mineflayer";

export function joinArrayFrom(array: IArguments | string[], index: number): string {
    let args = [];

    for (let i = index; i < array.length; i++) {
        args.push(array[i]);
    }

    if (args.length > 0) {
        return args.join(" ");
    }
    return null;
}

export function getSubArray(array: IArguments | string[], from: number): string[] {
    let result: string[] = [];
    for (let i = from; i < array.length; i++) {
        result.push(array[i]);
    }
    return result;
}

export function requireInterfaceSafe(bot: MineflayerBot, object: any): boolean {
    try {
        requireInterface(bot, object);
        return true;
    } catch (e) {
        return false;
    }
}

export function requireInterface(bot: MineflayerBot, object: any) {
    (function requirePlugins(actual, expected) {
        for (let key in expected) {
            if (!expected.hasOwnProperty(key)) continue;
            let val = expected[key];
            if (!actual[key]) {
                throw new Error(`Attribute not present expected: ` +
                    `${JSON.stringify(expected)} but was: ${JSON.stringify(actual)}`);
            }
            if (typeof val === "object") {
                requirePlugins(actual[key], expected[key]);
            }
        }
    })(bot, object);
}

