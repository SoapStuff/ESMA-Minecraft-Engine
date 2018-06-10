import * as bot_manager from "./bot_manager";
import * as read from "readline";

bot_manager.addDefaults();
bot_manager.init("Jaques");
let bot = bot_manager.getBot("Jaques");

let rl = read.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', (line: string) => bot.doCommand(null, line));