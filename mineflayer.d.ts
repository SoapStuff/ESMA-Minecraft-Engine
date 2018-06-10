import EventEmitter = NodeJS.EventEmitter;

declare function createBot(options: any);

declare class Vec3 {
    x: number;
    y: number;
    z: number;
}

declare type Vec3Arg = [number, number, number] | Vec3;

declare class BotGame {

    levelType;
    dimension;
    difficulty;
    gameMode;
    hardcore: boolean;
    worldHeight: number;
    maxPlayers: number;
}

declare class BotSettings {

    chat: any;
    colorsEnabled: boolean;
    viewDistance: number;
    difficulty: any;
    showCape: any;
}

declare class BotExperience {
    level: number;
    points: number;
    progress: number;
}

declare class BotTime {
    day: number;
    age: number;
}

declare class Entity extends EventEmitter {
    constructor(id: number);

    id: number;
    type: 'player' | 'mob' | 'object' | 'global' | 'orb' | 'other';

    username?: string;

    mobType?: string;
    displayName?: string;
    entityType?: number;

    kind?: any;
    name?: string;

    objectType?: string;
    count?: number;


    position: Vec3;
    velocity: Vec3;
    yaw: number;
    pitch: number;
    onGround: boolean;
    height: number;
    effects: any;
    // 0 = held item, 1-4 = armor slot
    equipment: [any, any, any, any, any];
    heldItem: any;
    isValid: boolean;

    metadata: any;
    player?: any;

}

declare class MineflayerBot extends EventEmitter {

    entity: Entity;
    entities: any;
    username: string;
    spawnPoint: any;

    players: any[];
    isRaining: boolean;
    chatPatterns: any;

    game: BotGame;
    settings: BotSettings;
    experience: BotExperience;
    time: BotTime;
    creative: BotCreative;

    health: number;
    food: number;
    foodSaturation: number;
    physics: any;

    quickBarSlot: any;
    inventory: any;
    targetDigBlock: any;
    isSleeping: boolean;
    scoreboards: any;
    controlState: any;


    end(): void

    quit(reason): void

    chat(message: string): void

    whisper(username: string, message: string): void

    chatAddPattern(pattern, chatType, description): void

    setSettings(options): void

    loadPlugin(plugin): void

    loadPlugins(plugins): void

    sleep(bedBlock, cb?): void

    wake(cb?): void

    setControlState(control, state): void

    clearControlStates(): void

    lookAt(point, [force], callback?): void

    look(yaw, pitch, [force], callback?): void

    updateSign(block, text): void

    equip(item, destination, callback?): void

    unequip(destination, callback?): void

    tossStack(item, callback?): void

    toss(itemType, metadata, count, callback?): void

    dig(block, callback?): void

    stopDigging(): void

    digTime(block): void

    placeBlock(referenceBlock, faceVector, cb): void

    activateBlock(block, callback?): void

    activateEntity(entity, callback?): void

    activateItem(): void

    deactivateItem(): void

    useOn(targetEntity): void

    attack(entity): void

    mount(entity): void

    dismount(): void

    moveVehicle(left, forward): void

    setQuickBarSlot(slot): void

    craft(recipe, count, craftingTable, callback?): void

    writeBook(slot, pages, callback?): void

    openChest(chestBlockOrMinecartchestEntity): void

    openFurnace(furnaceBlock): void

    openDispenser(dispenserBlock): void

    openEnchantmentTable(enchantmentTableBlock): void

    openVillager(villagerEntity): void

    trade(villagerInstance, tradeIndex, times?, cb?): void

    setCommandBlock(pos, command, track_output): void


    clickWindow(slot, mouseButton, mode, cb): void

    putSelectedItemRange(start, end, window, slot, cb): void

    putAway(slot, cb): void

    closeWindow(window): void

    transfer(options, cb): void

    openBlock(block, Class): void

    openEntity(entity, Class): void

    moveSlotItem(sourceSlot, destSlot, cb): void

