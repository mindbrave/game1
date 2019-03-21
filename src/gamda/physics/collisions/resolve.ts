
import { div, mul, sub, add, Scalar } from "uom-ts";

import { normalizeVector, subtractVectors, dotProduct, scaleVector } from "../../vectors";
import { Body } from "../body";
import { Circle } from "../shape";

export const circleBounceOfCircle = (body1: Body<Circle>, body2: Body<Circle>): Body<Circle> => {
    const normalizedVectorBetween = normalizeVector(subtractVectors(body2.position, body1.position));
    const a1 = dotProduct(body1.velocity, normalizedVectorBetween);
    const a2 = dotProduct(body2.velocity, normalizedVectorBetween);

    const optimizedP = div(mul(2.0 as Scalar, sub(a1, a2)), add(body1.mass, body2.mass));
    const newVelocity = subtractVectors(body1.velocity, scaleVector(mul(optimizedP, body2.mass), normalizedVectorBetween));
    return {
        ...body1,
        velocity: newVelocity,
    };
};
