import * as THREE from './three.js-master/build/three.module.js'
import { STLLoader }  from './three.js-master/examples/jsm/loaders/STLLoader.js'

const loadObject = () => {

    const loader = new STLLoader()
    loader.load("./assets/fin-plate.stl", function (geometry) {
        group = new THREE.Group()
        scene.add(group)

        const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x111111, shininess: 200 })
        mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 0, 0)
        mesh.scale.set(10, 10, 10)
        mesh.castShadow = true
        mesh.receiveShadow = true

        geometry.center()
        group.add(mesh)
    })
}