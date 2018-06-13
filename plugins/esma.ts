import * as chat from "./commands/chat";

import {MineflayerBot, MineflayerBotOptions} from "mineflayer";
import {ESMABot} from "../classes/ESMABot";
import {ESMAOptions} from "../classes/ESMAOptions";
import {CommandFunc} from "../classes/CommandFunc";
import {getSubArray, joinArrayFrom} from "./util";

export class CommandItem {

    get func() {
        return this._func;
    }

    get help() {
        return this._help;
    }

    private readonly _command: string;
    private readonly _func: CommandFunc;
    private readonly _help: string;

    constructor(command: string, func: CommandFunc, help: string) {
        this._command = command;
        this._func = func;
        this._help = help;
    }

    toJSON(): string {
        return this._command + " : " + this.help;
    }
}

export class CommandMap {
    [index: string]: CommandItem | CommandMap
}

// declare type CommandMap = { [index: string]: { func: CommandFunc, help: string } | CommandMap };

/**
 * The ESMA plugin for handling commands.
 */
export class ESMA {
    private readonly commands: CommandMap;
    private readonly logging: boolean;
    private readonly owners: string[];
    private readonly mineflayer_bot: MineflayerBot;

    /**
     * Create a new instance of ESMA, with reference to the original mineflayer bot.
     * @param {MineflayerBot} bot
     * @param {ESMAOptions} options
     */
    constructor(bot: MineflayerBot, options: ESMAOptions) {
        this.mineflayer_bot = bot;
        this.owners = options.owners;
        this.logging = !!options.logging;
        this.commands = {};
        this.registerCommand("help", this.help, "Displays the help of a command or displays the list. \n " +
            "usage: help [command] [subcommand] ...");
    }

