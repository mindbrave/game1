
import { Map } from "immutable";

import { Entities, EntityId, Entity } from "./gamda/entities";
import { createView, View } from "./view";

export interface Soccer {
    selectedCharacterId: EntityId;
    entities: Entities;
    view: View;
}

export const initialGameState: Soccer = {
    selectedCharacterId: 1,
    entities: {
        map: Map<EntityId, Entity>(),
        lastEntityId: 0,
    },
    view: createView(),
};
