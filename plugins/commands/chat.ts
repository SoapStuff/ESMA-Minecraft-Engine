import {ESMABot} from "../../classes/ESMABot";
import {joinArrayFrom} from "../util";
import Timer = NodeJS.Timer;

function countDown(bot: ESMABot, from: string, amount: number, command: string): void {
    let target = 0;
    let timer: Timer;

    function count() {
        if (amount === target) {
            clearInterval(timer);
            bot.esma.interpCommandString(from, command);
        } else {
            bot.esma.chat(from, amount.toString());
            amount--;
        }
    }

    timer = setInterval(count, 1000);
}

function countUp(bot: ESMABot, from: string, target: number, command: string): void {
    let amount = 0;
    let timer: Timer;

    function count() {
        if (amount === target + 1) {
            clearInterval(timer);
            bot.esma.interpCommandString(from, command);
        } else {
            bot.esma.chat(from, amount.toString());
            amount++;
        }
    }

    timer = setInterval(count, 1000);
}

export function count(bot: ESMABot, from: string, _amount: string, _direction: string): string {
    let amount = parseInt(_amount);
    let command = joinArrayFrom(arguments, _direction === "up" || _direction === "down" ? 4 : 3);
    if (!command) command = "say GO!";

    if (isNaN(amount)) return 'usage: count <amount : number> ["up" | "down"] [command]';

    if (_direction && _direction === "up") countUp(bot, from, amount, command);
    countDown(bot, from, amount, command);
}

export function whisper(bot: ESMABot, from: string, to: string, message: string): string {
    if (!to || !message) {
        return;
    }
    bot.whisper(to, message);
}

export function say(bot: ESMABot, from: string, message: string): string {
    if (!message) return;
    bot.esma.chat(from, message);
    return;
}