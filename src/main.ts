
import { merge, Observable, of } from "rxjs";
import { complement, unary } from "ramda";
import { map, tap, filter, mapTo } from "rxjs/operators";
import { Scalar } from "uom-ts";

import { ticks, TicksPerSecond } from "./gamda/ticks";
import { Vec, normalizeVector, isZeroVector } from "./gamda/vectors";
import { addEntityView, updateEntitiesMeshPositions } from "./view";
import { wsad, WSADDirection, onKeyDown } from "./gamda/input";
import { game, gameEvents, GameCommand, GameEvents, GameEvent, isEventOfType } from "./gamda/game";
import { initialGameState, Soccer, updateGame } from "./soccer";
import { orderCharacterToStop, orderCharacterToMoveInDirection } from "./movement";
import { startGame } from "./start";
import { shootBallWithSelectedCharacter } from "./shoot";
import { getEntity, EntityAdded, ENTITY_ADDED } from "./gamda/entities";

const ticksPerSecond = 60.0 as TicksPerSecond;
const everyTick$ = ticks(ticksPerSecond);

const wsadDirectionToVec = (wsadDirection: WSADDirection): Vec<Scalar> => normalizeVector({
    x: wsadDirection.x as Scalar,
    y: 0 as Scalar,
    z: wsadDirection.y as Scalar,
});

const handleEntityAdded = (event: EntityAdded) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    view: addEntityView(getEntity(event.entityId, game.entities)!, game.view)
}, []];

const directionToMove$ = wsad().pipe(map(wsadDirectionToVec));

const gameEvents$ = gameEvents();

const gameCommands$: Observable<GameCommand<Soccer>> = merge(
    of(startGame),
    everyTick$.pipe(map(unary(updateGame))),
    directionToMove$.pipe(filter(isZeroVector)).pipe(mapTo(orderCharacterToStop)),
    directionToMove$.pipe(filter(complement(isZeroVector))).pipe(map(unary(orderCharacterToMoveInDirection))),
    onKeyDown("e").pipe(mapTo(shootBallWithSelectedCharacter)),
    gameEvents$.pipe(filter(isEventOfType<GameEvent, EntityAdded>(ENTITY_ADDED)), map(handleEntityAdded)),
);

const whenGameUpdates$ = game(gameCommands$, gameEvents$, initialGameState);
whenGameUpdates$.subscribe(updateEntitiesMeshPositions);
 