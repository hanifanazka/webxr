import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader.js";
import { OrbitControls } from "OrbitControls.js";
import { TransformControls } from "TransformControls.js";
import { runCheck } from "./check.js";
import { activateXR } from "./appXR.js";

window.activateXR = activateXR

let scene, renderer, object, camera, control;

const XRSUPPORTED = runCheck();
// if (XRSUPPORTED) null;
// else initFallback();
initFallback();

function initFallback() {
  // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const gl = canvas.getContext("webgl", { xrCompatible: true });

  scene = new THREE.Scene();

  // Set up the WebGLRenderer, which handles rendering to the session's base layer.
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl,
  });
  renderer.autoClear = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  const aspect = window.innerWidth / window.innerHeight;

  camera = new THREE.PerspectiveCamera(undefined, aspect);
  camera.position.z = 5;
  camera.matrixAutoUpdate = false;

  const loader = new GLTFLoader().setPath("models/gltf/DamagedHelmet/glTF/");
  loader.load("DamagedHelmet.gltf", function (gltf) {
    object = gltf.scene;
    object.position.set(0, 0, -2);
    scene.add(object);

    requestAnimationFrame(onFrame);

    const orbitControl = new OrbitControls(camera, canvas);
    orbitControl.listenToKeyEvents(window); // optional

    orbitControl.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbitControl.dampingFactor = 0.05;

    orbitControl.minDistance = 1;
    orbitControl.maxDistance = 100;
    orbitControl.screenSpacePanning = false;

    control = new TransformControls(camera, canvas);
    control.attach(object);
    scene.add(control);

    control.addEventListener("dragging-changed", function (event) {
      orbitControl.enabled = !event.value;
    });
  });

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1, 1, 1);
  light.power = 800; // ref for lumens: http://www.power-sure.com/lumens.htm
  scene.add(light);

  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
  hemiLight.intensity = 10; // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
  scene.add(hemiLight);

  window.addEventListener("resize", onWindowResize);
}

function render() {
  // Render the scene with THREE.WebGLRenderer
  renderer.render(scene, camera);
}

// Create a render loop that allows us to draw on the view
function onFrame() {
  // Queue up the next draw request.
  requestAnimationFrame(onFrame);

  //   object.rotation.x += 0.01;
  //   object.rotation.y += 0.01;

  render();
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}
