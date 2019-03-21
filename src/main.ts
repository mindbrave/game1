
import { merge, Observable, of } from "rxjs";
import { map, tap, filter, mapTo } from "rxjs/operators";

import { ticks, TicksPerSecond } from "./gamda/ticks";
import { isZeroVector, isNotZeroVector } from "./gamda/vectors";
import { updateEntitiesMeshPositions, addEntityView } from "./view";
import { wsad, onKeyDown, wsadDirectionToVec } from "./gamda/input";
import { game, gameEvents, GameCommand, GameEvents, GameEvent, isEventOfType, pipeWithEvents } from "./gamda/game";
import { orderCharacterToStop, orderCharacterToMoveInDirection, updateMovingBehavior } from "./movement";
import { startGame } from "./start";
import { shootBallWithSelectedCharacter } from "./shoot";
import { EntityAdded, ENTITY_ADDED } from "./gamda/entities";
import { Seconds } from "./gamda/physics/units";
import { updatePhysics } from "./physics";
import { Soccer, initialGameState } from "./soccer";

const updateGame = (delta: Seconds) => (game: Soccer): [Soccer, GameEvents] => pipeWithEvents(
    game,
    updateMovingBehavior(delta),
    updatePhysics(delta)
);

const ticksPerSecond = 60.0 as TicksPerSecond;
const everyTick$ = ticks(ticksPerSecond);
const directionToMove$ = wsad().pipe(map(wsadDirectionToVec));

const gameEvents$ = gameEvents();
const whenEntityIsAdded$ = gameEvents$.pipe(filter(isEventOfType<GameEvent, EntityAdded>(ENTITY_ADDED)));

const gameCommands$: Observable<GameCommand<Soccer>> = merge(
    of(startGame),
    everyTick$.pipe(map(updateGame)),
    directionToMove$.pipe(filter(isZeroVector)).pipe(mapTo(orderCharacterToStop)),
    directionToMove$.pipe(filter(isNotZeroVector)).pipe(map(orderCharacterToMoveInDirection)),
    onKeyDown("e").pipe(mapTo(shootBallWithSelectedCharacter)),
    whenEntityIsAdded$.pipe(map(addEntityView)),
);

const onGameUpdate$ = game(gameCommands$, gameEvents$, initialGameState);
onGameUpdate$.subscribe(updateEntitiesMeshPositions);
 