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

    // 0. DYNAMIC TIME CALCULATIONS
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    
    const skyColor = isDay ? 0x88ccff : 0x000308;
    const fogDensity = isDay ? 0.001 : 0.002;
    const waterColorVal = isDay ? 0x004466 : 0x00101a;
    const sunColorVal = isDay ? 0xffffaa : 0xbbccff;
    const ambientIntensity = isDay ? 0.4 : 0.15;
    const mainLightIntensity = isDay ? 2.5 : 1.2;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor); // Set background for day sky
    scene.fog = new THREE.FogExp2(skyColor, fogDensity);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    
    // Zoom even closer for true hero shot (from 55 to 45)
    camera.position.set(45, 14, 0); 
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
    renderer.toneMappingExposure = 1.25; // Brighter for cinematic pop
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
        sunDirection: new THREE.Vector3(isDay ? 100 : 30, isDay ? 100 : 50, isDay ? 50 : 40).normalize(),
        sunColor: sunColorVal,
        waterColor: waterColorVal,
        distortionScale: 3.5, // slightly more distortion for realistic surf
        clipBias: 0.0001,
        alpha: 1.0
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
    waterRef.current = water;

    // 3. LIGHTING (Dynamic Day/Night)
    const mainLight = new THREE.DirectionalLight(sunColorVal, mainLightIntensity);
    mainLight.position.set(isDay ? 100 : 30, isDay ? 100 : 50, isDay ? 50 : 40);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    const sSize = 60;
    mainLight.shadow.camera.left = -sSize;
    mainLight.shadow.camera.right = sSize;
    mainLight.shadow.camera.top = sSize;
    mainLight.shadow.camera.bottom = -sSize;
    scene.add(mainLight);

    // Lanterns (Always on but dim during day)
    const lantern1 = new THREE.PointLight(0xffaa44, isDay ? 0.3 : 1.4, 60);
    lantern1.position.set(5, 12, 5);
    lantern1.castShadow = true;
    scene.add(lantern1);

    const lantern2 = new THREE.PointLight(0xff8822, isDay ? 0.2 : 0.9, 50);
    lantern2.position.set(-5, 10, -5);
    lantern2.castShadow = true;
    scene.add(lantern2);

    const fillLight = new THREE.DirectionalLight(isDay ? 0xffffff : 0x445577, 0.4); // Cool fill
    fillLight.position.set(-50, 20, -50);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(sunColorVal, 0.3);
    rimLight.position.set(0, 5, -50);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity); 
    scene.add(ambient);

    // 4. CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 20; // Allow closer zoom
    controls.maxDistance = 150;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // 5. MODEL LOADING
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/sunny/glTF/scene.gltf',
      (gltf) => {
        const object = gltf.scene;
        
        object.traverse((child: THREE.Object3D) => {
          const name = child.name;
          const mesh = child as THREE.Mesh;
          const mat = mesh.isMesh ? (mesh.material as THREE.Material) : null;
          const materialName = mat && mat.name ? mat.name : '';
          
          // SURGICAL REMOVAL OF INBUILT WATER ONLY
          // User identified: name="Cube013" (parent) and "Cube013_Material015_0" (child)
          if (name.includes('Cube013') || materialName.includes('Material.015')) {
            child.visible = false;
            if (mesh.isMesh) {
              mesh.castShadow = false;
              mesh.receiveShadow = false;
            }
            return;
          }

          if (!mesh.isMesh) return;
          mesh.visible = true;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // SPRAY/FOAM Logic (Keeping the nice transparency for these specific materials)
          if (materialName.includes('018') || materialName.includes('019')) {
             const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
             materials.forEach(m => {
               m.transparent = true;
               m.opacity = 0.8;
             });
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
        // ENHANCED REALISM SPEED (1/150 for more motion)
        waterRef.current.material.uniforms[ 'time' ].value += 1.0 / 150.0;
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
