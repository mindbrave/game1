
import { isNil } from "ramda";
import { add, Scalar } from "uom-ts";

import { Vec, normalizeVector, subtractVectors, addVectors, scaleVector } from "./gamda/vectors";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms, ShapeType, Circle, Body } from "./gamda/physics";
import { WithBehavior, Physical, addEntity, getEntity } from "./gamda/entities";
import { Soccer } from "./soccer";
import { GameEvents } from "./gamda/game";
import { getPointerCurrent3dPosition } from "./view";

export type Projectile = Physical & WithBehavior;

export const shootBallWithSelectedCharacter = (game: Soccer): [Soccer, GameEvents] => {
    const targetPosition = getPointerCurrent3dPosition(game.view);
    if (isNil(targetPosition)) {
        return [game, []];
    }
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
};

const createProjectile = (position: Vec<Meters>, direction: Vec<Scalar>): Projectile => ({
    body: {
        position,
        velocity: scaleVector(15.0 as MetersPerSecond, direction),
        friction: 5.0 as MetersPerSquaredSecond,
        mass: 0.1 as Kilograms,
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
