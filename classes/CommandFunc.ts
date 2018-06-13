import {MineflayerBot} from "mineflayer";

/**
 * A object that represents information about the executed command.
 */
export declare type CommandInfo = {
    /**
     * The person who issued the command,
     * this <i>can</i> be null when it is from a terminal instead of ingame.
     */
    from: string;
    /**
     * If this command is whispered to the bot.
     */
    whispered: boolean

    /**
     * The time the chat message was received.
     */
    date: Date;
}

/**
 * Represents a command that can be executed by the bot.
 * The first argument is the bot that executes a command.
 * The second argument is the user that ordered this command to be executed. This will be null if it was done from the terminal.
 * The other arguments are the arguments passed, all these arguments can be undefined/null so need to be checked before use.
 * It should return a string on invalid input. Otherwise it should return a falsy value (null, false, undefined, etc.).
 */
export declare type CommandFunc = (bot: MineflayerBot, options: CommandInfo, ...args: string[]) => string;