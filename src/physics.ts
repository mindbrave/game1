
import { curry } from "ramda";
import { Unit, Scalar, mul } from "uom-ts";

import { Vec, addVectors, scaleVector, normalizeVector, clampVector, subtractVectors, divideVector, vectorMagnitude } from "./vectors";

export type Meters = Unit<{m: 1}>;
export type SquaredMeters = Unit<{m: 2}>;
export type Seconds = Unit<{s: 1}>;
export type Milliseconds = Unit<{ms: 1}>;
export type Kilograms = Unit<{kg: 1}>;
export type MetersPerSecond = Unit<{m: 1, s: -1}>;
export type MetersPerSquaredSecond = Unit<{m: 1, s: -2}>;

export enum ShapeType {
    Segment,
    Circle,
}

export type Segment = {
    type: ShapeType.Segment,
    pointA: Vec<Meters>,
    pointB: Vec<Meters>,
}

export type Circle = {
    type: ShapeType.Circle,
    radius: Meters,
}

export type Shape = Circle | Segment;

export interface Body<SHAPE = Shape> {
    position: Vec<Meters>;
    velocity: Vec<MetersPerSecond>;
    friction: MetersPerSquaredSecond;
    shape: SHAPE;
    mass: Kilograms;
}

export const move = curry((delta: Seconds, body: Body): Body => ({
    ...body,
    position: addVectors(body.position, scaleVector(delta, body.velocity)),
}));

export const applyFriction = curry((delta: Seconds, body: Body): Body => ({
    ...body,
    velocity: subtractVectors(
        body.velocity,
        scaleVector(Math.min(mul(body.friction, delta), vectorMagnitude(body.velocity)) as MetersPerSecond, normalizeVector(body.velocity))
    ),
}));

export const setBodyVelocityTowardsDirection = (direction: Vec<Scalar>, speed: MetersPerSecond, body: Body): Body => ({
    ...body,
    velocity: scaleVector(speed, normalizeVector(direction)),
});

export const accelerate = curry((acceleration: Vec<MetersPerSquaredSecond>, delta: Seconds, body: Body): Body => ({
    ...body,
    velocity: addVectors(body.velocity, scaleVector(delta, acceleration)),
}));

export const tuneAccelerationToNotExceedGivenVelocity = curry((
        velocityToNotExceed: MetersPerSecond,
        delta: Seconds,
        currentVelocity: Vec<MetersPerSecond>,
        acceleration: Vec<MetersPerSquaredSecond>
    ): Vec<MetersPerSquaredSecond> => divideVector(
        delta,
        subtractVectors(
            clampVector(velocityToNotExceed, addVectors(scaleVector(delta, acceleration), currentVelocity)),
            currentVelocity
        )
    )
);
