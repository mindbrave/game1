
import { Map } from "immutable";
import { assoc, curry } from "ramda";

export type EntityId = number;

export type Entity<T> = {id?: EntityId} & T;

export type Entities<T> = Map<EntityId, Entity<T>>;

export const mergeEntitiesWithPropMap = curry(<T>(prop: string, entities: Entities<T>, propMap: Map<EntityId, any>): Entities<T> => (
    propMap.toArray().reduce((entities, [entityId, propVal]) => entities.update(entityId, assoc(prop, propVal)), entities)
));
