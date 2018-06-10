import {Bot} from "../bot_manager";

export function welcome(bot: Bot) {
    let mb = bot.mineflayer_bot;
    mb.on("playerJoined", (player: Entity) => {
        if (player.username !== mb.username) mb.chat("Welcome " + player.username + "!");
    });
}

export function whisper(bot: Bot, user: string, message: string): void {
    if (!user || !message) return;
    bot.mineflayer_bot.whisper(user, message);
}

export function say(bot: Bot, message: string): void {
    if (!message) return;
    bot.mineflayer_bot.chat(message);
}