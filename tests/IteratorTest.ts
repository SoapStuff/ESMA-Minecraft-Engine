import {TunnelIterator} from "../classes/TunnelIterator";
import * as vec3 from "vec3";
//east: vec3(1, 0, 0),
let iterator = new TunnelIterator(vec3(5, 10, 20), "east", 8, 3);
let actual = [];
while (iterator.hasNext()) {
    actual.push(iterator.next());
}

console.log(JSON.stringify(actual, null, 2));
