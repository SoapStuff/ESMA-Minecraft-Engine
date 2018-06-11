import * as read from "readline";
import {esma} from "./plugins/esma";
import {createBot} from "mineflayer";
import welcome from "./plugins/welcome";
import {ESMABot} from "./classes/ESMABot";

let bot: ESMABot = createBot({
    host: 'localhost',  // optional
    port: 25565,        // optional
    username: "ESMA", // email and password are required only for
});

bot.loadPlugin(esma({logging: true, owners: ["EternalSoap"]}));
bot.loadPlugin(welcome);

let rl = read.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', (line: string) => bot.esma.doCommand(null, line));