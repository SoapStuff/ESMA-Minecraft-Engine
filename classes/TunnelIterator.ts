import {Iterator} from "./Iterator";
import * as vec3 from "vec3";
import {Vec3} from "../vec3";

/**
 * Constants for the directions.
 * @type {{north, east, south, west}}
 */
export function directions(dir: string): Vec3 {
    let directions: { [i: string]: Vec3 } = {
        north: vec3(0, 0, -1),
        east: vec3(1, 0, 0),
        south: vec3(0, 0, 1),
        west: vec3(-1, 0, 0),
    };
    return directions[dir] ? directions[dir].clone() : null;
}

/**
 * Constants for the directions.
 * @type {{north: string, east: string, south: string, west: string}}
 */
export function rightof(dir: string) {
    let rightof: { [i: string]: string } = {
        north: "east",
        east: "south",
        south: "west",
        west: "north"

    };
    return rightof[dir] ? rightof[dir] : null;
}


/**
 * Iterator for positions of a tunnel.
 */
export class TunnelIterator implements Iterator<Vec3> {
    private readonly start: Vec3;
    private readonly end: Vec3;
    private readonly dir: Vec3;
    private readonly size: number;

    private count = 0;
    private readonly maxCount: number;

    private readonly right: Vec3;
    private readonly up: Vec3 = vec3(0, 1, 0);

    private next_value: Vec3;

    /**
     * @constructor
     * @param {Vec3} start The start position of the tunnel.
     * @param {string} direction The direction (east west ...) the tunnel should be made in.
     * @param {number} distance The length of the tunnel.
     * @param {number} size The size (width & height) of the tunnel.
     */
    constructor(start: Vec3, direction: string, distance: number, size: number) {
        if (!directions[direction.toLowerCase()]) throw new Error("Illegal direction");
        if (size < 2) throw new Error("Size must be atleast 2");

        this.start = start;
        this.dir = directions(direction.toLowerCase());
        this.right = directions(rightof[direction.toLowerCase()]);

        this.next_value = start.clone();
        this.size = size;
        this.end = this.calcEnd(distance);
        this.maxCount = size * size * distance;
    }

    private calcEnd(distance: number): Vec3 {
        let offset = this.dir.clone().scaled(distance + 1);
        let rightOf = this.right.plus(vec3(0, 1, 0)).scaled(this.size - 1);
        return this.start.plus(offset).plus(rightOf);
    }

    hasNext(): boolean {
        return this.count < this.maxCount && !!this.next_value && !this.next_value.equals(this.end);
    }

    next(): Vec3 {
        let result = this.next_value.clone();
        this.getNext();
        return result;
    }

    peek(): Vec3 {
        return this.next_value ? this.next_value.clone() : null;
    }

    private getNext() {
        if (!this.hasNext()) this.next_value = null;
        this.count++;

        //If moving in the z direction you need to reset the x count when reaching the most right point.
        if (this.next_value.x === this.end.x && this.dir.z !== 0) {
            this.next_value.x = this.start.x;
            if (this.next_value.y === this.end.y) {
                this.next_value.y = this.start.y;
                this.next_value.add(this.dir);
            } else {
                this.next_value.add(this.up)
            }
            return;
        }

        //If moving in the x direction you need to reset the z count when reaching the most right point.
        if (this.next_value.z === this.end.z && this.dir.x !== 0) {
            this.next_value.z = this.start.z;
            if (this.next_value.y === this.end.y) {
                this.next_value.y = this.start.y;
                this.next_value.add(this.dir);
            } else {
                this.next_value.add(this.up)
            }
            return;
        }

        this.next_value.add(this.right);
    }
}