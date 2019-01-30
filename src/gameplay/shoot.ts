
import { curry } from "ramda";
import { add, Scalar } from "uom-ts";

import { Vec, normalizeVector, subtractVectors, addVectors, scaleVector } from "../gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms, ShapeType, Circle, Body } from "../gamda/physics";
import { WithBehavior, Physical, addEntity, getEntity } from "../gamda/entities";
import { Soccer } from "./soccer";
import { GameEvents } from "../gamda/game";

export type Projectile = Physical & WithBehavior;

export const shootBallWithSelectedCharacter = curry((targetPosition: Vec<Meters>, game: Soccer): [Soccer, GameEvents] => {
    const selectedEntityBody = getEntity(game.selectedCharacterId, game.entities)!.body as Body<Circle>;
    const shootDirection = normalizeVector(subtractVectors({...targetPosition, y: selectedEntityBody.position.y}, selectedEntityBody.position));
    const ballRadius = 0.5 as Meters;
    const distanceBetweenBallAndEntity = 0.1 as Meters;
    const projectileStartPosition = addVectors(
        selectedEntityBody.position,
        scaleVector(add(ballRadius, add(distanceBetweenBallAndEntity, selectedEntityBody.shape.radius)), shootDirection)
    );
    const [entities, projectile] = addEntity(createProjectile(projectileStartPosition, shootDirection), game.entities);
    const entityAdded = {
        type: "EntityAdded",
        entityId: projectile.id,
    };
    return [
        {
            ...game,
            entities
        },
        [entityAdded]
    ];
});

const createProjectile = (position: Vec<Meters>, direction: Vec<Scalar>): Projectile => ({
    body: {
        position,
        velocity: scaleVector(15.0 as MetersPerSecond, direction),
        friction: 1.0 as MetersPerSquaredSecond,
        mass: 1.0 as Kilograms,
        shape: {
            type: ShapeType.Circle,
            radius: 0.5 as Meters,
        }
    },
    movementBehavior: {
        acceleration: 0.0 as MetersPerSquaredSecond,
        maxVelocity: 15.0 as MetersPerSecond,
        direction: direction,
    }
});
