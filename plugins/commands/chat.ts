import {ESMABot} from "../../classes/ESMABot";
import {joinArrayFrom} from "../util";
import {CommandInfo} from "../../classes/CommandFunc";
import Timer = NodeJS.Timer;

/**
 * Lets the bot count down.
 * @param {ESMABot} bot
 * @param {CommandInfo} info
 * @param {number} amount
 * @param {string} command
 */
function countDown(bot: ESMABot, info: CommandInfo, amount: number, command: string): void {
    let target = 0;
    let timer: Timer;

    function count() {
        if (amount === target) {
            clearInterval(timer);
            bot.esma.interpCommandString(info.from, command);
        } else {
            bot.esma.chat(info.from, amount.toString(), info.whispered);
            amount--;
        }
    }

    timer = setInterval(count, 1000);
}

/**
 * Lets the bot count up.
 * @param {ESMABot} bot
 * @param {CommandInfo} info
 * @param {number} target
 * @param {string} command
 */
function countUp(bot: ESMABot, info: CommandInfo, target: number, command: string): void {
    let amount = 0;
    let timer: Timer;

    function count() {
        if (amount === target + 1) {
            clearInterval(timer);
            bot.esma.interpCommandString(info.from, command);
        } else {
            bot.esma.chat(info.from, amount.toString(), info.whispered);
            amount++;
        }
    }

    timer = setInterval(count, 1000);
}

/**
 * Lets the bot count.
 * @param {ESMABot} bot
 * @param {CommandInfo} info
 * @param {string} _amount
 * @param {string} _direction
 * @return {string}
 */
export function count(bot: ESMABot, info: CommandInfo, _amount: string, _direction: string): string {
    let amount = parseInt(_amount);
    let command = joinArrayFrom(arguments, _direction === "up" || _direction === "down" ? 4 : 3);
    if (!command) command = "say GO!";

    if (isNaN(amount)) return 'usage: count <amount : number> ["up" | "down"] [command]';

    if (_direction && _direction === "up") countUp(bot, info, amount, command);
    countDown(bot, info, amount, command);
}

/**
 * Whispers a message to a person.
 * @param {ESMABot} bot
 * @param {CommandInfo} info
 * @param {string} to
 * @param {string} message
 * @return {string}
 */
export function whisper(bot: ESMABot, info: CommandInfo, to: string, message: string): string {
    if (!to || !message) {
        return;
    }
    bot.whisper(to, message);
}

/**
 * Lets the bot talk using the esma chat method.
 * @see {@link ESMABot.esma.chat}
 * @param {ESMABot} bot
 * @param {CommandInfo} info
 * @param {string} message
 * @return {string}
 */
export function say(bot: ESMABot, info: CommandInfo, message: string): string {
    if (!message) return;
    bot.esma.chat(info.from, message, info.whispered);
    return;
}