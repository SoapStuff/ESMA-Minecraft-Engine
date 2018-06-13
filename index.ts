import * as read from "readline";
import {esma} from "./plugins/esma";
import {createBot, MineflayerBotOptions} from "mineflayer";
import welcome from "./plugins/welcome";
import {ESMABot} from "./classes/ESMABot";
import {stripmine} from "./plugins/stripminer";

let bot: ESMABot;

export function init(options: MineflayerBotOptions, useTerminal: boolean = false) {
    if (useTerminal) {
        let rl = read.createInterface({input: process.stdin, output: process.stdout,});
        rl.on('line', (line: string) => bot.esma.doCommand(null, line));
    }
    bot = createBot(options);
}

export function loadPlugins() {
    bot.loadPlugin(welcome);
    bot.loadPlugin(stripmine);
}

export function loadCommands(logging: boolean, owners: string[]) {
    bot.loadPlugin(esma({logging: true, owners: owners}));
}

if (process.argv.indexOf("--load-ESMA-defaults")) {
    init({
        host: 'localhost',  // optional
        port: 25565,        // optional
        username: "ESMA", // email and password are required only for
    });
    loadPlugins();
    loadCommands(true, ["EternalSoap"]);
}