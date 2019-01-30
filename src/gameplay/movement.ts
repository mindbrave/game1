import { curry, evolve } from "ramda";
import { Scalar } from "uom-ts";

import { Vec } from "../gamda/vectors";
import { orderToGoIntoDirection, orderToNotMove, updateBodyMovingBehavior } from "../gamda/movingBehavior";
import { Seconds } from "../gamda/physics";
import { Soccer } from "./soccer";
import { GameEvents } from "../gamda/game";
import { updateEntity, mapEntities } from "../gamda/entities";

export const orderCharacterToMoveInDirection = curry((direction: Vec<Scalar>, game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity(
        game.selectedCharacterId,
        evolve({movementBehavior: orderToGoIntoDirection(direction)}),
        game.entities
    ),
}, []]);

export const orderCharacterToStop = (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    entities: updateEntity(game.selectedCharacterId, evolve({movementBehavior: orderToNotMove}), game.entities),
}, []];

export const updateMovingBehavior = curry((delta: Seconds, game: Soccer): Soccer => ({
    ...game,
    entities: mapEntities(
        entity => ({...entity, body: updateBodyMovingBehavior(delta, entity.body, entity.movementBehavior)}),
        game.entities
    ),
}));
