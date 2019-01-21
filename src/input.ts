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

const keyDown$ = fromEvent<KeyboardEvent>(window, "keydown");
const keyUp$ = fromEvent<KeyboardEvent>(window, "keyup");

const isKey = (key: string) => (ev: KeyboardEvent): boolean => ev.key === key;

export const wsad = (): Observable<WSADDirection> => merge(
        keyDown$.pipe(filter(isKey("w"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({w: true})),
        keyDown$.pipe(filter(isKey("s"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({s: true})),
        keyDown$.pipe(filter(isKey("a"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({a: true})),
        keyDown$.pipe(filter(isKey("d"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({d: true})),
        keyUp$.pipe(filter(isKey("w"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({w: false})),
        keyUp$.pipe(filter(isKey("s"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({s: false})),
        keyUp$.pipe(filter(isKey("a"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({a: false})),
        keyUp$.pipe(filter(isKey("d"))).pipe(mapTo<KeyboardEvent, WSADStateChange>({d: false}))
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
