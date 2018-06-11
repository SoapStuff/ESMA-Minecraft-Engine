import {ESMABot} from "../classes/ESMABot";
import {Entity, MineflayerBotOptions} from "mineflayer";

export default function welcome(bot: ESMABot, options: MineflayerBotOptions) {
    bot.on("playerJoined", (player: Entity) => {
        if (player.username !== bot.username) bot.chat("Welcome " + player.username + "!");
    });
}