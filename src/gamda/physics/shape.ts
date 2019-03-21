import { Vec } from "../vectors";
import { Meters } from "./units";
import { Body } from "./body";

export enum ShapeType {
    Segment,
    Circle,
}

export type Segment = {
    type: ShapeType.Segment,
    pointA: Vec<Meters>,
    pointB: Vec<Meters>,
}

export type Circle = {
    type: ShapeType.Circle,
    radius: Meters,
}

export type Shape = Circle | Segment;

export const isCircleShaped = (body: Body): body is Body<Circle> => ShapeType.Circle === body.shape.type;
