export declare class Vec3 {
    x: number;
    y: number;
    z: number;

    set(x: number, y: number, z: number): Vec3

    update(other: Vec3): Vec3

    floored(): Vec3

    floor(): Vec3

    offset(dx: number, dy: number, dz: number): Vec3;

    translate(dx: number, dy: number, dz: number): Vec3

    add(other: Vec3): Vec3

    substract(other: Vec3): Vec3;

    plus(other: Vec3): Vec3;

    min(other: Vec3): Vec3;

    scaled(scalar: number): Vec3;

    modulus(other: Vec3): Vec3;

    distanceTo(other: Vec3): number;

    equals(other: Vec3): boolean

    min(other: Vec3): Vec3;

    max(other: Vec3): Vec3;

    clone(): Vec3
}

export default function vec3(x: number, y: number, z: number): Vec3