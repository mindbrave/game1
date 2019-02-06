import { curry, evolve, isNil } from "ramda";
import { pipe } from "remeda";
import { Map } from "immutable";

import { Seconds, applyFriction, Body, Circle } from "./gamda/physics";
import { Entities, mergeEntitiesWithPropMap, mapEntities, propMapFromEntities, setEntity, getEntity } from "./gamda/entities";
import { moveUntilFirstCollision, BodyId, circleBounceOfCircle } from "./gamda/collisions";
import { Soccer } from "./soccer";
import { sub } from "uom-ts";

export const updatePhysics = curry((delta: Seconds, game: Soccer): Soccer => ({
    ...game,
    entities: pipe(
        mapEntities(evolve({
            body: applyFriction(delta),
        }), game.entities),
        moveEntitiesWithCollisions(delta)
    )
}));

const moveEntitiesWithCollisions = curry((duration: Seconds, entities: Entities): Entities => {
    const bodiesMap = propMapFromEntities("body", entities);
    const [movedBodiesMap, collision] = moveUntilFirstCollision(duration, bodiesMap);
    let movedEntities = mergeEntitiesWithPropMap("body", entities, movedBodiesMap);
    if (isNil(collision)) {
        return movedEntities;
    }
    const [entity1id, entity2id] = collision.between;
    const entity1 = getEntity(entity1id, movedEntities);
    const entity2 = getEntity(entity2id, movedEntities);
    movedEntities = setEntity(
        {
            ...entity1!,
            body: circleBounceOfCircle(entity1!.body as Body<Circle>, entity2!.body as Body<Circle>),
        },
        movedEntities
    );
    movedEntities = setEntity(
        {
            ...entity2!,
            body: circleBounceOfCircle(entity2!.body as Body<Circle>, entity1!.body as Body<Circle>),
        },
        movedEntities
    );
    return moveEntitiesWithCollisions(sub(duration, collision.timeToImpact), movedEntities);
});
