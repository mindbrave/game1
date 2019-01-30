
import { 
    Engine, Scene, Vector3, MeshBuilder, DirectionalLight, Mesh, ArcRotateCamera,
    ShadowGenerator
 } from "babylonjs";
import  { Map } from "immutable";
import { curry, isNil } from "ramda";
import "babylonjs-materials";

import { Meters, Body, Circle } from "./gamda/physics";
import { Vec, vecToArray, Radians } from "./gamda/vectors";
import { Entity, EntityId, Physical, getEntity } from "./gamda/entities";
import { Soccer } from "./gameplay/soccer";

export const createView = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const engine = new Engine(canvas, false);

    const scene = new Scene(engine);

    const ground = Mesh.CreateGround("ground1", 30 as Meters, 30 as Meters, 10, scene);
    ground.receiveShadows = true;

    const light = new DirectionalLight("light1", new Vector3(100, -200, 20), scene);
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;

    const camera = new ArcRotateCamera("Camera", 0 as Radians, Math.PI / 4 as Radians, 100.0 as Meters, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.angularSensibilityX = 5000.0;
    camera.angularSensibilityY = 5000.0;
    camera.lowerAlphaLimit = -Math.PI/2 as Radians;
    camera.upperAlphaLimit = -Math.PI/2 as Radians;
    camera.lowerBetaLimit = 0 as Radians;
    camera.upperBetaLimit = Math.PI / 4 as Radians;
    camera.lowerRadiusLimit = 100.0 as Meters;
    camera.upperRadiusLimit = 180.0 as Meters;

    let entitiesViews = Map<EntityId, Mesh>();

    engine.runRenderLoop(() => {
        scene.render();
    });

    const addEntityView = (entityId: EntityId, game: Soccer): void => {
        const entity = getEntity(entityId,game.entities)!;
        const mesh = createCharacterView(scene, entity);
        shadowGenerator.addShadowCaster(mesh);
        entitiesViews = entitiesViews.set(entityId, mesh);
    };

    const getPointerCurrent3dPosition = (): Vec<Meters> | null => {
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
        if (isNil(pickInfo) || isNil(pickInfo.pickedPoint)) {
            return null;
        }
        return babylonVectorToVec(pickInfo.pickedPoint);
    }

    return {
        addEntityView,
        getPointerCurrent3dPosition,
        updateView: (game: Soccer): void => {
            entitiesViews.forEach((view, entityId) => view.setAbsolutePosition(vecToBabylonVec(getEntity(entityId, game.entities)!.body.position)));
        },
    };
};

const createCharacterView = curry((scene: Scene, character: Entity<Physical>): Mesh => {
    const body = character.body as Body<Circle>;
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: body.shape.radius * 2, segments: 12 }, scene);
    sphere.setAbsolutePosition(vecToBabylonVec(body.position));
    return sphere;
});

const vecToBabylonVec = (vec: Vec): Vector3 => Vector3.FromArray(vecToArray(vec));
const babylonVectorToVec = (vec: Vector3): Vec<Meters> => ({x: vec.x as Meters, y: vec.y as Meters, z: vec.z as Meters});
