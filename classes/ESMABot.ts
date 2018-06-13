import {ESMA} from "../plugins/esma";
import {MineflayerBot} from "../mineflayer";

export interface ESMABot extends MineflayerBot {
    esma?: ESMA;
    mine?: any;
}