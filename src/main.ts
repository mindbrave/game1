
import { merge, Observable } from "rxjs";
import { complement, unary } from "ramda";
import { map, scan, tap, filter, mapTo } from "rxjs/operators";
import { Scalar } from "uom-ts";

import { startGame, Game, orderCharacterToMoveInDirection, updateGame, orderCharacterToStop } from "./game";
import { ticks, TicksPerSecond } from "./ticks";
import { Vec, normalizeVector, isZeroVector } from "./vectors";
import { createView } from "./view";
import { wsad, WSADDirection } from "./input";

type GameCommand = (game: Game) => Game;

const game = startGame();

const ticksPerSecond = 64.0 as TicksPerSecond;
const everyTick$ = ticks(ticksPerSecond);

const wsadDirectionToVec = (wsadDirection: WSADDirection): Vec<Scalar> => normalizeVector({
    x: wsadDirection.x as Scalar,
    y: 0 as Scalar,
    z: wsadDirection.y as Scalar,
});

const directionToMove$ = wsad().pipe(map(wsadDirectionToVec));

const gameCommands$: Observable<GameCommand> = merge(
    everyTick$.pipe(map(delta => updateGame(delta))),
    directionToMove$.pipe(filter(isZeroVector)).pipe(mapTo(orderCharacterToStop)),
    directionToMove$.pipe(filter(complement(isZeroVector))).pipe(map<Vec<Scalar>, GameCommand>(unary(orderCharacterToMoveInDirection))),
);

const whenGameUpdates$ = gameCommands$.pipe(scan((game: Game, command: GameCommand): Game => command(game), game));

const { updateView } = createView(game);

whenGameUpdates$.subscribe(updateView);
 