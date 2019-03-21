
import { Vec } from "../../vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "../../physics/units";
import { ShapeType, Circle } from "../../physics/shape";
import { Body } from "../../physics/body";

export const givenBody = (): Body<Circle> => ({
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
    dampening: 0 as MetersPerSquaredSecond,
    shape: {
        type: ShapeType.Circle,
        radius: 1.0 as Meters,
    },
    mass: 1.0 as Kilograms,
});

export const atPosition = (position: Vec<Meters>) => <B extends Body>(body: B): B => ({
    ...body,
    position,
});

export const withVelocity = (velocity: Vec<MetersPerSecond>) => <B extends Body>(body: B): B => ({
    ...body,
    velocity,
});

export const withZeroVelocity = <B extends Body>(body: B): B => ({
    ...body,
    velocity: {
        x: 0 as MetersPerSecond,
        y: 0 as MetersPerSecond,
        z: 0 as MetersPerSecond,
    }
});

export const withDampening = (dampening: MetersPerSquaredSecond) => <B extends Body>(body: B): B => ({
    ...body,
    dampening
});

export const circleShaped = (radius: Meters) => <B extends Body>(body: B): B & Body<Circle> => ({
    ...body,
    shape: {
        type: ShapeType.Circle,
        radius,
    }
});
