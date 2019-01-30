import { Entities, EntityId, Entity, Traits } from "../gamda/entities";
import { Map } from "immutable";

export interface Soccer {
    currentEntityId: EntityId,
    selectedCharacterId: EntityId;
    entities: Entities;
}

export const initialGameState: Soccer = {
    currentEntityId: 0,
    selectedCharacterId: 1,
    entities: {
        map: Map<EntityId, Entity<Traits>>(),
        lastEntityId: 0,
    },
};
