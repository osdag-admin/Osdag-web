// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// const ModelViewer = ({ modelUrl }) => {
//     const containerRef = useRef(null);
    
//     useEffect(() => {
//         if (!modelUrl) return;

//         const container = containerRef.current;
//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000);
//         const renderer = new THREE.WebGLRenderer();
        
//         renderer.setSize(container.clientWidth, container.clientHeight);
//         container.appendChild(renderer.domElement);
        
//         const loader = new STLLoader();
//         loader.load(modelUrl, (geometry) => {
//             const material = new THREE.MeshPhongMaterial({
//                 color: 0xAAAAAA,
//                 specular: 0x111111,
//                 shininess: 200
//             });
//             const mesh = new THREE.Mesh(geometry, material);
//             scene.add(mesh);
            
//             // Center the model
//             geometry.computeBoundingBox();
//             const center = geometry.boundingBox.getCenter(new THREE.Vector3());
//             mesh.position.sub(center);
//         });

//         // Add lights
//         const light = new THREE.DirectionalLight(0xffffff, 1);
//         light.position.set(1, 1, 1);
//         scene.add(light);
        
//         const ambientLight = new THREE.AmbientLight(0x404040);
//         scene.add(ambientLight);
        
//         camera.position.z = 5;
        
//         const animate = () => {
//             requestAnimationFrame(animate);
//             renderer.render(scene, camera);
//         };
//         animate();
        
//         return () => {
//             container.removeChild(renderer.domElement);
//         };
//     }, [modelUrl]);

//     return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
// };

// export default ModelViewer;


import React, { useEffect, useRef ,useState} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const ModelViewer = ({ modelUrl }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        // Add this at the start of useEffect
        console.log('ModelViewer received modelUrl:', {
            modelUrl,
            isDefined: !!modelUrl,
            type: typeof modelUrl
        });
        
        if (!modelUrl || !containerRef.current) {
            console.error('ModelViewer error:', { modelUrl, containerRef: containerRef.current });
            setError('No model URL provided');
            setLoading(false);
            return;
        }

        // Add absolute path handling
        const absoluteModelUrl = modelUrl.startsWith('http') 
            ? modelUrl 
            : `${window.location.origin}${modelUrl}`;
            
        console.log('Loading model:', {
            originalUrl: modelUrl,
            absoluteUrl: absoluteModelUrl,
            fileExtension: modelUrl.split('.').pop().toLowerCase()
        });

        const container = containerRef.current;
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x571364);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        camera.position.set(0, 5, 10);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 2, 2);
        scene.add(directionalLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Determine loader based on file extension
        const fileExtension = modelUrl.split('.').pop().toLowerCase();
        let loader;
        
        if (fileExtension === 'stl') {
            loader = new STLLoader();
        } else if (fileExtension === 'obj') {
            loader = new OBJLoader();
        } else if (fileExtension === 'step') {
            // You'll need to convert STEP to STL/OBJ on the server side
            // For now, show an error message
            setError('STEP files are not directly supported. Please convert to STL or OBJ format.');
            setLoading(false);
            return;
        } else {
            setError(`Unsupported file format: ${fileExtension}`);
            setLoading(false);
            return;
        }

        // Load Model
        loader.load(
            absoluteModelUrl,
            (geometry) => {
                console.log('Model loaded successfully:', geometry);
                let mesh;
                if (geometry instanceof THREE.BufferGeometry) {
                    // STL file
                    const material = new THREE.MeshPhongMaterial({
                        color: 0xaaaaaa,
                        specular: 0x111111,
                        shininess: 200
                    });
                    mesh = new THREE.Mesh(geometry, material);
                } else {
                    // OBJ file
                    mesh = geometry;
                }

                // Center the model
                const box = new THREE.Box3().setFromObject(mesh);
                const center = box.getCenter(new THREE.Vector3());
                mesh.position.sub(center);

                // Scale model to fit view
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 5 / maxDim;
                mesh.scale.multiplyScalar(scale);

                scene.add(mesh);
                
                // Position camera to see the model
                camera.position.set(5, 5, 5);
                camera.lookAt(0, 0, 0);
                controls.update();
                
                setLoading(false);
                console.log('Model loaded successfully');
            },
            (xhr) => {
                const progress = (xhr.loaded / xhr.total) * 100;
                console.log(`Loading progress: ${progress}%`);
            },
            (error) => {
                console.error('Model loading error:', error);
                setError(`Failed to load model: ${error.message}`);
                setLoading(false);
            }
        );

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Handle window resize
        function handleResize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            controls.dispose();
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [modelUrl]);

    return (
        <div className="w-full h-full relative">
            <div ref={containerRef} className="w-full h-full" />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#571364] bg-opacity-50">
                    <div className="text-white">Loading model...</div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#571364] bg-opacity-50">
                    <div className="text-white bg-red-500 p-4 rounded">
                        {error}
                        <br />
                        <small>Model URL: {modelUrl}</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelViewer;