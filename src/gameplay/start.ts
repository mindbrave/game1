
import { createCharacter } from "./character";
import { Meters } from "../gamda/physics";
import { Soccer } from "./soccer";
import { GameEvents } from "../gamda/game";
import { addEntity } from "../gamda/entities";
import { EntityAdded } from "../main";

export const startGame = (game: Soccer): [Soccer, GameEvents] => {
    let entities, entity;
    let events: EntityAdded[] = [];
    [entities, entity] = addEntity(createCharacter({
        x: 0 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }), game.entities);
    events = events.concat([{
        type: "EntityAdded",
        entityId: entity.id,
    }]);
    [entities, entity] = addEntity(createCharacter({
        x: 2 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }), entities);
    events = events.concat([{
        type: "EntityAdded",
        entityId: entity.id,
    }]);
    [entities, entity] = addEntity(createCharacter({
        x: 4 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }), entities);
    events = events.concat([{
        type: "EntityAdded",
        entityId: entity.id,
    }]);
    [entities, entity] = addEntity(createCharacter({
        x: 6 as Meters,
        y: 1.0 as Meters,
        z: 0 as Meters,
    }), entities);
    events = events.concat([{
        type: "EntityAdded",
        entityId: entity.id,
    }]);
    console.log(entities);
    return [
        {
            ...game,
            entities,
        },
        events
    ];
};
