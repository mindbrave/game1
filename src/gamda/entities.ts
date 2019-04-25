
import { Map, Set } from "immutable";
import { append, defaultTo, pipe, head, isNil } from "ramda";

import { GameEvent } from "./game";
import { Maybe } from "./maybe";

export type EntityId = number & {__brand: "EntityId"};
export type EntityKind = string;

export type Entity<T = any> = {
    id: Maybe<EntityId>,
    type: string,
    traits: string[],
} & T;

type ByTraitMap = {[trait:string]: Set<EntityId>};

export type Entities = {
    map: Map<EntityId, Entity>;
    byTrait: ByTraitMap,
    lastEntityId: EntityId;
};

export const storeEntity = <T extends Entity>(entity: T) => (entities: Entities): Entities => {
    if (isNil(entity.id)) {
        entities = nextEntityId(entities);
        entity = {...entity, id: entities.lastEntityId};
    }
    return {
        ...entities,
        map: entities.map.set(entity.id, entity),
        byTrait: storeEntityToTraitMap(entity, entities.byTrait)
    };
};
    

const storeEntityToTraitMap = (entity: Entity, byTrait: ByTraitMap): ByTraitMap => entity.traits.reduce((byTrait: ByTraitMap, trait: string) => ({
    ...byTrait,
    [trait]: byTrait[trait].add(entity.id)
}), byTrait);

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

export const filterEntities = (filterFn: (entity: Entity) => boolean, entities: Entities): Entity[] => (
    entities.map.filter(filterFn).valueSeq().toArray()
);

export const mapEntitiesWithTrait = <T extends Entity<unknown>>(trait: string, mapFunction: (entity: T) => T) => (entities: Entities): Entities => (
    entities.byTrait[trait].reduce((entities: Entities, entityId: EntityId) => updateEntity(entityId, mapFunction, entities), entities)
);

export const nextEntityId = (entities: Entities): Entities => ({
    ...entities,
    lastEntityId: (entities.lastEntityId + 1) as EntityId
});
