
import { Scalar } from "uom-ts";

import { Vec, vec } from "../gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, ShapeType, Kilograms } from "../gamda/physics";
import { Physical, WithBehavior } from "../gamda/entities";

export type Character = Physical & WithBehavior;

export const createCharacter = (position: Vec<Meters>): Character => ({
    body: {
        position,
        velocity: vec(0, 0, 0) as Vec<MetersPerSecond>,
        friction: 5.0 as MetersPerSquaredSecond,
        shape: {
            type: ShapeType.Circle,
            radius: 1.0 as Meters,
        },
        mass: 1.0 as Kilograms,
    },
    movementBehavior: {
        acceleration: 30.0 as MetersPerSquaredSecond,
        maxVelocity: 15.0 as MetersPerSecond,
        direction: {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar},
    },
});
