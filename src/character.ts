
import { Scalar } from "uom-ts";

import { Vec, vec } from "./gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { ShapeType } from "./gamda/physics/shape";
import { Entity, EntityId } from "./gamda/entities";
import { Physical, alwaysCollide, doesntOverlap, bounce } from "./gamda/entitiesPhysics";
import { WithBehavior } from "./gamda/movingBehavior";
import { Map } from "immutable";

export type Character = Entity<Physical & WithBehavior>;

export const createCharacter = (position: Vec<Meters>): Character => ({
    id: null,
    type: 'character',
    body: {
        position,
        velocity: vec(0, 0, 0) as Vec<MetersPerSecond>,
        dampening: 5.0 as MetersPerSquaredSecond,
        shape: {
            type: ShapeType.Sphere,
            radius: 1.0 as Meters,
        },
        mass: 1.0 as Kilograms,
    },
    contactBehaviors: Map({
        'character': {
            doesCollide: alwaysCollide,
            doesOverlap: doesntOverlap,
            onCollision: [bounce],
            onOverlap: []
        },
        'projectile': {
            doesCollide: alwaysCollide,
            onCollision: [bounce],
            doesOverlap: doesntOverlap,
            onOverlap: []
        }
    }),
    movementBehavior: {
        acceleration: 30.0 as MetersPerSquaredSecond,
        maxVelocity: 15.0 as MetersPerSecond,
        direction: {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar},
    },
});
