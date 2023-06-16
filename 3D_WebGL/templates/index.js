import * as THREE from './three.js-master/build/three.module.js'
import { STLLoader }  from './three.js-master/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js'
import Stats from './three.js-master/examples/jsm/libs/stats.module.js'
const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.SpotLight()
light.position.set(20, 20, 20)
scene.add(light)

const camera = new THREE.PerspectiveCamera(
    1500,
    window.innerWidth / window.innerHeight,
    0.0000001,
    20000
)
camera.position.z = 100

const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const envTexture = new THREE.CubeTextureLoader().load([
    './three.js-master/examples/textures/cube/pisa/px.png',
    './three.js-master/examples/textures/cube/pisa/nx.png',
    './three.js-master/examples/textures/cube/pisa/py.png',
    './three.js-master/examples/textures/cube/pisa/ny.png',
    './three.js-master/examples/textures/cube/pisa/pz.png',
    './three.js-master/examples/textures/cube/pisa/nz.png'
])
envTexture.mapping = THREE.CubeReflectionMapping

const material = new THREE.MeshPhysicalMaterial({
    color: 0xb2ffc8,
    envMap: envTexture,
    metalness: 0.25,
    roughness: 0.1,
    opacity: 1.0,
    transparent: true,
    transmission: 0.99,
    clearcoat: 1.0,
    clearcoatRoughness: 0.25
})
//const uvTexture = new THREE.TextureLoader().load('./three.js-master/examples/textures/brick_diffuse.jpg')
//uvTexture.mapping = THREE.TextureLoader
const loader = new STLLoader()
loader.load(
    'assets/fin-plate.stl',
    function (geometry) {
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()