import { evolve } from "ramda";
import { Scalar } from "uom-ts";

import { Vec } from "./gamda/vectors";
import { orderToGoIntoDirection, orderToNotMove, updateBodyMovingBehavior, WithBehavior } from "./gamda/movingBehavior";
import { Seconds } from "./gamda/physics/units";
import { GameEvents } from "./gamda/game";
import { updateEntity, mapEntities, Entity, Entities } from "./gamda/entities";
import { Soccer } from "./soccer";

export const orderCharacterToMoveInDirection = (direction: Vec<Scalar>) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity<Entity<WithBehavior>>(
        game.selectedCharacterId,
        evolve({movementBehavior: orderToGoIntoDirection(direction)}),
        game.entities
    ),
}, []];

export const orderCharacterToStop = (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity<Entity<WithBehavior>>(game.selectedCharacterId, evolve({movementBehavior: orderToNotMove}), game.entities),
}, []];

export const updateMovingBehavior = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => ([
    {...game, entities: updateEntitiesMovingBehavior(delta, game.entities)},
    []
]);

const updateEntitiesMovingBehavior = (delta: Seconds, entities: Entities) => mapEntities((entity: Entity<WithBehavior>) => ({
    ...entity,
    body: updateBodyMovingBehavior(delta, entity.movementBehavior, entity.body)
}))(entities);
