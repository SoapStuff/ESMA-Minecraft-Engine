import {Bot} from "../bot_manager";

export function disconnect(bot: Bot, from: string, command?: string): string {
    bot.mineflayer_bot.quit("Disconnect");
    return null;
}