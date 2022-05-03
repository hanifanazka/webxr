import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader.js";
import { RGBELoader } from "RGBELoader.js";
import { TransformControls } from "TransformControls.js";
import { ARButton } from "ARButton.js";

let scene, camera, renderer, controller, object, controllerGrip;

let raycaster;

const tempMatrix = new THREE.Matrix4();

init();
animate();

function init() {
  scene = initScene();
  camera = initCamera(camera);
  initHemisphereLight();
  renderer = initRenderer();
  onWindowResize();

  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    new THREE.MeshBasicMaterial({ color: 0x0000ff }),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
    new THREE.MeshBasicMaterial({ color: 0xff00ff }),
    new THREE.MeshBasicMaterial({ color: 0x00ffff }),
    new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  ];

  // Create the cube and add it to the demo scene.
  object = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
    materials
  );
  object.position.set(0, 0, -1);
  scene.add(object);

  document.body.appendChild(ARButton.createButton(renderer));

  controller = renderer.xr.getController(0);
  controller.addEventListener("selectstart", onSelectStart);
  controller.addEventListener("selectend", onSelectEnd);
  scene.add(controller);

  raycaster = new THREE.Raycaster();

  window.addEventListener("resize", onWindowResize);
}

function initScene() {
  return new THREE.Scene();
}

function initCamera() {
  return new THREE.PerspectiveCamera();
}

function initHemisphereLight() {
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);
}

function initRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

function onSelectStart(event) {
  const controller = event.target;

  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const object = intersection.object;
    controller.attach(object);

    controller.userData.selected = object;
  }
}

function onSelectEnd(event) {
  const controller = event.target;
  if (controller.userData.selected !== undefined) {
    const object = controller.userData.selected;
    scene.attach(object);

    controller.userData.selected = undefined;
  }
}

function getIntersections(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  return raycaster.intersectObjects(scene.children, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}
