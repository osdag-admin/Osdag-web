"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// var THREE = require("./three.js-master/build/three.module.js");
// var objLoader_js_1 = require("./three.js-master/examples/jsm/loaders/objLoader.js");
// var OrbitControls_js_1 = require("./three.js-master/examples/jsm/controls/OrbitControls.js");
// var stats_module_js_1 = require("./three.js-master/examples/jsm/libs/stats.module.js");

import * as THREE from './three.js-master/build/three.module.js'
import { OBJLoader }  from './three.js-master/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js'
import Stats from './three.js-master/examples/jsm/libs/stats.module.js'
import { FontLoader }  from './three.js-master/examples/jsm/loaders/FontLoader.js'
var scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));
scene.background = new THREE.Color(0xffffff)
// const light = new THREE.SpotLight();
// light.position.set(5, 5, 5)
// scene.add(light);
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00001, 20000);
camera.position.z = 2
var renderer = new THREE.WebGLRenderer();
// renderer.PhysicallyCorrectLights = true
// renderer.shadowMap.enabled = true
// renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls(camera, renderer.domElement);

var texture = new THREE.TextureLoader().load('./three.js-master/examples/textures/carbon/Carbon_Normal.png')
var envTexture = new THREE.CubeTextureLoader().load([
    './three.js-master/examples/textures/cube/pisa/px.png',
    './three.js-master/examples/textures/cube/pisa/nx.png',
    './three.js-master/examples/textures/cube/pisa/py.png',
    './three.js-master/examples/textures/cube/pisa/ny.png',
    './three.js-master/examples/textures/cube/pisa/pz.png',
    './three.js-master/examples/textures/cube/pisa/nz.png'
])
//envTexture.mapping = THREE.CubeReflectionMapping

const material = new THREE.MeshPhysicalMaterial({
        color: 0xFF0000,
        envMap: texture,
        metalness: 0.25,
        roughness: 0.1,
        opacity: 1.0,
        transparent: true,
        transmission: 0.99,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
})
controls.enableDamping = true;

//Fontloader and adding strings over the axes
var fontLoader = new FontLoader();

// fontLoader.load('examples/fonts/helvetiker_regular.typeface.json', function(font) {

//   // Create the text geometry
//     const textGeometry = new THREE.TextGeometry('X axis', {
//         font: font,
//         size: 0.5,
//         height: 0.05
//     });

//     // Create the material for the text
//     const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

//     // Create the text mesh
//     const textMesh = new THREE.Mesh(textGeometry, textMaterial);

//     // Position the text mesh along the x axis
//     textMesh.position.set(1, 0, 0);  // Position the text on the X-axis
//     textMesh.rotation.y = Math.PI / 2;  // Rotate the text to face the camera

//     // Add the text mesh to the scene
//     scene.add(textMesh);
//     });
var loader = new OBJLoader();
loader.load('assets/fin-plate.obj', function (obj) {
    obj.traverse(function (child) {
        if (child.isMesh) {
            var m = child;
            m.receiveShadow = true;
            m.castShadow = true;
            m.material = material;
        }
        if (child.isLight) {
            var l = child;
            l.castShadow = true;
            l.shadow.bias = -0.003;
            l.shadow.mapSize.width = 2048;
            l.shadow.mapSize.height = 2048;
        }
    });
    obj.traverse(function(object) {
        if (object.isMesh && object.name) {
            console.log(object.name);
        }
    });
    scene.add(obj);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
}, function (error) {
    console.log(error);
});

// var loader1 = new objLoader();
// loader1.load('assets/bb-splice-bolted.obj', function (obj) {
//     obj.scene.traverse(function (child) {
//         if (child.isMesh) {
//             var m = child;
//             m.receiveShadow = true;
//             m.castShadow = true;
//             m.material = material;
//         }
//         if (child.isLight) {
//             var l = child;
//             l.castShadow = true;
//             l.shadow.bias = -0.003;
//             l.shadow.mapSize.width = 2048;
//             l.shadow.mapSize.height = 2048;
//         }
//     });
//     obj.scene.traverse(function(object) {
//         if (object.isMesh && object.name) {
//             console.log(object.name);
//         }
//     });
//     scene.add(obj.scene);
// }, function (xhr) {
//     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
// }, function (error) {
//     console.log(error);
// });
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
var stats = Stats()
document.body.appendChild(stats.dom);
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
}
function render() {
    renderer.render(scene, camera);
}
animate();
