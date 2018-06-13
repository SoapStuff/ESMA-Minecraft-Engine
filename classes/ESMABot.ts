import {ESMA} from "../plugins/esma";
import {MineflayerBot} from "../mineflayer";

export interface ESMABot extends MineflayerBot {
    welcome?: any;
    esma?: ESMA;
    mine?: {
        strip: (direction: string, distance: number, func: Function) => void,
        stop: (f: Function) => void
    };
    scaffold?: any
    heldItem?: any;
}