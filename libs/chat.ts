import {Bot} from "../bot_manager";
import {getCommand} from "./util";
import Timer = NodeJS.Timer;

export function welcome(bot: Bot) {
    let mb = bot.mineflayer_bot;
    mb.on("playerJoined", (player: Entity) => {
        if (player.username !== mb.username) mb.chat("Welcome " + player.username + "!");
    });
}

export function stopwatch(bot: Bot, from: string, command: string): string {
    let stopwatch = bot.getLib("chat_stopwatch"); //Initialize if not ready
    if (!stopwatch) {
        stopwatch = {count_ms: 0, timer: null};
        bot.setLib("chat_stopwatch", stopwatch);
    }
    if (command === "reset") {
        let timer = stopwatch.timer;
        if (timer) clearInterval(timer);
        stopwatch.timer = null;
        stopwatch.count_ms = 0;
    } else if (command === "start") {
        if (stopwatch.timer) return "Stopwatch already started.";
        stopwatch.timer = setInterval(() => stopwatch.count_ms += 10, 10);
    } else if (command === "stop") {
        let timer = stopwatch.timer;
        if (timer) clearInterval(timer);

        bot.chat(from, (stopwatch.count_ms / 1000).toString());
        stopwatch.timer = null;
    } else if (command === "get") {
        bot.chat(from, (stopwatch.count_ms / 1000).toString());
    } else {
        return "usage: stopwatch <reset|start|stop|get>";
    }
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