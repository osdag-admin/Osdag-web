import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls, useTexture} from '@react-three/drei'
import { useLoader } from '@react-three/fiber';
import React, {useMemo} from "react";
//import mdl from  
function Model() {
    const obj = useLoader(OBJLoader,"/output-obj.obj"); //issue is here that our .obj model is not getting loaded in the objloader
    //console.log('obj loader :  ' , obj)
    //return <primitive object={obj} />
    const texture = useTexture("/texture.png");
    //console.log('texture  : ' , texture)
    const geometry = useMemo(() => {
      let g;
      obj.traverse((c) => {
        if (c.type === "Mesh") {
          const _c = c ; 
          g = _c.geometry;
        }
      });
      //console.log("Done Loading")
      return g;
    }, [obj]);
    
    // I've used meshPhysicalMaterial because the texture needs lights to be seen properly
    // AxesHelper param changing the axes lengths
    // scale:model scale
    return (
      <group name='scene'>
          <axesHelper args={[200]}/> 
          <mesh geometry={geometry} scale={0.008}>
            <meshPhysicalMaterial attach = "material" color={'#FF0000'} metalness={0.25} roughness={0.1} opacity={2.0} transparent = {true} transmission={0.99} clearcoat={1.0} clearcoatRoughness={0.25}/>
          </mesh>
          <OrbitControls />
      </group>
    );
}

export default Model;