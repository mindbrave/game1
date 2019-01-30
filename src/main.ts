
import { merge, Observable, of } from "rxjs";
import { complement, unary, isNil } from "ramda";
import { pipe } from "remeda";
import { map, tap, filter, mapTo } from "rxjs/operators";
import { Scalar } from "uom-ts";

import { ticks, TicksPerSecond } from "./gamda/ticks";
import { Vec, normalizeVector, isZeroVector } from "./gamda/vectors";
import { createView } from "./view";
import { wsad, WSADDirection, keyDown$, isKey, onKeyDown } from "./gamda/input";
import { game, gameEvents, GameCommand, GameEvents, GameEvent } from "./gamda/game";
import { initialGameState, Soccer } from "./gameplay/soccer";
import { updateMovingBehavior, orderCharacterToStop, orderCharacterToMoveInDirection } from "./gameplay/movement";
import { updatePhysics } from "./gameplay/physics";
import { startGame } from "./gameplay/start";
import { shootBallWithSelectedCharacter } from "./gameplay/shoot";
import { EntityId } from "./gamda/entities";
import { Meters } from "./gamda/physics";

const ticksPerSecond = 60.0 as TicksPerSecond;
const everyTick$ = ticks(ticksPerSecond);

const wsadDirectionToVec = (wsadDirection: WSADDirection): Vec<Scalar> => normalizeVector({
    x: wsadDirection.x as Scalar,
    y: 0 as Scalar,
    z: wsadDirection.y as Scalar,
});

export interface EntityAdded extends GameEvent {
    type: "EntityAdded";
    entityId: EntityId;
}

const directionToMove$ = wsad().pipe(map(wsadDirectionToVec));

const { updateView, getPointerCurrent3dPosition, addEntityView } = createView();

const gameEvents$ = gameEvents();

const pointerPosition3dOnKeyDown = (key: string): Observable<Vec<Meters>> => (
    onKeyDown(key)
    .pipe(map(getPointerCurrent3dPosition))
    .pipe(filter(complement(isNil)))
);

const gameCommands$: Observable<GameCommand<Soccer>> = merge(
    of(startGame),
    everyTick$.pipe(map(delta => (game: Soccer) => [pipe(game, updateMovingBehavior(delta), updatePhysics(delta)), []])),
    directionToMove$.pipe(filter(isZeroVector)).pipe(mapTo(orderCharacterToStop)),
    directionToMove$.pipe(filter(complement(isZeroVector))).pipe(map<Vec<Scalar>, GameCommand<Soccer>>(unary(orderCharacterToMoveInDirection))),
    pointerPosition3dOnKeyDown("e").pipe(map(unary(shootBallWithSelectedCharacter))),
    gameEvents$.pipe(filter((event): event is EntityAdded => event.type === 'EntityAdded')).pipe(map((event: EntityAdded) => (game: Soccer): [Soccer, GameEvents] => {
        addEntityView(event.entityId, game);
        return [game, []];
    })),
);

const whenGameUpdates$ = game(gameCommands$, gameEvents$, initialGameState);

whenGameUpdates$.subscribe(updateView);
 