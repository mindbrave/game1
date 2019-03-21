import { Seconds } from "./gamda/physics/units";
import { Soccer } from "./soccer";
import { GameEvents, pipeWithEvents } from "./gamda/game";
import { dampenEntitiesVelocity, moveEntitiesWithCollisions } from "./gamda/entitiesPhysics";

export const updatePhysics = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => {
    const [entities, events] = pipeWithEvents(
        dampenEntitiesVelocity(delta, game.entities),
        moveEntitiesWithCollisions(delta, [])
    );
    return [{...game, entities}, events];
};
