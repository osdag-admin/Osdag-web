import * as THREE from './three.js-master/build/three.module.js'
import { STLLoader }  from './three.js-master/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls'

console.log("Three.js version:"+THREE.REVISION)
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
//cons
scene.background = new THREE.Color(0x00000)
const loader = new STLLoader()
const controls = new OrbitControls(camera,renderer.domElement)
controls.enableDamping = true 

loader.load('assets/fin-plate.stl',function(geometry){
    //console.log(stl)
    group = new THREE.Group()
    scene.add(group)
    //root.scale.set(0.1,0.1,0.1)
    const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x111111, shininess: 200 })
    mesh = new THREE.Mesh(geometry,material)
    //const texture = new THREE.TextureLoader().load('./three.js-master/examples/textures/brick_diffuse.jpg');
    // const material = new THREE.MeshStandardMaterial({
    //     map: texture,
    //     color: 0xffffff,
    //     metalness: 1,
    //     roughness: 0,
    // });
    mesh.position.set(0, 0, 0)
    mesh.scale.set(10, 10, 10)
    mesh.castShadow = true
    mesh.receiveShadow = true

    mesh.material= material;
    geometry.center()
    group.add(mesh)

  // Add the mesh to the scene
    // scene.add(mesh);
    // scene.add(root);
},function(xhr){
    console.log((xhr.loaded/xhr.total * 100) +"% loaded")   
},function(error){
    // console.log('An error occured')
    console.log(error)
})


// const material = new THREE.MeshStandardMaterial({
//     color: 0xffffff,
//     metalness: 1,
//     roughness: 0,
// });
//scene.add(material)
const light = new THREE.DirectionalLight(0xffffff,1) //add lighting to scene
light.position.set(1,1,1)
scene.add(light)

const ambient = new THREE.AmbientLight(0xffffff);
light.position.set(0,1,2)
scene.add(ambient);
// const geometry = new THREE.BoxGeometry(1,1,1)
// const material = new THREE.MeshBasicMaterial({
//     color: 'red'
// })

// const boxMesh = new THREE.Mesh(geometry,material)
// scene.add(boxMesh)
const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
const uvTexture = new THREE.TextureLoader().load('./three.js-master/examples/textures/brick_diffuse.jpg')

// const ge3 = new THREE.PlaneGeometry(2,2);
// const me3 = new THREE.MeshStandardMaterial({
//      map: uvTexture

//  });
// const edge1 = new THREE.Mesh(ge3,me3)
// scene.add(edge1);
const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.1,100)
camera.position.set(0,1,2)
scene.add(camera)

const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})

renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.shadowMap.enabled = true
renderer.gammaOutput = true 
renderer.render(scene, camera)

function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()