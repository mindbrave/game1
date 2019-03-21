
import { pipe as pipeInline } from "remeda";

import { createCharacter } from "./character";
import { Meters } from "./gamda/physics/units";
import { Soccer } from "./soccer";
import { GameEvents } from "./gamda/game";
import { storeEntityH } from "./gamda/entities";
import { runRenderLoop } from "./view";

export const startGame = (game: Soccer): [Soccer, GameEvents] => {
    const entities = pipeInline(
        game.entities,
        storeEntityH(createCharacter({
            x: 0 as Meters,
            y: 1.0 as Meters,
            z: 0 as Meters,
        })),
        storeEntityH(createCharacter({
            x: 2 as Meters,
            y: 1.0 as Meters,
            z: 0 as Meters,
        })),
        storeEntityH(createCharacter({
            x: 4 as Meters,
            y: 1.0 as Meters,
            z: 0 as Meters,
        })),
        storeEntityH(createCharacter({
            x: 6 as Meters,
            y: 1.0 as Meters,
            z: 0 as Meters,
        })),
        storeEntityH(createCharacter({
            x: 8 as Meters,
            y: 1.0 as Meters,
            z: 0 as Meters,
        }))
    );
    const events = [{
        type: "EntityAdded",
        entityId: 1,
    }, {
        type: "EntityAdded",
        entityId: 2,
    }, {
        type: "EntityAdded",
        entityId: 3,
    }, {
        type: "EntityAdded",
        entityId: 4,
    }, {
        type: "EntityAdded",
        entityId: 5,
    }];
    return [
        {
            ...game,
            view: runRenderLoop(game.view),
            entities,
        },
        events
    ];
};
