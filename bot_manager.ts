import * as mineflayer from "mineflayer";
import * as chat from "./libs/chat";

/**
 * Represents a command that can be executed by the bot.
 * The first argument is the bot that executes a command.
 * The second argument is the user that ordered this command to be executed. This will be null if it was done from the terminal.
 * The other arguments are the arguments passed, all these arguments can be undefined/null so need to be checked before use.
 * It should return a string on invalid input. Otherwise it should return a falsy value (null, false, undefined, etc.).
 */
declare type CommandFunc = (bot: Bot, from: string | null, ...args: string[]) => string;
declare type MineflayerBotOptions = { host?: string, port?: number, username: string, password?: string }
declare type BotOptions = { bot_name?: string, create: MineflayerBotOptions, owners?: string[], logging?: boolean }
/**
 * @see {@link Bot#libs}
 */
declare type BotPlugins = { [plugin_name: string]: any };

let bots: { [name: string]: Bot } = {};
let commands: { [i: string]: CommandFunc } = {};
let listeners: ((Bot) => void)[] = [];

export var global_settings = {
    default_owner: "EternalSoap",
};


/**
 * The class that contains the MinecraftBot instance of mineflayer,
 * and other utility methods.
 */
export class Bot {

    /**
     * The name of the bot.
     * This is can be different of the username.
     * @return {string}
     */
    get bot_name(): string {
        return this._bot_name;
    }

    /**
     * All the players who can command this bot.
     * @return {string[]}
     */
    get owners(): string[] {
        return this._owners;
    }

    /**
     * The bot entity of the mine_flayer API.
     * @return {MineflayerBot}
     */
    get bot() {
        return this._mineflayer_bot;
    }

    /**
     * The bot entity of the mine_flayer API.
     * @return {MineflayerBot}
     */
    get mineflayer_bot() {
        return this._mineflayer_bot;
    }

    /**
     * Gets the libs object.
     * This is an map with as key the name of the library and as value an json object that can be used
     * to store values for certain sub_modules so that you don't need to keep an own map to store
     * certain values by certain bots.
     * @return {BotPlugins}
     */
    get libs(): BotPlugins {
        return this._libs;
    }

    private readonly _mineflayer_bot: MineflayerBot;
    private readonly _bot_name: string;
    private readonly _logging: boolean;
    private readonly _owners: string[];
    private readonly _libs: BotPlugins;

    /**
     * @constructor
     * @param {BotOptions} options
     * @see {@link Bot}
     * @see {@link http://mineflayer.prismarine.js.org/#/}
     */
    constructor(options: BotOptions) {

        //Parse the options.
        this._bot_name = options.bot_name ? options.bot_name : options.create.username;
        this._logging = !!options.logging;
        this._owners = options.owners ? options.owners : [global_settings.default_owner];


        this._mineflayer_bot = mineflayer.createBot(options.create);
        this._libs = {};

        this.mineflayer_bot.on('chat', (username: string, message: string) => this.onChat(username, message, false));
        this.mineflayer_bot.on('whisper', (username: string, message: string) => this.onChat(username, message, true));
        this.addEventListeners();
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
        if (this._logging) console.log('[' + new Date().toUTCString() + '] <' + username + '> ' + message);
        if (username === this.mineflayer_bot.username) return;

        //Only listen to masters.

        if (this.isCommand(message)) {
            if (this._owners.indexOf(username) > -1) {
                let command = message.substr(1 + this.mineflayer_bot.username.length);
                this.doCommand(username, command, !!whispered);
            }
            else {
                this.mineflayer_bot.chat("Sorry " + username + "but you don't have the required privileges");
            }
        } else if (message.lastIndexOf("@" + this.mineflayer_bot.username, 0) === 0) {
            //TODO some fun chat thingy.
        }
    }

    private addEventListeners(): void {
        for (let listener of listeners) {
            listener(this);
        }
    }

    private isCommand(message: string): boolean {
        return message.lastIndexOf("!" + this.mineflayer_bot.username, 0) === 0 ||
            message.lastIndexOf("!" + this._bot_name, 0) === 0;
    }

    /**
     * Executes a command for the specified minecraft bot.
     * @param {string} username The person that issued the command
     * @param {string} command_string The string with the command and arguments.
     * @param {boolean} [whisper] whether the command was whispered or not.
     */
    doCommand(username: string, command_string: string, whisper?: boolean): void {
        let bot = this.mineflayer_bot;
        if (!bot) return;

        //This split it into an string array split on spaces.
        let args = command_string.match(/(?:[^\s"]+|"[^"]*")+/g);
        console.log(args ? args : "[]");

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

        let cmd = args[0];

        //Work around for the string array
        let func_args: (string | Bot)[] = args;

        if (commands[cmd]) {
            func_args[0] = this;
            func_args.splice(1, 0, username);
            try {
                let result: string | boolean = commands[cmd].apply(null, func_args);
                if (result && typeof result === "string") {
                    this.chat(username, result, whisper);
                }
            } catch (e) {
                console.log(e);
                bot.chat("Oh, oh, something went wrong: " + e.message);
            }
        } else {
            this.chat(username, "I don't know what '" + cmd + "' means.", whisper);
        }
    }

    /**
     * Sets the value of the plugin.
     * @param {string} lib The name of the library.
     * @param value The value object.
     * @see {@link libs) for more information.
     */
    setLib(lib: string, value: any): void {
        if (!this.libs) {
            this.libs[lib] = value;
        } else {
            console.error('Plugin "' + lib + '" already in use!');
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
export function addCommand(command: string, func: (bot: Bot, ...args: string[]) => string): void {
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