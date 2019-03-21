
import { Map } from "immutable";
import { assoc, defaultTo, pipe, head, isNil, curryN } from "ramda";

import { GameEvent } from "./game";
import { Maybe } from "./maybe";

export type EntityId = number;
export type EntityKind = string;

export type Entity<T = any> = {
    id: Maybe<EntityId>,
    type: string,
} & T;

export interface Entities {
    map: Map<EntityId, Entity>;
    lastEntityId: EntityId;
}

export const mergeEntitiesWithPropMap = (prop: string, entities: Entities, propMap: Map<EntityId, any>): Entities => ({
    ...entities,
    map: propMap.toArray().reduce(
        (entitiesMap, [entityId, propVal]) => entitiesMap.update(entityId, assoc(prop, propVal)),
        entities.map
    ),
});

export const propMapFromEntities = (prop: string, entities: Entities): Map<EntityId, any> => (
    Map(entities.map.toArray().map(([id, entity]: [EntityId, any]) => [id, entity[prop]] as [EntityId, any]))
);

export const storeEntity = <T extends Entity>(entity: T) => (entities: Entities): [Entities, T] => ( isNil(entity.id) ? [
    {
        ...entities,
        lastEntityId: nextEntityId(entities.lastEntityId),
        map: entities.map.set(nextEntityId(entities.lastEntityId), {...entity, id: nextEntityId(entities.lastEntityId)}),
    }, {
        ...entity,
        id: nextEntityId(entities.lastEntityId)
    }
] : [
    {
        ...entities,
        map: entities.map.set(entity.id, entity),
    }, entity
]);

export const storeEntityH = <T extends Entity>(entity: T) => pipe<Entities, [Entities, T], Entities>(storeEntity(entity), head);

export const ENTITY_ADDED = "EntityAdded";

export interface EntityAdded extends GameEvent {
    type: "EntityAdded";
    entityId: EntityId;
}

export const entitiesList = (entities: Entities): Entity<unknown>[] => entities.map.valueSeq().toArray();
export const getEntity = (entityId: EntityId, entities: Entities): Maybe<Entity<unknown>> => defaultTo(null, entities.map.get(entityId));
export const setEntity = <T extends Entity>(entity: T, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.set(entity.id!, entity)
});
export const setManyEntities = (entitiesList: Entity<unknown>[], entities: Entities): Entities => (
    entitiesList.reduce((entities, entity) => setEntity(entity, entities), entities)
);
export const updateEntity = <T extends Entity<unknown>>(entityId: EntityId, updater: (entity: T) => T, entities: Entities): Entities => ({
    ...entities,
    map: entities.map.update(entityId, updater)
});

export const mapEntities = <T extends Entity<unknown>>(mapFunction: (entity: T) => T) => (entities: Entities): Entities => ({
    ...entities,
    map: entities.map.map(mapFunction),
});

const nextEntityId = (entityId: EntityId): EntityId => entityId + 1;
