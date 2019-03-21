import { curryN } from "ramda";
import { Seconds, MetersPerSecond, MetersPerSquaredSecond } from "./units";
import { addVectors, scaleVector, subtractVectors, vectorMagnitude, normalizeVector, Vec, divideVector, clampVector, zeroVector } from "../vectors";
import { mul, Scalar } from "uom-ts";
import { Body } from "./body";

export const move = curryN(2, (delta: Seconds, body: Body): Body => ({
    ...body,
    position: addVectors(body.position, scaleVector(delta, body.velocity)),
}));

export const setZeroVelocity = (body: Body): Body => ({...body, velocity: zeroVector as Vec<MetersPerSecond>});

export const applyDampening = curryN(2, (delta: Seconds, body: Body): Body => ({
    ...body,
    velocity: subtractVectors(
        body.velocity,
        scaleVector(Math.min(mul(body.dampening, delta), vectorMagnitude(body.velocity)) as MetersPerSecond, normalizeVector(body.velocity))
    ),
}));

export const setBodyVelocityTowardsDirection = (direction: Vec<Scalar>, speed: MetersPerSecond, body: Body): Body => ({
    ...body,
    velocity: scaleVector(speed, normalizeVector(direction)),
});

export const accelerate = (acceleration: Vec<MetersPerSquaredSecond>, delta: Seconds, body: Body): Body => ({
    ...body,
    velocity: addVectors(body.velocity, scaleVector(delta, acceleration)),
});

export const tuneAccelerationToNotExceedGivenVelocity = (
        velocityToNotExceed: MetersPerSecond,
        delta: Seconds,
        currentVelocity: Vec<MetersPerSecond>,
        acceleration: Vec<MetersPerSquaredSecond>
    ): Vec<MetersPerSquaredSecond> => (
        divideVector(
            delta,
            subtractVectors(
                clampVector(velocityToNotExceed, addVectors(scaleVector(delta, acceleration), currentVelocity)),
                currentVelocity
            )
        )
);
