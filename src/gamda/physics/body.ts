
import { Shape, ShapeType, Sphere, Triangle } from "./shape";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./units";
import { Vec } from "../vectors";

export type BodyPart<SHAPE extends Shape = Shape> = {
    shape: SHAPE,
    relativePosition: Vec<Meters>,
};

export type BodyPartId = number;

export interface Body {
    position: Vec<Meters>;
    velocity: Vec<MetersPerSecond>;
    dampening: MetersPerSquaredSecond;
    parts: BodyPart[];
    mass: Kilograms;
}

export const isSphere = (part: BodyPart): part is BodyPart<Sphere> => ShapeType.Sphere === part.shape.type;
export const isTriangle = (part: BodyPart): part is BodyPart<Triangle> => ShapeType.Triangle === part.shape.type;
