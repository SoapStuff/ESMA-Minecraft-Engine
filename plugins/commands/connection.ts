import {ESMABot} from "../../classes/ESMABot";

export function disconnect(bot: ESMABot, from: string, command?: string): string {
    bot.quit("Disconnect");
    return null;
}