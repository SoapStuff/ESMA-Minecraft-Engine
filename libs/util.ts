export function getCommand(array: IArguments | string[], index: number): string {
    let args = [];

    for (let i = index; i < array.length; i++) {
        args.push(array[i]);
    }

    if (args.length > 0) {
        return args.join(" ");
    }
    return null;
}