import {Bot} from "../bot_manager";

export function welcome(bot: Bot) {
    let mb = bot.mineflayer_bot;
    mb.on("playerJoined", (player: Entity) => {
        if (player.username !== mb.username) mb.chat("Welcome " + player.username + "!");
    });
}

export function count(bot: Bot, from: string, direction: string, amount: string): string {


    let timer = setInterval(function () {

    }, 1000);
    return;
}

export function whisper(bot: Bot, from: string, to: string, message: string): string {
    if (!to || !message) {
        return;
    }
    bot.mineflayer_bot.whisper(to, message);
}

export function say(bot: Bot, from: string, message: string): string {
    if (!message) return;
    bot.chat(from, message);
    return;
}