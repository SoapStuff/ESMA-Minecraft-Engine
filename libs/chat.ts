import {Bot} from "../bot_manager";
import {getCommand} from "./util";
import Timer = NodeJS.Timer;

export function welcome(bot: Bot) {
    let mb = bot.mineflayer_bot;
    mb.on("playerJoined", (player: Entity) => {
        if (player.username !== mb.username) mb.chat("Welcome " + player.username + "!");
    });
}

function countDown(bot: Bot, from: string, amount: number, command: string): void {
    let target = 0;
    let timer: Timer;

    function count() {
        if (amount === target) {
            clearInterval(timer);
            bot.doCommand(from, command);
        } else {
            bot.chat(from, amount.toString());
            amount--;
        }
    }

    timer = setInterval(count, 1000);
}

function countUp(bot: Bot, from: string, target: number, command: string): void {
    let amount = 0;
    let timer: Timer;

    function count() {
        if (amount === target + 1) {
            clearInterval(timer);
            bot.doCommand(from, command);
        } else {
            bot.chat(from, amount.toString());
            amount++;
        }
    }

    timer = setInterval(count, 1000);
}

export function count(bot: Bot, from: string, _amount: string, _direction: string): string {
    let amount = parseInt(_amount);
    let command = getCommand(arguments, _direction === "up" || _direction === "down" ? 4 : 3);
    if (!command) command = "say GO!";

    if (isNaN(amount)) return 'usage: count <amount : number> ["up" | "down"] [command]';

    if (_direction && _direction === "up") countUp(bot, from, amount, command);
    countDown(bot, from, amount, command);
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