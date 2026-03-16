import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ShipScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    
    // Initial side-view profile perspective
    camera.position.set(60, 15, 0); 
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.75; // Night exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    containerRef.current.appendChild(renderer.domElement);

    // 2. LIGHTING (Night - Cinematic Atmosphere)
    // Moonlight — cool blue-white
    const moon = new THREE.DirectionalLight(0x8899bb, 1.2);
    moon.position.set(30, 50, 40);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 2048;
    moon.shadow.mapSize.height = 2048;
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far = 300;
    const sSize = 50;
    moon.shadow.camera.left = -sSize;
    moon.shadow.camera.right = sSize;
    moon.shadow.camera.top = sSize;
    moon.shadow.camera.bottom = -sSize;
    scene.add(moon);

    // Lanterns (Warm glows)
    const lantern1 = new THREE.PointLight(0xffaa44, 1.4, 50);
    lantern1.position.set(5, 12, 5);
    lantern1.castShadow = true;
    scene.add(lantern1);

    const lantern2 = new THREE.PointLight(0xff8822, 0.9, 40);
    lantern2.position.set(-5, 10, -5);
    lantern2.castShadow = true;
    scene.add(lantern2);

    // Fill light — very subtle
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-50, 20, -50);
    scene.add(fillLight);

    // Rim light — barely visible
    const rimLight = new THREE.DirectionalLight(0x8899bb, 0.2);
    rimLight.position.set(0, 5, -50);
    scene.add(rimLight);

    // Ambient — reduce intensity to keep atmosphere
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // 3. CONTROLS (Interactive Rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    
    // Interaction Limits (No underground view)
    controls.minPolarAngle = Math.PI / 6;    // Limit top view
    controls.maxPolarAngle = Math.PI / 2.1;  // Limit bottom view (Prevent underground)
    controls.minDistance = 30;
    controls.maxDistance = 150;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // 4. MODEL LOADING (glTF)
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      '/models/sunny/glTF/scene.gltf',
      (gltf) => {
        const object = gltf.scene;
        
        object.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            const name = mesh.name.toLowerCase();
            
            // Hide glTF Water to use photorealistic 2D OceanCanvas background
            if (name.includes('water') || name.includes('ocean') || name.includes('sea') || name.includes('plane')) {
              mesh.visible = false;
            } else if (name.includes('stand') || name.includes('ground')) {
              mesh.visible = false;
            } else {
              mesh.visible = true;
            }
          }
        });

        // Auto-center and Scale
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        object.position.sub(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 50 / maxDim; 
        object.scale.setScalar(scale);
        
        // Initial Side View Profile (Corrected offset)
        const baseY = -size.y * 0.1; 
        object.position.y = baseY; 
        object.rotation.y = Math.PI; // Correct profile view for this model

        object.userData.baseY = baseY; 
        scene.add(object);
        shipRef.current = object;
      },
      undefined,
      (error) => console.error('glTF Load Error:', error)
    );

    // 5. ANIMATION LOOP (Total Smoothness)
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const t = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (shipRef.current) {
        const baseY = shipRef.current.userData.baseY ?? -2;
        // Calm natural bobbing
        shipRef.current.position.y = baseY + Math.sin(t * 0.4) * 0.3;
        shipRef.current.rotation.z = Math.sin(t * 0.3) * 0.015;
        shipRef.current.rotation.x = Math.sin(t * 0.2) * 0.01;

        // Animate Original Water Mesh if found
        shipRef.current.traverse((child) => {
          if (child.userData.isWater && (child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Simple slow vertex-like modulation
            mesh.position.y = Math.sin(t * 0.5) * 0.1;
          }
        });
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 6. CLEANUP
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-transparent" />;
}
