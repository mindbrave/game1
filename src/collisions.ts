
import { flatten, equals } from "remeda";
import { prop, sortBy, head, isEmpty, curry } from "ramda";

import { Body, Seconds, MetersPerSecond, Meters, SquaredMeters, move, Circle, Shape, ShapeType } from "./physics";
import { subtractVectors, vectorMagnitude, scaleVector, vectorSqrMagnitude, normalizeVector, dotProduct, isZeroVector } from "./vectors";
import { add, sub, lt, pow2, lte, gte, sqrt2, div, mul, Scalar } from "uom-ts";
import { Map } from "immutable";

export type BodyId = number;
type TimeToImpact = Seconds;

export interface IncomingCollision {
    timeToImpact: Seconds;
    between: [[BodyId, Body], [BodyId, Body]],
}

export const moveWithCollisions = curry((duration: Seconds, bodiesMap: Map<BodyId, Body>): Map<BodyId, Body> => {
    const incomingCollisions = findIncomingCollisions(duration, bodiesMap);
    if (isEmpty(incomingCollisions)) {
        return bodiesMap.map(move(duration));
    }
    const earliestCollision = head(sortBy<IncomingCollision>(prop('timeToImpact'), incomingCollisions))!;
    let movedBodiesMap = bodiesMap.map(move(earliestCollision.timeToImpact));
    const [[bodyId1, body1], [bodyId2, body2]] = resolveCollision(earliestCollision);
    movedBodiesMap = movedBodiesMap.update(bodyId1, body => ({...body, velocity: body1.velocity}));
    movedBodiesMap = movedBodiesMap.update(bodyId2, body => ({...body, velocity: body2.velocity}));

    return moveWithCollisions(sub(duration, earliestCollision.timeToImpact), movedBodiesMap);
});

export const findIncomingCollisions = (duration: Seconds, bodiesMap: Map<BodyId, Body>): IncomingCollision[] => (
    everyDistinctPairInArray(bodiesMap.toArray()).map(([[bodyId1, body1], [bodyId2, body2]]) => ({
        timeToImpact: incomingCollisionBetween(body1, body2, duration),
        between: [[bodyId1, body1], [bodyId2, body2]],
    })).filter((incomingCollision): incomingCollision is IncomingCollision => incomingCollision.timeToImpact !== null)
);

const everyDistinctPairInArray = <T>(array: T[]): [T, T][] => flatten(
    array.map((element1, index) => array.slice(index).map(element2 => [element1, element2] as [T, T]))
);

const incomingCollisionBetween = (body1: Body, body2: Body, duration: Seconds): TimeToImpact | null => (
    isCircle(body1) ? (
        isCircle(body2) ? incomingCollisionBetweenCircles(body1, body2, duration) : null
    ) : null
);

const isCircle = (body: Body): body is Body<Circle> => equals(body.shape.type, ShapeType.Circle);

/**
 * Implementation of this algorithm -> https://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=1
 */
const incomingCollisionBetweenCircles = (body1: Body<Circle>, body2: Body<Circle>, duration: Seconds): TimeToImpact | null => {
    const [movingBody, staticBody] = considerSecondBodyStationary(body1, body2);
    const radiusSum = add(movingBody.shape.radius, staticBody.shape.radius);
    const towardsVector = subtractVectors(staticBody.position, movingBody.position);
    const distanceBetweenEntities = sub(vectorMagnitude(towardsVector), radiusSum);
    const entityTranslation = scaleVector(duration, movingBody.velocity);
    const distanceEntityCanMoveSqr = vectorSqrMagnitude(entityTranslation);
    if (!lt(pow2(distanceBetweenEntities), distanceEntityCanMoveSqr)) {
        return null;
    }
    const normalizedTranslation = normalizeVector(entityTranslation);
    const D = dotProduct(normalizedTranslation, towardsVector);
    if (lte(D, 0 as Meters)) {
        return null;
    }
    const distanceBetweenCenters = vectorMagnitude(towardsVector);
    const radiusSumSquared = pow2(radiusSum);
    const closestDistanceThatCanGetBetweenEntitiesSquared = sub(pow2(distanceBetweenCenters), pow2(D));
    if (gte(closestDistanceThatCanGetBetweenEntitiesSquared, radiusSumSquared)) {
        return null;
    }
    const T = sub(radiusSumSquared, closestDistanceThatCanGetBetweenEntitiesSquared);
    if (lt(T, 0 as SquaredMeters)) {
        return null;
    }
    const distanceTillCollision = sub(D, sqrt2(T));
    const translationDistance = vectorMagnitude(entityTranslation);
    if (lt(translationDistance, distanceTillCollision)) {
        return null;
    }
    const x = div(distanceTillCollision, translationDistance);
    const realDistanceTillCollisionFromBody1 = mul(vectorMagnitude(scaleVector(duration, body1.velocity)), x);
    const realDistanceTillCollisionFromBody2 = mul(vectorMagnitude(scaleVector(duration, body2.velocity)), x);
    const timeToImpact = !isZeroVector(body1.velocity) ?
        div(realDistanceTillCollisionFromBody1, vectorMagnitude(body1.velocity)) :
        div(realDistanceTillCollisionFromBody2, vectorMagnitude(body2.velocity));
    return timeToImpact;
};

const considerSecondBodyStationary = <A extends Shape, B extends Shape>(body1: Body<A>, body2: Body<B>): [Body<A>, Body<B>] => {
    return [
        {
            ...body1,
            velocity: subtractVectors(body1.velocity, body2.velocity),
        },
        {
            ...body2,
            velocity: {
                x: 0 as MetersPerSecond,
                y: 0 as MetersPerSecond,
                z: 0 as MetersPerSecond,
            },
        },
    ];
};

const resolveCollision = (collision: IncomingCollision): [[BodyId, Body], [BodyId, Body]] => {
    const [body1Id, body1] = collision.between[0];
    const [body2Id, body2] = collision.between[1];
    return [
        [body1Id, circleBounceOfCircle(body1 as Body<Circle>, body2 as Body<Circle>)],
        [body2Id, circleBounceOfCircle(body2 as Body<Circle>, body1 as Body<Circle>)],
    ];
};

const circleBounceOfCircle = (body1: Body<Circle>, body2: Body<Circle>): Body<Circle> => {
    const normalizedVectorBetween = normalizeVector(subtractVectors(body2.position, body1.position));
    const a1 = dotProduct(body1.velocity, normalizedVectorBetween);
    const a2 = dotProduct(body2.velocity, normalizedVectorBetween);

    const optimizedP = div(mul(2.0 as Scalar, sub(a1, a2)), add(body1.mass, body2.mass));
    const newVelocity = subtractVectors(body1.velocity, scaleVector(mul(optimizedP, body2.mass), normalizedVectorBetween));
    return {
        ...body1,
        velocity: newVelocity,
    };
};
