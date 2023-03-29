"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// var THREE = require("./three.js-master/build/three.module.js");
// var GLTFLoader_js_1 = require("./three.js-master/examples/jsm/loaders/GLTFLoader.js");
// var OrbitControls_js_1 = require("./three.js-master/examples/jsm/controls/OrbitControls.js");
// var stats_module_js_1 = require("./three.js-master/examples/jsm/libs/stats.module.js");

import * as THREE from './three.js-master/build/three.module.js'
import { GLTFLoader }  from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js'
import Stats from './three.js-master/examples/jsm/libs/stats.module.js'
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
        color: 0x964B00,
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
var loader = new GLTFLoader();
loader.load('assets/design_123.gltf', function (gltf) {
    gltf.scene.traverse(function (child) {
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
    gltf.scene.traverse(function(object) {
        if (object.isMesh && object.name) {
            console.log(object.name);
        }
    });
    scene.add(gltf.scene);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
}, function (error) {
    console.log(error);
});
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
