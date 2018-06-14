import {ESMABot} from "../classes/ESMABot";
import {MineflayerBotOptions} from "mineflayer";
import {requireInterfaceSafe} from "./util";
import {esmastub} from "./esma";
import {Vec3} from "../vec3";
import * as vec3 from "vec3";

let directions = {
    east: vec3(1, 0, 0),
    west: vec3(-1, 0, 0),
    north: vec3(0, 0, 1),
    south: vec3(0, 0, -1)
};

export function miner(bot: ESMABot, options: MineflayerBotOptions) {
    bot.esma_miner = {
        strip: strip,
        stop: stop,
        tunnel: tunnel
    };

    function strip(direction: string, distance: number, size?: number) {
        requireInterfaceSafe(bot, {esma: esmastub});

        console.log("Currently not implemented");
    }

    function tunnel(direction: string, distance: number, size?: number) {
        requireInterfaceSafe(bot, {esma: esmastub});
        if (size === undefined) size = 3;

        let dir = directions[direction.toLowerCase()];
        if (!dir) throw new Error("Illegal direction");

        let it = new BlockIterator(bot.entity.position, dir, distance);
    }

    function stop() {
        requireInterfaceSafe(bot, {esma: esmastub});
        console.log("Currently not implemented");
    }
}

interface Iterator<T> {
    hasNext(): boolean;

    next(): T;
}

class BlockIterator implements Iterator<Vec3> {
    private start: Vec3;
    private end: Vec3;
    private dir: Vec3;
    private value: Vec3;

    constructor(start: Vec3, dir: Vec3, distance: number) {
        this.start = start;
        this.dir = dir;
        this.end = start.plus(dir.clone().scaled(distance + 1));
        this.value = start.clone();
    }

    hasNext(): boolean {
        return false;
    }

    next(): Vec3 {
        return undefined;
    }

}