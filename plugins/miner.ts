import {ESMABot} from "../classes/ESMABot";
import {MineflayerBotOptions} from "mineflayer";
import {directions, TunnelIterator} from "../classes/TunnelIterator";
import {Vec3} from "../vec3";

/**
 * Injects the miner plugin.
 * @see {@link strip}
 * @see {@link tunnel}
 * @see {@link stop}
 * @see {@link unpause}
 * @param {ESMABot} bot
 * @param {} options
 */
export function miner(bot: ESMABot, options: MineflayerBotOptions) {
    bot.esma_miner = {
        strip: strip,
        stop: stop,
        tunnel: tunnel,
        unpause: unpause
    };

    let stopped = false;
    let executed = null;

    /**
     * Stripmine in the given direction.
     * @param {string} direction
     * @param {number} distance
     * @param {number} size
     */
    function strip(direction: string, distance: number, size?: number) {
        console.log("Currently not implemented");
    }

    /**
     * Checks if the block at a position is mineable.
     * Currently only ignores air.
     * @param {Vec3} pos
     * @return {boolean}
     */
    function isMinable(pos: Vec3) {
        return bot.blockAt(pos).type !== 0;
    }

    /**
     * Tunnel in the given direction.
     * @param {string} direction
     * @param {number} distance
     * @param {number} size
     */
    function tunnel(direction: string, distance: number, size?: number) {
        stopped = false;
        if (!directions[direction.toLowerCase()]) throw new Error("Unknown direction");
        if (size === undefined) size = 3;

        size = Math.floor(size);
        distance = Math.floor(distance);
        direction = direction.toLowerCase();


        let start = bot.entity.position.clone().floored();
        let it = new TunnelIterator(start, direction, distance, size);
        let dir = directions(direction);

        /**
         * Calculates the position where to move.
         * @param {Vec3} pos
         * @return {Vec3}
         */
        function calcToPos(pos: Vec3): Vec3 {
            let result = pos.plus(dir.scaled(-2));
            result.y = start.y;
            return result;
        }

        /**
         * Do the actual mining.
         */
        function minetunnel() {
            executed = minetunnel;
            if (it.hasNext() && !stopped) {
                let pos = it.next();

                //Find a suitable block to mine.
                while (!isMinable(pos)) {
                    if (!it.hasNext()) return;
                    pos = it.next();
                }

                let block = bot.blockAt(pos);

                //Move 2 block in fron of the block to mine.
                if (bot.entity.position.distanceTo(pos) > 6) {
                    bot.scaffold.to(calcToPos(pos), (err) => {
                        if (err) bot.chat(err);
                        else bot.dig(block, minetunnel);
                    })
                } else {
                    //Dig the block and then continue.
                    bot.dig(block, minetunnel);
                }
            } else if (!it.hasNext()) {
                executed = null;
            }
        }

        minetunnel();
    }

    /**
     * Lets the bot continue the mining operation.
     */
    function unpause() {
        if (stopped) {
            stopped = false;
            if (executed) executed();
        }
    }

    /**
     * Lets the bot stop the mining operation.
     */
    function stop() {
        if (!stopped) {
            stopped = true;
        }

    }

}

