import { pipe } from "remeda";
import { expect, assert } from "chai";

import { timeTillCollisionBetweenBodies } from "../../physics/collisions/detection";
import { givenBody, atPosition, withZeroVelocity, withVelocity, circleShaped } from "../fixtures/body";
import { Map } from "immutable";
import { Meters, Seconds, MetersPerSecond } from "../../physics/units";
import { Shape } from "../../physics/shape";
import { Body } from "../../physics/body";

describe("find incoming collisions between given bodies", () => {
    test("doesnt find incoming collision between two bodies that are not going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity
        );

        const timeToCollision = timeTillCollisionBetweenBodies(bodyA, bodyB, 10.0 as Seconds);
    
        expect(timeToCollision).to.be.null;
    });

    test("can find incoming collision between two bodies that are going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1.0 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond})
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity
        );

        const timeToCollision = timeTillCollisionBetweenBodies(bodyA, bodyB, 10.0 as Seconds);
    
        assert.closeTo(timeToCollision!, 9.0 as Seconds, 0.1 as Seconds);
    });
});


