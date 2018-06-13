/**
 * Adapted from https://github.com/Darthfett/helperbot/blob/master/lib/plugins/stripmine.js
 * 
 */

import {ESMABot} from "../classes/ESMABot";
import * as assert from "assert";
import * as vec3 from "vec3";
import {Location, materials, MineflayerBotOptions} from "mineflayer";
import {Vec3} from "../vec3";


let sideVecs = [
    vec3(-1, 0, 0),
    vec3(1, 0, 0),
    vec3(0, -1, 0),
    vec3(0, 1, 0),
    vec3(0, 0, -1),
    vec3(0, 0, 1),
];

// block types allowed to be used as scaffolding
const scaffoldBlockTypes = {
    3: true, // dirt
    4: true, // cobblestone
    87: true, // netherrack
};

const liquidBlockTypes = {
    8: true,  // water
    9: true,  // water
    10: true, // lava
    11: true, // lava
};

const fallingBlockTypes = {
    12: true, // sand
    13: true, // gravel
};

function mine() {
    let it = null;
    let respond = (err?) => null;
    let stopped = true;
    let bot = this;

    function strip(username, args, respondFn) {
        respond = respondFn;
        if (stopped) {
            stopped = false;
            it = new Iterator(bot.entity.position);
            breakAllInRange();
        } else {
            respond("Already strip mining.");
        }
    }

    function stop(username, args, respondFn) {
        respond = respondFn;
        if (!stopped) {
            bot.scaffold.stop();
            stopped = true;
            respond("stopping strip mining operation");
        }
    }

    function placeBlock(targetBlock, face, cb) {
        equipBuildingBlock(function (err) {
            if (err) {
                cb(err);
            } else {
                bot.placeBlock(targetBlock, face);
                cb();
            }
        });
    }

    function equipBuildingBlock(cb) {
        // return true if we're already good to go
        if (bot.heldItem && scaffoldBlockTypes[bot.heldItem.type]) return cb();
        const scaffoldingItems = bot.inventory.items().filter(function (item) {
            return scaffoldBlockTypes[item.type];
        });
        let item = scaffoldingItems[0];
        if (!item) {
            respond("I lack scaffolding materials.");
            stopped = true;
            return;
        }
        bot.equip(item, 'hand', cb);
    }

    function breakBlock(targetBlock, cb) {
        if (bot.game.gameMode === 'creative') {
            bot.dig(targetBlock, cb);
            return;
        }
        // before breaking, plug up any lava or water
        const liquidBlockAndVecs = sideVecs.map(function (sideVec) {
            return {
                block: bot.blockAt(targetBlock.position.plus(sideVec)),
                sideVec: sideVec,
            };
        }).filter(function (sideBlockAndVec) {
            return liquidBlockTypes[sideBlockAndVec.block.type];
        });
        placeOne();

        function placeOne(err?) {
            if (err) return cb(err);
            const liquidBlockAndVec = liquidBlockAndVecs.shift();
            if (liquidBlockAndVec == null) {
                equipToolToBreak(targetBlock, function (err) {
                    if (err) return cb(err);
                    bot.dig(targetBlock, cb);
                });
            } else {
                placeBlock(targetBlock, liquidBlockAndVec.sideVec, placeOne);
            }
        }
    }

    function canHarvest(block) {
        let okTools = block.harvestTools;
        if (!okTools) return true;
        if (bot.heldItem && okTools[bot.heldItem.type]) return true;
        // see if we have the tool necessary in inventory
        const tools = bot.inventory.items().filter(function (item) {
            return okTools[item.type];
        });
        let tool = tools[0];
        return !!tool;
    }

    function equipToolToBreak(blockToBreak, cb) {
        if (!canHarvest(blockToBreak)) {
            respond("I lack a tool to break " + blockToBreak.displayName);
            stopped = true;
            return;
        }
        // equip the most efficient tool that we have
        let material = blockToBreak.material;
        if (!material) return cb();
        const toolMultipliers = materials[material];
        assert.ok(toolMultipliers);
        const tools = bot.inventory.items().filter(item => toolMultipliers[item.type] != null);
        tools.sort((a, b) => toolMultipliers[b.type] - toolMultipliers[a.type]);
        let tool = tools[0];
        if (!tool) return cb();
        if (bot.heldItem && bot.heldItem.type === tool.type) return cb();
        bot.equip(tool, 'hand', cb);
    }

    function breakAllInRange(err?) {
        if (stopped) return;
        if (err) {
            if (err.code === 'EDIGINTERRUPT') {
                process.nextTick(breakAllInRange);
            } else {
                respond("Error breaking block.");
                console.error(err.stack);
                stopped = true;
            }
            return;
        }
        const cursor = vec3();
        const pos = bot.entity.position.floored();
        for (cursor.x = pos.x - 6; cursor.x < pos.x + 6; cursor.x += 1) {
            for (cursor.y = pos.y + 5; cursor.y >= pos.y; cursor.y -= 1) {
                for (cursor.z = pos.z - 6; cursor.z < pos.z + 6; cursor.z += 1) {
                    // make sure it's in the strip mine
                    if (cursor.x < it.start.x || cursor.x >= it.start.x + 16 ||
                        cursor.z < it.start.z || cursor.z >= it.start.z + 16) {
                        continue;
                    }
                    const block = bot.blockAt(cursor);
                    if (bot.canDigBlock(block)) {
                        breakBlock(block, breakAllInRange);
                        return;
                    }
                }
            }
        }
        scaffoldToNext();
    }

    function scaffoldToNext() {
        let targetBlock = null;
        while (it.value) {
            const block = bot.blockAt(it.value);
            if (block && block.diggable) {
                targetBlock = block;
                break;
            }
            it.next();
        }
        if (!targetBlock) {
            respond("done.");
            stopped = true;
            return;
        }
        // find the key point with the lowest Y that allows us to break the block
        const keyPtIt = new KeyPointIterator(targetBlock.position);
        while (keyPtIt.value.distanceTo(targetBlock.position) > 5) {
            keyPtIt.next();
        }
        // get to the key point
        bot.scaffold.to(keyPtIt.value, {navigateTimeout: 50}, function (err) {
            if (err) {
                if (err.code === 'death') {
                    respond("I died. Pausing stripmining operation.");
                    stopped = true;
                } else if (err.code === 'danger') {
                    breakAllInRange();
                } else if (err.code === 'errorDigging') {
                    breakAllInRange();
                } else if (err.code === 'errorEquipping') {
                    breakAllInRange();
                } else if (err.code === 'itemRequired') {
                    if (err.data.type === 'tool') {
                        respond("I lack the tool to break " + err.data.targetBlock.displayName);
                    } else if (err.data.type === 'scaffolding') {
                        respond("I lack scaffolding materials.");
                    }
                    stopped = true;
                }
            } else {
                breakAllInRange();
            }
        });
    }
}

