import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { getWaveHeight } from '../utils/wavePhysics';

export default function ShipScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const waterRef = useRef<Water | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000308, 0.002); // Deep night fog

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    
    camera.position.set(62, 18, 0); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    containerRef.current.appendChild(renderer.domElement);

    // 2. WATER (Realistic 3D Shader)
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(30, 50, 40).normalize(),
        sunColor: 0xbbccff, // Cooler moonlight color
        waterColor: 0x00101a, // Even deeper night blue
        distortionScale: 3.0, // More subtle
        clipBias: 0.0001,
        alpha: 1.0
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
    waterRef.current = water;

    // 3. LIGHTING (Night - Cinematic Atmosphere)
    const moon = new THREE.DirectionalLight(0x8899bb, 1.2);
    moon.position.set(30, 50, 40);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 2048;
    moon.shadow.mapSize.height = 2048;
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far = 300;
    const sSize = 60;
    moon.shadow.camera.left = -sSize;
    moon.shadow.camera.right = sSize;
    moon.shadow.camera.top = sSize;
    moon.shadow.camera.bottom = -sSize;
    scene.add(moon);

    const lantern1 = new THREE.PointLight(0xffaa44, 1.4, 60);
    lantern1.position.set(5, 12, 5);
    lantern1.castShadow = true;
    scene.add(lantern1);

    const lantern2 = new THREE.PointLight(0xff8822, 0.9, 50);
    lantern2.position.set(-5, 10, -5);
    lantern2.castShadow = true;
    scene.add(lantern2);

    const fillLight = new THREE.DirectionalLight(0x445577, 0.3); // Cool fill
    fillLight.position.set(-50, 20, -50);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8899bb, 0.2);
    rimLight.position.set(0, 5, -50);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.1); 
    scene.add(ambient);

    // 4. CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 30;
    controls.maxDistance = 150;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // 5. MODEL LOADING
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/sunny/glTF/scene.gltf',
      (gltf) => {
        const object = gltf.scene;
        
        // BALANCED SELECTIVE HIDE STRATEGY
        const shipKeywords = [
          'hull', 'mast', 'sail', 'deck', 'wood', 'door', 'window', 'rope', 
          'cannon', 'figure', 'head', 'lamp', 'lantern', 'grass', 'railing', 
          'stairs', 'box', 'barrel', 'anchor', 'chain', 'lookout', 'cabin',
          'sunny', 'ship', 'boat', 'flag', 'steering', 'wheel', 'bench',
          'material.018', 'material.019', 'material.020' // RE-ENABLE PARTICLES/FOAM
        ];

        object.traverse((child: THREE.Object3D) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const name = mesh.name.toLowerCase();
          const mat = mesh.material as THREE.Material;
          const materialName = mat && mat.name ? mat.name.toLowerCase() : '';
          const bbox = new THREE.Box3().setFromObject(mesh);
          const size = bbox.getSize(new THREE.Vector3());
          
          const envKeywords = [
             'water', 'ocean', 'sea', 'plane', 'liquid', 'wave', 'river', 
             'ground', 'stand', 'floor', 'base', 'environment', 'island', 
             'mountain', 'rock', 'sky', 'cloud', 'background', 'nature',
             'material.015', 'cube013'
          ];
          const isKnownEnv = envKeywords.some(key => name.includes(key) || materialName.includes(key));
          const isFacetedWater = (size.x > 30 && size.z > 30 && size.y < 5);

          const isShipPart = shipKeywords.some(key => name.includes(key) || materialName.includes(key));
          
          if (isKnownEnv || isFacetedWater) {
            mesh.visible = false;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          } else {
            if (isShipPart || (size.x < 30 && size.y < 30 && size.z < 30)) {
               mesh.visible = true;
               mesh.castShadow = true;
               mesh.receiveShadow = true;
               
               // ANIME SPRAY/FOAM Logic
               if (materialName.includes('018')) {
                 mesh.visible = true;
                 const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                 materials.forEach(m => {
                   m.transparent = true;
                   m.opacity = 0.8;
                 });
               }
            } else {
               mesh.visible = false;
            }
          }
        });

        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 50 / maxDim; 
        object.scale.setScalar(scale);
        
        const baseY = -size.y * 0.1; 
        object.position.y = baseY; 
        object.rotation.y = Math.PI;
        object.userData.baseY = baseY; 
        scene.add(object);
        shipRef.current = object;
      },
      undefined,
      (error) => console.error('glTF Load Error:', error)
    );

    // 6. SPRAY PARTICLES (Native 3D)
    const sprayCount = 1000;
    const sprayGeometry = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(sprayCount * 3);
    const sprayVelocities = new Float32Array(sprayCount * 3);
    
    for (let i = 0; i < sprayCount; i++) {
      sprayPositions[i * 3] = (Math.random() - 0.5) * 40;
      sprayPositions[i * 3 + 1] = -5; // Near water line
      sprayPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      
      sprayVelocities[i * 3] = (Math.random() - 0.5) * 0.05;
      sprayVelocities[i * 3 + 1] = Math.random() * 0.1;
      sprayVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    
    sprayGeometry.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const sprayPoints = new THREE.Points(sprayGeometry, sprayMaterial);
    scene.add(sprayPoints);

    // 7. ANIMATION LOOP
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      if (controlsRef.current) controlsRef.current.update();
      
      if (waterRef.current) {
        waterRef.current.material.uniforms[ 'time' ].value += 1.0 / 240.0;
      }

      // Update Spray
      const positions = sprayPoints.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sprayCount; i++) {
        positions[i * 3] += sprayVelocities[i * 3];
        positions[i * 3 + 1] += sprayVelocities[i * 3 + 1];
        positions[i * 3 + 2] += sprayVelocities[i * 3 + 2];
        
        // Gravity
        sprayVelocities[i * 3 + 1] -= 0.001;
        
        // Reset
        if (positions[i * 3 + 1] < -5.5) {
          positions[i * 3] = (Math.random() - 0.5) * 40;
          positions[i * 3 + 1] = -5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
          sprayVelocities[i * 3 + 1] = Math.random() * 0.1;
        }
      }
      sprayPoints.geometry.attributes.position.needsUpdate = true;

      if (shipRef.current) {
        const baseY = shipRef.current.userData.baseY ?? -2;
        const centerX = window.innerWidth / 2;
        const rawWaveY = getWaveHeight(centerX, t * 3, 5); 
        const bobDisplacement = rawWaveY * 0.045; 
        shipRef.current.position.y = baseY + bobDisplacement;
        shipRef.current.rotation.z = (rawWaveY * 0.0012) + Math.sin(t * 0.5) * 0.01;
        shipRef.current.rotation.x = Math.cos(t * 0.4) * 0.015;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

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
