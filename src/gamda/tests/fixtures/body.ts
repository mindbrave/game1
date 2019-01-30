
import { curry } from "ramda";

import { Body, Meters, MetersPerSecond, MetersPerSquaredSecond, ShapeType, Kilograms } from "../../physics";
import { Vec } from "../../vectors";

export const givenBody = (): Body => ({
    position: {
        x: 0.0 as Meters,
        y: 0.0 as Meters,
        z: 0.0 as Meters
    },
    velocity: {
        x: 0.0 as MetersPerSecond,
        y: 0.0 as MetersPerSecond,
        z: 0.0 as MetersPerSecond,
    },
    friction: 0 as MetersPerSquaredSecond,
    shape: {
        type: ShapeType.Circle,
        radius: 1.0 as Meters,
    },
    mass: 1.0 as Kilograms,
});

export const atPosition = curry((position: Vec<Meters>, body: Body): Body => ({
    ...body,
    position,
}));

export const withVelocity = curry((velocity: Vec<MetersPerSecond>, body: Body): Body => ({
    ...body,
    velocity,
}));

export const withZeroVelocity = (body: Body): Body => ({
    ...body,
    velocity: {
        x: 0 as MetersPerSecond,
        y: 0 as MetersPerSecond,
        z: 0 as MetersPerSecond,
    }
});

export const withFriction = curry((friction: MetersPerSquaredSecond, body: Body): Body => ({
    ...body,
    friction
}));

export const circleShaped = curry((radius: Meters, body: Body): Body => ({
    ...body,
    shape: {
        type: ShapeType.Circle,
        radius,
    }
}));