    /**
     * Executes a command for the specified minecraft bot.
     * @param {string} username The person that issued the command
     * @param {string} command_string The string with the command and arguments.
     * @param {boolean} [whisper] whether the command was whispered or not.
     */
    interpCommandString(username: string, command_string: string, whisper: boolean = false): void {
        let bot = this.mineflayer_bot;
        if (!bot) return console.log("Bot not initialized");

        //This splits it into an string array, split on spaces.
        let args = command_string.match(/(?:[^\s"]+|"[^"]*")+/g);
        // console.log(args ? args : "[]");

        if (!args || !args[0]) {
            this.chat(username, "What would you like me to do " + (username ? username : "master") + "?");
            return;
        }

        //Remove double quotes from all strings.
        for (let i = 0; i < args.length; i++) {
            if (args[i].length > 2 && args[i].startsWith('"') && args[i].endsWith('"')) {
                args[i] = args[i].substr(1, args[i].length - 2);
            }
        }

        this.interpCommand(username, args, whisper, this.commands);
    }

    /**
     * @param {string} username
     * @param {string[]} args
     * @param {boolean} whisper
     * @param {CommandMap} commands
     */
    private interpCommand(username: string, args: string[], whisper: boolean, commands: CommandMap) {
        let bot = this.mineflayer_bot;
        if (!bot) return;

        if (args.length < 1) {
            this.chat(username, "No (sub) command specified");
        }

        let command = commands[args[0]];
        //Work around for the string array
        let func_args: (string | MineflayerBot)[] = args;

        if (command && command instanceof CommandItem) {
            func_args[0] = this.mineflayer_bot;
            func_args.splice(1, 0, username);
            try {
                let result: string | boolean = command.func.apply(this, func_args);
                if (result && typeof result === "string") {
                    this.chat(username, result, whisper);
                }
            } catch (e) {
                console.log(e);
                bot.chat("Oh, oh, something went wrong: " + e.message);
            }
        } else if (command && command instanceof CommandMap) {
            func_args.splice(0, 1);
            this.interpCommand(username, func_args, whisper, command);
        } else {
            this.chat(username, "I don't know what '" + args[0] + "' means.", whisper);
        }
    }

    /**
     * Adds a new command to esma.
     * @param {string} command
     * @param {CommandFunc} func
     * @param {string} help
     * @param {CommandMap} [commands] the current position in the command tree.
     */
    registerCommand(command: string, func: CommandFunc, help: string, commands: CommandMap = this.commands) {
        let cmds = command.split(".");
        if (cmds.length > 1) {
            if (!commands[cmds[0]]) commands[cmds[0]] = new CommandMap();
            this.registerCommand(joinArrayFrom(cmds, 1), func, help, <CommandMap> commands[cmds[0]]);
            return;
        }
        if (!commands[command]) {
            commands[command] = new CommandItem(command, func, help);
        } else {
            console.warn("Duplicate command deceleration: " + command + "-" + func.toString());
        }
    }

    /**
     * Util method that will print the message to the console if "from" is null.
     * Otherwise it will just use the server chat.
     * @param {string} from The user that issued the command.
     * @param {string} message The message to print.
     * @param {boolean} [whisper] If the message should be whispered to the person.
     */
    chat(from: string, message: string, whisper?: boolean) {
        if (from) {
            if (!!whisper) {
                this.mineflayer_bot.whisper(from, message);
            } else {
                this.mineflayer_bot.chat(message);
            }
        } else {
            console.log(message);
        }
    }

    /**
     * This is fired when the bot receives an chat event.
     * Parse the input and if a string starts with !<bot_name> or !<username> then executes the command.
     * @param {string} username The player who issued the command.
     * @param {string} message The message to say.
     * @param {boolean} whispered whether this message was whispered or not.
     */
    onChat(username: string, message: string, whispered?: boolean): void {
        //Do some logging.
        if (this.logging) console.log('[' + new Date().toUTCString() + '] <' + username + '> ' + message);
        if (username === this.mineflayer_bot.username) return;

        //Only listen to masters.
        if (this.isCommand(message)) {
            if (this.owners.indexOf(username) > -1) {
                let command = message.substr(1 + this.mineflayer_bot.username.length);
                this.interpCommandString(username, command, !!whispered);
            }
            else {
                this.mineflayer_bot.chat("Sorry " + username + "but you don't have the required privileges");
            }
        } else if (message.lastIndexOf("@" + this.mineflayer_bot.username, 0) === 0) {
            //TODO some fun chat thingy.
        }
    }

    private isCommand(message: string): boolean {
        return message.lastIndexOf("!" + this.mineflayer_bot.username, 0) === 0;
    }

    private help(bot: MineflayerBot, from: string, command: string): string {
        if (!command) return "usage: help <command> <subcommand> ....";
        return this.helpRec(from, getSubArray(arguments, 2));
        /*
let cmds = command.split(".");
if (cmds.length > 1) {
    if (!commands[cmds[0]]) commands[cmds[0]] = new CommandMap();
    this.registerCommand(joinArrayFrom(cmds, 1), func, help, <CommandMap> commands[cmds[0]]);
    return;
}
if (!commands[command]) {
    commands[command] = new CommandItem(command, func, help);
} else {
    console.warn("Duplicate command deceleration: " + command + "-" + func.toString());
}
 */
    }

    private helpRec(from: string, command: string[], commands: CommandMap = this.commands) {
        if (command.length < 1) return "Could not find command";
        let cmd = commands[command[0]];
        if (!cmd) return "Could not find command: " + command[0];

        if (command.length === 1) {
            if (cmd instanceof CommandMap) {
                let values = Object.keys(cmd);
                this.chat(from, "Sub commands: [" + values.toString() + "]");
            } else {
                this.chat(from, cmd.help);
            }
        } else {
            if (cmd instanceof CommandMap) this.helpRec(from, getSubArray(command, 1), cmd);
            else this.chat(from, cmd.help);
        }
    }
}

/**
 * Returns the plugin for the Mineflayer bot with the given options for the ESMA class.
 * @see {@link ESMA}
 * @param {ESMAOptions} options
 * @return {(bot: MineflayerBot, option: MineflayerBotOptions) => void}
 */
export function esma(options: ESMAOptions): (bot: MineflayerBot, option: MineflayerBotOptions) => void {
    return function (bot: MineflayerBot & ESMABot, option: MineflayerBotOptions) {
        bot.esma = new ESMA(bot, options);
        bot.on('chat', (username: string, message: string) => bot.esma.onChat(username, message, false));
        bot.on('whisper', (username: string, message: string) => bot.esma.onChat(username, message, true));
        bot.esma.registerCommand("chat.say", chat.say, "Let the bot talk \n usage: say <message>");
        bot.esma.registerCommand("chat.whisper", chat.whisper, "Let the bot whisper a message \n usage: whisper <player> <message>");
        bot.esma.registerCommand("chat.count", chat.count, "Let the bot count and optionally execute a command \n usage: count <amount> [up|down] ");
        console.log(JSON.stringify(bot.esma.commands, null, 2));
    }
}