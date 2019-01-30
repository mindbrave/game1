import { Observable, Subject } from "rxjs";
import { scan } from "rxjs/operators";

export interface GameEvent {
    type: string;
} 
export type GameEvents = GameEvent[];
export type GameCommand<T> = (game: T) => [T, GameEvents];

export const game = <T>(commands$: Observable<GameCommand<T>>, events$: Subject<GameEvent>, initialState: T): Observable<T> =>  {
    return commands$.pipe(scan((game: T, command: GameCommand<T>): T => {
        let [updatedGame, events] = command(game);
        events.forEach((event: GameEvent) => setTimeout(() => events$.next(event), 0));
        return updatedGame;
    }, initialState));
};

export const gameEvents = () => new Subject<GameEvent>();
