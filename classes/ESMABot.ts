import {ESMA} from "../plugins/esma";
import {MineflayerBot} from "../mineflayer";

/**
 * Interface for the ESMABot, this is only used for typescript typechecking.
 */
export interface ESMABot extends MineflayerBot {
    esma?: ESMA;
    esma_miner?: {
        strip: (direction: string, distance: number, size?: number) => void,
        tunnel: (direction: string, distance: number, size?: number) => void,
        stop: () => void,
        unpause: () => void
    };
    scaffold?: any
    navigate: any
    heldItem?: any;
}