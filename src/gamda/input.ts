import { fromEvent, Observable, merge } from "rxjs";
import { filter, mapTo, scan, map, tap } from "rxjs/operators";

export interface WSADDirection {
    x: 1 | 0 | -1;
    y: 1 | 0 | -1;
}

interface WSADState {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
}

type WSADStateChange = {
    [key:string]: boolean;
};

export const keyDown$ = fromEvent<KeyboardEvent>(window, "keyup");
export const keyUp$ = fromEvent<KeyboardEvent>(window, "keyup");

export const onKeyDown = (key: string): Observable<KeyboardEvent> => keyDown$.pipe(filter(isKey(key)));
export const onKeyUp = (key: string): Observable<KeyboardEvent> => keyUp$.pipe(filter(isKey(key)));

export const isKey = (key: string) => (ev: KeyboardEvent): boolean => ev.key === key;

export const wsad = (): Observable<WSADDirection> => merge(
        onKeyDown("w").pipe(mapTo<KeyboardEvent, WSADStateChange>({w: true})),
        onKeyDown("s").pipe(mapTo<KeyboardEvent, WSADStateChange>({s: true})),
        onKeyDown("a").pipe(mapTo<KeyboardEvent, WSADStateChange>({a: true})),
        onKeyDown("d").pipe(mapTo<KeyboardEvent, WSADStateChange>({d: true})),
        onKeyUp("w").pipe(mapTo<KeyboardEvent, WSADStateChange>({w: false})),
        onKeyUp("s").pipe(mapTo<KeyboardEvent, WSADStateChange>({s: false})),
        onKeyUp("a").pipe(mapTo<KeyboardEvent, WSADStateChange>({a: false})),
        onKeyUp("d").pipe(mapTo<KeyboardEvent, WSADStateChange>({d: false}))
    )
    .pipe(scan((wsadState: WSADState, stateChange: WSADStateChange): WSADState => ({
        ...wsadState,
        ...stateChange,
    }), {w: false, s: false, a: false, d: false}))
    .pipe(map(wsadStateToWsadDirection));

const wsadStateToWsadDirection = (wsadState: WSADState): WSADDirection => ({
    x: (wsadState.a && wsadState.d) || (!wsadState.a && !wsadState.d) ? 0 : wsadState.a ? -1 : 1,
    y: (wsadState.w && wsadState.s) || (!wsadState.w && !wsadState.s) ? 0 : wsadState.s ? -1 : 1,
});

export const spaceDown = (): Observable<KeyboardEvent> => keyDown$.pipe(filter(isKey("Space")));