class Iterator {
    private start: Vec3;
    private end: Vec3;
    private value: Vec3;

    constructor(pos: Vec3) {
        const loc = new Location(pos);
        this.start = vec3(loc.chunkCorner.x, 255, loc.chunkCorner.z);
        this.end = vec3(this.start.x + 16, 0, this.start.z + 16);
        this.value = this.start.clone();
    }

    next() {
        this.value.x += 1;
        if (this.value.x < this.end.x) return;
        this.value.x = this.start.x;
        this.value.z += 1;
        if (this.value.z < this.end.z) return;
        this.value.z = this.start.z;
        this.value.y -= 1;
        if (this.value.y >= 0) return;
        this.value = null;
    }
}

const kpd = 3; // key point delta

class KeyPointIterator {
    get value(): Vec3 {
        return this._value;
    }

    private chunkCorner: Vec3;
    private readonly offset: Vec3;
    private _value: Vec3;

    constructor(pos: Vec3) {
        this.chunkCorner = (new Location(pos)).chunkCorner.offset(0, -16, 0);
        this.offset = vec3(kpd, kpd, kpd);
        this.computeValue();
    }

    computeValue() {
        this._value = this.chunkCorner.plus(this.offset);
    }

    next() {
        this.offset.x += kpd;
        if (this.offset.x >= 16) {
            this.offset.x = kpd;
            this.offset.z += kpd;
            if (this.offset.z >= 16) {
                this.offset.z = kpd;
                this.offset.y += kpd;
                assert.ok(this.offset.y < 32);
            }
        }
        this.computeValue();
    };
}

export function stripmine(bot: ESMABot, option: MineflayerBotOptions) {
    bot.mine = mine;
}