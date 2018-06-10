import * as mineflayer from "mineflayer";
import * as chat from "./libs/chat";

let bots: { [name: string]: Bot } = {};
let commands: { [i: string]: (bot: Bot, ...args: string[]) => void } = {};
let listeners: ((Bot) => void)[] = [];

declare type MineflayerBotOptions = { host?: string, port?: number, username: string, password?: string }
declare type BotOptions = { bot_name?: string, create: MineflayerBotOptions, masters?: string[], logging?: boolean }

/**
 * The class that contains the MinecraftBot instance of mineflayer,
 * and other utility methods.
 */
export class Bot {

    get bot() {
        return this._mineflayer_bot;
    }

    get mineflayer_bot() {
        return this._mineflayer_bot;
    }

    private readonly _mineflayer_bot: MineflayerBot;
    private readonly bot_name: string;
    private readonly logging: boolean;

    private masters: string[];

    constructor(options: BotOptions) {

        //Parse the options.
        this.bot_name = options.bot_name ? options.bot_name : options.create.username;
        this.logging = !!options.logging;
        this.masters = options.masters ? options.masters : ['EternalSoap'];


        this._mineflayer_bot = mineflayer.createBot(options.create);

        this.mineflayer_bot.on('chat', (username: string, message: string) => this.onChat(username, message));
        this.addEventListeners();
    }

    /**
     * This is fired when the bot receives an chat event.
     * Parse the input and if a string starts with !<bot_name> or !<username> then executes the command.
     * @param {string} username
     * @param {string} message
     */
    onChat(username: string, message: string) {
        //Do some logging.
        if (this.logging) console.log('[' + new Date().toUTCString() + '] <' + username + '> ' + message);
        if (username === this.mineflayer_bot.username) return;

        //Only listen to masters.

        if (this.isCommand(message)) {
            if (this.masters.indexOf(username) > -1) {
                let command = message.substr(1 + this.mineflayer_bot.username.length);
                this.doCommand(username, command);
            }
            else {
                this.mineflayer_bot.chat("Sorry " + username + "but you don't have the required privileges");
            }
        } else if (message.lastIndexOf("@" + this.mineflayer_bot.username, 0) === 0) {
            //TODO some fun chat thingy.
        }
    }

    private addEventListeners() {
        for (let listener of listeners) {
            listener(this);
        }
    }

    private isCommand(message: string): boolean {
        return message.lastIndexOf("!" + this.mineflayer_bot.username, 0) === 0 ||
            message.lastIndexOf("!" + this.bot_name, 0) === 0;
    }

    /**
     * Executes a command for the specified minecraft bot.
     * @param {string} username
     * @param {string} command_string
     */
    doCommand(username: string, command_string: string): void {
        let bot = this.mineflayer_bot;
        if (!bot) return;

        //This split it into an string array split on spaces.
        let args = command_string.match(/(?:[^\s"]+|"[^"]*")+/g);
        console.log(args ? args : "[]");

        function say(message: string) {
            username ? bot.chat(message) : console.log(message);
        }

        if (!args || !args[0]) {
            say("What would you like me to do " + (username ? username : "master") + "?");
            return;
        }

        //Remove double quotes from all strings.
        for (let i = 0; i < args.length; i++) {
            if (args[i].length > 2 && args[i].startsWith('"') && args[i].endsWith('"')) {
                args[i] = args[i].substr(1, args[i].length - 2);
            }
        }

        let cmd = args[0];

        //Work around for the string array
        let func_args: (string | Bot)[] = args;

        if (commands[cmd]) {
            func_args[0] = this;
            try {
                commands[cmd].apply(null, func_args);
            } catch (e) {
                console.log(e);
                bot.chat("Oh, oh, something went wrong: " + e.message);
            }
        } else {
            say("I don't know what '" + cmd + "' means.");
        }
    }

}

/**
 * Initializes the first bot.
 * @param {string} name
 * @param {string} password
 */
export function init(name: string, password?: string) {
    addBot({
        bot_name: name,
        create: {
            host: 'localhost', // optional
            port: 25565,       // optional
            username: name, // email and password are required only for
            password: password
        }
    });
}

/**
 * Creates a new Bot.
 * @param {MineflayerBotOptions} options
 * @return {Bot}
 */
export function addBot(options: BotOptions): Bot {
    if (!bots[options.bot_name])
        bots[options.bot_name] = new Bot(options);
    return bots[options.bot_name];
}

/**
 * Gets the bot with the specified bot_name property.
 * @param {string} name
 * @return {Bot}
 */
export function getBot(name: string): Bot {
    return bots[name];
}

/**
 * Registers a new command for all the bots to use.
 * @param {string} command
 * @param {Function} func (bot: MinecraftBot, ...args: string[]) => void
 */
export function addCommand(command: string, func: (bot: Bot, ...args: string[]) => void): void {
    commands[command] = func;
}

/**
 * Add a function that is executed for every bot, and every bot added in the future.
 * @param {(bot: MinecraftBot) => void} func
 */
export function addListener(func: (bot: Bot) => void) {
    for (let bot in bots) {
        if (!bots.hasOwnProperty(bot)) continue;
        func(bots[bot]);
    }
    listeners.push(func);
}

/**
 * Adds the default built-in modules to the commands and bots.
 */
export function addDefaults() {
    addCommand("say", chat.say);
    addCommand("whisper", chat.whisper);
    addListener(chat.welcome);
}