import { curry, evolve } from "ramda";
import { pipe } from "remeda";
import { Map } from "immutable";

import { Seconds, applyFriction, Body } from "../gamda/physics";
import { Entities, mergeEntitiesWithPropMap, mapEntities } from "../gamda/entities";
import { moveWithCollisions, BodyId } from "../gamda/collisions";
import { Soccer } from "./soccer";

export const updatePhysics = curry((delta: Seconds, game: Soccer): Soccer => ({
    ...game,
    entities: pipe(
        mapEntities(evolve({
            body: applyFriction(delta),
        }), game.entities),
        moveEntitiesWithCollisions(delta)
    )
}));

const moveEntitiesWithCollisions = curry((duration: Seconds, entities: Entities): Entities => (
    pipe(
        entities,
        bodiesMap,
        moveWithCollisions(duration),
        mergeEntitiesWithPropMap('body', entities)
    )
));

const bodiesMap = (entities: Entities): Map<BodyId, Body> => (
    Map(entities.map.toArray().map(([bodyId, entity]) => [bodyId, entity.body] as [BodyId, Body]))
);
