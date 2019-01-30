import { pipe } from "remeda";
import { assert } from "chai";

import { Meters, MetersPerSecond, Seconds, Body, Shape } from "../physics";
import { findIncomingCollisions, moveWithCollisions } from "../collisions";
import { givenBody, atPosition, withZeroVelocity, withVelocity, circleShaped } from "./fixtures/body";
import { Map } from "immutable";

describe("find incoming collisions between given bodies", () => {
    test("doesnt find incoming collision between two entities that are not going to collide", () => {
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

        const incomingCollisions = findIncomingCollisions(10.0 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        assert.equal(incomingCollisions.length, 0);
    });

    test("can find incoming collision between two entities that are going to collide", () => {
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

        const incomingCollisions = findIncomingCollisions(10.0 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        assert.equal(incomingCollisions.length, 1);
        const incomingCollision = incomingCollisions[0];
        assert.closeTo(incomingCollision.timeToImpact, 9.0 as Seconds, 0.1 as Seconds);
        assert.deepEqual(incomingCollision.between, [[1, bodyA], [2, bodyB]]);
    });

    test("can find incoming collision between more than two entities that are going to collide", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity,
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: -10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond})
        );
        const bodyC = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: -1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond})
        );

        const incomingCollisions = findIncomingCollisions(10.0 as Seconds, Map([[1, bodyA], [2, bodyB], [3, bodyC]] as [number, Body<Shape>][]));
        assert.equal(incomingCollisions.length, 3);
        const incomingCollisionAB = incomingCollisions[0];
        const incomingCollisionAC = incomingCollisions[1];
        const incomingCollisionBC = incomingCollisions[2];

        assert.closeTo(incomingCollisionAB.timeToImpact, 9.0 as Seconds, 0.1 as Seconds);
        assert.deepEqual(incomingCollisionAB.between, [[1, bodyA], [2, bodyB]]);
        assert.closeTo(incomingCollisionAC.timeToImpact, 9.0 as Seconds, 0.1 as Seconds);
        assert.deepEqual(incomingCollisionAC.between, [[1, bodyA], [3, bodyC]]);
        assert.closeTo(incomingCollisionBC.timeToImpact, 9.5 as Seconds, 0.1 as Seconds);
        assert.deepEqual(incomingCollisionBC.between, [[2, bodyB], [3, bodyC]]);
    });
});

describe("test if moving solid bodies collides properly and changes movement accordingly", () => {
    test("two bodies with the same speed going into each other will not collide if period is too short", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: -1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(4.5 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        const [movedA, movedB] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyA.velocity);
        assert.deepEqual(movedB.velocity, bodyB.velocity);
    });

    test("two bodies with the same speed going into each other will bounce of", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: -1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(4.6 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        const [movedA, movedB] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyB.velocity);
        assert.deepEqual(movedB.velocity, bodyA.velocity);
    });

    test("two bodies with different speed going into each other will bounce of", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 2 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: -1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(3.1 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        const [movedA, movedB] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyB.velocity);
        assert.deepEqual(movedB.velocity, bodyA.velocity);
    });

    test("two bodies going into each other will bounce of when speed is much bigger than distance per time period", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 100 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: -100 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(1.0 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        const [movedA, movedB] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyB.velocity);
        assert.deepEqual(movedB.velocity, bodyA.velocity);
    });

    test("three bodies should bounce of each other, but middle body should stay in place", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 5 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withZeroVelocity,
        );
        const bodyC = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 10 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: -1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(5.0 as Seconds, Map([[1, bodyA], [2, bodyB], [3, bodyC]] as [number, Body<Shape>][]));
    
        const [movedA, movedB, movedC] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyC.velocity);
        assert.deepEqual(movedC.velocity, bodyA.velocity);
        assert.deepEqual(movedB.velocity, bodyB.velocity);
    });

    test("three bodies moving in the same direction with the same speed won't collide", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 1 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );
        const bodyC = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 2 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 1 as MetersPerSecond, y: 0 as MetersPerSecond, z: 0 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(1.0 as Seconds, Map([[1, bodyA], [2, bodyB], [3, bodyC]] as [number, Body<Shape>][]));
    
        const [movedA, movedB, movedC] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyA.velocity);
        assert.deepEqual(movedB.velocity, bodyB.velocity);
        assert.deepEqual(movedC.velocity, bodyC.velocity);
    });

    test("body hitting slower body from behind will speed it up", () => {
        const bodyA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 0 as Meters}),
            withVelocity({x: 0 as MetersPerSecond, y: 0 as MetersPerSecond, z: 2 as MetersPerSecond}),
        );
        const bodyB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition({x: 0 as Meters, y: 0 as Meters, z: 5 as Meters}),
            withVelocity({x: 0 as MetersPerSecond, y: 0 as MetersPerSecond, z: 1 as MetersPerSecond}),
        );

        const bodiesAfterCollision = moveWithCollisions(5.0 as Seconds, Map([[1, bodyA], [2, bodyB]] as [number, Body<Shape>][]));
    
        const [movedA, movedB] = bodiesAfterCollision.valueSeq().toArray();
        assert.deepEqual(movedA.velocity, bodyB.velocity);
        assert.deepEqual(movedB.velocity, bodyA.velocity);
    });
});
