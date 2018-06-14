import {ESMA} from "../plugins/esma";
import {MineflayerBot} from "../mineflayer";

export interface ESMABot extends MineflayerBot {
    welcome?: any;
    esma?: ESMA;
    esma_miner?: {
        strip: (direction: string, distance: number, size?: number) => void,
        tunnel: (direction: string, distance: number, size?: number) => void,
        stop: () => void
    };
    scaffold?: any
    heldItem?: any;
}