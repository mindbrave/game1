
import { Engine, Scene, Vector3, MeshBuilder, DirectionalLight, Mesh, ArcRotateCamera } from "babylonjs";
import { curry } from "ramda";
import "babylonjs-materials";

import { Game, Physical } from "./game";
import { Meters, Body, Circle } from "./physics";
import { Vec, vecToArray, Radians } from "./vectors";
import { Entity } from "./entities";

export const createView = (game: Game) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const engine = new Engine(canvas, false);

    const scene = new Scene(engine);

    const ground = BABYLON.Mesh.CreateGround("ground1", 30 as Meters, 30 as Meters, 10, scene);
    ground.receiveShadows = true;

    const light = new DirectionalLight("light1", new Vector3(100, -200, 20), scene);
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
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

    const entitiesViews = game.entities.map(createCharacterView(scene));
    
    entitiesViews.forEach((view: Mesh) => shadowGenerator.addShadowCaster(view));

    engine.runRenderLoop(() => {
        scene.render();
    });

    return {
        updateView: (game: Game): void => {
            entitiesViews.forEach((view, entityId) => view.setAbsolutePosition(vecToBabylonVec(game.entities.get(entityId)!.body.position)));
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
