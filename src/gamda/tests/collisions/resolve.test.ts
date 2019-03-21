import { pipe } from "remeda";
import { expect } from "chai";

import { givenBody, circleShaped, withVelocity, atPosition } from "../fixtures/body";

import { vec, Vec } from "../../vectors";
import { circleBounceOfCircle } from "../../physics/collisions/resolve";
import { Meters, MetersPerSecond } from "../../physics/units";

describe("Can correctly resolve bouncing bodies off each other", function() {
    test("can bounce circle of circle if going into each other in the same direction", function() {
        const circleA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>),
        );
        const circleB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withVelocity(vec(-1, 0, 0) as Vec<MetersPerSecond>),
        );

        const resolvedA = circleBounceOfCircle(circleA, circleB);
        const resolvedB = circleBounceOfCircle(circleB, circleA);

        expect(resolvedA.velocity).to.deep.equal(circleB.velocity);
        expect(resolvedB.velocity).to.deep.equal(circleA.velocity);
    });

    test("can bounce circle of circle when one stays and one is moving", function() {
        const circleA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(1, 0, 0) as Vec<MetersPerSecond>),
        );
        const circleB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withVelocity(vec(0, 0, 0) as Vec<MetersPerSecond>),
        );

        const resolvedA = circleBounceOfCircle(circleA, circleB);
        const resolvedB = circleBounceOfCircle(circleB, circleA);

        expect(resolvedA.velocity).to.deep.equal(circleB.velocity);
        expect(resolvedB.velocity).to.deep.equal(circleA.velocity);
    });

    test("can bounce circle of circle on 45 degrees angle", function() {
        const circleA = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition(vec(0, 0, 0) as Vec<Meters>),
            withVelocity(vec(1, 1, 0) as Vec<MetersPerSecond>),
        );
        const circleB = pipe(
            givenBody(),
            circleShaped(0.5 as Meters),
            atPosition(vec(1, 0, 0) as Vec<Meters>),
            withVelocity(vec(0, 0, 0) as Vec<MetersPerSecond>),
        );

        const resolvedA = circleBounceOfCircle(circleA, circleB);
        const resolvedB = circleBounceOfCircle(circleB, circleA);

        expect(resolvedA.velocity).to.deep.equal(vec(0, 1, 0) as Vec<MetersPerSecond>);
        expect(resolvedB.velocity).to.deep.equal(vec(1, 0, 0) as Vec<MetersPerSecond>);
    });
});