    updateHeldItem(): void

    on(event: "chat", callback: (username, message, translate, jsonMsg, matches) => void);
    on(event: "whisper", callback: (username, message, translate, jsonMsg, matches) => void)
    on(event: "actionBar", callback: (jsonMsg) => void)
    on(event: "message", callback: (jsonMsg) => void)
    on(event: "login", callback: () => void)
    on(event: "spawn", callback: () => void)
    on(event: "respawn", callback: () => void)
    on(event: "game", callback: () => void)
    on(event: "title", callback: () => void)
    on(event: "rain", callback: () => void)
    on(event: "time", callback: () => void)
    on(event: "kicked", callback: (reason, loggedIn) => void)
    on(event: "end", callback: () => void)
    on(event: "spawnReset", callback: () => void)
    on(event: "death", callback: () => void)
    on(event: "health", callback: () => void)
    on(event: "entitySwingArm", callback: (entity) => void)
    on(event: "entityHurt", callback: (entity) => void)
    on(event: "entityWake", callback: (entity) => void)
    on(event: "entityEat", callback: (entity) => void)
    on(event: "entityCrouch", callback: (entity) => void)
    on(event: "entityUncrouch", callback: (entity) => void)
    on(event: "entityEquipmentChange", callback: (entity) => void)
    on(event: "entitySleep", callback: (entity) => void)
    on(event: "entitySpawn", callback: (entity) => void)
    on(event: "playerCollect", callback: (collector, collected) => void)
    on(event: "entityGone", callback: (entity) => void)
    on(event: "entityMoved", callback: (entity) => void)
    on(event: "entityDetach", callback: (entity, vehicle) => void)
    on(event: "entityAttach", callback: (entity, vehicle) => void)
    on(event: "entityUpdate", callback: (entity) => void)
    on(event: "entityEffect", callback: (entity, effect) => void)
    on(event: "entityEffectEnd", callback: (entity, effect) => void)
    on(event: "playerJoined", callback: (player) => void)
    on(event: "playerLeft", callback: (player) => void)
    on(event: "blockUpdate", callback: (oldBlock, newBlock) => void)
    on(event: "blockUpdate:(0,0,0)" | string, callback: (oldBlock, newBlock) => void)
    on(event: "chunkColumnLoad", callback: (point) => void)
    on(event: "chunkColumnUnload", callback: (point) => void)
    on(event: "soundEffectHeard", callback: (soundName, position, volume, pitch) => void)
    on(event: "hardcodedSoundEffectHeard", callback: (soundId, soundCategory, position, volume, pitch) => void)
    on(event: "noteHeard", callback: (block, instrument, pitch) => void)
    on(event: "pistonMove", callback: (block, isPulling, direction) => void)
    on(event: "chestLidMove", callback: (block, isOpen) => void)
    on(event: "blockBreakProgressObserved", callback: (block, destroyStage) => void)
    on(event: "blockBreakProgressEnd", callback: (block) => void)
    on(event: "diggingCompleted", callback: (block) => void)
    on(event: "diggingAborted", callback: (block) => void)
    on(event: "move", callback: () => void)
    on(event: "forcedMove", callback: () => void)
    on(event: "mount", callback: () => void)
    on(event: "dismount", callback: (vehicle) => void)
    on(event: "windowOpen", callback: (window) => void)
    on(event: "windowClose", callback: (window) => void)
    on(event: "sleep", callback: () => void)
    on(event: "wake", callback: () => void)
    on(event: "experience", callback: () => void)
    on(event: "scoreboardObjective", callback: (scoreboardName, displayText) => void)
    on(event: "scoreboardScore", callback: (scoreboardName, itemName, value) => void)
    on(event: "scoreboardDisplayObjective", callback: (scoreboardName, position) => void)


}

declare class BotCreative {
    setInventorySlot(slot, item)

    flyTo(destination, cb?)

    startFlying()

    stopFlying()
}