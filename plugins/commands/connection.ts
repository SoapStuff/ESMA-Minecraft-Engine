import {ESMABot} from "../../classes/ESMABot";
import {CommandInfo} from "../../classes/CommandFunc";

export function disconnect(bot: ESMABot, info: CommandInfo, command?: string): string {
    bot.quit("Disconnect");
    return null;
}