
import { isEmpty, head, sortBy, prop, isNil, curry, evolve, concat, map, pick } from "ramda";

import { EntityKind, Entity, Entities, setEntity, mapEntities, updateEntity, entitiesList, setManyEntities, EntityId, getEntity } from "./entities";
import { Map } from "immutable";
import { circleBounceOfCircle } from "./physics/collisions/resolve";
import { Seconds } from "./physics/units";
import { isCircleShaped } from "./physics/shape";
import { Body } from "./physics/body";
import { Maybe } from "./maybe";
import { sub } from "uom-ts";
import { move, applyDampening, setZeroVelocity } from "./physics/motion";
import { GameEvents, pipeWithEvents } from "./game";
import { timeTillCollisionBetweenBodies } from "./physics/collisions/detection";
import { everyDistinctPairInArray } from "./distinctPairsFromArray";

export type EntityContactEffect<T extends Entity = Entity> = (entity: T) => T;

export type DoesCollide = (entityA: Entity<Physical>, entityB: Entity<Physical>) => boolean;
export type DoesOverlap = DoesCollide;

export type OnCollision = (entityA: Entity<Physical>, entityB: Entity<Physical>, entities: Entities) => [Entities, GameEvents];
export type OnOverlap = OnCollision;

export type ContactBehavior = {
    doesCollide: DoesCollide,
    onCollision: OnCollision[],
    doesOverlap: DoesOverlap,
    onOverlap: OnOverlap[],
};

export interface Collision {
    timeToImpact: Seconds;
    between: [EntityId, EntityId],
}

export type Physical = {
    body: Body,
    contactBehaviors: Map<EntityKind, ContactBehavior>,
};

export const doesntCollide = (_: Entity<Physical>, __: Entity<Physical>): boolean => false;
export const alwaysCollide = (_: Entity<Physical>, __: Entity<Physical>): boolean => true;
export const doesntOverlap = doesntCollide;
export const alwaysOverlap = alwaysCollide;

export const moveEntitiesWithCollisions = curry((duration: Seconds, events: GameEvents, entities: Entities): [Entities, GameEvents] => {
    const [movedEntitiesList, collision] = moveUntilFirstCollision(duration, entitiesList(entities) as Entity<Physical>[]);
    const movedEntities = setManyEntities(movedEntitiesList, entities);
    if (isNil(collision)) {
        return [movedEntities, events];
    }
    const [entity1id, entity2id] = collision.between;
    const entity1 = getEntity(entity1id, movedEntities) as Entity<Physical>;
    const entity2 = getEntity(entity2id, movedEntities) as Entity<Physical>;
    const [entitiesAfterCollision, eventsAfterCollision] = pipeWithEvents(
        movedEntities,
        applyContactEffectsAgainstEntity(entity1, entity2),
        applyContactEffectsAgainstEntity(entity2, entity1)
    );

    return moveEntitiesWithCollisions(sub(duration, collision.timeToImpact), concat(events, eventsAfterCollision), entitiesAfterCollision);
});

export const moveUntilFirstCollision = (duration: Seconds, entities: Entity<Physical>[]): [Entity<Physical>[], Maybe<Collision>] => {
    const incomingCollisions = findIncomingCollisions(duration, entities);
    if (isEmpty(incomingCollisions)) {
        return [map(evolve({body: move(duration)}), entities), null];
    }
    const earliestCollision = head(sortBy<Collision>(prop('timeToImpact'), incomingCollisions))!;
    let movedEntities = map<Entity<Physical>, Entity<Physical>>(evolve({body: move(earliestCollision.timeToImpact)}), entities);
    return [movedEntities, earliestCollision];
};

const findIncomingCollisions = (duration: Seconds, entities: Entity<Physical>[]): Collision[] => (
    everyDistinctPairInArray(entities).filter(([entityA, entityB]) => doesEntitiesCollide(entityA, entityB)).map(([entityA, entityB]) => ({
        timeToImpact: timeTillCollisionBetweenBodies(entityA.body, entityB.body, duration),
        between: [entityA.id, entityB.id],
    })).filter((incomingCollision): incomingCollision is Collision => incomingCollision.timeToImpact !== null)
);

const doesEntitiesCollide = (entityA: Entity<Physical>, entityB: Entity<Physical>): boolean => {
    const contactBehaviorAvsB = entityA.contactBehaviors.get(entityB.type);
    const contactBehaviorBvsA = entityB.contactBehaviors.get(entityA.type);
    if (isNil(contactBehaviorAvsB) || isNil(contactBehaviorBvsA)) {
        return false;
    }
    return contactBehaviorAvsB.doesCollide(entityA, entityB) && contactBehaviorBvsA.doesCollide(entityB, entityA);
};

const applyContactEffectsAgainstEntity = (entity1: Entity<Physical>, entity2: Entity<Physical>) => (entities: Entities): [Entities, GameEvents] => {
    const contactBehaviorAgainstEntity2 = entity1.contactBehaviors.get(entity2.type);
    if (!isNil(contactBehaviorAgainstEntity2)) {
        return contactBehaviorAgainstEntity2.onCollision.reduce(
            ([entities, events]: [Entities, GameEvents], onCollision: OnCollision): [Entities, GameEvents] => {
                let [newEntities, newEvents] = onCollision(entity1, entity2, entities);
                return [newEntities, concat(events, newEvents)];
            },
            [entities, []]
        );
    }
    return [entities, []];
};

export const block: OnCollision = (entityA, entityB, entities) => (
    [updateEntity<Entity<Physical>>(entityA.id!, evolve({body: setZeroVelocity}), entities), []]
);

export const bounce = (entityA: Entity<Physical>, entityB: Entity<Physical>, entities: Entities): [Entities, GameEvents] => {
    entityA = isCircleShaped(entityA.body) ?
        (
            isCircleShaped(entityB.body) ? ({...entityA, body: circleBounceOfCircle(entityA.body, entityB.body)}) :
            entityA
        ) : entityA;
    return [setEntity(entityA, entities), []];
};

export const dampenEntitiesVelocity = (delta: Seconds, entities: Entities) => mapEntities<Entity<Physical>>(evolve({
    body: applyDampening(delta),
}))(entities);
