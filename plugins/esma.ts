import * as chat from "./commands/chat";

import {MineflayerBot, MineflayerBotOptions} from "mineflayer";
import {ESMABot} from "../classes/ESMABot";
import {ESMAOptions} from "../classes/ESMAOptions";
import {CommandFunc, CommandInfo} from "../classes/CommandFunc";
import {getSubArray, joinArrayFrom} from "./util";

export class CommandItem {

    get func() {
        return this._func;
    }

    get helpMessage() {
        return this._helpMessage;
    }

    private readonly _command: string;
    private readonly _func: CommandFunc;
    private readonly _helpMessage: string;

    constructor(command: string, func: CommandFunc, help: string) {
        this._command = command;
        this._func = func;
        this._helpMessage = help;
    }
}

export class CommandMap {
    [index: string]: CommandItem | CommandMap
}


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
        let date = new Date();

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

        let info = {from: username, whispered: whisper, date: date};
        this.interpCommand(info, args, whisper, this.commands);
    }

    /**
     * @param {CommandInfo} info
     * @param {string[]} args
     * @param {boolean} whisper
     * @param {CommandMap} commands
     */
    private interpCommand(info: CommandInfo, args: string[], whisper: boolean, commands: CommandMap) {
        let bot = this.mineflayer_bot;
        if (!bot) return;

        if (args.length < 1) {
            this.chat(info.from, "No (sub) command specified", info.whispered);
        }

        let command = commands[args[0]];
        //Work around for the string array
        let func_args: (string | MineflayerBot | CommandInfo)[] = args;

        if (command && command instanceof CommandItem) {
            func_args[0] = this.mineflayer_bot;
            func_args.splice(1, 0, info);
            try {
                let result: string | boolean = command.func.apply(this, func_args);
                if (result && typeof result === "string") {
                    this.chat(info.from, result, whisper);
                }
            } catch (e) {
                console.log(e);
                bot.chat("Oh, oh, something went wrong: " + e.message);
            }
        } else if (command && command instanceof CommandMap) {
            func_args.splice(0, 1);
            this.interpCommand(info, func_args, whisper, command);
        } else {
            this.chat(info.from, "I don't know what '" + args[0] + "' means.", whisper);
        }
    }

    /**
     * Adds a new command to esma.
     * @param {string} command
     * @param {CommandFunc} func
     * @param {string} helpMessage
     */
    registerCommand(command: string, func: CommandFunc, helpMessage: string) {
        this.registerCommandTree(command, func, helpMessage)
    }

    /**
     * Adds a new command to esma.
     * @param {string} command
     * @param {CommandFunc} func
     * @param {string} helpMessage
     * @param {CommandMap} [commands] the current position in the command tree.
     */
    private registerCommandTree(command: string, func: CommandFunc, helpMessage: string, commands: CommandMap = this.commands) {
        let cmds = command.split(".");
        if (cmds.length > 1) {
            if (!commands[cmds[0]]) commands[cmds[0]] = new CommandMap();
            this.registerCommandTree(joinArrayFrom(cmds, 1), func, helpMessage, <CommandMap> commands[cmds[0]]);
            return;
        }
        if (!commands[command]) {
            commands[command] = new CommandItem(command, func, helpMessage);
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

    private help(bot: MineflayerBot, info: CommandInfo, command: string): string {
        if (!command) return "usage: help <command> <subcommand> ....";
        return this.helpRec(info, getSubArray(arguments, 2));
    }

    private helpRec(info: CommandInfo, command: string[], commands: CommandMap = this.commands) {
        if (command.length < 1) return "Could not find command";
        let cmd = commands[command[0]];
        if (!cmd) return "Could not find command: " + command[0];

        if (command.length === 1) {
            if (cmd instanceof CommandMap) {
                let values = Object.keys(cmd);
                this.chat(info.from, "Sub commands: [" + values.toString() + "]");
            } else {
                this.chat(info.from, cmd.helpMessage, info.whispered);
            }
        } else {
            if (cmd instanceof CommandMap) this.helpRec(info, getSubArray(command, 1), cmd);
            else this.chat(info.from, cmd.helpMessage, info.whispered);
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
        bot.esma.registerCommand("say", chat.say, "Let the bot talk \n usage: say <message>");
        bot.esma.registerCommand("whisper", chat.say, "Let the bot whisper a message \n usage: whisper <player> <message>");
    }
}