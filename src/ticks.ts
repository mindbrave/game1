
import { Unit, mul, div, DivideUnits } from "uom-ts";
import { interval, TimeInterval } from "rxjs";
import { map, timeInterval, pluck } from "rxjs/operators";

import { Seconds, Milliseconds } from "./physics";
import { Observable } from "rxjs";

type Ticks = Unit<{tick: 1}>
export type TicksPerSecond = DivideUnits<Ticks, Seconds>;

export const ticks = (ticksPerSecond: TicksPerSecond): Observable<Seconds> => (
    interval(secondsToMilliseconds(convertTicksRatioToPeriod(ticksPerSecond)))
        .pipe(timeInterval()).pipe(pluck<TimeInterval<number>, Milliseconds>('interval'))
        .pipe(map(millisecondsToSeconds))
);

const MILLISECONDS_TO_SECONDS_RATIO = 1000.0 as DivideUnits<Milliseconds, Seconds>;

const secondsToMilliseconds = (seconds: Seconds): Milliseconds => mul(seconds, MILLISECONDS_TO_SECONDS_RATIO);
const millisecondsToSeconds = (milliseconds: Milliseconds): Seconds => div(milliseconds, MILLISECONDS_TO_SECONDS_RATIO);

const convertTicksRatioToPeriod = (ticksRatio: TicksPerSecond): Seconds => div(1.0 as Ticks, ticksRatio);
