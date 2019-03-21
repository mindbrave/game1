
import { Shape } from "./shape";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./units";
import { Vec } from "../vectors";

export interface Body<SHAPE = Shape> {
    position: Vec<Meters>;
    velocity: Vec<MetersPerSecond>;
    dampening: MetersPerSquaredSecond;
    shape: SHAPE;
    mass: Kilograms;
}
