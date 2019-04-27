
import { head, pipe, prop } from "ramda";

import { createCharacter, isCharacter } from "./character";
import { Meters } from "./gamda/physics/units";
import { Soccer, selectCharacter, addEntities } from "./soccer";
import { GameEvents, pipeWithEvents } from "./gamda/game";
import { filterEntities, Entities, Entity } from "./gamda/entities";
import { runRenderLoop } from "./view";
import { createParallelogramWall } from "./wall";
import { vec, Vec } from "./gamda/vectors";

export const startGame = (game: Soccer): [Soccer, GameEvents] => {
    const character = createCharacter({
        x: 0 as Meters,
        y: 3.0 as Meters,
        z: 0 as Meters,
    });
    
    return pipeWithEvents(
        game,
        addEntities([
            character,
            ...createPlayField(),
        ]),
        renderGame,
        selectFirstCharacter
    );
};

export const renderGame = (game: Soccer): [Soccer, GameEvents] => [({...game, view: runRenderLoop(game.view)}), []];

const selectFirstCharacter = (game: Soccer): [Soccer, GameEvents] => selectCharacter(head(filterEntities(isCharacter, game.entities)), game);

const createPlayField = (): Entity[] => {
    const ground = createParallelogramWall(
        vec(-30, 0, -30) as Vec<Meters>,
        vec(-30, 0, 30) as Vec<Meters>,
        vec(30, 0, 30) as Vec<Meters>,
    );
    const roof = createParallelogramWall(
        vec(30, 30, 30) as Vec<Meters>,
        vec(-30, 30, 30) as Vec<Meters>,
        vec(-30, 30, -30) as Vec<Meters>,
    );
    const westWall = createParallelogramWall(
        vec(-30, 0, -30) as Vec<Meters>,
        vec(-30, 30, -30) as Vec<Meters>,
        vec(-30, 30, 30) as Vec<Meters>,
    );
    const northWall = [
        createParallelogramWall(
            vec(-30, 0, 30) as Vec<Meters>,
            vec(-30, 30, 30) as Vec<Meters>,
            vec(-8, 30, 30) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(8, 0, 30) as Vec<Meters>,
            vec(8, 30, 30) as Vec<Meters>,
            vec(30, 30, 30) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 4, 30) as Vec<Meters>,
            vec(-8, 30, 30) as Vec<Meters>,
            vec(8, 30, 30) as Vec<Meters>,
        ),   
    ];
    const northGoal = [
        createParallelogramWall(
            vec(-8, 0, 30) as Vec<Meters>,
            vec(-8, 0, 34) as Vec<Meters>,
            vec(8, 0, 34) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 4, 34) as Vec<Meters>,
            vec(-8, 4, 30) as Vec<Meters>,
            vec(8, 4, 30) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 0, 34) as Vec<Meters>,
            vec(-8, 4, 34) as Vec<Meters>,
            vec(8, 4, 34) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(-8, 0, 30) as Vec<Meters>,
            vec(-8, 4, 30) as Vec<Meters>,
            vec(-8, 4, 34) as Vec<Meters>,
        ),
        createParallelogramWall(
            vec(8, 0, 34) as Vec<Meters>,
            vec(8, 4, 34) as Vec<Meters>,
            vec(8, 4, 30) as Vec<Meters>,
        ),
    ]
    const eastWall = createParallelogramWall(
        vec(30, 0, 30) as Vec<Meters>,
        vec(30, 30, 30) as Vec<Meters>,
        vec(30, 30, -30) as Vec<Meters>,
    );
    const southWall = createParallelogramWall(
        vec(30, 0, -30) as Vec<Meters>,
        vec(30, 30, -30) as Vec<Meters>,
        vec(-30, 30, -30) as Vec<Meters>,
    );
    return [
        ground,
        roof,
        westWall,
        eastWall,
        ...northWall,
        ...northGoal,
        southWall,
    ];
};
