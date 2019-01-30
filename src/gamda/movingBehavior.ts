
import { Scalar } from "uom-ts";
import { curry } from "ramda";
 
import { accelerate, tuneAccelerationToNotExceedGivenVelocity, Seconds, MetersPerSecond, MetersPerSquaredSecond, Body } from "./physics";
import { scaleVector, Vec } from "./vectors";

export interface MovementBehavior {
    direction: Vec<Scalar>;
    acceleration: MetersPerSquaredSecond;
    maxVelocity: MetersPerSecond;
}

export const updateBodyMovingBehavior = curry((delta: Seconds, body: Body, movementBehavior: MovementBehavior): Body => (
    accelerate(
        tuneAccelerationToNotExceedGivenVelocity(
            movementBehavior.maxVelocity,
            delta,
            body.velocity,
            scaleVector(
                movementBehavior.acceleration, 
                movementBehavior.direction
            )
        ),
        delta,
        body
    )
));

export const orderToNotMove = (movementBehavior: MovementBehavior): MovementBehavior => ({
    ...movementBehavior,
    direction: {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar},
});

export const orderToGoIntoDirection = curry((direction: Vec<Scalar>, movementBehavior: MovementBehavior): MovementBehavior => ({
    ...movementBehavior,
    direction
}));
