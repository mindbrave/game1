
import { Map } from "immutable";
import { assoc, curry } from "ramda";

import { MovementBehavior } from "./movingBehavior";
import { Body } from "./physics";
import { GameEvent } from "./game";

export type EntityId = number;

export type Entity<T> = {id: EntityId} & T;

export interface Entities {
    map: Map<EntityId, Entity<Traits>>;
    lastEntityId: EntityId;
}

export interface Physical {
    body: Body;
}

export interface WithBehavior {
    body: Body;
    movementBehavior: MovementBehavior;
}

export type Traits = Physical & WithBehavior;

export const mergeEntitiesWithPropMap = curry((prop: string, entities: Entities, propMap: Map<EntityId, any>): Entities => ({
    ...entities,
    map: propMap.toArray().reduce(
        (entitiesMap, [entityId, propVal]) => entitiesMap.update(entityId, assoc(prop, propVal)),
        entities.map
    ),
}));

export const propMapFromEntities = curry(<T extends keyof Traits> (prop: T, entities: Entities): Map<EntityId, Traits[T]> => (
    Map(entities.map.toArray().map(([id, entity]) => [id, entity[prop]] as [EntityId, Traits[T]]))
));

export const addEntity = <T extends Traits>(entity: T, entities: Entities): [Entities, Entity<T>] => ([
    {
        ...entities,
        lastEntityId: nextEntityId(entities.lastEntityId),
        map: entities.map.set(nextEntityId(entities.lastEntityId), {
            ...entity,
            id: nextEntityId(entities.lastEntityId),
        })
    },
    {
        ...entity,
        id: nextEntityId(entities.lastEntityId),
    }
]);

export const ENTITY_ADDED = "EntityAdded";

export interface EntityAdded extends GameEvent {
    type: "EntityAdded";
    entityId: EntityId;
}

export const getEntity = (entityId: EntityId, entities: Entities): Entity<Traits> | undefined => entities.map.get(entityId);
export const setEntity = (entity: Entity<Traits>, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.set(entity.id, entity)
});
export const updateEntity = (entityId: EntityId, updater: (entity: Entity<Traits>) => Entity<Traits>, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.update(entityId, updater)
});

export const mapEntities = (mapFunction: (entity: Entity<Traits>) => Entity<Traits>, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.map(mapFunction),
});

const nextEntityId = (entityId: EntityId): EntityId => entityId + 1;
