
import { isNil } from "ramda";
import { add, Scalar } from "uom-ts";
import { Map } from "immutable";

import { Vec, normalizeVector, subtractVectors, addVectors, scaleVector } from "./gamda/vectors";
import { Soccer } from "./soccer";
import { GameEvents } from "./gamda/game";
import { getPointerCurrent3dPosition } from "./view";
import { Physical, alwaysCollide, bounce, doesntOverlap, block } from "./gamda/entitiesPhysics";
import { WithBehavior } from "./gamda/movingBehavior";
import { getEntity, storeEntity, Entity } from "./gamda/entities";
import { Meters, MetersPerSecond, MetersPerSquaredSecond, Kilograms } from "./gamda/physics/units";
import { ShapeType, Circle } from "./gamda/physics/shape";
import { Body } from "./gamda/physics/body";

export type Projectile = Entity<Physical & WithBehavior>;

const PROJECTILE_RADIUS = 0.5 as Meters;

export const shootBallWithSelectedCharacter = (game: Soccer): [Soccer, GameEvents] => {
    const targetPosition = getPointerCurrent3dPosition(game.view);
    if (isNil(targetPosition)) {
        return [game, []];
    }
    const selectedEntity = getEntity(game.selectedCharacterId, game.entities) as Entity<Physical>;
    const selectedEntityBody = selectedEntity.body as Body<Circle>;
    const shootDirection = normalizeVector(subtractVectors({...targetPosition, y: selectedEntityBody.position.y}, selectedEntityBody.position));
    const distanceBetweenBallAndEntity = 0.1 as Meters;
    const projectileStartPosition = addVectors(
        selectedEntityBody.position,
        scaleVector(add(PROJECTILE_RADIUS, add(distanceBetweenBallAndEntity, selectedEntityBody.shape.radius)), shootDirection)
    );
    const [entities, projectile] = storeEntity(createProjectile(projectileStartPosition, shootDirection))(game.entities);
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
    id: null,
    type: 'projectile',
    body: {
        position,
        velocity: scaleVector(15.0 as MetersPerSecond, direction),
        dampening: 5.0 as MetersPerSquaredSecond,
        mass: 999999 as Kilograms,
        shape: {
            type: ShapeType.Circle,
            radius: PROJECTILE_RADIUS,
        }
    },
    movementBehavior: {
        acceleration: 0.0 as MetersPerSquaredSecond,
        maxVelocity: 15.0 as MetersPerSecond,
        direction: direction,
    },
    contactBehaviors: Map({
        'character': {
            doesCollide: alwaysCollide,
            onCollision: [bounce],
            doesOverlap: doesntOverlap,
            onOverlap: []
        }
    })
});
