import {ESMABot} from "../../classes/ESMABot";
import {CommandInfo} from "../../classes/CommandFunc";
import {requireInterface} from "../util";

export function unpause(bot: ESMABot, info: CommandInfo): string {
    requireInterface(bot, {esma_miner: {strip: true, tunnel: true, stop: true, unpause: true}});
    bot.esma_miner.unpause();
    return null;
}

export function strip(bot: ESMABot, info: CommandInfo, direction: string, distance: string, size?: string): string {
    requireInterface(bot, {esma_miner: {strip: true}});

    if (!direction || !distance) return "Usage: mine strip <direction> <distance>";
    if (size === undefined) size = "3";

    let _size = parseInt(size);
    let _distance = parseInt(distance);

    if (isNaN(_size) || isNaN(_distance)) return "Size and distance should be a number";

    bot.esma_miner.strip(direction, _distance, _size);

    return null;
}

export function tunnel(bot: ESMABot, info: CommandInfo, direction: string, distance: string, size?: string): string {
    requireInterface(bot, {esma_miner: {tunnel: true}});

    if (!direction || !distance) return "Usage: mine strip <direction> <distance>";
    if (size === undefined) size = "3";

    let _size = parseInt(size);
    let _distance = parseInt(distance);

    if (isNaN(_size) || isNaN(_distance)) return "Size and distance should be a number";

    bot.esma_miner.tunnel(direction, _distance, _size);

    return null;
}

export function pause(bot: ESMABot, info: CommandInfo): string {
    requireInterface(bot, {esma_miner: {strip: true, tunnel: true, stop: true}});
    bot.esma_miner.stop();
    return null;
}