
import  { Map } from "immutable";
import { curry, isNil } from "ramda";
import { 
    Engine, Scene, Vector3, MeshBuilder, DirectionalLight, Mesh, ArcRotateCamera,
    ShadowGenerator,
    Camera
 } from "babylonjs";
import "babylonjs-materials";

import { Vec, vecToArray, Radians } from "./gamda/vectors";
import { Entity, EntityId, getEntity, EntityAdded } from "./gamda/entities";
import { Soccer } from "./soccer";
import { Meters } from "./gamda/physics/units";
import { Body } from "./gamda/physics/body";
import { Circle } from "./gamda/physics/shape";
import { Physical } from "./gamda/entitiesPhysics";
import { GameEvents } from "./gamda/game";

export interface View {
    engine: Engine;
    scene: Scene;
    entitiesMesh: Map<EntityId, Mesh>;
    shadowGenerator: ShadowGenerator;
}

export const createView = (): View => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const engine = new Engine(canvas, false);

    const scene = new Scene(engine);

    const ground = Mesh.CreateGround("ground1", 100 as Meters, 100 as Meters, 10, scene);
    ground.receiveShadows = true;

    const light = new DirectionalLight("light1", new Vector3(100, -200, 20), scene);
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;

    const camera = createCamera(scene);
    camera.attachControl(canvas, true);

    const entitiesMesh = Map<EntityId, Mesh>();

    return {
        engine,
        scene,
        entitiesMesh,
        shadowGenerator
    };
};

export const createCamera = (scene: Scene): Camera => {
    const camera = new ArcRotateCamera("Camera", 0 as Radians, Math.PI / 4 as Radians, 100.0 as Meters, Vector3.Zero(), scene);
    camera.angularSensibilityX = 5000.0;
    camera.angularSensibilityY = 5000.0;
    camera.lowerAlphaLimit = -Math.PI/2 as Radians;
    camera.upperAlphaLimit = -Math.PI/2 as Radians;
    camera.lowerBetaLimit = 0 as Radians;
    camera.upperBetaLimit = Math.PI / 4 as Radians;
    camera.lowerRadiusLimit = 100.0 as Meters;
    camera.upperRadiusLimit = 180.0 as Meters;
    return camera;
};

export const updateEntitiesMeshPositions = (game: Soccer): Soccer => {
    game.view.entitiesMesh.forEach(
        (mesh, entityId) => {
            let entity = getEntity(entityId, game.entities) as Entity<Physical>;
            mesh.setAbsolutePosition(vecToBabylonVec(entity.body.position));
        }
    );
    return game;
};

export const runRenderLoop = (view: View): View => {
    view.engine.runRenderLoop(() => {
        view.scene.render();
    });
    return view;
};

export const createCharacterView = curry((scene: Scene, character: Entity<Physical>): Mesh => {
    const body = character.body as Body<Circle>;
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: body.shape.radius * 2, segments: 12 }, scene);
    sphere.setAbsolutePosition(vecToBabylonVec(body.position));
    return sphere;
});

export const addEntityMeshToView = (entity: Entity<Physical & unknown>, view: View): View => {
    const mesh = createCharacterView(view.scene, entity);
    view.shadowGenerator.addShadowCaster(mesh);
    return {
        ...view,
        entitiesMesh: view.entitiesMesh.set(entity.id!, mesh),
    };
};

export const getPointerCurrent3dPosition = (view: View): Vec<Meters> | null => {
    const pickInfo = view.scene.pick(view.scene.pointerX, view.scene.pointerY);
    if (isNil(pickInfo) || isNil(pickInfo.pickedPoint)) {
        return null;
    }
    return babylonVectorToVec(pickInfo.pickedPoint);
};

const vecToBabylonVec = (vec: Vec): Vector3 => Vector3.FromArray(vecToArray(vec));
const babylonVectorToVec = (vec: Vector3): Vec<Meters> => ({x: vec.x as Meters, y: vec.y as Meters, z: vec.z as Meters});

export const addEntityView = (event: EntityAdded) => (game: Soccer): [Soccer, GameEvents] => [{
    ...game,
    view: addEntityMeshToView(getEntity(event.entityId, game.entities) as Entity<Physical>, game.view)
}, []];
