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