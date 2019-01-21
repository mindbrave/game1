
import { Scalar } from "uom-ts";
import { curry, evolve } from "ramda";
import { pipe as pipeR } from "remeda";
import { Map } from "immutable";

import {
    Body, Meters, MetersPerSquaredSecond, Seconds, MetersPerSecond, move, applyFriction, Kilograms, ShapeType
} from "./physics";
import { Vec } from "./vectors";
import { orderToNotMove, orderToGoIntoDirection, updateBodyMovingBehavior, MovementBehavior } from "./movingBehavior";
import { EntityId, Entities, Entity, mergeEntitiesWithPropMap } from "./entities";
import { moveWithCollisions, BodyId } from "./collisions";

export interface WithBehavior {
    movementBehavior: MovementBehavior;
    body: Body;
}

export interface Physical {
    body: Body;
}

export interface Game {
    selectedCharacterId: EntityId;
    entities: Entities<WithBehavior & Physical>;
}

const createCharacter = (id: EntityId, position: Vec<Meters>): Entity<Physical & WithBehavior> => ({
    id,
    body: {
        position,
        velocity: {
            x: 0.0 as MetersPerSecond,
            y: 0.0 as MetersPerSecond,
            z: 0.0 as MetersPerSecond,
        },
        friction: 5.0 as MetersPerSquaredSecond,
        shape: {
            type: ShapeType.Circle,
            radius: 1.0 as Meters,
        },
        mass: 1.0 as Kilograms,
    },
    movementBehavior: {
        acceleration: 30.0 as MetersPerSquaredSecond,
        maxVelocity: 15.0 as MetersPerSecond,
        direction: {x: 0 as Scalar, y: 0 as Scalar, z: 0 as Scalar},
    },
})

export const startGame = (): Game => {
    let entities = Map<EntityId, Entity<WithBehavior & Physical>>();
    entities = entities.set(1, createCharacter(1, {
        x: 0 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }));
    entities = entities.set(2, createCharacter(2, {
        x: 2 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }));
    entities = entities.set(3, createCharacter(3, {
        x: 4 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }));
    entities = entities.set(4, createCharacter(4, {
        x: 6 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }));
    entities = entities.set(5, createCharacter(5, {
        x: 8 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }));
    entities = entities.set(6, createCharacter(6, {
        x: 8 as Meters,
        y: 1.0 as Meters,
        z: 2 as Meters,
    }));
    return {
        selectedCharacterId: 1,
        entities
    };
};

export const updateGame = curry((delta: Seconds, game: Game): Game => pipeR(game, updateMovingBehavior(delta), updatePhysics(delta)));

const updatePhysics = curry((delta: Seconds, game: Game): Game => ({
    ...game,
    entities: pipeR(
        game.entities.map(evolve({
            body: applyFriction(delta),
        })),
        moveEntitiesWithCollisions(delta)
    )
}));

const moveEntitiesWithCollisions = curry(<T extends Physical>(duration: Seconds, entities: Entities<T>): Entities<T> => (
    pipeR(
        entities,
        bodiesMap,
        moveWithCollisions(duration),
        mergeEntitiesWithPropMap('body', entities)
    )
));

const bodiesMap = (entities: Entities<Physical>): Map<BodyId, Body> => (
    Map(entities.toArray().map(([bodyId, entity]) => [bodyId, entity.body] as [BodyId, Body]))
);

const updateMovingBehavior = curry((delta: Seconds, game: Game): Game => ({
    ...game,
    entities: game.entities.map(entity => ({...entity, body: updateBodyMovingBehavior(delta, entity.body, entity.movementBehavior)})),
}));

export const orderCharacterToMoveInDirection = curry((direction: Vec<Scalar>, game: Game): Game => ({
    ...game,
    entities: game.entities.update(game.selectedCharacterId, evolve({movementBehavior: orderToGoIntoDirection(direction)}))
}));

export const orderCharacterToStop = (game: Game): Game => ({
    ...game,
    entities: game.entities.update(game.selectedCharacterId, evolve({movementBehavior: orderToNotMove})),
});
