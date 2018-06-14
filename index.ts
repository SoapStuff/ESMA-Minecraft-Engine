import * as read from "readline";
import {ReadLine} from "readline";
import * as mf from "mineflayer";
import {createBot, MineflayerBot, MineflayerBotOptions} from "mineflayer";
import * as vec3 from "vec3";
import * as minerCommand from "./plugins/commands/miner";
import welcome from "./plugins/welcome";
import {esma} from "./plugins/esma";
import {ESMABot} from "./classes/ESMABot";
import {miner} from "./plugins/miner";

let bot: ESMABot;
let rl: ReadLine;

/**
 * Initializes the bot and the terminal if specified.
 * @param {MineflayerBotOptions} options The options for creating the mineflayer bot.
 * @param {boolean} useTerminal If to use a terminal for commanding the bot.
 * @return {MineflayerBot}
 */
export function initESMA(options: MineflayerBotOptions, useTerminal: boolean = false): MineflayerBot {
    if (useTerminal) {
        rl = read.createInterface({input: process.stdin, output: process.stdout,});
        rl.on('line', (line: string) => bot.esma.interpCommandString(null, line));
    }
    bot = createBot(options);
    return bot;
}

/**
 * Loads the default plugins.
 * @param {MineflayerBot} bot The mineflayer bot.
 * @param {boolean} logging If you want to log the chat messages.
 * @param {string[]} owners The owners who can issue commands.
 */
export function loadPlugins(bot: MineflayerBot, logging: boolean, owners: string[]) {
    bot.loadPlugin(esma({logging: true, owners: owners}));
    bot.loadPlugin(welcome);
    bot.loadPlugin(miner);
}

/**
 * Loads the default commands.
 * @param {ESMABot} bot The mineflayer bot.
 */
export function loadCommands(bot: ESMABot) {
    if (!bot.esma) throw new Error("ESMA Was not yet initialized!");
    bot.esma.registerCommand("mine.strip", minerCommand.strip, "TODO");
    bot.esma.registerCommand("mine.tunnel", minerCommand.tunnel, "TODO");
    bot.esma.registerCommand("mine.stop", minerCommand.pause, "TODO");
    bot.esma.registerCommand("mine.continue", minerCommand.unpause, "TODO");
}

/**
 * Load the bot and plugin.
 */
(function load() {
    if (process.argv.indexOf("--load-ESMA-defaults")) {
        bot = initESMA({
            host: 'localhost',  // optional
            port: 25565,        // optional
            username: "ESMA", // email and password are required only for
        }, true);

        mf.vec3 = vec3;
        mf.materials = require("minecraft-data/data")["pc"]["1.12.2"]["materials"];
        require('mineflayer-navigate')(mf)(bot);
        require('mineflayer-scaffold')(mf)(bot);
        require('mineflayer-blockfinder')(mf)(bot);
        //Timeout for the createBot method so the bot can join.
        setTimeout(() => {
            loadPlugins(bot, true, ["EternalSoap"]);
            loadCommands(bot);
        }, 2000);
    }
})();