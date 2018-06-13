import * as read from "readline";
import {ReadLine} from "readline";
import {esma} from "./plugins/esma";
import * as mf from "mineflayer";
import {createBot, MineflayerBot, MineflayerBotOptions} from "mineflayer";
import welcome from "./plugins/welcome";
import {ESMABot} from "./classes/ESMABot";
import * as vec3 from "vec3";

let bot: ESMABot;
let rl: ReadLine;

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
 * @param {MineflayerBot} bot
 * @param {boolean} logging
 * @param {string[]} owners
 */
export function loadPlugins(bot: MineflayerBot, logging: boolean, owners: string[]) {
    bot.loadPlugin(esma({logging: true, owners: owners}));
    bot.loadPlugin(welcome);
}

/**
 * Loads the default commands.
 * @param {ESMABot} bot
 */
export function loadCommands(bot: ESMABot) {
    if (!bot.esma) throw new Error("ESMA Was not yet initialized!");

}

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