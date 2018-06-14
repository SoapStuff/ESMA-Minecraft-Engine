import {ESMABot} from "../classes/ESMABot";
import {Entity, MineflayerBotOptions} from "mineflayer";

/**
 * Injects the plugin that welcomes joined players.
 * @param {ESMABot} bot
 * @param {MineflayerBotOptions} options
 */
export default function welcome(bot: ESMABot, options: MineflayerBotOptions) {
    bot.on("playerJoined", (player: Entity) => {
        if (player.username !== bot.username) bot.chat("Welcome " + player.username + "!");
    });
}