import { pipe } from "remeda";
import { curry } from "ramda";
import { Map } from "immutable";

import { Entities, EntityId, Entity, Traits } from "./gamda/entities";
import { createView, View } from "./view";
import { updateMovingBehavior } from "./movement";
import { updatePhysics } from "./physics";
import { GameEvents } from "./gamda/game";
import { Seconds } from "./gamda/physics";

export interface Soccer {
    selectedCharacterId: EntityId;
    entities: Entities;
    view: View;
}

export const initialGameState: Soccer = {
    selectedCharacterId: 1,
    entities: {
        map: Map<EntityId, Entity<Traits>>(),
        lastEntityId: 0,
    },
    view: createView(),
};

export const updateGame = curry((delta: Seconds, game: Soccer): [Soccer, GameEvents] => [
    pipe(game, updateMovingBehavior(delta), updatePhysics(delta)),
    []
]);
